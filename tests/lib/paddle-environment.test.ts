import { describe, expect, it } from 'vitest';

import { paddleEnvironmentProblem } from '@/lib/env';

/**
 * The four Paddle switches, and whether they agree.
 *
 * These assertions are written from the two real failure modes rather than from the
 * function's branches, because the branches are the easy part. What matters is that a
 * correctly configured live account is waved through — a false positive here takes payments
 * off a working site, which is a worse outcome than the bug being guarded against.
 */

const LIVE = {
  keyEnvironment: 'production',
  serverEnvironment: 'production',
  clientToken: 'live_a1b2c3d4e5f6g7h8',
  publicEnvironment: 'production',
} as const;

const SANDBOX = {
  keyEnvironment: 'sandbox',
  serverEnvironment: 'sandbox',
  clientToken: 'test_a1b2c3d4e5f6g7h8',
  publicEnvironment: 'sandbox',
} as const;

describe('paddleEnvironmentProblem', () => {
  it('passes a fully live configuration', () => {
    expect(paddleEnvironmentProblem({ ...LIVE })).toBeNull();
  });

  it('passes a fully sandbox configuration', () => {
    // Consistent sandbox is correct for local work and for preview deployments. Whether it
    // is acceptable *in production* is a separate question, answered in `serverEnv()`.
    expect(paddleEnvironmentProblem({ ...SANDBOX })).toBeNull();
  });

  it('catches a live key left with PADDLE_ENVIRONMENT=sandbox', () => {
    const problem = paddleEnvironmentProblem({ ...SANDBOX, keyEnvironment: 'production' });
    expect(problem).toContain('PADDLE_API_KEY');
    expect(problem).toContain('PADDLE_ENVIRONMENT');
  });

  it('catches PADDLE_ENVIRONMENT switched to live while the key is still sandbox', () => {
    const problem = paddleEnvironmentProblem({ ...SANDBOX, serverEnvironment: 'production' });
    expect(problem).toContain('sandbox key');
  });

  it('catches the server and the browser pointing at different environments', () => {
    /*
     * The half-switched deploy: server on live, browser still on sandbox. Paddle creates the
     * transaction in one and the overlay looks for it in the other, so the customer sees
     * "we could not open the payment window" and nothing explains why.
     */
    const problem = paddleEnvironmentProblem({
      keyEnvironment: 'production',
      serverEnvironment: 'production',
      clientToken: 'test_a1b2c3d4e5f6g7h8',
      publicEnvironment: 'sandbox',
    });
    expect(problem).toContain('NEXT_PUBLIC_PADDLE_ENVIRONMENT');
  });

  it('catches a sandbox client token under a live public environment', () => {
    const problem = paddleEnvironmentProblem({ ...LIVE, clientToken: 'test_a1b2c3d4e5f6g7h8' });
    expect(problem).toContain('NEXT_PUBLIC_PADDLE_CLIENT_TOKEN');
  });

  it('says nothing about a legacy key, whose environment cannot be read', () => {
    /*
     * Pre-2025 keys are unprefixed random strings, so `describePaddleApiKey` reports
     * `environment: null`. They still authenticate. Refusing to take payments because a
     * working credential predates a format change would be this guard causing the outage it
     * exists to prevent.
     */
    expect(paddleEnvironmentProblem({ ...LIVE, keyEnvironment: null })).toBeNull();
    expect(paddleEnvironmentProblem({ ...SANDBOX, keyEnvironment: null })).toBeNull();
  });

  it('says nothing when the client token is unset', () => {
    // An absent token is handled by `checkoutWillOfferPaddle`, not by this check. An empty
    // string is not a contradiction, and reporting it as one would bury the real message.
    expect(paddleEnvironmentProblem({ ...LIVE, clientToken: '' })).toBeNull();
  });

  it('says nothing when the client token has an unrecognised prefix', () => {
    // Could be an API key pasted into the public slot, which `describePaddleApiKey` reports
    // by name. Guessing an environment from it would produce a misleading second message.
    expect(paddleEnvironmentProblem({ ...LIVE, clientToken: 'pdl_live_apikey_x' })).toBeNull();
  });

  it('reports the key/server disagreement first when several are wrong at once', () => {
    /*
     * Nothing switched at all except `PADDLE_ENVIRONMENT`. Every pair disagrees, and the
     * useful message is the one naming the credential — fixing the key is what resolves the
     * rest, and a message per pair would read as three separate faults.
     */
    const problem = paddleEnvironmentProblem({
      keyEnvironment: 'sandbox',
      serverEnvironment: 'production',
      clientToken: 'test_a1b2c3d4e5f6g7h8',
      publicEnvironment: 'sandbox',
    });
    expect(problem).toContain('PADDLE_API_KEY');
  });
});
