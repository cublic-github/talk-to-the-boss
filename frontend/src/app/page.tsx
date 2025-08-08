"use client";

import { useState } from "react";
import {
  Container,
  Box,
  Typography,
  AppBar,
  Toolbar,
  Button,
} from "@mui/material";
import { AdminPanelSettings } from "@mui/icons-material";
import Link from "next/link";
import ChatInterface from "@/components/chat/ChatInterface";

export default function HomePage() {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Talk to the Boss
          </Typography>
          <Button
            color="inherit"
            startIcon={<AdminPanelSettings />}
            component={Link}
            href="/admin"
          >
            管理画面
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          minHeight="80vh"
        >
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            textAlign="center"
            sx={{ mb: 4 }}
          >
            社内ナレッジ共有チャットボット
          </Typography>

          <Box width="100%" maxWidth="800px">
            <ChatInterface />
          </Box>
        </Box>
      </Container>
    </>
  );
}
