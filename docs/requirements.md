# atai-ai 需求规格与验收基线

## 1. 工具定位

`atai-ai` 是一个本地命令行工作流工具，面向根目录包含 `apps/*` 的多应用前端 Monorepo 仓库。

核心能力：

- 动态识别目标文件归属的子应用。
- 读取、合并并校验子应用规则源。
- 在改代码前输出上下文。
- 校验代码规则违规。
- 联动目标项目本地质量工具链。
- 生成合规修改建议。
- 扫描全项目规则健康度。
- 压缩 Figma 导出的位图资源。

运行环境：

- Node.js + TypeScript。
- CLI 框架使用 `commander.js`。
- Git 集成使用 `simple-git`。
- 图片压缩使用 `sharp`。
- 兼容 Windows PowerShell、macOS/Linux 终端。
- 质量检查依赖目标项目本地安装的 eslint、typescript、vitest。

## 2. 强制项目结构

所有命令均必须接收 `--project`，且该参数必须是目标 Monorepo 根目录的绝对路径。

有效项目必须满足：

- `--project` 路径存在。
- `--project` 是目录。
- 根目录下存在 `apps/` 目录。
- 子应用均位于 `apps/<app-name>/`。

目标文件必须能归属到唯一子应用：`apps/<app-name>/...`。

## 3. 固定执行链路

所有子命令必须按以下顺序执行：

1. 命令与参数解析校验。
2. 项目根目录与 `apps/` 结构校验。
3. 基于 `--target` 或 `--staged` 识别子应用上下文。
4. 加载当前子应用规则源。
5. 校验规则源自身异常。
6. 执行子命令核心能力。
7. 按 `--format` 输出结果。

优先级：

1. 规则源异常。
2. 代码违规。
3. 质量检查。

当规则源存在 error 级异常时，必须优先输出异常并终止后续代码校验。

## 4. 规则源范围

每个子应用仅允许读取以下规则源：

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

规则源异常类型：

- 冲突标记：Git merge conflict marker 或 `<!-- CONFLICT -->`。
- 项目指南错配：`PROJECT_GUIDE.md` 中存在 `TODO`、`FIXME`、`XXX`、`PLACEHOLDER`。
- 样式体系冲突：规则源中同时出现多个样式体系。
- 规则缺失：缺少推荐规则源，例如 `PROJECT_GUIDE.md`。

## 5. 子命令规范

### 5.1 preflight

用途：改代码前输出目标文件上下文。

参数：

- 必填：`--project`、`--target`
- 可选：`--format text|markdown|json`

行为：

- 支持目标文件尚未创建。
- 仅输出归属应用、样式体系、规则来源、质量命令、规则信号、规则源异常。
- 不做代码校验。
- 不修改文件。

### 5.2 verify

用途：校验目标文件或 Git 暂存文件是否违反规则，并可联动质量检查。

参数：

- 必填：`--project`
- 二选一：`--target` 或 `--staged`
- 可选：`--quality`
- 可选：`--format text|markdown|json`

行为：

- `--target` 校验单个文件。
- `--staged` 通过 Git 读取暂存区文件列表并批量校验。
- 先校验规则源异常；存在 error 时跳过代码校验。
- 代码校验必须输出违规位置、原因、规则来源和严重级别。
- `--quality` 按顺序运行目标子应用本地命令：lint -> typecheck -> test。

### 5.3 fix-suggestions

用途：基于违规项生成合规修改建议。

参数：

- 必填：`--project`、`--target`
- 可选：`--format text|markdown|json`
- 可选：`--with-snippets`
- 可选：`--apply-checklist`

行为：

- 完成规则源校验与代码违规扫描。
- 针对每项违规输出修改建议。
- `--with-snippets` 输出代码片段。
- `--apply-checklist` 输出分步清单。
- markdown 输出必须适合粘贴到任务系统、代码评审和文档中。

### 5.4 rules-check

用途：扫描所有子应用规则健康度。

参数：

- 必填：`--project`
- 可选：`--format text|markdown|json`

行为：

- 遍历 `apps/` 下所有子应用。
- 分应用输出规则源列表和规则异常。
- 汇总异常总数和存在问题的应用数。

### 5.5 figma-compress

用途：压缩 Figma 导出的位图资源。

参数：

- 必填：`--project`、`--input`、`--output`

支持格式：

- `png`
- `jpg`
- `jpeg`
- `webp`

行为：

- 校验 `--project` 是有效 Monorepo 根目录。
- 校验输入文件存在且格式受支持。
- 文件小于等于 1MB 时跳过压缩并说明原因。
- 文件大于 1MB 时执行无损或低损压缩。
- 输出压缩前后大小、压缩比例、是否跳过。

## 6. 代码规则清单

必须覆盖的违规项：

- 规则源冲突标记。
- 项目指南内容错配。
- 样式体系冲突。
- 业务代码直接使用 `axios`。
- 业务代码直接使用 `fetch`。
- i18n 文案硬编码。
- 滥用 `useCallback`。
- 未按项目统一写法调用接口，例如直接引入非项目 HTTP 客户端或使用 `XMLHttpRequest`。

豁免规则：

- `*.test.ts`
- `*.test.tsx`
- `*.spec.ts`
- `*.spec.tsx`

以上测试文件豁免统一请求写法违规检查，但不豁免 i18n 和 `useCallback` 检查。

## 7. 输出格式

支持格式：

- `text`：默认格式，终端友好、层级清晰。
- `markdown`：标准 Markdown，可粘贴到任务系统、代码评审和文档。
- `json`：标准结构化 JSON，stdout 必须只包含可解析 JSON；进度或提示信息应写入 stderr 或结构化字段。

所有 JSON 输出必须包含 `schemaVersion`，当前版本为 `"1.0"`，用于脚本集成时识别结构化输出协议。

## 9. 退出码规范

所有命令必须使用稳定退出码，便于 CI、Git hooks 和外部脚本集成。

| Code | Meaning |
|------|---------|
| 0 | 执行成功 |
| 1 | 未预期的内部错误 |
| 2 | 命令用法或参数错误 |
| 3 | 项目、app 或 target 路径错误 |
| 4 | 规则源错误 |
| 5 | 代码规则违规 |
| 6 | 质量检查失败 |
| 7 | 图片输入或压缩错误 |

当多个失败同时存在时，按以下优先级返回退出码：

```text
规则源错误 -> 代码规则违规 -> 质量检查失败
```

## 10. 容错与报错

必须覆盖：

- `--project` 不是绝对路径。
- `--project` 不存在。
- `--project` 不是目录。
- `--project` 缺少 `apps/`。
- `--target` 不存在。
- `--target` 不在 `apps/*` 下。
- 规则源存在冲突或错配。
- `--quality` 运行耗时提示。
- 质量命令失败时输出失败原因。
- 图片格式不支持。
- 图片小于等于 1MB。
- 图片已经高度压缩导致压缩收益低或无收益。

## 11. 当前文件结构

```text
src/
  index.ts
  commands/
    preflight.ts
    verify.ts
    fix-suggestions.ts
    rules-check.ts
    figma-compress.ts
  core/
    project-resolver.ts
    rules-loader.ts
    rules-validator.ts
    code-checker.ts
    quality-runner.ts
    formatter.ts
  types/
    index.ts
  utils/
    constants.ts
    fs.ts
    git.ts
```

## 12. 本地使用与验收命令

安装依赖：

```bash
npm install
```

编译：

```bash
npm run build
```

查看帮助：

```bash
node dist/index.js --help
```

示例：

```bash
node dist/index.js preflight --project "/absolute/path/to/monorepo" --target apps/web/src/App.tsx --format json
node dist/index.js verify --project "/absolute/path/to/monorepo" --target apps/web/src/App.tsx --format markdown
node dist/index.js verify --project "/absolute/path/to/monorepo" --staged --quality
node dist/index.js fix-suggestions --project "/absolute/path/to/monorepo" --target apps/web/src/App.tsx --with-snippets --apply-checklist
node dist/index.js rules-check --project "/absolute/path/to/monorepo" --format json
node dist/index.js figma-compress --project "/absolute/path/to/monorepo" --input apps/web/assets/source.png --output apps/web/assets/source.min.png
```
