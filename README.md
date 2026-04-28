# atai-ai

`atai-ai` is a local CLI workflow tool for frontend Monorepo repositories that use an `apps/*` structure.

It helps teams inspect app-specific rules before editing code, verify code against local conventions, generate fix suggestions, scan rule-source health, and compress Figma-exported bitmap assets.

## Requirements

- Node.js `>=20.0.0`
- A target frontend Monorepo with an `apps/` directory at the project root
- Target apps should use local project tooling for quality checks when `--quality` is enabled:
  - eslint
  - TypeScript / `tsc`
  - vitest

## Install

From this repository:

```bash
npm install
npm run build
npm link
```

Then run:

```bash
atai-ai --help
```

For local development without linking:

```bash
npm run dev -- --help
node dist/index.js --help
```

## Commands

### preflight

Outputs context before editing a target file.

```bash
atai-ai preflight --project "/absolute/path/to/monorepo" --target apps/web/src/App.tsx
atai-ai preflight --project "/absolute/path/to/monorepo" --target apps/web/src/NewFile.tsx --format json
```

Outputs:

- app ownership
- detected style system
- rule sources
- inferred quality commands
- extracted rule signals
- rule-source exceptions

### verify

Verifies one target file or all Git staged files.

```bash
atai-ai verify --project "/absolute/path/to/monorepo" --target apps/web/src/App.tsx
atai-ai verify --project "/absolute/path/to/monorepo" --staged
atai-ai verify --project "/absolute/path/to/monorepo" --staged --quality --format json
```

`--quality` runs:

```text
lint -> typecheck -> test
```

Quality commands are inferred in this order:

1. app `package.json` scripts
2. root `package.json` scripts
3. package-manager fallback commands

Supported package managers:

- npm
- pnpm
- yarn
- bun

### fix-suggestions

Generates actionable suggestions for violations in a target file.

```bash
atai-ai fix-suggestions --project "/absolute/path/to/monorepo" --target apps/web/src/App.tsx
atai-ai fix-suggestions --project "/absolute/path/to/monorepo" --target apps/web/src/App.tsx --with-snippets --apply-checklist --format markdown
```

### rules-check

Scans all apps under `apps/` for rule-source health issues.

```bash
atai-ai rules-check --project "/absolute/path/to/monorepo"
atai-ai rules-check --project "/absolute/path/to/monorepo" --format json
```

### figma-compress

Compresses Figma-exported bitmap assets.

```bash
atai-ai figma-compress --project "/absolute/path/to/monorepo" --input apps/web/assets/source.png --output apps/web/assets/source.min.png
```

Supported formats:

- png
- jpg
- jpeg
- webp

Files at or below 1 MB are skipped.

## Rule Sources

For each app, the CLI reads only these rule sources:

- `skills/**/*.md`
- `PROJECT_GUIDE.md`
- `README.md`
- `.serena/**`
- `.trae/**`
- `ai.md`
- `router.md`
- `*.logic.md`
- `DEV_STEPS.md`
- `*compat-plan.md`

Rule-source errors take priority over code checks.

## Output Formats

All commands support terminal-friendly text output by default.

Commands with `--format` support:

- `text`
- `markdown`
- `json`

JSON output includes:

```json
{
  "schemaVersion": "1.0"
}
```

In JSON mode, stdout is reserved for parseable JSON. Progress messages and human-readable hints are written to stderr.

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Unexpected internal failure |
| 2 | Invalid command usage or options |
| 3 | Invalid project, app, or target path |
| 4 | Rule-source errors |
| 5 | Code rule violations |
| 6 | Quality check failure |
| 7 | Image input or compression error |

Priority order:

```text
rule-source errors -> code violations -> quality failures
```

## Development

```bash
npm install
npm run build
npm test
npm audit --registry=https://registry.npmjs.org/
npm run pack:dry-run
```

## Documentation

- [Requirements](docs/requirements.md)
- [Optimization roadmap](docs/optimization-roadmap.md)
- [P0/P1 summary](docs/phase-p0-p1-summary.md)
- [P2 summary](docs/phase-p2-summary.md)
