// チャットリクエストの型定義
export interface ChatRequest {
  message: string;
  sessionId?: string;
}

// チャットレスポンスの型定義
export interface ChatResponse {
  success: boolean;
  message: string;
  needsMoreInfo?: boolean;
}

// ナレッジベースの型定義
export interface Knowledge {
  id?: string;
  title: string;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
  // Phase 2で追加予定
  category?: string;
  tags?: string[];
}

// チャットメッセージの型定義
export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  sessionId: string;
}

// Vertex AI Embeddingsのレスポンス型
export interface EmbeddingResponse {
  embeddings: {
    values: number[];
  }[];
}

// Gemini APIのレスポンス型
export interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}
