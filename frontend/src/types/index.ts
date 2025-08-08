// チャットメッセージの型定義
export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

// チャットセッションの型定義
export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// ナレッジベースの型定義
export interface Knowledge {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  // Phase 2で追加予定
  category?: string;
  tags?: string[];
}

// APIレスポンスの型定義
export interface ChatResponse {
  success: boolean;
  message: string;
  needsMoreInfo?: boolean;
}

export interface KnowledgeCreateRequest {
  title: string;
  content: string;
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
}
