import { Request, Response } from "firebase-functions";
import { Knowledge } from "../types";
import { KnowledgeService } from "../services/knowledgeService";
import { EmbeddingService } from "../services/embeddingService";

export async function knowledgeHandler(
  req: Request,
  res: Response
): Promise<void> {
  const knowledgeService = new KnowledgeService();
  const embeddingService = new EmbeddingService();

  try {
    switch (req.method) {
      case "GET":
        await handleGetKnowledge(req, res, knowledgeService);
        break;
      case "POST":
        await handleCreateKnowledge(
          req,
          res,
          knowledgeService,
          embeddingService
        );
        break;
      case "PUT":
        await handleUpdateKnowledge(
          req,
          res,
          knowledgeService,
          embeddingService
        );
        break;
      case "DELETE":
        await handleDeleteKnowledge(req, res, knowledgeService);
        break;
      default:
        res.status(405).json({ success: false, message: "Method not allowed" });
    }
  } catch (error) {
    console.error("Knowledge handler error:", error);
    res.status(500).json({
      success: false,
      message: "サーバーエラーが発生しました",
    });
  }
}

async function handleGetKnowledge(
  req: Request,
  res: Response,
  knowledgeService: KnowledgeService
): Promise<void> {
  const knowledge = await knowledgeService.getAllKnowledge();
  res.status(200).json({
    success: true,
    knowledge,
  });
}

async function handleCreateKnowledge(
  req: Request,
  res: Response,
  knowledgeService: KnowledgeService,
  embeddingService: EmbeddingService
): Promise<void> {
  const { title, content }: Knowledge = req.body;

  if (!title?.trim() || !content?.trim()) {
    res.status(400).json({
      success: false,
      message: "タイトルと内容を入力してください",
    });
    return;
  }

  // コンテンツのベクトル化
  const embedding = await embeddingService.getEmbedding(content);

  const knowledgeData: Knowledge = {
    title: title.trim(),
    content: content.trim(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const knowledgeId = await knowledgeService.createKnowledge(
    knowledgeData,
    embedding
  );

  res.status(201).json({
    success: true,
    message: "ナレッジが正常に作成されました",
    id: knowledgeId,
  });
}

async function handleUpdateKnowledge(
  req: Request,
  res: Response,
  knowledgeService: KnowledgeService,
  embeddingService: EmbeddingService
): Promise<void> {
  const knowledgeId = req.url.split("/").pop();
  const { title, content }: Knowledge = req.body;

  if (!knowledgeId) {
    res.status(400).json({
      success: false,
      message: "ナレッジIDが指定されていません",
    });
    return;
  }

  if (!title?.trim() || !content?.trim()) {
    res.status(400).json({
      success: false,
      message: "タイトルと内容を入力してください",
    });
    return;
  }

  // コンテンツのベクトル化
  const embedding = await embeddingService.getEmbedding(content);

  const knowledgeData: Knowledge = {
    title: title.trim(),
    content: content.trim(),
    updatedAt: new Date(),
  };

  await knowledgeService.updateKnowledge(knowledgeId, knowledgeData, embedding);

  res.status(200).json({
    success: true,
    message: "ナレッジが正常に更新されました",
  });
}

async function handleDeleteKnowledge(
  req: Request,
  res: Response,
  knowledgeService: KnowledgeService
): Promise<void> {
  const knowledgeId = req.url.split("/").pop();

  if (!knowledgeId) {
    res.status(400).json({
      success: false,
      message: "ナレッジIDが指定されていません",
    });
    return;
  }

  await knowledgeService.deleteKnowledge(knowledgeId);

  res.status(200).json({
    success: true,
    message: "ナレッジが正常に削除されました",
  });
}
