# Upstream / 上游来源

本目录是 **透镜 Lens 设计系统** 运行时的一个子集副本，用于浏览器扩展中离线运行。

| 项 | 值 |
| --- | --- |
| 上游仓库 | https://github.com/ruiqichenbiec/design-systems |
| 上游路径 | `lens/lab/design-system/` |
| 上游版本 | `1.1.0-showcase.1`（`tokens.js` 中的 `version`） |
| 许可证 | MIT，见同目录 `LICENSE` |

## 为什么只保留了这些文件

入口是 `runtime.js`，它的依赖闭包为：

```
runtime.js
├── internal/renderer.js   WebGL2 折射渲染器
│   ├── internal/optics.js
│   ├── internal/context-budget.js
│   └── ../tokens.js
├── internal/jelly.js      指针弹性物理
│   └── internal/jelly-physics.js
├── sound.js               合成音效（本扩展默认关闭）
├── tokens.js              设计令牌（唯一变量来源）
├── focus.js               键盘焦点管理
├── tokens.css
└── components.css         lg- 命名空间的材质与控件样式
```

上游的 `components.js`、`card-list.js`、`showcase*.js`、`catalog*.js` 等未引入——
本项目只使用 `[data-glass]` 约定自行绘制磁贴，不需要组件工厂。

## 升级方式

从上游重新拷贝上述文件到本目录，然后跑一次验证（`npm run check` 会检查文件完整性与
`data-glass` 渲染是否正常）。修改上游文件时请同时更新本文件里的版本号。

**不要直接改这里的文件**：本地改动会在下次升级上游时丢失。需要覆盖样式请写在
`src/newtab.css` 里。
