# TuneCard Project Structure

## 專案概述
TuneCard 是一個音樂播放清單分享平台，使用 Next.js 13+ App Router 構建。

## 技術棧
- Frontend: Next.js 13+, React, TypeScript
- Styling: Tailwind CSS
- Database: Supabase
- Authentication: Supabase Auth
- UI Components: shadcn/ui

## 目錄結構

```
playlist-sharing/
├── app/                          # Next.js 13 App Router 目錄
│   ├── add-playlist/            # 添加播放清單頁面
│   ├── api/                     # API 路由
│   ├── auth/                    # 認證相關頁面
│   ├── create-playlist/         # 創建播放清單頁面
│   ├── login/                   # 登入頁面
│   ├── my-playlists/           # 我的播放清單頁面
│   ├── playlist/               # 單個播放清單頁面
│   ├── playlists/              # 播放清單相關頁面
│   ├── layout.tsx              # 根布局
│   ├── page.tsx                # 首頁
│   └── providers.tsx           # React context providers
│
├── components/                   # React 組件
│   ├── ui/                     # UI 組件 (shadcn/ui)
│   ├── header.tsx              # 頁面頭部組件
│   ├── latest-playlists.tsx    # 最新播放清單組件
│   ├── providers/              # Provider 組件
│   └── theme-provider.tsx      # 主題提供者組件
│
├── hooks/                       # React 自定義 hooks
│
├── lib/                        # 工具庫
│
├── public/                     # 靜態資源
│
├── styles/                     # 樣式文件
│
├── supabase/                   # Supabase 相關配置
│
├── types/                      # TypeScript 類型定義
│
├── utils/                      # 工具函數
│
├── .env.local                  # 環境變量
├── middleware.ts               # Next.js 中間件
├── next.config.js             # Next.js 配置
├── package.json               # 項目依賴
├── tailwind.config.js         # Tailwind CSS 配置
└── tsconfig.json              # TypeScript 配置
```

## 主要功能模塊

### 認證系統 (`app/auth/`)
- 使用 Supabase Auth 進行用戶認證
- 支持郵箱登錄

### 播放清單管理 (`app/playlists/`)
- 創建播放清單
- 編輯播放清單
- 查看播放清單
- 刪除播放清單

### API 路由 (`app/api/`)
- 搜索功能
- 播放清單 CRUD 操作
- 用戶數據操作

### UI 組件 (`components/`)
- 使用 shadcn/ui 構建的可重用組件
- 自定義組件如頁面頭部、播放清單卡片等

### 數據庫結構
使用 Supabase 作為後端數據庫，主要包含以下表：
- users: 用戶信息
- playlists: 播放清單
- playlist_tracks: 播放清單中的歌曲

### 樣式系統
- 使用 Tailwind CSS 進行樣式管理
- 支持深色模式
- 響應式設計
