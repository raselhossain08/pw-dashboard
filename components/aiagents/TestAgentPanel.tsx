"use client";

import * as React from "react";
import {
  Send,
  Loader2,
  Bot,
  User,
  XCircle,
  RefreshCw,
  Download,
  Copy,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { aiAgentsService, type Agent } from "@/services/ai-agents.service";
import { useToast } from "@/context/ToastContext";

interface TestMessage {
  role: "user" | "bot";
  content: string;
  timestamp: Date;
  intent?: string;
  confidence?: number;
  responseTime?: number;
}

interface TestAgentPanelProps {
  agent: Agent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TestAgentPanel({
  agent,
  open,
  onOpenChange,
}: TestAgentPanelProps) {
  const [messages, setMessages] = React.useState<TestMessage[]>([]);
  const [inputMessage, setInputMessage] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const { push } = useToast();

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isSending) return;

    const userMessage: TestMessage = {
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsSending(true);

    try {
      const startTime = Date.now();
      const { data } = await aiAgentsService.testAgent(agent._id, inputMessage);
      const responseTime = Date.now() - startTime;

      const response = data as any;
      const botMessage: TestMessage = {
        role: "bot",
        content: response.message || "No response generated",
        timestamp: new Date(),
        intent: response.intent,
        confidence: response.confidence,
        responseTime,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      push({
        message:
          error?.response?.data?.message || "Failed to send test message",
        type: "error",
      });

      const errorMessage: TestMessage = {
        role: "bot",
        content: "Error: Could not generate response",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    push({
      message: "Test conversation cleared",
      type: "success",
    });
  };

  const handleExportChat = () => {
    const chatData = {
      agent: {
        id: agent._id,
        name: agent.name,
        type: agent.agentType,
      },
      timestamp: new Date().toISOString(),
      messages: messages.map((msg) => ({
        ...msg,
        timestamp: msg.timestamp.toISOString(),
      })),
      metrics: {
        totalMessages: messages.length,
        avgResponseTime:
          messages
            .filter((m) => m.role === "bot" && m.responseTime)
            .reduce((sum, m) => sum + (m.responseTime || 0), 0) /
            messages.filter((m) => m.role === "bot" && m.responseTime).length ||
          0,
      },
    };

    const dataStr = JSON.stringify(chatData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `test-chat-${agent.name}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    push({
      message: "Test conversation exported",
      type: "success",
    });
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    push({
      message: "Message copied to clipboard",
      type: "success",
    });
  };

  const avgResponseTime =
    messages
      .filter((m) => m.role === "bot" && m.responseTime)
      .reduce((sum, m) => sum + (m.responseTime || 0), 0) /
      messages.filter((m) => m.role === "bot" && m.responseTime).length || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl">
                Test Agent: {agent.name}
              </DialogTitle>
              <DialogDescription>
                Test and validate agent responses in real-time
              </DialogDescription>
            </div>
            <Badge
              variant={agent.status === "active" ? "default" : "secondary"}
            >
              {agent.status}
            </Badge>
          </div>
        </DialogHeader>

        {/* Metrics Bar */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {messages.filter((m) => m.role === "user").length}
            </p>
            <p className="text-sm text-gray-600">Messages Sent</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-accent">
              {avgResponseTime > 0 ? `${avgResponseTime.toFixed(0)}ms` : "-"}
            </p>
            <p className="text-sm text-gray-600">Avg Response Time</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {agent.agentType}
            </p>
            <p className="text-sm text-gray-600">Agent Type</p>
          </div>
        </div>

        {/* Chat Area */}
        <ScrollArea
          ref={scrollRef}
          className="flex-1 h-[400px] border rounded-lg p-4"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Bot className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Start Testing
              </h3>
              <p className="text-gray-500">
                Send a message to test how this agent responds
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      msg.role === "user"
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="shrink-0 mt-1">
                        {msg.role === "user" ? (
                          <User className="w-4 h-4" />
                        ) : (
                          <Bot className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm whitespace-pre-wrap">
                          {msg.content}
                        </p>
                        {msg.role === "bot" && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {msg.intent && (
                              <Badge variant="outline" className="text-xs">
                                {msg.intent}
                              </Badge>
                            )}
                            {msg.confidence !== undefined && (
                              <Badge variant="outline" className="text-xs">
                                {(msg.confidence * 100).toFixed(0)}% confidence
                              </Badge>
                            )}
                            {msg.responseTime && (
                              <Badge variant="outline" className="text-xs">
                                {msg.responseTime}ms
                              </Badge>
                            )}
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs opacity-70">
                            {msg.timestamp.toLocaleTimeString()}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                            onClick={() => handleCopyMessage(msg.content)}
                          >
                            {copied ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-gray-600" />
                      <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                      <span className="text-sm text-gray-600">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your test message..."
            disabled={isSending}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isSending}
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearChat}
              disabled={messages.length === 0}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Clear
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportChat}
              disabled={messages.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
