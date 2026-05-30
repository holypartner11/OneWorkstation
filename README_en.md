# OneWorkstation

[中文](./README_zh.md) | English

---

**v0.0.1 | ⚠️ UI Prototype Phase**

## Overview

OneWorkstation is a unified AI workstation that lets you use OpenClaw, Claude Code, and Hermes in a single interface — manage all your AI assistants in one place.

## Features

- **Multi-platform Integration** - Manage multiple AI assistants in one interface
- **Agent Management** - Configure independent AI agents for each platform
- **Group Chat** - Multi-agent conversations with @mention support
- **Config Sharing** - "Brain" configs can be copied between platforms
- **Theme Switching** - Light/Dark/System theme support
- **Session History** - Persistent chat history storage

## Supported AI Platforms

| Platform | Theme | Description |
|----------|-------|-------------|
| OpenClaw | Blue | Multi-agent orchestration, supports GPT-4o, Claude, and more |
| Claude Code | Gray | Anthropic CLI tool for project and session management |
| Hermes | Green | Local AI assistant framework |

## Getting Started

### Install Dependencies

```bash
npm install
cd server && npm install
```

### Mac / Linux

```bash
./start.sh
```

### Windows

```bash
# Terminal 1 - Start backend
cd server
npm run dev

# Terminal 2 - Start frontend
npm run dev
```

### Access

Open browser: http://localhost:5173

## Project Structure

```
OneWorkstation
├── src/                    # React frontend
│   ├── components/layout/  # Layout components
│   ├── views/              # View components
│   ├── services/           # API services
│   ├── store/              # State management
│   └── types/              # TypeScript types
├── server/                 # Express backend
│   └── src/routes/         # API routes
└── public/                 # Static assets
```

## Tech Stack

- React 19 + TypeScript
- Vite
- Zustand (state management)
- Express (backend)
- Tailwind CSS v4

## System Requirements

- Node.js 18+
- iTerm2 (for Claude Code and Hermes session integration)
- CLI tools for each AI platform installed and configured

## Notice

⚠️ This project is currently in UI prototype phase — not for production use.