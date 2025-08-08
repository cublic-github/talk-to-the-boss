import { Request, Response } from "firebase-functions";
import { ChatRequest, ChatResponse } from "../types";
import { EmbeddingService } from "../services/embeddingService";
import { KnowledgeService } from "../services/knowledgeService";
import { GeminiService } from "../services/geminiService";
import { ChatHistoryService } from "../services/chatHistoryService";

export async function chatHandler(req: Request, res: Response): Promise<void> {
  try {
    const { message, sessionId }: ChatRequest = req.body;

    if (!message?.trim()) {
      res.status(400).json({
        success: false,
        message: "メッセージが入力されていません",
      });
      return;
    }

    const embeddingService = new EmbeddingService();
    const knowledgeService = new KnowledgeService();
    const geminiService = new GeminiService();
    const chatHistoryService = new ChatHistoryService();

    // セッションIDがない場合は新規作成
    const currentSessionId = sessionId || `session_${Date.now()}`;

    // 1. 質問をベクトル化
    console.log("🔍 Query:", message);
    const queryEmbedding = await embeddingService.getEmbedding(message);
    console.log("📊 Query embedding generated, length:", queryEmbedding.length);

    // 2. 関連ナレッジを検索
    console.log("🔎 Searching for similar knowledge...");
    const relatedKnowledge = await knowledgeService.searchSimilarKnowledge(
      queryEmbedding
    );
    console.log("📚 Found", relatedKnowledge.length, "related knowledge items");
    console.log(
      "📝 Related knowledge:",
      relatedKnowledge.map((k) => ({
        title: k.title,
        similarity: (k as any).similarity,
      }))
    );

    // 3. 会話履歴を取得
    const chatHistory = await chatHistoryService.getChatHistory(
      currentSessionId
    );

    // 過去のAIメッセージ（エラーフォールバックなど）による汚染を避けるため、ユーザー発話のみをプロンプトに渡す
    const userOnlyHistory = chatHistory.filter((m) => m.isUser);

    // 4. Geminiで回答生成
    const aiResponse = await geminiService.generateResponse({
      query: message,
      relatedKnowledge,
      chatHistory: userOnlyHistory,
    });

    // 5. 会話履歴を保存
    await chatHistoryService.saveChatMessage({
      id: `user_${Date.now()}`,
      content: message,
      isUser: true,
      timestamp: new Date(),
      sessionId: currentSessionId,
    });

    await chatHistoryService.saveChatMessage({
      id: `ai_${Date.now()}`,
      content: aiResponse.message,
      isUser: false,
      timestamp: new Date(),
      sessionId: currentSessionId,
    });

    const response: ChatResponse = {
      success: true,
      message: aiResponse.message,
      needsMoreInfo: aiResponse.needsMoreInfo,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Chat handler error:", error);
    res.status(500).json({
      success: false,
      message:
        "現在システムに問題が発生しています。時間をおいて再度お試しください",
    });
  }
}
