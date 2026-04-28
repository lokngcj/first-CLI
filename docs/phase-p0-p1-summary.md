# P0/P1 阶段性沉淀

## 阶段目标

本阶段目标是把 `atai-ai` 从“功能可跑”推进到“行为可回归验证”：

- 建立自动化测试体系。
- 固化 CLI 命令级验收场景。
- 锁定 JSON stdout 契约。
- 覆盖规则扫描准确性回归。

## 已完成内容

### 文档

- 新增 `docs/optimization-roadmap.md`，沉淀 P0/P1/P2/P3 优化路线。
- 保留 `docs/requirements.md` 作为完整需求与验收基线。

### 测试体系

- 接入 Vitest。
- 新增 `npm test`。
- 新增临时 `apps/*` Monorepo fixture。

### 单元测试覆盖

- `project-resolver`
  - 绝对路径校验。
  - `apps/` 结构校验。
  - 目标文件归属 app 解析。
  - preflight 未创建文件解析。
- `rules-loader` / `rules-validator`
  - 规则源加载范围。
  - 规则指令提取。
  - 冲突标记、TODO、样式体系冲突。
- `code-checker`
  - axios / fetch / i18n / useCallback / nonstandard API 检查。
  - 注释误报回归。
  - 测试文件统一请求写法豁免。
- `formatter`
  - JSON 输出可解析。

### CLI 验收覆盖

- `preflight --format json`
- `verify --target --format json`
- `verify --staged --format json`
- `fix-suggestions --format json`
- `rules-check --format json`
- `figma-compress`

## 验收结果

已通过：

```bash
npm run build
npm test
npm audit --registry=https://registry.npmjs.org/
```

测试规模：

- 5 个测试文件。
- 18 个测试用例。

安全审计：

- 0 vulnerabilities。

## 本地提交

阶段提交：

```text
7e9c391 test: add P0 P1 coverage and roadmap
```

## 已知注意点

- 仓库历史中存在已跟踪的 `node_modules` 文件。本阶段新增 `.gitignore` 防止后续继续引入新依赖噪音，但未主动清理历史已跟踪文件。
- 当前质量命令仍是固定命令，尚未按真实 Monorepo 的 package manager 和 scripts 自动适配。
- JSON 输出尚未包含 schema version。

## P2 切入点

下一阶段优先处理：

- 从 app/root `package.json` scripts 推断质量命令。
- 检测 npm / pnpm / yarn / bun。
- `--staged --quality` 涉及多个 app 时按 app 分别运行质量检查。
- JSON 输出增加 `schemaVersion`。
- 为 P2 行为补测试。
