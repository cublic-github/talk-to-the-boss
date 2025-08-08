"use client";

import {
  Container,
  Box,
  Typography,
  AppBar,
  Toolbar,
  Button,
} from "@mui/material";
import { Chat, Home } from "@mui/icons-material";
import Link from "next/link";
import KnowledgeManagement from "@/components/admin/KnowledgeManagement";

export default function AdminPage() {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Talk to the Boss - 管理画面
          </Typography>
          <Button
            color="inherit"
            startIcon={<Chat />}
            component={Link}
            href="/"
          >
            チャットに戻る
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
            ナレッジ管理
          </Typography>

          <KnowledgeManagement />
        </Box>
      </Container>
    </>
  );
}
