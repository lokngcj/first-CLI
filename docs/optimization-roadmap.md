# atai-ai 优化路线图

这份文档用于在新对话或新迭代中快速恢复工程优化上下文。

## 当前基线

`atai-ai` 已实现核心 CLI 能力：

- `preflight`：改前上下文生成。
- `verify`：规则源与代码违规校验，支持 `--target` / `--staged`。
- `fix-suggestions`：基于违规生成修改建议。
- `rules-check`：全项目规则健康度扫描。
- `figma-compress`：Figma 位图压缩。

已修复的关键问题：

- `figma-compress` 必须校验 `--project`。
- 代码扫描必须跳过注释，避免 axios/fetch/i18n 误报。
- `--format json` 的 stdout 必须保持可解析 JSON，进度和提示信息走 stderr。
- 测试文件豁免统一请求写法检查。
- 补充 `nonstandard_api_call` 检查。

## P0：稳定性底座

目标：让后续改动不会破坏既有 CLI 行为。

任务清单：

- 接入 Vitest。
- 增加 `npm test` 脚本。
- 为核心纯函数补单元测试：
  - `project-resolver`
  - `rules-loader`
  - `rules-validator`
  - `code-checker`
  - `formatter`
- 建立临时 `apps/*` fixture Monorepo。
- 增加 CLI 命令级验收测试：
  - `preflight --format json`
  - `verify --target --format json`
  - `verify --staged --format json`
  - `fix-suggestions --format json`
  - `rules-check --format json`
  - `figma-compress`
- 锁定 stdout/stderr 契约：
  - JSON 模式下 stdout 只输出 JSON。
  - 进度、提示和非结构化错误信息输出到 stderr。

验收标准：

- `npm run build` 通过。
- `npm test` 通过。
- JSON 输出可以直接 `JSON.parse`。

## P1：扫描准确性与行为契约

目标：降低误报/漏报，稳定外部脚本集成。

任务清单：

- 代码扫描必须先剥离注释再匹配规则。
- 统一请求写法违规检查必须覆盖：
  - `axios` import / require / method call
  - `fetch`
  - 常见非项目 HTTP client import
  - `XMLHttpRequest`
- 测试文件只豁免统一请求写法，不豁免 i18n 和 `useCallback`。
- `figma-compress` 必须处理：
  - 无效项目
  - 不支持格式
  - 小于等于 1MB
  - 压缩后不变小
- `--quality` 的提示必须不污染 JSON stdout。

验收标准：

- 注释中的 axios/fetch/中文不触发违规。
- 业务代码中的违规仍能被准确识别。
- `*.test.*` / `*.spec.*` 中直接请求不触发统一请求违规。
- `fix-suggestions --format json` 在规则源错误时 stdout 仍是 JSON。

## P2：真实 Monorepo 适配

目标：让工具更适配生产仓库差异。

建议任务：

- 从 `package.json` scripts 推断质量命令。
- 支持 pnpm/yarn/npm/bun 的包管理器检测。
- `--staged --quality` 涉及多个 app 时按 app 运行质量检查，或明确输出跳过原因。
- 增加 JSON schema version，例如 `schemaVersion: "1.0"`。
- 规则源解析升级为结构化 schema，允许定义 API wrapper 名称、i18n 函数名、样式体系。

## P3：发布与维护

目标：降低安装、使用和发布成本。

建议任务：

- 增加 README。
- 增加 GitHub Actions：
  - `npm ci`
  - `npm run build`
  - `npm test`
  - `npm audit`
- 增加 `engines.node`。
- 明确 exit code 规范。
- 发布前校验 npm package 内容。

## 新对话恢复提示

可以直接粘贴以下提示：

```text
请读取 docs/requirements.md 和 docs/optimization-roadmap.md，继续推进 atai-ai 的工程化优化。优先完成 P0/P1：测试体系、CLI fixture 验收、JSON stdout 契约、扫描准确性回归。实现后运行 npm run build 和 npm test，并给出测试报告。
```
