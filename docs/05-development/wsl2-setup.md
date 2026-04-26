# WSL2 / Ubuntu 开发环境迁移

## 目标目录

推荐在 WSL2 / Ubuntu 中使用独立目录：

```bash
/root/repos/narrat-game
```

不要直接在 Windows 挂载盘目录中运行依赖安装或构建，也不要从 Windows 复制 `node_modules` 到 WSL2。

## 基础环境

```bash
apt update
apt install -y git curl build-essential
```

项目要求 Node 22+。项目不固定 pnpm 版本号，会使用本机已安装的最新 pnpm 版本。

```bash
cd /root/repos/narrat-game
nvm install
nvm use
node -v
# 确保本机 pnpm 可用（推荐 10+）
pnpm -v
```

## 依赖安装

```bash
pnpm install
```

使用本机已有的 pnpm，不强制通过 corepack 安装。

## 从 Windows 迁移时排除的目录

迁移源码时不要复制这些生成产物或平台相关目录：

```text
node_modules/
dist/
out/
out-steam/
.tmp-*/
build/
tmp/
tests/tmp/
```

尤其是 `node_modules/`，其中可能包含 Electron、oxlint、steamworks.js 等平台相关二进制，必须在 WSL2 内重新安装。

## 运行 Demo UI

```bash
pnpm run dev:demo-ui
```

通常可以从 Windows 浏览器访问：

```text
http://localhost:5173
```

如果遇到 localhost 转发问题，可临时使用 Vite host 参数：

```bash
pnpm run dev:demo-ui -- --host 0.0.0.0
```

## 迁移后验证命令

建议运行全部测试以验证迁移完整性：

```bash
pnpm run test
```

该命令会串行运行全部测试套件，全部通过即表示迁移验证完成。

也可以单独运行关键测试：

```bash
pnpm run type-check
pnpm run test:events
pnpm run test:demo-session
pnpm run test:demo-flow
pnpm run test:save
pnpm run build
```

## Electron / Linux 打包注意事项

Web Demo 主路径不依赖桌面环境。若运行 Electron 或 Linux 打包，WSL2 可能需要 WSLg 和额外系统库，例如：

```bash
apt install -y libnss3 libatk-bridge2.0-0 libgtk-3-0 libxss1 libasound2t64
```

若需要 `deb` / `rpm` 打包，可按需安装：

```bash
apt install -y dpkg fakeroot rpm
```

Windows 包建议仍在 Windows 环境或 Windows CI runner 中构建；WSL2 默认优先验证 Web Demo、测试、普通 build 和 Linux package。

## 外部参考仓库

DoL 参考仓库在 WSL2 下建议放置于：

```bash
/root/repos/degrees-of-lewdity
```

该仓库仅用于只读机制参考，不得直接复制源码到本项目运行路径。
