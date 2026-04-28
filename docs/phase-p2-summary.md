# P2 阶段性沉淀

## 阶段目标

P2 目标是提升 `atai-ai` 对真实 Monorepo 的适配能力，减少对固定命令和单 app 假设的依赖。

## 已完成内容

### JSON schema version

所有命令结构化输出均增加：

```json
{
  "schemaVersion": "1.0"
}
```

覆盖命令：

- `preflight`
- `verify`
- `fix-suggestions`
- `rules-check`
- `figma-compress`

### 包管理器检测

新增检测逻辑：

1. 优先读取项目根目录锁文件。
2. 再读取 app 目录锁文件。
3. 默认回退到 `npm`。

支持：

- `pnpm-lock.yaml` -> `pnpm`
- `yarn.lock` -> `yarn`
- `bun.lockb` / `bun.lock` -> `bun`
- `package-lock.json` -> `npm`

### 质量命令推断

`--quality` 不再只依赖固定命令，执行顺序仍保持：

```text
lint -> typecheck -> test
```

命令解析优先级：

1. app 目录 `package.json` scripts。
2. 项目根目录 `package.json` scripts。
3. 包管理器本地执行 fallback。

脚本候选：

- lint：`lint`、`eslint`
- typecheck：`typecheck`、`type-check`、`tsc`
- test：`test`、`test:run`、`vitest`

fallback：

- npm：`npx eslint ...`、`npx tsc --noEmit`、`npx vitest run`
- pnpm：`pnpm exec ...`
- yarn：`yarn ...`
- bun：`bunx ...`

### 多 app staged quality

`verify --staged --quality` 涉及多个 app 时，会按 app 分别运行质量检查。

JSON 输出中保留聚合结果和每个 app 的明细：

```json
{
  "quality": {
    "packageManager": "npm",
    "lint": {
      "success": true,
      "command": "<multiple apps>"
    },
    "apps": [
      {
        "appName": "web",
        "packageManager": "npm",
        "lint": {
          "command": "npm run lint"
        }
      }
    ]
  }
}
```

summary 仍保留兼容字段：

- `lintPassed`
- `typecheckPassed`
- `testPassed`

## 新增测试

新增 `test/core/quality-runner.test.ts`，覆盖：

- 包管理器检测。
- app scripts 优先。
- root scripts 回退。
- 多 app quality 聚合。

增强 `test/cli/commands.test.ts`，覆盖：

- `verify --staged --quality --format json` 多 app 场景。
- JSON 中 `schemaVersion`。
- 每个 app 的 quality 明细。
- quality 进度输出到 stderr。

## 验收结果

已通过：

```bash
npm run build
npm test
```

测试规模：

- 6 个测试文件。
- 23 个测试用例。

## 设计取舍

- 当前 root scripts 回退会在项目根目录执行，适合 monorepo 统一脚本。
- app scripts 存在时优先 app 目录执行，更适合独立子应用。
- `quality.apps` 是新增字段，旧调用方仍可读取 `quality.lint/typecheck/test` 和 `summary.*Passed`。

## 后续建议

下一阶段可继续推进：

- README 和用户安装文档。
- GitHub Actions。
- exit code 规范。
- 结构化规则 schema，支持配置 API wrapper、i18n 函数名和样式体系。
