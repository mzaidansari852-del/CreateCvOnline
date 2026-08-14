/**
 * Runs a task against a locally started production server, on any platform.
 *
 * The scripts that need one used to start it with a shell one-liner in `package.json`:
 *
 *   npm start & SERVER=$! ; sleep 8 ; node script.mjs ; kill $SERVER
 *
 * That is bash. On Windows `cmd.exe` it fails outright, and it was wrong even on a Unix
 * shell in two quieter ways: a fixed `sleep 8` is a guess that is either wasted time or a
 * connection refused on a slower machine, and `kill $SERVER` kills the `npm` wrapper while
 * leaving the Next server it spawned holding the port. A stale server surviving a script
 * is how a later run ends up crawling the *previous* build and reporting phantom failures.
 *
 * Next is launched through `process.execPath` rather than `npm start` so there is no shell
 * and no wrapper process: one child, killed directly, no orphans.
 */
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { setTimeout as delay } from 'node:timers/promises';

const require = createRequire(import.meta.url);

const READY_TIMEOUT_MS = 90_000;
const POLL_INTERVAL_MS = 250;

async function reachable(url) {
  try {
    // Any status means something is listening and routing; a 404 on `/` would still do.
    await fetch(url, { signal: AbortSignal.timeout(2_000) });
    return true;
  } catch {
    return false;
  }
}

/**
 * Starts `next start`, waits until it answers, runs `task(baseUrl)`, then stops it.
 *
 * The server is stopped in a `finally`, so a task that throws still releases the port.
 */
export async function withServer(task, { port = 3000 } = {}) {
  const baseUrl = `http://localhost:${port}`;

  if (await reachable(baseUrl)) {
    throw new Error(
      `Something is already listening on ${baseUrl}. Stop it first — otherwise this run ` +
        'would silently test whatever that server is serving, which may be an older build.',
    );
  }

  const nextBin = require.resolve('next/dist/bin/next');
  const server = spawn(process.execPath, [nextBin, 'start', '--port', String(port)], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, PORT: String(port) },
  });

  let crash = '';
  server.stderr.on('data', (chunk) => {
    crash += chunk.toString();
  });

  const exited = new Promise((resolve) => server.once('exit', (code) => resolve(code)));

  try {
    const deadline = Date.now() + READY_TIMEOUT_MS;
    for (;;) {
      if (await reachable(baseUrl)) break;

      // A server that has already exited will never become reachable; say why instead of
      // spinning until the timeout.
      const code = await Promise.race([exited, Promise.resolve(undefined)]);
      if (code !== undefined) {
        throw new Error(
          `next start exited with code ${code} before becoming reachable.` +
            (crash.trim() ? `\n\n${crash.trim()}` : '\n\nDid you run `npm run build` first?'),
        );
      }
      if (Date.now() > deadline) {
        throw new Error(`next start did not answer on ${baseUrl} within 90s.`);
      }
      await delay(POLL_INTERVAL_MS);
    }

    return await task(baseUrl);
  } finally {
    server.kill('SIGTERM');
    // Give it a moment to release the port, then insist.
    const stopped = await Promise.race([exited, delay(5_000).then(() => 'timeout')]);
    if (stopped === 'timeout') server.kill('SIGKILL');
  }
}
