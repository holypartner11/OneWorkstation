# OneWorkstation

[English](./README_en.md) | 中文

---

**v0.0.1 | ⚠️ UI 原型阶段**

## 简介

OneWorkstation 是一个统一的 AI 工作站，让你在一个界面中同时使用 OpenClaw、Claude Code 和 Hermes 三个 AI 平台，轻松管理所有 AI 助手。

## 核心功能

- **多平台整合** - 在一个界面中管理多个 AI 助手
- **智能体管理** - 为每个平台配置独立的 AI 智能体
- **群聊协作** - 支持多智能体同时对话
- **配置共享** - "Brain" 配置可在平台间复制
- **主题切换** - 支持浅色/深色/系统主题
- **会话管理** - 持久化存储聊天记录

## 支持的 AI 平台

| 平台 | 主题色 | 说明 |
|------|--------|------|
| OpenClaw | 蓝色 | 多智能体编排，支持 GPT-4o、Claude 等模型 |
| Claude Code | 灰色 | Anthropic CLI 工具的项目和会话管理 |
| Hermes | 绿色 | 本地运行的 AI 助手框架 |

## 快速开始

### 安装依赖

```bash
npm install
cd server && npm install
```

### Mac 启动

```bash
./start.sh
```

### Windows 启动

```bash
# 终端 1 - 启动后端
cd server
npm run dev

# 终端 2 - 启动前端
npm run dev
```

### 访问

打开浏览器访问 http://localhost:5173

## 项目结构

```
OneWorkstation
├── src/                    # React 前端
│   ├── components/layout/ # 布局组件
│   ├── views/             # 视图组件
│   ├── services/          # API 服务
│   ├── store/             # 状态管理
│   └── types/             # TypeScript 类型
├── server/                # Express 后端
│   └── src/routes/        # API 路由
└── public/                # 静态资源
```

## 技术栈

- React 19 + TypeScript
- Vite
- Zustand (状态管理)
- Express (后端)
- Tailwind CSS v4

## 系统要求

- Node.js 18+
- iTerm2 (用于 Claude Code 和 Hermes 会话)
- 各 AI 平台的 CLI 工具已安装并配置

## 注意事项

⚠️ 本项目目前处于 UI 原型阶段，请勿用于生产环境。