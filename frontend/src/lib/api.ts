import {
  ChatRequest,
  ChatResponse,
  KnowledgeCreateRequest,
  Knowledge,
} from "@/types";

const FUNCTIONS_URL = process.env.NEXT_PUBLIC_FUNCTIONS_URL || "";

// チャットメッセージ送信
export async function sendChatMessage(
  request: ChatRequest
): Promise<ChatResponse> {
  try {
    const response = await fetch(`${FUNCTIONS_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error("Chat request failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Chat API error:", error);
    return {
      success: false,
      message:
        "現在システムに問題が発生しています。時間をおいて再度お試しください",
    };
  }
}

// 新しいナレッジを作成
export async function createKnowledge(
  knowledge: KnowledgeCreateRequest
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${FUNCTIONS_URL}/knowledge`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(knowledge),
    });

    if (!response.ok) {
      throw new Error("Knowledge creation failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Knowledge creation error:", error);
    return {
      success: false,
      message: "ナレッジの作成に失敗しました",
    };
  }
}

// ナレッジ一覧取得
export async function getKnowledgeList(): Promise<Knowledge[]> {
  try {
    const response = await fetch(`${FUNCTIONS_URL}/knowledge`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch knowledge list");
    }

    const data = await response.json();
    return data.knowledge || [];
  } catch (error) {
    console.error("Knowledge list fetch error:", error);
    return [];
  }
}

// ナレッジ更新
export async function updateKnowledge(
  id: string,
  knowledge: KnowledgeCreateRequest
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${FUNCTIONS_URL}/knowledge/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(knowledge),
    });

    if (!response.ok) {
      throw new Error("Knowledge update failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Knowledge update error:", error);
    return {
      success: false,
      message: "ナレッジの更新に失敗しました",
    };
  }
}

// ナレッジ削除
export async function deleteKnowledge(
  id: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${FUNCTIONS_URL}/knowledge/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Knowledge deletion failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Knowledge deletion error:", error);
    return {
      success: false,
      message: "ナレッジの削除に失敗しました",
    };
  }
}
