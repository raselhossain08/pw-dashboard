"use client";

import * as React from "react";
import { Loader2, Sparkles, Database, Zap } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RichTextEditor } from "./RichTextEditor";
import { FileUpload } from "./FileUpload";
import type { CreateAgentDto, UpdateAgentDto, Agent } from "@/services/ai-agents.service";

interface EnhancedAgentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateAgentDto | UpdateAgentDto) => Promise<void>;
  initialData?: Agent | null;
  mode: "create" | "edit";
  loading?: boolean;
}

export function EnhancedAgentForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
  loading = false,
}: EnhancedAgentFormProps) {
  const [formData, setFormData] = React.useState<CreateAgentDto>({
    name: "",
    description: "",
    agentType: "Course Advisor",
    knowledgeBase: [],
    status: "active",
  });

  const [uploadedFiles, setUploadedFiles] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description,
        agentType: initialData.agentType,
        knowledgeBase: initialData.knowledgeBase || [],
        status: initialData.status,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        agentType: "Course Advisor",
        knowledgeBase: [],
        status: "active",
      });
    }
  }, [initialData, open]);

  const handleSubmit = async () => {
    // Add uploaded file URLs to knowledge base
    const fileUrls = uploadedFiles
      .filter((f) => f.status === "success" && f.url)
      .map((f) => f.url);
    
    const dataToSubmit = {
      ...formData,
      knowledgeBase: [...(formData.knowledgeBase || []), ...fileUrls],
    };

    await onSubmit(dataToSubmit);
  };

  const toggleKnowledgeBase = (item: string) => {
    setFormData((prev) => ({
      ...prev,
      knowledgeBase: prev.knowledgeBase?.includes(item)
        ? prev.knowledgeBase.filter((kb) => kb !== item)
        : [...(prev.knowledgeBase || []), item],
    }));
  };

  const agentTypes = [
    { value: "Course Advisor", icon: Sparkles },
    { value: "Study Assistant", icon: Database },
    { value: "Assignment Helper", icon: Zap },
    { value: "Progress Tracker", icon: Sparkles },
    { value: "Language Tutor", icon: Database },
    { value: "Technical Support", icon: Zap },
    { value: "Custom", icon: Sparkles },
  ];

  const knowledgeBaseOptions = [
    { id: "Course Materials", label: "Course Materials" },
    { id: "FAQ Database", label: "FAQ Database" },
    { id: "Student Handbook", label: "Student Handbook" },
    { id: "Policies & Guidelines", label: "Policies & Guidelines" },
    { id: "Technical Documentation", label: "Technical Documentation" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {mode === "create" ? "Create New AI Agent" : "Edit AI Agent"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Configure a new AI assistant tailored to your needs"
              : "Update agent settings and configuration"}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
            <TabsTrigger value="files">Upload Files</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6 mt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="agent-name" className="text-base font-semibold">
                  Agent Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="agent-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Math Tutor Pro"
                  className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Choose a clear, descriptive name for your AI agent
                </p>
              </div>

              <div>
                <Label htmlFor="agent-type" className="text-base font-semibold">
                  Agent Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.agentType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, agentType: value })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {agentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="w-4 h-4" />
                          {type.value}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  Select the type that best matches your agent's purpose
                </p>
              </div>

              <div>
                <Label className="text-base font-semibold">
                  Agent Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="agent-desc" className="text-base font-semibold">
                  Description <span className="text-red-500">*</span>
                </Label>
                <p className="text-sm text-gray-500 mb-2">
                  Provide a detailed description of what your agent will do. Supports
                  rich formatting.
                </p>
                <RichTextEditor
                  content={formData.description}
                  onChange={(html) =>
                    setFormData({ ...formData, description: html })
                  }
                  placeholder="Describe your agent's purpose, capabilities, and specialties..."
                  className="mt-2"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="knowledge" className="space-y-6 mt-4">
            <div>
              <Label className="text-base font-semibold mb-3 block">
                Select Knowledge Base Sources
              </Label>
              <p className="text-sm text-gray-500 mb-4">
                Choose which knowledge sources your agent can access to answer
                questions
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {knowledgeBaseOptions.map((kb) => (
                  <div
                    key={kb.id}
                    className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => toggleKnowledgeBase(kb.id)}
                  >
                    <Checkbox
                      id={kb.id}
                      checked={formData.knowledgeBase?.includes(kb.id)}
                      onCheckedChange={() => toggleKnowledgeBase(kb.id)}
                    />
                    <label
                      htmlFor={kb.id}
                      className="flex-1 text-sm font-medium cursor-pointer"
                    >
                      {kb.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">
                💡 Knowledge Base Tips
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Select relevant sources for more accurate responses</li>
                <li>• Multiple sources can be combined for comprehensive answers</li>
                <li>• You can upload custom files in the "Upload Files" tab</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="files" className="space-y-6 mt-4">
            <div>
              <Label className="text-base font-semibold mb-3 block">
                Upload Knowledge Base Files
              </Label>
              <p className="text-sm text-gray-500 mb-4">
                Upload documents, PDFs, and text files to enhance your agent's
                knowledge. These will be processed and added to the agent's database.
              </p>
              <FileUpload
                onFilesChange={(files) => setUploadedFiles(files)}
                accept=".pdf,.txt,.doc,.docx,.md"
                maxSize={10 * 1024 * 1024}
                maxFiles={5}
                multiple={true}
              />
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-2">
                📚 Supported File Types
              </h4>
              <div className="text-sm text-purple-800 grid grid-cols-2 gap-2">
                <div>• PDF Documents</div>
                <div>• Text Files (.txt)</div>
                <div>• Word Documents (.doc, .docx)</div>
                <div>• Markdown Files (.md)</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between items-center mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {mode === "create" ? "Creating..." : "Updating..."}
              </>
            ) : (
              <>{mode === "create" ? "Create Agent" : "Update Agent"}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


