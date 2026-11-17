import path from 'node:path'

/**
 * Run ESLint from the app package cwd so each flat config is picked up.
 * @param {string} workspaceDir
 * @param {string[]} files
 */
function eslintForWorkspace(workspaceDir, files) {
  const relative = files
    .map((file) => path.relative(workspaceDir, file).replace(/\\/g, '/'))
    .filter((file) => file && !file.startsWith('..'))

  if (relative.length === 0) {
    return []
  }

  const quoted = relative.map((file) => `"${file}"`).join(' ')
  return [
    `npm exec --workspace=${workspacePackage(workspaceDir)} -- eslint --fix --max-warnings=0 ${quoted}`,
  ]
}

/**
 * @param {string} workspaceDir
 */
function workspacePackage(workspaceDir) {
  if (workspaceDir.replace(/\\/g, '/').endsWith('apps/web')) {
    return '@remunify/web'
  }
  return '@remunify/api'
}

export default {
  'apps/web/**/*.{ts,tsx}': (files) => [
    `prettier --write ${files.map((file) => `"${file}"`).join(' ')}`,
    ...eslintForWorkspace('apps/web', files),
  ],
  'apps/api/**/*.{ts,tsx}': (files) => [
    `prettier --write ${files.map((file) => `"${file}"`).join(' ')}`,
    ...eslintForWorkspace('apps/api', files),
  ],
  'apps/web/**/*.{css,html,json}': (files) =>
    `prettier --write ${files.map((file) => `"${file}"`).join(' ')}`,
  'apps/api/**/*.json': (files) =>
    `prettier --write ${files.map((file) => `"${file}"`).join(' ')}`,
  'package.json': (files) =>
    `prettier --write ${files.map((file) => `"${file}"`).join(' ')}`,
  '*.{md,yml,yaml}': (files) =>
    `prettier --write ${files.map((file) => `"${file}"`).join(' ')}`,
  'docs/**/*.md': (files) =>
    `prettier --write ${files.map((file) => `"${file}"`).join(' ')}`,
}
