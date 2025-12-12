# Repository Guidelines
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.


## Always respond in Chinese-simplified

## 项目概述

这是一个基于 TypeScript 的 Node.js 项目模板，使用 pnpm 作为包管理器，用于快速启动 TypeScript 开发。

## 开发命令

### 项目初始化
```bash
# 安装依赖
pnpm install
```

### 运行开发环境
```bash
pnpm dev
```

### 依赖管理
```bash
# 添加生产依赖
pnpm add package-name

# 添加开发依赖
pnpm add -D package-name

# 检查过时的包
pnpm outdated

# 更新所有依赖
pnpm update
```

## 技术栈

- **TypeScript**: 5.9.3
- **Node.js**: @types/node 24.6.2
- **运行时**: ts-node 10.9.2
- **包管理器**: pnpm（必须使用 pnpm，避免使用 npm 或 yarn）

## TypeScript 配置

- **编译目标**: ES2016
- **模块系统**: CommonJS
- **严格模式**: 启用（所有代码必须有适当的类型注解）
- **esModuleInterop**: 启用
- **forceConsistentCasingInFileNames**: 启用

## 项目结构

### 当前结构
```
.
├── src/
│   └── index.ts          # 主入口文件
├── package.json          # 项目配置和依赖
├── tsconfig.json         # TypeScript 配置
└── pnpm-lock.yaml        # 依赖锁定文件
```

### 推荐的目录结构（扩展时使用）
```
src/
├── index.ts          # 主入口文件
├── types/            # 类型定义
├── utils/            # 工具函数
├── services/         # 业务逻辑服务
├── models/           # 数据模型
└── config/           # 配置文件
```

## 开发规范

### 代码组织原则
- 所有源代码放在 `src/` 目录下
- 在 `src/` 目录下按功能模块组织文件
- 每个模块应该有清晰的职责分离
- 使用 `index.ts` 文件作为模块的导出入口

### 类型安全要求
- 始终使用 TypeScript 类型注解
- 遵循严格的类型检查规则
- 在添加新功能前，确保现有代码通过类型检查
- 在提交前确保代码通过类型检查

### 最佳实践
1. 所有新代码都必须有适当的类型注解
2. 保持代码结构清晰，按功能模块组织
3. 确保代码符合项目的 tsconfig.json 配置
4. 遵循 coding-standards.mdc 中的编码规范（如果存在）

## 部署准备

项目目前处于模板阶段，建议在实际使用时：
- 添加构建脚本到 package.json
- 配置生产环境的 TypeScript 编译
- 考虑添加 ESLint 和 Prettier 进行代码格式化
- 添加测试框架（建议 Jest 或 Vitest）
