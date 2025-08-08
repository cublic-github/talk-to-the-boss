import * as admin from "firebase-admin";
import { ChatMessage } from "../types";

export class ChatHistoryService {
  private db: admin.firestore.Firestore;

  constructor() {
    this.db = admin.firestore();
  }

  /**
   * チャットメッセージを保存する
   */
  async saveChatMessage(message: ChatMessage): Promise<void> {
    const docRef = this.db.collection("chat_history").doc(message.id);

    await docRef.set({
      ...message,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  /**
   * セッションのチャット履歴を取得する
   */
  async getChatHistory(
    sessionId: string,
    limit: number = 20
  ): Promise<ChatMessage[]> {
    const snapshot = await this.db
      .collection("chat_history")
      .where("sessionId", "==", sessionId)
      .orderBy("timestamp", "asc")
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate(),
    })) as ChatMessage[];
  }

  /**
   * 古いチャット履歴を削除する（定期的なクリーンアップ用）
   */
  async deleteOldChatHistory(daysToKeep: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const snapshot = await this.db
      .collection("chat_history")
      .where("timestamp", "<", cutoffDate)
      .get();

    const batch = this.db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  }

  /**
   * 特定セッションのチャット履歴を削除する
   */
  async deleteChatHistoryBySession(sessionId: string): Promise<void> {
    const snapshot = await this.db
      .collection("chat_history")
      .where("sessionId", "==", sessionId)
      .get();

    const batch = this.db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  }

  /**
   * チャットセッションの統計情報を取得する
   */
  async getChatStatistics(sessionId: string): Promise<{
    totalMessages: number;
    userMessages: number;
    aiMessages: number;
    firstMessageTime?: Date;
    lastMessageTime?: Date;
  }> {
    const snapshot = await this.db
      .collection("chat_history")
      .where("sessionId", "==", sessionId)
      .orderBy("timestamp", "asc")
      .get();

    const messages = snapshot.docs.map((doc) => doc.data()) as ChatMessage[];

    const userMessages = messages.filter((msg) => msg.isUser).length;
    const aiMessages = messages.filter((msg) => !msg.isUser).length;

    return {
      totalMessages: messages.length,
      userMessages,
      aiMessages,
      firstMessageTime: messages.length > 0 ? messages[0].timestamp : undefined,
      lastMessageTime:
        messages.length > 0
          ? messages[messages.length - 1].timestamp
          : undefined,
    };
  }
}
