import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { chatHandler } from "./handlers/chatHandler";
import { knowledgeHandler } from "./handlers/knowledgeHandler";

// Firebase Admin SDKの初期化
admin.initializeApp();

// corsOptions変数を削除（使われていないため）

// チャット処理のエンドポイント
export const chat = functions
  .region("us-central1")
  .runWith({
    memory: "1GB",
    timeoutSeconds: 300,
  })
  .https.onRequest(async (req, res) => {
    // CORS対応
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
      res.status(200).end();
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      await chatHandler(req, res);
    } catch (error) {
      console.error("Chat function error:", error);
      res.status(500).json({
        success: false,
        message:
          "現在システムに問題が発生しています。時間をおいて再度お試しください",
      });
    }
  });

// ナレッジ管理のエンドポイント
export const knowledge = functions
  .region("us-central1")
  .runWith({
    memory: "1GB",
    timeoutSeconds: 300,
  })
  .https.onRequest(async (req, res) => {
    // CORS対応
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
      res.status(200).end();
      return;
    }

    try {
      await knowledgeHandler(req, res);
    } catch (error) {
      console.error("Knowledge function error:", error);
      res.status(500).json({
        success: false,
        message: "サーバーエラーが発生しました",
      });
    }
  });
