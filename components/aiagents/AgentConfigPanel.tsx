"use client";

import * as React from "react";
import {
  Settings,
  Loader2,
  Save,
  RotateCcw,
  Sliders,
  FileText,
  Database,
  Zap,
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { aiAgentsService, type Agent } from "@/services/ai-agents.service";
import { useToast } from "@/context/ToastContext";

interface AgentConfig {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  responseFormat: string;
}

interface AgentConfigPanelProps {
  agent: Agent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfigUpdate?: () => void;
}

export function AgentConfigPanel({
  agent,
  open,
  onOpenChange,
  onConfigUpdate,
}: AgentConfigPanelProps) {
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const { push } = useToast();

  const [config, setConfig] = React.useState<AgentConfig>({
    temperature: 0.7,
    maxTokens: 2000,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    responseFormat: "text",
  });

  const [customPrompt, setCustomPrompt] = React.useState("");
  const [systemInstructions, setSystemInstructions] = React.useState("");
  const [enableWebSearch, setEnableWebSearch] = React.useState(false);
  const [enableMemory, setEnableMemory] = React.useState(true);

  React.useEffect(() => {
    if (open && agent) {
      loadAgentConfig();
    }
  }, [open, agent]);

  const loadAgentConfig = async () => {
    try {
      setLoading(true);
      const { data } = await aiAgentsService.getAgentConfig(agent._id);
      const configData = data as any;
      if (configData.config) {
        setConfig(configData.config);
      }
      // Set default prompts based on agent type
      setCustomPrompt(
        `You are a ${
          agent.agentType
        } AI assistant specializing in helping students with ${agent.agentType.toLowerCase()} tasks.`
      );
      setSystemInstructions(agent.description);
    } catch (error: any) {
      push({
        message:
          error?.response?.data?.message || "Failed to load configuration",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      setSaving(true);
      await aiAgentsService.updateAgentConfig(agent._id, {
        config,
        customPrompt,
        systemInstructions,
        enableWebSearch,
        enableMemory,
      });

      push({
        message: "Agent configuration saved successfully",
        type: "success",
      });

      if (onConfigUpdate) {
        onConfigUpdate();
      }

      onOpenChange(false);
    } catch (error: any) {
      push({
        message:
          error?.response?.data?.message || "Failed to save configuration",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setConfig({
      temperature: 0.7,
      maxTokens: 2000,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
      responseFormat: "text",
    });
    setCustomPrompt("");
    setSystemInstructions(agent.description);
    setEnableWebSearch(false);
    setEnableMemory(true);
    push({
      message: "Configuration reset to defaults",
      type: "success",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <Settings className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl">
                Configure Agent: {agent.name}
              </DialogTitle>
              <DialogDescription>
                Customize agent behavior, prompts, and advanced settings
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">
                <FileText className="w-4 h-4 mr-2" />
                Basic
              </TabsTrigger>
              <TabsTrigger value="prompts">
                <Zap className="w-4 h-4 mr-2" />
                Prompts
              </TabsTrigger>
              <TabsTrigger value="parameters">
                <Sliders className="w-4 h-4 mr-2" />
                Parameters
              </TabsTrigger>
              <TabsTrigger value="advanced">
                <Database className="w-4 h-4 mr-2" />
                Advanced
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">Agent Name</Label>
                    <p className="font-semibold">{agent.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Type</Label>
                    <p className="font-semibold">{agent.agentType}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Status</Label>
                    <Badge
                      variant={
                        agent.status === "active" ? "default" : "secondary"
                      }
                    >
                      {agent.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">
                      Conversations
                    </Label>
                    <p className="font-semibold">
                      {agent.conversations.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="system-instructions">System Instructions</Label>
                <Textarea
                  id="system-instructions"
                  value={systemInstructions}
                  onChange={(e) => setSystemInstructions(e.target.value)}
                  rows={4}
                  placeholder="General instructions for the agent's behavior..."
                  className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-1">
                  These instructions define the agent's core behavior and
                  personality
                </p>
              </div>

              <div>
                <Label>Response Format</Label>
                <Select
                  value={config.responseFormat}
                  onValueChange={(value) =>
                    setConfig({ ...config, responseFormat: value })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Plain Text</SelectItem>
                    <SelectItem value="markdown">Markdown</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="prompts" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="custom-prompt">Custom System Prompt</Label>
                <Textarea
                  id="custom-prompt"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  rows={6}
                  placeholder="Define how the agent should introduce itself and behave..."
                  className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-1">
                  This prompt is sent with every conversation to guide the
                  agent's responses
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-semibold">Prompt Templates</h4>
                <div className="grid gap-2">
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() =>
                      setCustomPrompt(
                        "You are a helpful and friendly AI assistant. Always be polite and professional."
                      )
                    }
                  >
                    Professional Assistant
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() =>
                      setCustomPrompt(
                        "You are a patient and encouraging tutor. Break down complex topics into simple explanations."
                      )
                    }
                  >
                    Patient Tutor
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() =>
                      setCustomPrompt(
                        "You are an expert problem solver. Provide step-by-step solutions with clear explanations."
                      )
                    }
                  >
                    Expert Problem Solver
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="parameters" className="space-y-6 mt-4">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Temperature: {config.temperature}</Label>
                    <Badge variant="outline">{config.temperature}</Badge>
                  </div>
                  <Slider
                    value={[config.temperature]}
                    onValueChange={([value]) =>
                      setConfig({ ...config, temperature: value })
                    }
                    min={0}
                    max={2}
                    step={0.1}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Controls randomness: 0 is focused, 2 is creative
                  </p>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Max Tokens: {config.maxTokens}</Label>
                    <Badge variant="outline">{config.maxTokens}</Badge>
                  </div>
                  <Slider
                    value={[config.maxTokens]}
                    onValueChange={([value]) =>
                      setConfig({ ...config, maxTokens: value })
                    }
                    min={100}
                    max={4000}
                    step={100}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Maximum length of generated responses
                  </p>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Top P: {config.topP}</Label>
                    <Badge variant="outline">{config.topP}</Badge>
                  </div>
                  <Slider
                    value={[config.topP]}
                    onValueChange={([value]) =>
                      setConfig({ ...config, topP: value })
                    }
                    min={0}
                    max={1}
                    step={0.1}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Controls diversity via nucleus sampling
                  </p>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Frequency Penalty: {config.frequencyPenalty}</Label>
                    <Badge variant="outline">{config.frequencyPenalty}</Badge>
                  </div>
                  <Slider
                    value={[config.frequencyPenalty]}
                    onValueChange={([value]) =>
                      setConfig({ ...config, frequencyPenalty: value })
                    }
                    min={0}
                    max={2}
                    step={0.1}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Reduces repetition of frequently used words
                  </p>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Presence Penalty: {config.presencePenalty}</Label>
                    <Badge variant="outline">{config.presencePenalty}</Badge>
                  </div>
                  <Slider
                    value={[config.presencePenalty]}
                    onValueChange={([value]) =>
                      setConfig({ ...config, presencePenalty: value })
                    }
                    min={0}
                    max={2}
                    step={0.1}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Encourages talking about new topics
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-1">
                    <Label>Enable Web Search</Label>
                    <p className="text-sm text-gray-500">
                      Allow agent to search the web for up-to-date information
                    </p>
                  </div>
                  <Switch
                    checked={enableWebSearch}
                    onCheckedChange={setEnableWebSearch}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-1">
                    <Label>Conversation Memory</Label>
                    <p className="text-sm text-gray-500">
                      Remember context from previous messages in the
                      conversation
                    </p>
                  </div>
                  <Switch
                    checked={enableMemory}
                    onCheckedChange={setEnableMemory}
                  />
                </div>

                <Separator />

                <div>
                  <Label>Knowledge Base Sources</Label>
                  <div className="mt-2 space-y-2">
                    {agent.knowledgeBase && agent.knowledgeBase.length > 0 ? (
                      agent.knowledgeBase.map((kb, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-white border rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <Database className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{kb}</span>
                          </div>
                          <Badge variant="outline">Active</Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No knowledge base sources configured
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleReset} disabled={saving}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveConfig} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Configuration
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
