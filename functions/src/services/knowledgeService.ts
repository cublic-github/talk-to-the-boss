import * as admin from "firebase-admin";
import { Knowledge } from "../types";
import { EmbeddingService } from "./embeddingService";

export class KnowledgeService {
  private db: admin.firestore.Firestore;
  private embeddingService: EmbeddingService;

  constructor() {
    this.db = admin.firestore();
    this.embeddingService = new EmbeddingService();
  }

  /**
   * 新しいナレッジを作成する
   */
  async createKnowledge(
    knowledge: Knowledge,
    embedding: number[]
  ): Promise<string> {
    const docRef = this.db.collection("knowledge_base").doc();

    await docRef.set({
      ...knowledge,
      embedding,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return docRef.id;
  }

  /**
   * ナレッジを更新する
   */
  async updateKnowledge(
    id: string,
    knowledge: Knowledge,
    embedding: number[]
  ): Promise<void> {
    const docRef = this.db.collection("knowledge_base").doc(id);

    await docRef.update({
      ...knowledge,
      embedding,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  /**
   * ナレッジを削除する
   */
  async deleteKnowledge(id: string): Promise<void> {
    const docRef = this.db.collection("knowledge_base").doc(id);
    await docRef.delete();
  }

  /**
   * 全ナレッジを取得する
   */
  async getAllKnowledge(): Promise<Knowledge[]> {
    const snapshot = await this.db
      .collection("knowledge_base")
      .orderBy("updatedAt", "desc")
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Knowledge[];
  }

  /**
   * IDでナレッジを取得する
   */
  async getKnowledgeById(id: string): Promise<Knowledge | null> {
    const doc = await this.db.collection("knowledge_base").doc(id).get();

    if (!doc.exists) {
      return null;
    }

    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate(),
      updatedAt: doc.data()?.updatedAt?.toDate(),
    } as Knowledge;
  }

  /**
   * 類似したナレッジを検索する
   */
  async searchSimilarKnowledge(
    queryEmbedding: number[],
    limit: number = 5,
    threshold: number = 0.5
  ): Promise<Knowledge[]> {
    console.log("🔍 Starting knowledge search with threshold:", threshold);

    // Firestoreから全ナレッジを取得（ベクトル検索機能がないため）
    const snapshot = await this.db.collection("knowledge_base").get();
    console.log("📊 Total knowledge documents:", snapshot.docs.length);

    const knowledgeWithSimilarity: Array<Knowledge & { similarity: number }> =
      [];

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const embedding = data.embedding;

      console.log("📝 Checking document:", doc.id, "title:", data.title);

      if (embedding && Array.isArray(embedding)) {
        const similarity = this.embeddingService.calculateCosineSimilarity(
          queryEmbedding,
          embedding
        );

        console.log("📊 Similarity for", data.title, ":", similarity);

        if (similarity >= threshold) {
          knowledgeWithSimilarity.push({
            id: doc.id,
            title: data.title,
            content: data.content,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
            similarity,
          });
          console.log("✅ Added to results:", data.title);
        } else {
          console.log(
            "❌ Below threshold:",
            data.title,
            similarity,
            "< ",
            threshold
          );
        }
      } else {
        console.log("⚠️  No embedding found for:", data.title);
      }
    }

    console.log("📚 Final results count:", knowledgeWithSimilarity.length);

    // 類似度でソートして上位結果を返す
    return knowledgeWithSimilarity
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(({ similarity, ...knowledge }) => knowledge);
  }

  /**
   * キーワードでナレッジを検索する（フォールバック）
   */
  async searchKnowledgeByKeywords(keywords: string[]): Promise<Knowledge[]> {
    const results: Knowledge[] = [];

    for (const keyword of keywords) {
      const snapshot = await this.db
        .collection("knowledge_base")
        .where("title", ">=", keyword)
        .where("title", "<=", keyword + "\uf8ff")
        .get();

      for (const doc of snapshot.docs) {
        const knowledge = {
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        } as Knowledge;

        // 重複を避ける
        if (!results.find((k) => k.id === knowledge.id)) {
          results.push(knowledge);
        }
      }
    }

    return results;
  }
}
