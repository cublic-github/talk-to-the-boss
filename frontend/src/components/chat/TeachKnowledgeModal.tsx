"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
} from "@mui/material";
import { createKnowledge } from "@/lib/api";

interface TeachKnowledgeModalProps {
  open: boolean;
  onClose: () => void;
}

export default function TeachKnowledgeModal({
  open,
  onClose,
}: TeachKnowledgeModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      setMessage({ type: "error", text: "タイトルと内容を入力してください" });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await createKnowledge({
        title: title.trim(),
        content: content.trim(),
      });

      if (response.success) {
        setMessage({ type: "success", text: "ナレッジが正常に登録されました" });
        setTitle("");
        setContent("");
        setTimeout(() => {
          onClose();
          setMessage(null);
        }, 2000);
      } else {
        setMessage({
          type: "error",
          text: response.message || "ナレッジの登録に失敗しました",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "ナレッジの登録に失敗しました" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setTitle("");
      setContent("");
      setMessage(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>新しい情報を教える</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          今後同様の質問に答えられるよう、新しい情報を登録してください。
        </Typography>

        {message && (
          <Alert severity={message.type} sx={{ mb: 2 }}>
            {message.text}
          </Alert>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            fullWidth
            label="タイトル"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            placeholder="例: 有給申請の方法"
          />
          <TextField
            fullWidth
            label="内容"
            multiline
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSubmitting}
            placeholder="詳細な説明を記入してください。Markdown記法が使用できます。"
            helperText="Markdown記法（**太字**、*斜体*、リストなど）が使用できます"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          キャンセル
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting || !title.trim() || !content.trim()}
        >
          {isSubmitting ? "登録中..." : "登録"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
