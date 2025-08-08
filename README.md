# Talk to the Boss - RAG 社内ナレッジ共有チャットボット

組織内に散在・属人化している知識やノウハウを集約し、対話 AI を通じて共有する RAG システムです。

## 📋 概要

このシステムは、Retrieval-Augmented Generation (RAG) 技術を使用して、社内のナレッジベースから適切な情報を検索し、AI が自然言語で回答を生成します。従業員の自己解決率向上と、特定メンバーへの問い合わせ工数削減を目的としています。

## 🛠 技術スタック

- **フロントエンド**: Next.js 14 + Material-UI + TypeScript
- **バックエンド**: Firebase Cloud Functions
- **データベース**: Firestore
- **AI/ML**: Google Vertex AI (Text Embeddings) + Gemini API
- **認証**: Firebase Authentication（Phase 2 で実装予定）
- **インフラ**: Firebase Hosting

## 📁 プロジェクト構造

```
talk-to-the-boss/
├── docs/                          # プロジェクトドキュメント
│   ├── ARCHITECTURE.md            # アーキテクチャ設計
│   └── SPEC.md                    # 機能仕様書
├── frontend/                      # Next.jsアプリケーション
│   ├── src/
│   │   ├── app/                   # App Router
│   │   │   ├── admin/             # 管理画面
│   │   │   └── page.tsx           # チャット画面
│   │   ├── components/            # Reactコンポーネント
│   │   │   ├── chat/              # チャット関連
│   │   │   └── admin/             # 管理画面関連
│   │   ├── lib/                   # ユーティリティ
│   │   └── types/                 # TypeScript型定義
│   ├── package.json
│   └── next.config.js
├── functions/                     # Firebase Cloud Functions
│   ├── src/
│   │   ├── handlers/              # APIハンドラー
│   │   ├── services/              # ビジネスロジック
│   │   └── types/                 # TypeScript型定義
│   ├── package.json
│   └── tsconfig.json

├── firebase.json                  # Firebase設定
├── firestore.rules               # Firestore セキュリティルール
├── firestore.indexes.json        # Firestore インデックス
```

## 🚀 セットアップ

### 前提条件

- Node.js 18+
- npm または yarn
- Firebase CLI (`npm install -g firebase-tools`)
- Google Cloud Project（以下の API 有効化済み）
  - Firebase API
  - Firestore API
  - Vertex AI API
  - Generative Language API

### 1. プロジェクトのクローンと依存関係インストール

```bash
git clone <repository-url>
cd talk-to-the-boss

# 依存関係をインストール（自動的にfrontend/functionsもインストール）
npm install
```

### 2. Google Cloud Project の設定

```bash
# Google Cloud にログイン
gcloud auth login

# プロジェクトを設定
gcloud config set project YOUR_PROJECT_ID

# 必要なAPIを有効化
gcloud services enable firestore.googleapis.com
gcloud services enable aiplatform.googleapis.com
gcloud services enable generativelanguage.googleapis.com
```

### 3. Firebase の設定

```bash
# Firebaseにログイン
firebase login

# プロジェクトを設定
firebase use YOUR_PROJECT_ID

# Firestoreデータベースを初期化（初回のみ）
firebase firestore:deploy
```

### 4. 環境変数の設定

#### フロントエンド設定 (`frontend/.env.local`)

```bash
cp frontend/env.example frontend/.env.local
```

```env
# Firebase設定（Firebase コンソールから取得）
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Cloud Functions URL（開発時はエミュレーター）
NEXT_PUBLIC_FUNCTIONS_URL=http://localhost:5001/your_project_id/us-central1
```

#### Cloud Functions 設定 (`functions/.env`)

```bash
cp functions/env.example functions/.env
```

```env
# Google Cloud Project設定
GOOGLE_CLOUD_PROJECT=your_project_id
GOOGLE_CLOUD_LOCATION=us-central1

# Gemini API設定（Google AI Studioから取得）
GEMINI_API_KEY=your_gemini_api_key

# Vertex AI設定
VERTEX_AI_PROJECT_ID=your_project_id
VERTEX_AI_LOCATION=us-central1
```

### 5. Firebase 設定ファイルの更新

`.firebaserc` ファイルを編集：

```json
{
  "projects": {
    "default": "your_project_id"
  }
}
```

## 🏃‍♂️ 開発環境での実行

```bash
# フロントエンド開発サーバー起動
npm run dev
```

## 🌐 アクセス URL

- **フロントエンド**: http://localhost:3000

## 📦 デプロイ

### 本番環境へのデプロイ

```bash
# 本番デプロイ
npm run deploy
```

### デプロイ前の確認事項

1. ✅ `.env.local` と `.env` の本番環境用設定
2. ✅ Firebase プロジェクトの課金設定有効化
3. ✅ Vertex AI API の有効化と権限設定
4. ✅ Firestore セキュリティルールの確認

## 🎯 主要機能

### Phase 1 (MVP) - 実装済み

- ✅ **チャット画面** (`/`)

  - AI との対話インターフェース
  - リアルタイム回答生成
  - 会話履歴の保持

- ✅ **RAG 機能**

  - Vertex AI Embeddings によるナレッジ検索
  - Gemini API による回答生成
  - コンテキストを考慮した応答

- ✅ **学習ループ機能**

  - ナレッジ不足時の自動判定
  - ユーザーからの新規情報登録
  - 継続的なナレッジベース改善

- ✅ **ナレッジ管理** (`/admin`)
  - CRUD 操作（作成・読取・更新・削除）
  - Markdown サポート
  - プレビュー機能

### Phase 2 (拡張機能) - 今後実装予定

- 🔄 **認証機能**

  - Firebase Authentication
  - Google Workspace ドメイン制限

- 🔄 **フィードバック機能**

  - 回答の評価（👍/👎）
  - 改善提案の収集

- 🔄 **拡張管理機能**
  - カテゴリ分類
  - タグ機能
  - 検索・フィルタリング

## 🛠 開発者向け情報

### API エンドポイント

```
POST /chat           # チャット処理
GET  /knowledge      # ナレッジ一覧取得
POST /knowledge      # ナレッジ作成
PUT  /knowledge/:id  # ナレッジ更新
DELETE /knowledge/:id # ナレッジ削除
```

### データベーススキーマ

#### ナレッジベース (`knowledge_base`)

```typescript
{
  id: string;
  title: string;
  content: string;
  embedding: number[];        // Vertex AI Embeddings
  createdAt: Timestamp;
  updatedAt: Timestamp;
  category?: string;          // Phase 2
  tags?: string[];           // Phase 2
}
```

#### チャット履歴 (`chat_history`)

```typescript
{
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Timestamp;
  sessionId: string;
}
```

## 🐛 トラブルシューティング

### よくある問題

1. **Vertex AI API エラー**

   ```bash
   # APIが有効化されているか確認
   gcloud services list --enabled --filter="aiplatform"

   # 認証情報の確認
   gcloud auth application-default login
   ```

2. **Firestore 接続エラー**

   ```bash
   # エミュレーター起動確認
   firebase emulators:start --only firestore
   ```

3. **依存関係エラー**
   ```bash
   # node_modulesを削除して再インストール
   rm -rf node_modules package-lock.json
   npm install
   ```

## 📄 ライセンス

MIT License

## 🤝 貢献

詳細な仕様は以下を参照してください：

- [機能仕様書](docs/SPEC.md)
- [アーキテクチャ設計](docs/ARCHITECTURE.md)

## 📞 サポート

問題や質問がある場合は、GitHub の Issues で報告してください。
