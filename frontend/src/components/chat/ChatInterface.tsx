"use client";

import { useState, useEffect, useRef } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Chip,
  CircularProgress,
} from "@mui/material";
import { Send, SmartToy, Person } from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import { ChatMessage } from "@/types";
import { sendChatMessage } from "@/lib/api";
import TeachKnowledgeModal from "./TeachKnowledgeModal";

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTeachModal, setShowTeachModal] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 初期挨拶メッセージ
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: "welcome",
      content: "こんにちは！何かお困りですか？",
      isUser: false,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  // メッセージリストの最下部にスクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      content: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await sendChatMessage({
        message: inputMessage,
        sessionId,
      });

      const aiMessage: ChatMessage = {
        id: `ai_${Date.now()}`,
        content: response.message,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      // ナレッジ不足の場合は学習モーダルを表示
      if (response.needsMoreInfo) {
        setShowTeachModal(true);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        content:
          "現在システムに問題が発生しています。時間をおいて再度お試しください",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box>
      {/* チャットメッセージエリア */}
      <Paper
        elevation={2}
        sx={{
          height: "60vh",
          overflowY: "auto",
          p: 2,
          mb: 2,
          backgroundColor: "#fafafa",
        }}
      >
        {messages.map((message) => (
          <Box
            key={message.id}
            display="flex"
            justifyContent={message.isUser ? "flex-end" : "flex-start"}
            mb={2}
          >
            <Box
              display="flex"
              flexDirection={message.isUser ? "row-reverse" : "row"}
              alignItems="flex-start"
              maxWidth="80%"
            >
              <Chip
                icon={message.isUser ? <Person /> : <SmartToy />}
                label={message.isUser ? "あなた" : "AI"}
                size="small"
                sx={{
                  mx: 1,
                  backgroundColor: message.isUser ? "#e3f2fd" : "#f3e5f5",
                }}
              />
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  backgroundColor: message.isUser ? "#1976d2" : "#fff",
                  color: message.isUser ? "#fff" : "#333",
                }}
              >
                {message.isUser ? (
                  <Typography variant="body1">{message.content}</Typography>
                ) : (
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                )}
              </Paper>
            </Box>
          </Box>
        ))}
        {isLoading && (
          <Box display="flex" justifyContent="flex-start" mb={2}>
            <Box display="flex" alignItems="center">
              <Chip
                icon={<SmartToy />}
                label="AI"
                size="small"
                sx={{ mx: 1, backgroundColor: "#f3e5f5" }}
              />
              <Paper elevation={1} sx={{ p: 2, backgroundColor: "#fff" }}>
                <CircularProgress size={20} />
                <Typography variant="body2" sx={{ ml: 1, display: "inline" }}>
                  考え中...
                </Typography>
              </Paper>
            </Box>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Paper>

      {/* 入力エリア */}
      <Box display="flex" gap={1}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="メッセージを入力してください..."
          disabled={isLoading}
        />
        <Button
          variant="contained"
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isLoading}
          sx={{ minWidth: "56px", height: "56px" }}
        >
          <Send />
        </Button>
      </Box>

      {/* 学習モーダル */}
      <TeachKnowledgeModal
        open={showTeachModal}
        onClose={() => setShowTeachModal(false)}
      />
    </Box>
  );
}
