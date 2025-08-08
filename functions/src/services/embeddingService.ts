import { GoogleAuth } from "google-auth-library";

export class EmbeddingService {
  private projectId: string;
  private location: string;
  private model: string;

  constructor() {
    this.projectId =
      process.env.VERTEX_AI_PROJECT_ID ||
      process.env.GOOGLE_CLOUD_PROJECT ||
      "";
    this.location = "us-central1";
    this.model = "text-embedding-005";
    console.log(
      `Embedding service (REST) initialized for project: ${this.projectId}, location: ${this.location}, model: ${this.model}`
    );
  }

  /**
   * テキストをベクトル化する（Vertex AI REST API使用）
   */
  async getEmbedding(text: string): Promise<number[]> {
    try {
      const url = `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/${this.model}:predict`;

      const auth = new GoogleAuth({
        scopes: ["https://www.googleapis.com/auth/cloud-platform"],
      });
      const client = await auth.getClient();
      const headers = await client.getRequestHeaders();

      const body = {
        instances: [{ content: text }],
      };

      const res = await fetch(url, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Vertex REST error ${res.status}: ${errText}`);
      }

      const data: any = await res.json();
      const values = data?.predictions?.[0]?.embeddings?.values;
      if (Array.isArray(values)) {
        return values as number[];
      }

      throw new Error("No embedding returned from Vertex AI REST");
    } catch (error: any) {
      console.error("Vertex AI REST Embedding error:", error);
      throw new Error(
        `Failed to generate embedding: ${error?.message || "Unknown error"}`
      );
    }
  }

  /**
   * 複数のテキストを一括でベクトル化する
   */
  async getBatchEmbeddings(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];

    for (const text of texts) {
      const embedding = await this.getEmbedding(text);
      embeddings.push(embedding);
    }

    return embeddings;
  }

  /**
   * コサイン類似度を計算する
   */
  calculateCosineSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) {
      throw new Error("Vector dimensions must match");
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }

    const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2);

    if (magnitude === 0) {
      return 0;
    }

    return dotProduct / magnitude;
  }
}
