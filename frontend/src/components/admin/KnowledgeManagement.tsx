"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import { Knowledge } from "@/types";
import { getKnowledgeList, deleteKnowledge } from "@/lib/api";
import KnowledgeForm from "./KnowledgeForm";

export default function KnowledgeManagement() {
  const [knowledgeList, setKnowledgeList] = useState<Knowledge[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingKnowledge, setEditingKnowledge] = useState<Knowledge | null>(
    null
  );
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    knowledge: Knowledge | null;
  }>({
    open: false,
    knowledge: null,
  });

  useEffect(() => {
    loadKnowledge();
  }, []);

  const loadKnowledge = async () => {
    setLoading(true);
    try {
      const data = await getKnowledgeList();
      setKnowledgeList(data);
    } catch (error) {
      setMessage({ type: "error", text: "ナレッジの読み込みに失敗しました" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingKnowledge(null);
    setShowForm(true);
  };

  const handleEdit = (knowledge: Knowledge) => {
    setEditingKnowledge(knowledge);
    setShowForm(true);
  };

  const handleDelete = (knowledge: Knowledge) => {
    setDeleteConfirm({ open: true, knowledge });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.knowledge) return;

    try {
      const response = await deleteKnowledge(deleteConfirm.knowledge.id);
      if (response.success) {
        setMessage({ type: "success", text: "ナレッジを削除しました" });
        loadKnowledge();
      } else {
        setMessage({ type: "error", text: response.message });
      }
    } catch (error) {
      setMessage({ type: "error", text: "削除に失敗しました" });
    } finally {
      setDeleteConfirm({ open: false, knowledge: null });
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingKnowledge(null);
    setMessage({
      type: "success",
      text: editingKnowledge
        ? "ナレッジを更新しました"
        : "ナレッジを作成しました",
    });
    loadKnowledge();
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {message && (
        <Alert
          severity={message.type}
          sx={{ mb: 2 }}
          onClose={() => setMessage(null)}
        >
          {message.text}
        </Alert>
      )}

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h6">
          ナレッジ一覧 ({knowledgeList.length}件)
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleCreate}>
          新規作成
        </Button>
      </Box>

      {knowledgeList.length === 0 ? (
        <Card>
          <CardContent>
            <Typography
              variant="body1"
              textAlign="center"
              color="text.secondary"
            >
              ナレッジが登録されていません
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {knowledgeList.map((knowledge) => (
            <Grid item xs={12} md={6} lg={4} key={knowledge.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom noWrap>
                    {knowledge.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      mb: 2,
                    }}
                  >
                    {knowledge.content}
                  </Typography>
                  <Chip
                    label={`更新: ${formatDate(knowledge.updatedAt)}`}
                    size="small"
                    variant="outlined"
                  />
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<Edit />}
                    onClick={() => handleEdit(knowledge)}
                  >
                    編集
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<Delete />}
                    onClick={() => handleDelete(knowledge)}
                  >
                    削除
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* ナレッジ作成・編集フォーム */}
      <KnowledgeForm
        open={showForm}
        knowledge={editingKnowledge}
        onClose={() => {
          setShowForm(false);
          setEditingKnowledge(null);
        }}
        onSuccess={handleFormSuccess}
      />

      {/* 削除確認ダイアログ */}
      <Dialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, knowledge: null })}
      >
        <DialogTitle>ナレッジの削除</DialogTitle>
        <DialogContent>
          <Typography>
            「{deleteConfirm.knowledge?.title}」を削除しますか？
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            この操作は取り消せません。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteConfirm({ open: false, knowledge: null })}
          >
            キャンセル
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            削除
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
