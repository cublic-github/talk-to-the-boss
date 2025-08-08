```mermaid
graph TD
    subgraph "User Interface (Next.js + MUI)"
        A[ユーザー] -- "1.質問を入力" --> B(チャットUI);
        B -- "9.回答を表示 / 新情報を教える" --> A;
    end

    subgraph "Firebase Backend (RAG Pipeline)"
        B -- "2.処理をリクエスト" --> C{Cloud Functions};
        B -- "10.新ナレッジ登録をリクエスト" --> C;
        
        C -- "3.会話履歴を取得" --> H["Firestore (チャット履歴)"];
        
        C -- "4.質問をベクトル化" --> D[Vertex AI Embeddings API];
        D -- "ベクトルを返す" --> C;

        C -- "5.ベクトルで関連ナレッジを検索" --> E["Firestore (ナレッジベース)"];
        E -- "6.関連ナレッジを返す" --> C;
        
        C -- "7.質問/履歴/ナレッジを元に回答生成" --> F[Gemini API];
        F -- "8.最終的な回答を返す" --> C;

        C -- "回答を履歴に保存" --> H;
        C -- "新ナレッジを書き込み" --> E;

    end

    subgraph "Knowledge Base Admin"
        G[管理者] -- "ナレッジを手動で登録・更新" --> E;
    end

    %% スタイル設定
    style A fill:#e3f2fd,stroke:#333
    style B fill:#e3f2fd,stroke:#333
    style C fill:#fffde7,stroke:#333,stroke-width:2px
    style E fill:#ffe0b2,stroke:#333
    style H fill:#ffcdd2,stroke:#333
    style D fill:#c8e6c9,stroke:#333
    style F fill:#c8e6c9,stroke:#333
    style G fill:#f5f5f5,stroke:#333
    ```