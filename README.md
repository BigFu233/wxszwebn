# 无限摄制社团官方网站 (Infinite Photography Club Website)

## 项目结构
- `frontend`: Vue 3 + TypeScript + Vite + Element Plus
- `backend`: Node.js + Express + TypeScript + MongoDB

## 快速开始

### 1. 数据库配置
1. 确保已安装 MongoDB 4.0+。
2. 启动 MongoDB 服务。
3. 修改 `backend/.env` 中的数据库配置。

### 2. 后端启动
```bash
cd backend
npm install
npm run dev      # 启动开发服务器 (http://localhost:3000)
```

### 3. 前端启动
```bash
cd frontend
npm install
npm run dev      # 启动开发服务器 (http://localhost:5173)
```

## 功能列表
- **用户认证**: 注册、登录、JWT 令牌。
- **权限管理**: 访客、社员、管理员三级权限。
- **作品展示**: 瀑布流布局展示作品。
- **社员中心**: 作品上传、任务查看。
- **管理后台**: 用户管理、内容审核。

## 技术栈
- 前端: Vue 3, Pinia, Vue Router, Element Plus, Axios, Sass
- 后端: Express, Mongoose, JsonWebToken, BcryptJS