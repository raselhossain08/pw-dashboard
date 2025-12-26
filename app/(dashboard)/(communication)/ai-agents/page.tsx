import { Metadata } from "next";
import AIAgents from "@/components/aiagents/AIAgents";
import AppLayout from "@/components/layout/AppLayout";
import { AIAgentsErrorBoundary } from "@/components/aiagents/AIAgentsErrorBoundary";

export const metadata: Metadata = {
  title: "AI Agents Management | Dashboard",
  description:
    "Manage and configure AI agents, view analytics, monitor conversations, and track agent performance. Create custom AI assistants for enhanced learning experiences.",
  keywords: [
    "AI agents",
    "artificial intelligence",
    "chatbot management",
    "conversation analytics",
    "AI assistants",
    "agent configuration",
  ],
};

export default function AiAgentsPage() {
  return (
    <AppLayout>
      <AIAgentsErrorBoundary>
        <AIAgents />
      </AIAgentsErrorBoundary>
    </AppLayout>
  );
}
