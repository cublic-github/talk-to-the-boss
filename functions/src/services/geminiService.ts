import { GenerativeServiceClient } from "@google-ai/generativelanguage";
import { Knowledge, ChatMessage } from "../types";

interface GenerateResponseInput {
  query: string;
  relatedKnowledge: Knowledge[];
  chatHistory: ChatMessage[];
}

interface GenerateResponseOutput {
  message: string;
  needsMoreInfo: boolean;
}

export class GeminiService {
  private client: GenerativeServiceClient;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }

    this.client = new GenerativeServiceClient({
      apiKey,
    });
  }

  /**
   * 回答を生成する
   */
  async generateResponse(
    input: GenerateResponseInput
  ): Promise<GenerateResponseOutput> {
    const { query, relatedKnowledge, chatHistory } = input;

    // 関連ナレッジがない場合の処理
    if (relatedKnowledge.length === 0) {
      return {
        message:
          "申し訳ありませんが、私の知識ではわかりかねます。正しい情報を教えていただければ、今後の回答のために記憶させていただきます。",
        needsMoreInfo: true,
      };
    }

    try {
      const prompt = this.buildPrompt(query, relatedKnowledge, chatHistory);

      const request = {
        model: "models/gemini-2.5-pro",
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        },
      };

      const [response] = await this.client.generateContent(request);

      if (response.candidates && response.candidates.length > 0) {
        const content = response.candidates[0].content;
        if (content && content.parts && content.parts.length > 0) {
          const text = content.parts[0].text || "";
          return {
            message: text,
            needsMoreInfo: false,
          };
        }
      }

      throw new Error("No content generated");
    } catch (error) {
      console.error("Gemini API error:", error);
      return {
        message:
          "現在システムに問題が発生しています。時間をおいて再度お試しください",
        needsMoreInfo: false,
      };
    }
  }

  /**
   * プロンプトを構築する
   */
  private buildPrompt(
    query: string,
    relatedKnowledge: Knowledge[],
    chatHistory: ChatMessage[]
  ): string {
    let prompt = `あなたは社内のナレッジ共有を担当するAIアシスタントです。以下の情報を参考にして、ユーザーの質問に適切に回答してください。

【重要な指示】
- 提供されたナレッジベースの情報のみを使用して回答してください
- 情報が不足している場合は、正直にその旨を伝えてください
- 丁寧で分かりやすい日本語で回答してください
- 会話履歴を考慮して、文脈に沿った回答をしてください
- システム障害や利用不可などの表現は、根拠がある場合のみ用い、根拠がなければ使用しないでください
- 事実のない推測や一般論は避け、提供されたナレッジの範囲で簡潔に回答してください

`;

    // 会話履歴を追加
    if (chatHistory.length > 0) {
      prompt += `【会話履歴】\n`;
      const recentHistory = chatHistory.slice(-6); // 直近6件の履歴を使用
      for (const msg of recentHistory) {
        const role = msg.isUser ? "ユーザー" : "AI";
        prompt += `${role}: ${msg.content}\n`;
      }
      prompt += "\n";
    }

    // 関連ナレッジを追加
    prompt += `【関連するナレッジベース】\n`;
    for (let i = 0; i < relatedKnowledge.length; i++) {
      const knowledge = relatedKnowledge[i];
      prompt += `ナレッジ${i + 1}: ${knowledge.title}\n${
        knowledge.content
      }\n\n`;
    }

    // 質問を追加
    prompt += `【ユーザーの質問】\n${query}\n\n`;

    prompt += `【回答】\n`;

    return prompt;
  }

  /**
   * 質問の意図を確認する必要があるかチェック
   */
  async checkIfNeedsClarification(
    query: string
  ): Promise<{ needsClarification: boolean; clarificationQuestion?: string }> {
    return { needsClarification: false };
  }
}
