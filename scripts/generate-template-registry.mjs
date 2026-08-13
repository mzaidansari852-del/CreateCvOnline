#!/usr/bin/env node
/**
 * Generates `lib/cv/templates.generated.ts` from the files in
 * `components/cv/templates/<category>/*.tsx`.
 *
 * Adding a template therefore requires no registry edit: drop the file in, export a
 * default component + `meta` (+ optional `pageBackground`), and this script wires it up.
 * It runs automatically on `npm run build` via the `prebuild` script.
 */
import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const templatesDir = join(root, 'components', 'cv', 'templates');
const outFile = join(root, 'lib', 'cv', 'templates.generated.ts');

const CATEGORY_ORDER = ['modern', 'corporate', 'creative', 'technology', 'classic', 'ats'];

/** @returns {{category: string, file: string, importPath: string, componentName: string}[]} */
function collect() {
  const found = [];
  let categories;
  try {
    categories = readdirSync(templatesDir).filter((entry) =>
      statSync(join(templatesDir, entry)).isDirectory(),
    );
  } catch {
    throw new Error(`Template directory not found: ${templatesDir}`);
  }

  categories.sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a);
    const bi = CATEGORY_ORDER.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi) || a.localeCompare(b);
  });

  for (const category of categories) {
    const dir = join(templatesDir, category);
    const files = readdirSync(dir)
      .filter((file) => file.endsWith('.tsx'))
      .sort((a, b) => a.localeCompare(b));

    for (const file of files) {
      const source = readFileSync(join(dir, file), 'utf8');
      if (!/export\s+const\s+meta\s*:/.test(source)) {
        throw new Error(
          `${relative(root, join(dir, file))} does not export a \`meta\` object. ` +
            `See docs/TEMPLATE_AUTHORING.md §5.`,
        );
      }
      if (!/export\s+default\s+function/.test(source)) {
        throw new Error(
          `${relative(root, join(dir, file))} does not export a default component.`,
        );
      }

      found.push({
        category,
        file,
        importPath: `@/components/cv/templates/${category}/${file.replace(/\.tsx$/, '')}`,
        componentName: file.replace(/\.tsx$/, ''),
        hasPageBackground: /export\s+function\s+pageBackground\s*\(/.test(source),
      });
    }
  }

  return found;
}

function build() {
  const templates = collect();
  if (templates.length === 0) throw new Error('No templates found.');

  const seen = new Set();
  for (const template of templates) {
    if (seen.has(template.componentName)) {
      throw new Error(`Duplicate template component name: ${template.componentName}`);
    }
    seen.add(template.componentName);
  }

  const imports = templates
    .map((template) => {
      const parts = [`meta as ${lower(template.componentName)}Meta`];
      if (template.hasPageBackground) {
        parts.push(`pageBackground as ${lower(template.componentName)}Background`);
      }
      return `import ${template.componentName}, { ${parts.join(', ')} } from '${template.importPath}';`;
    })
    .join('\n');

  const entries = templates
    .map((template) => {
      const lines = [
        `    ...${lower(template.componentName)}Meta,`,
        `    component: ${template.componentName},`,
      ];
      if (template.hasPageBackground) {
        lines.push(`    pageBackground: ${lower(template.componentName)}Background,`);
      }
      return `  {\n${lines.join('\n')}\n  },`;
    })
    .join('\n');

  const output = `/**
 * AUTO-GENERATED — do not edit.
 * Run \`npm run generate:templates\` (or \`npm run build\`) to regenerate.
 *
 * Source: components/cv/templates/<category>/*.tsx  (${templates.length} templates)
 */
import type { TemplateDefinition } from '@/types/cv';

${imports}

export const GENERATED_TEMPLATES: TemplateDefinition[] = [
${entries}
];
`;

  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, output, 'utf8');

  const byCategory = templates.reduce((acc, template) => {
    acc[template.category] = (acc[template.category] ?? 0) + 1;
    return acc;
  }, /** @type {Record<string, number>} */ ({}));

  console.log(
    `✓ template registry: ${templates.length} templates ` +
      `(${Object.entries(byCategory)
        .map(([category, count]) => `${category} ${count}`)
        .join(', ')})`,
  );
}

function lower(value) {
  return value.charAt(0).toLowerCase() + value.slice(1);
}

build();
