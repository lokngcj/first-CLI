# P3 阶段性沉淀

## 阶段目标

P3 目标是补齐发布与维护能力，让 `atai-ai` 更适合被安装、接入 CI 和脚本化使用。

## 已完成内容

### 用户文档

新增 `README.md`，覆盖：

- 工具定位。
- Node.js 要求。
- 安装与本地开发命令。
- 5 个子命令的使用示例。
- 规则源范围。
- 输出格式和 JSON `schemaVersion`。
- 稳定退出码。
- 开发与验收命令。

### CI

新增 `.github/workflows/ci.yml`。

矩阵：

- `ubuntu-latest`
- `windows-latest`
- Node.js `20.x`
- Node.js `22.x`

执行：

```bash
npm ci
npm run build
npm test
npm audit --registry=https://registry.npmjs.org/
npm run pack:dry-run
```

### 发布配置

更新 `package.json`：

- 增加 `engines.node >=20.0.0`。
- npm package 内容包含：
  - `dist`
  - `docs`
  - `README.md`
- 增加 `pack:dry-run` 脚本。

### 退出码规范

新增 `src/utils/errors.ts`，集中定义退出码：

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

已接入：

- `index.ts` 命令入口错误处理。
- `project-resolver` 项目和 target 路径错误。
- `preflight` 规则源错误。
- `verify` 规则源、代码违规、质量失败优先级。
- `fix-suggestions` 规则源错误和代码违规。
- `rules-check` 规则源错误。
- `figma-compress` 图片输入和格式错误。

## 验收标准

本阶段必须通过：

```bash
npm run build
npm test
npm audit --registry=https://registry.npmjs.org/
npm run pack:dry-run
```

## 后续建议

- 根据实际发布目标补充 `license`、`repository`、`homepage`。
- 如需发布到 npm，正式发布前再运行一次 `npm pack --dry-run` 检查包内容。
- 如果后续决定不跟踪 `dist/`，需要单独调整发布流程和 `.gitignore`。
