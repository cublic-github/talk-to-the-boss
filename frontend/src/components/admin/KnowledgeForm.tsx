"use client";

import { useState, useEffect } from "react";
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
  Tabs,
  Tab,
  Paper,
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import { Knowledge } from "@/types";
import { createKnowledge, updateKnowledge } from "@/lib/api";

interface KnowledgeFormProps {
  open: boolean;
  knowledge?: Knowledge | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function KnowledgeForm({
  open,
  knowledge,
  onClose,
  onSuccess,
}: KnowledgeFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [previewTab, setPreviewTab] = useState(0);

  const isEdit = !!knowledge;

  useEffect(() => {
    if (open) {
      setTitle(knowledge?.title || "");
      setContent(knowledge?.content || "");
      setMessage(null);
      setPreviewTab(0);
    }
  }, [open, knowledge]);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      setMessage({ type: "error", text: "タイトルと内容を入力してください" });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const data = {
        title: title.trim(),
        content: content.trim(),
      };

      const response = isEdit
        ? await updateKnowledge(knowledge!.id, data)
        : await createKnowledge(data);

      if (response.success) {
        onSuccess();
      } else {
        setMessage({
          type: "error",
          text: response.message || "保存に失敗しました",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "保存に失敗しました" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      sx={{ "& .MuiDialog-paper": { height: "80vh" } }}
    >
      <DialogTitle>
        {isEdit ? "ナレッジを編集" : "新しいナレッジを作成"}
      </DialogTitle>
      <DialogContent>
        {message && (
          <Alert severity={message.type} sx={{ mb: 2 }}>
            {message.text}
          </Alert>
        )}

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            height: "100%",
          }}
        >
          <TextField
            fullWidth
            label="タイトル"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            placeholder="例: 有給申請の方法"
          />

          <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
            <Tabs
              value={previewTab}
              onChange={(_, newValue) => setPreviewTab(newValue)}
            >
              <Tab label="編集" />
              <Tab label="プレビュー" />
            </Tabs>

            <Box sx={{ flexGrow: 1, mt: 1 }}>
              {previewTab === 0 ? (
                <TextField
                  fullWidth
                  label="内容"
                  multiline
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="詳細な説明を記入してください。Markdown記法が使用できます。"
                  helperText="Markdown記法（**太字**、*斜体*、リストなど）が使用できます"
                  sx={{
                    "& .MuiInputBase-root": {
                      height: "100%",
                      alignItems: "flex-start",
                    },
                    "& .MuiInputBase-input": {
                      height: "100% !important",
                      overflowY: "auto !important",
                    },
                  }}
                />
              ) : (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    height: "100%",
                    overflowY: "auto",
                    backgroundColor: "#fafafa",
                  }}
                >
                  {content ? (
                    <ReactMarkdown>{content}</ReactMarkdown>
                  ) : (
                    <Typography color="text.secondary">
                      プレビューするには内容を入力してください
                    </Typography>
                  )}
                </Paper>
              )}
            </Box>
          </Box>
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
          {isSubmitting ? "保存中..." : isEdit ? "更新" : "作成"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
