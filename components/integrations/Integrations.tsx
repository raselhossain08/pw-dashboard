"use client";

import * as React from "react";
import Image from "next/image";
import {
  Search as SearchIcon,
  Plug,
  Megaphone,
  MessageSquare,
  BarChart3,
  Code2,
  Plus,
  ShieldCheck,
  Settings,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  X,
  Save,
  Key,
  Copy,
  Info,
  Lock as LockIcon,
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
import { useToast } from "@/context/ToastContext";
import { useIntegrations } from "@/hooks/useIntegrations";
import {
  Integration,
  IntegrationCategory,
  IntegrationStatus,
  IntegrationStats,
  IntegrationStat,
} from "@/types/integrations";

const EMPTY_INTEGRATIONS = [
  {
    id: "stripe",
    name: "Stripe",
    category: "Payment Gateways" as IntegrationCategory,
    description: "Secure payment processing for your courses and subscriptions",
    status: "disconnected" as IntegrationStatus,
    logo: "https://cdn.simpleicons.org/stripe/635BFF",
  },
  {
    id: "paypal",
    name: "PayPal",
    category: "Payment Gateways" as IntegrationCategory,
    description: "Global payments and payouts",
    status: "disconnected" as IntegrationStatus,
    logo: "https://cdn.simpleicons.org/paypal/00457C",
  },
  {
    id: "smtp",
    name: "Email SMTP",
    category: "Communication" as IntegrationCategory,
    description: "Transactional emails and notifications",
    status: "disconnected" as IntegrationStatus,
    logo: "https://cdn.simpleicons.org/gmail/EA4335",
  },
  {
    id: "twilio",
    name: "Twilio",
    category: "Communication" as IntegrationCategory,
    description: "SMS and voice notifications",
    status: "disconnected" as IntegrationStatus,
    logo: "https://cdn.simpleicons.org/twilio/F22F46",
  },
  {
    id: "facebook-ads",
    name: "Facebook Ads",
    category: "Marketing" as IntegrationCategory,
    description: "Campaign tracking and conversion",
    status: "disconnected" as IntegrationStatus,
    logo: "https://cdn.simpleicons.org/facebook/0866FF",
  },
  {
    id: "google-analytics",
    name: "Google Analytics",
    category: "Analytics" as IntegrationCategory,
    description: "Website analytics and performance",
    status: "disconnected" as IntegrationStatus,
    logo: "https://cdn.simpleicons.org/googleanalytics/E37400",
  },
];

export default function Integrations() {
  const { push: showToast } = useToast();
  const {
    integrations,
    stats,
    isLoading,
    actionLoading,
    connectIntegration,
    disconnectIntegration,
    testConnection,
    updateConfig,
    deleteIntegration,
    createIntegration,
    generateApiKey,
    saveWebhooks,
    getWebhooks,
  } = useIntegrations();

  const [search, setSearch] = React.useState("");
  const [activeTab, setActiveTab] = React.useState("All Integrations");

  // Dialog states
  const [addOpen, setAddOpen] = React.useState(false);
  const [configOpen, setConfigOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [apiKeyOpen, setApiKeyOpen] = React.useState(false);
  const [webhooksOpen, setWebhooksOpen] = React.useState(false);
  const [securityOpen, setSecurityOpen] = React.useState(false);
  const [docsOpen, setDocsOpen] = React.useState(false);
  const [selectedIntegration, setSelectedIntegration] =
    React.useState<Integration | null>(null);

  // Config form state
  const [configData, setConfigData] = React.useState({
    apiKey: "",
    apiSecret: "",
    webhookUrl: "",
    notes: "",
  });

  // API Key state
  const [generatedApiKey, setGeneratedApiKey] = React.useState("");
  const [apiKeyCopied, setApiKeyCopied] = React.useState(false);

  // Webhooks state
  const [webhookUrl, setWebhookUrl] = React.useState("");
  const [webhookEvents, setWebhookEvents] = React.useState<string[]>([]);

  // Handle connect
  const handleConnect = async (id: string) => {
    try {
      await connectIntegration(id);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  // Handle disconnect
  const handleDisconnect = async (id: string) => {
    try {
      await disconnectIntegration(id);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  // Handle test connection
  const handleTestConnection = async (id: string) => {
    try {
      await testConnection(id);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  // Handle configure click
  const handleConfigureClick = (integration: Integration) => {
    setSelectedIntegration(integration);
    setConfigData({
      apiKey: integration.config?.apiKey || "",
      apiSecret: integration.config?.apiSecret || "",
      webhookUrl: integration.config?.webhookUrl || "",
      notes: integration.config?.notes || "",
    });
    setConfigOpen(true);
  };

  // Add Integration state
  const [selectedAddId, setSelectedAddId] = React.useState<string | null>(null);
  const [addSearch, setAddSearch] = React.useState("");

  // Handle add integration
  const handleAddIntegration = async () => {
    if (!selectedAddId) return;

    const integrationToAdd = EMPTY_INTEGRATIONS.find(
      (i) => i.id === selectedAddId
    );
    if (!integrationToAdd) return;

    // Check if already exists
    const exists = integrations.find((i) => i.slug === integrationToAdd.id);
    if (exists) {
      showToast({
        type: "error",
        message: "This integration is already added",
      });
      return;
    }

    try {
      await createIntegration({
        name: integrationToAdd.name,
        slug: integrationToAdd.id,
        category: integrationToAdd.category,
        description: integrationToAdd.description,
        logo: integrationToAdd.logo,
        status: "disconnected",
      } as any);
      setAddOpen(false);
      setSelectedAddId(null);
    } catch (error) {
      // Error handled by hook
    }
  };

  // Handle save config
  const handleSaveConfig = async () => {
    if (!selectedIntegration) return;

    if (!configData.apiKey) {
      showToast({ type: "error", message: "API Key is required" });
      return;
    }

    try {
      await updateConfig(selectedIntegration.id, {
        config: configData,
        status: "connected" as IntegrationStatus,
      });
      setConfigOpen(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  // Handle delete click
  const handleDeleteClick = (integration: Integration) => {
    setSelectedIntegration(integration);
    setDeleteOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!selectedIntegration) return;

    try {
      await deleteIntegration(selectedIntegration.id);
      setDeleteOpen(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleGenerateApiKey = async () => {
    try {
      const key = await generateApiKey();
      if (key) {
        setGeneratedApiKey(key);
        setApiKeyCopied(false);
        setApiKeyOpen(true);
      }
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleCopyApiKey = async () => {
    try {
      await navigator.clipboard.writeText(generatedApiKey);
      setApiKeyCopied(true);
      showToast({ type: "success", message: "API key copied to clipboard" });
      setTimeout(() => setApiKeyCopied(false), 2000);
    } catch (error) {
      showToast({ type: "error", message: "Failed to copy API key" });
    }
  };

  const handleSaveWebhook = async () => {
    if (!webhookUrl) {
      showToast({ type: "error", message: "Please enter a webhook URL" });
      return;
    }
    if (webhookEvents.length === 0) {
      showToast({ type: "error", message: "Please select at least one event" });
      return;
    }

    try {
      await saveWebhooks({ url: webhookUrl, events: webhookEvents });
      setWebhooksOpen(false);
    } catch (error) {
      // Error handled by hook
    }
  };

  React.useEffect(() => {
    if (webhooksOpen) {
      getWebhooks().then((config) => {
        if (config) {
          setWebhookUrl(config.url || "");
          setWebhookEvents(config.events || []);
        }
      });
    }
  }, [webhooksOpen, getWebhooks]);

  const toggleWebhookEvent = (event: string) => {
    setWebhookEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  const statusChip = (s: IntegrationStatus) => {
    if (s === "connected") return "bg-green-600 text-white";
    if (s === "pending") return "bg-yellow-500 text-white";
    return "bg-red-500 text-white";
  };

  const statusIcon = (s: IntegrationStatus) => {
    if (s === "connected") return <CheckCircle2 className="w-3 h-3" />;
    if (s === "pending") return <AlertCircle className="w-3 h-3" />;
    return <XCircle className="w-3 h-3" />;
  };

  const iconForCategory = (c: IntegrationCategory) => {
    if (c === "Payment Gateways") return Plug;
    if (c === "Communication") return MessageSquare;
    if (c === "Marketing") return Megaphone;
    if (c === "Analytics") return BarChart3;
    return Code2;
  };

  // Use demo data as fallback if no integrations loaded
  const displayIntegrations = integrations;
  const loading = isLoading;

  const filtered = displayIntegrations.filter((it: Integration) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      it.name.toLowerCase().includes(q) ||
      it.description.toLowerCase().includes(q) ||
      it.category.toLowerCase().includes(q);
    const matchesTab =
      activeTab === "All Integrations" || it.category === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <main>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search integrations..."
              className="w-64 pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Integration
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Active Integrations
              </p>
              {loading ? (
                <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1" />
              ) : (
                <>
                  <p className="text-2xl font-bold text-secondary mt-1">
                    {stats?.connected || 0}
                  </p>
                  <p className="text-accent text-sm mt-1">Connected</p>
                </>
              )}
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="text-green-600 w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Total Services
              </p>
              {loading ? (
                <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1" />
              ) : (
                <>
                  <p className="text-2xl font-bold text-secondary mt-1">
                    {stats?.total || 0}
                  </p>
                  <p className="text-accent text-sm mt-1">Available</p>
                </>
              )}
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Plug className="text-primary w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Disconnected</p>
              {loading ? (
                <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1" />
              ) : (
                <>
                  <p className="text-2xl font-bold text-secondary mt-1">
                    {stats?.disconnected || 0}
                  </p>
                  <p className="text-red-500 text-sm mt-1">Action needed</p>
                </>
              )}
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
              <XCircle className="text-red-600 w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pending Setup</p>
              {loading ? (
                <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1" />
              ) : (
                <>
                  <p className="text-2xl font-bold text-secondary mt-1">
                    {stats?.pending || 0}
                  </p>
                  <p className="text-yellow-600 text-sm mt-1">Configure</p>
                </>
              )}
            </div>
            <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
              <AlertCircle className="text-yellow-600 w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {[
            "All Integrations",
            "Payment Gateways",
            "Communication",
            "Marketing",
            "Analytics",
            "Developer Tools",
          ].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`py-4 px-1 font-medium text-sm integration-tab ${
                activeTab === t
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t}
            </button>
          ))}
        </nav>
      </div>

      {/* Empty State */}
      {!loading && integrations.length === 0 && !search && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plug className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-secondary mb-2">
            No integrations yet
          </h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            Connect your favorite tools to automate your workflow and sync data
            across platforms.
          </p>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Integration
          </Button>
        </div>
      )}

      {/* No Search Results */}
      {!loading && integrations.length > 0 && filtered.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <SearchIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-secondary mb-2">
            No results found
          </h3>
          <p className="text-gray-500">
            No integrations match your search query "{search}".
          </p>
        </div>
      )}

      {(loading || filtered.length > 0) &&
        (
          [
            IntegrationCategory.PAYMENT_GATEWAYS,
            IntegrationCategory.COMMUNICATION,
            IntegrationCategory.MARKETING,
            IntegrationCategory.ANALYTICS,
            IntegrationCategory.DEVELOPER_TOOLS,
          ] as const
        ).map((section) => {
          const Icon = iconForCategory(section);
          const items = filtered.filter(
            (i: Integration) => i.category === section
          );
          if (!items.length && activeTab !== "All Integrations") return null;
          return (
            <div key={section} className="mb-12">
              <h3 className="text-xl font-semibold text-secondary mb-6">
                {section}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading
                  ? // Loading skeleton
                    Array.from({ length: 3 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="bg-card rounded-xl p-6 shadow-sm border border-gray-100"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center space-x-3 flex-1">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
                            <div className="flex-1">
                              <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse" />
                              <div className="h-3 bg-gray-200 rounded w-full animate-pulse" />
                            </div>
                          </div>
                          <div className="w-16 h-5 bg-gray-200 rounded-full animate-pulse" />
                        </div>
                        <div className="h-20 bg-gray-100 rounded mb-4 animate-pulse" />
                        <div className="flex space-x-3">
                          <div className="flex-1 h-9 bg-gray-200 rounded animate-pulse" />
                          <div className="flex-1 h-9 bg-gray-200 rounded animate-pulse" />
                        </div>
                      </div>
                    ))
                  : displayIntegrations
                      .filter((i: Integration) => i.category === section)
                      .filter((i: Integration) => filtered.includes(i))
                      .map((i: Integration) => (
                        <div
                          key={i.id}
                          className="integration-card bg-card rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center space-x-3 flex-1">
                              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                {i.logo ? (
                                  <Image
                                    src={i.logo}
                                    alt={i.name}
                                    width={32}
                                    height={32}
                                    unoptimized
                                    className="object-contain"
                                  />
                                ) : (
                                  <Icon className="w-6 h-6 text-primary" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-secondary truncate">
                                  {i.name}
                                </h4>
                                <p className="text-xs text-gray-600 line-clamp-1">
                                  {i.description}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`flex items-center gap-1 text-white text-xs px-2 py-1 rounded-full ${statusChip(
                                i.status
                              )} shrink-0 ml-2`}
                            >
                              {statusIcon(i.status)}
                              {i.status === "connected"
                                ? "Active"
                                : i.status === "pending"
                                ? "Pending"
                                : "Inactive"}
                            </span>
                          </div>

                          {i.stats && i.stats.length > 0 && (
                            <div className="bg-gray-50 rounded-lg p-3 mb-4">
                              <div className="grid grid-cols-2 gap-2">
                                {i.stats
                                  .slice(0, 4)
                                  .map((s: IntegrationStat, idx: number) => (
                                    <div key={idx} className="text-sm">
                                      <span className="text-gray-600 text-xs">
                                        {s.label}:
                                      </span>
                                      <span className="font-medium ml-1">
                                        {s.value}
                                      </span>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2">
                            {i.status === "connected" ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1"
                                  onClick={() => handleConfigureClick(i)}
                                  disabled={actionLoading === i.id}
                                  aria-label={`Configure ${i.name}`}
                                >
                                  <Settings className="w-3 h-3 mr-1" />
                                  Configure
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleTestConnection(i.id)}
                                  disabled={actionLoading === i.id}
                                  aria-label={`Test connection for ${i.name}`}
                                >
                                  <RefreshCw
                                    className={`w-3 h-3 mr-1 ${
                                      actionLoading === i.id
                                        ? "animate-spin"
                                        : ""
                                    }`}
                                  />
                                  Test
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDisconnect(i.id)}
                                  disabled={actionLoading === i.id}
                                  aria-label={`Disconnect ${i.name}`}
                                >
                                  {actionLoading === i.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <XCircle className="w-3 h-3" />
                                  )}
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => handleConfigureClick(i)}
                                  disabled={actionLoading === i.id}
                                >
                                  {i.status === "pending"
                                    ? "Setup Now"
                                    : "Connect"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteClick(i)}
                                  disabled={actionLoading === i.id}
                                  aria-label={`Delete ${i.name} integration`}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
              </div>
            </div>
          );
        })}

      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-secondary">
            API Documentation
          </h3>
          <Button
            onClick={handleGenerateApiKey}
            disabled={actionLoading === "generate-key"}
          >
            {actionLoading === "generate-key" ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plug className="w-4 h-4 mr-2" />
            )}
            Generate API Key
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Code2 className="text-primary w-5 h-5" />
              </div>
              <h4 className="font-medium text-secondary">REST API</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Complete REST API docs for building custom integrations
            </p>
            <Button
              variant="link"
              className="text-primary px-0 hover:underline"
              onClick={() => setDocsOpen(true)}
            >
              View Documentation →
            </Button>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <Plug className="text-accent w-5 h-5" />
              </div>
              <h4 className="font-medium text-secondary">Webhooks</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Set up webhooks to receive real-time notifications
            </p>
            <Button
              variant="link"
              className="text-primary px-0 hover:underline"
              onClick={() => setWebhooksOpen(true)}
            >
              Configure Webhooks →
            </Button>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <ShieldCheck className="text-purple-600 w-5 h-5" />
              </div>
              <h4 className="font-medium text-secondary">Security</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Learn about API security and best practices
            </p>
            <Button
              variant="link"
              className="text-primary px-0 hover:underline"
              onClick={() => setSecurityOpen(true)}
            >
              Security Guide →
            </Button>
          </div>
        </div>
      </div>

      {/* Add Integration Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Add New Integration
            </DialogTitle>
            <DialogDescription>
              Browse and add available integrations to your platform
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="search-integrations">Search</Label>
              <div className="relative mt-1">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search-integrations"
                  className="pl-9"
                  placeholder="Search available integrations..."
                  value={addSearch}
                  onChange={(e) => setAddSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {EMPTY_INTEGRATIONS.filter(
                (opt) =>
                  opt.name.toLowerCase().includes(addSearch.toLowerCase()) ||
                  opt.description
                    .toLowerCase()
                    .includes(addSearch.toLowerCase())
              ).map((opt) => {
                const isAdded = integrations.some((i) => i.slug === opt.id);
                return (
                  <div
                    key={opt.id}
                    onClick={() => !isAdded && setSelectedAddId(opt.id)}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedAddId === opt.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-gray-200 hover:border-primary hover:bg-gray-50"
                    } ${
                      isAdded ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        {opt.logo ? (
                          <Image
                            src={opt.logo}
                            alt={opt.name}
                            width={24}
                            height={24}
                            unoptimized
                            className="object-contain"
                          />
                        ) : (
                          <Plug className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-secondary">
                            {opt.name}
                          </h4>
                          {isAdded && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                              Added
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {opt.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddIntegration}
                disabled={!selectedAddId || actionLoading === "create"}
              >
                {actionLoading === "create" ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-1" />
                )}
                Add Selected
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Configuration Dialog */}
      <Dialog open={configOpen} onOpenChange={setConfigOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Configure {selectedIntegration?.name}
            </DialogTitle>
            <DialogDescription>
              Set up your integration credentials and configuration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="apiKey">API Key *</Label>
              <Input
                id="apiKey"
                type="password"
                value={configData.apiKey}
                onChange={(e) =>
                  setConfigData({ ...configData, apiKey: e.target.value })
                }
                placeholder="Enter your API key"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="apiSecret">API Secret</Label>
              <Input
                id="apiSecret"
                type="password"
                value={configData.apiSecret}
                onChange={(e) =>
                  setConfigData({ ...configData, apiSecret: e.target.value })
                }
                placeholder="Enter your API secret"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="webhookUrl">Webhook URL</Label>
              <Input
                id="webhookUrl"
                type="url"
                value={configData.webhookUrl}
                onChange={(e) =>
                  setConfigData({ ...configData, webhookUrl: e.target.value })
                }
                placeholder="https://your-domain.com/webhook"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={configData.notes}
                onChange={(e) =>
                  setConfigData({ ...configData, notes: e.target.value })
                }
                placeholder="Add any configuration notes..."
                className="mt-1 resize-none"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfigOpen(false)}
              disabled={actionLoading === `config-${selectedIntegration?.id}`}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveConfig}
              disabled={
                !configData.apiKey ||
                actionLoading === `config-${selectedIntegration?.id}`
              }
            >
              {actionLoading === `config-${selectedIntegration?.id}` ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-1" />
              )}
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove{" "}
              <span className="font-semibold">{selectedIntegration?.name}</span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={actionLoading === selectedIntegration?.id}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={actionLoading === selectedIntegration?.id}
            >
              {actionLoading === selectedIntegration?.id ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-1" />
              )}
              Delete Integration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* API Key Generation Dialog */}
      <Dialog open={apiKeyOpen} onOpenChange={setApiKeyOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              API Key Generated
            </DialogTitle>
            <DialogDescription>
              Your new API key has been generated. Copy it now as you won't be
              able to see it again.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <Label className="text-xs text-gray-500 mb-2 block">
                API Key
              </Label>
              <div className="flex items-center justify-between gap-2">
                <code className="text-sm font-mono break-all">
                  {generatedApiKey}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyApiKey}
                  className="shrink-0"
                >
                  {apiKeyCopied ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                Make sure to copy your API key now. You won't be able to see it
                again!
              </p>
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={handleGenerateApiKey}
              disabled={actionLoading === "generate-key"}
            >
              <RefreshCw
                className={`w-4 h-4 mr-1 ${
                  actionLoading === "generate-key" ? "animate-spin" : ""
                }`}
              />
              Regenerate
            </Button>
            <Button onClick={() => setApiKeyOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Webhooks Configuration Dialog */}
      <Dialog open={webhooksOpen} onOpenChange={setWebhooksOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plug className="w-5 h-5 text-primary" />
              Configure Webhooks
            </DialogTitle>
            <DialogDescription>
              Set up webhooks to receive real-time notifications about events
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input
                id="webhook-url"
                placeholder="https://your-domain.com/webhook"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                The URL where webhook events will be sent
              </p>
            </div>
            <div>
              <Label className="mb-2 block">Events to Subscribe</Label>
              <div className="space-y-2 border border-gray-200 rounded-lg p-3">
                {[
                  { id: "user.created", label: "User Created" },
                  { id: "user.updated", label: "User Updated" },
                  {
                    id: "integration.connected",
                    label: "Integration Connected",
                  },
                  {
                    id: "integration.disconnected",
                    label: "Integration Disconnected",
                  },
                  { id: "payment.success", label: "Payment Success" },
                  { id: "payment.failed", label: "Payment Failed" },
                ].map((event) => (
                  <label
                    key={event.id}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={webhookEvents.includes(event.id)}
                      onChange={() => toggleWebhookEvent(event.id)}
                      className="w-4 h-4 text-primary"
                    />
                    <span className="text-sm">{event.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWebhooksOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveWebhook}
              disabled={actionLoading === "save-webhooks"}
            >
              {actionLoading === "save-webhooks" ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-1" />
              )}
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* API Documentation Dialog */}
      <Dialog open={docsOpen} onOpenChange={setDocsOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-primary" />
              REST API Documentation
            </DialogTitle>
            <DialogDescription>
              Complete API reference for integrating with our platform
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Getting Started */}
            <div className="border-l-4 border-primary pl-4">
              <h4 className="font-semibold text-secondary mb-3 flex items-center gap-2">
                <Plug className="w-4 h-4" />
                Getting Started
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                Our REST API uses standard HTTP methods and returns JSON
                responses. All requests must be authenticated using an API key.
              </p>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <div className="text-gray-400">// Base URL</div>
                <div>https://api.yourplatform.com/v1</div>
                <br />
                <div className="text-gray-400">// Authentication Header</div>
                <div>Authorization: Bearer YOUR_API_KEY</div>
              </div>
            </div>

            {/* Endpoints */}
            <div className="border-l-4 border-accent pl-4">
              <h4 className="font-semibold text-secondary mb-3 flex items-center gap-2">
                <Code2 className="w-4 h-4" />
                Core Endpoints
              </h4>
              <div className="space-y-4">
                {/* Integrations Endpoint */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                      GET
                    </span>
                    <code className="text-sm">/integrations</code>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    List all integrations
                  </p>
                  <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-xs overflow-x-auto">
                    <div className="text-green-400">// Response 200 OK</div>
                    <pre>{`{
  "data": [
    {
      "id": "stripe",
      "name": "Stripe",
      "status": "connected",
      "category": "Payment Gateways"
    }
  ],
  "total": 1
}`}</pre>
                  </div>
                </div>

                {/* Connect Endpoint */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                      POST
                    </span>
                    <code className="text-sm">/integrations/:id/connect</code>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Connect an integration
                  </p>
                  <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-xs overflow-x-auto">
                    <div className="text-green-400">// Request Body</div>
                    <pre>{`{
  "config": {
    "apiKey": "your_api_key",
    "apiSecret": "your_secret"
  }
}`}</pre>
                  </div>
                </div>

                {/* Disconnect Endpoint */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                      DELETE
                    </span>
                    <code className="text-sm">
                      /integrations/:id/disconnect
                    </code>
                  </div>
                  <p className="text-sm text-gray-600">
                    Disconnect an integration
                  </p>
                </div>
              </div>
            </div>

            {/* Rate Limiting */}
            <div className="border-l-4 border-yellow-500 pl-4">
              <h4 className="font-semibold text-secondary mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Rate Limiting
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                API requests are limited to 1000 requests per hour per API key.
                Rate limit information is included in response headers:
              </p>
              <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-xs">
                <div>X-RateLimit-Limit: 1000</div>
                <div>X-RateLimit-Remaining: 999</div>
                <div>X-RateLimit-Reset: 1638360000</div>
              </div>
            </div>

            {/* Error Codes */}
            <div className="border-l-4 border-red-500 pl-4">
              <h4 className="font-semibold text-secondary mb-2 flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Error Responses
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <code className="text-red-600 font-semibold">400</code>
                  <span className="text-gray-600">
                    Bad Request - Invalid parameters
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <code className="text-red-600 font-semibold">401</code>
                  <span className="text-gray-600">
                    Unauthorized - Invalid API key
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <code className="text-red-600 font-semibold">404</code>
                  <span className="text-gray-600">
                    Not Found - Resource doesn't exist
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <code className="text-red-600 font-semibold">429</code>
                  <span className="text-gray-600">
                    Too Many Requests - Rate limit exceeded
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <code className="text-red-600 font-semibold">500</code>
                  <span className="text-gray-600">Internal Server Error</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Need More Help?
              </h4>
              <p className="text-sm text-blue-800">
                For complete API documentation, code examples, and SDKs, visit
                our{" "}
                <a href="#" className="underline font-medium">
                  Developer Portal
                </a>{" "}
                or join our{" "}
                <a href="#" className="underline font-medium">
                  Developer Community
                </a>
                .
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDocsOpen(false)}>
              Close
            </Button>
            <Button onClick={handleGenerateApiKey}>
              <Key className="w-4 h-4 mr-1" />
              Generate API Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Security Guide Dialog */}
      <Dialog open={securityOpen} onOpenChange={setSecurityOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              API Security Best Practices
            </DialogTitle>
            <DialogDescription>
              Follow these guidelines to keep your integrations secure
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-l-4 border-primary pl-4">
              <h4 className="font-semibold text-secondary mb-2 flex items-center gap-2">
                <Key className="w-4 h-4" />
                API Key Management
              </h4>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>
                  Never share your API keys publicly or commit them to version
                  control
                </li>
                <li>
                  Store API keys in environment variables or secure vaults
                </li>
                <li>Rotate keys regularly and immediately if compromised</li>
                <li>
                  Use different keys for development and production environments
                </li>
              </ul>
            </div>

            <div className="border-l-4 border-accent pl-4">
              <h4 className="font-semibold text-secondary mb-2 flex items-center gap-2">
                <LockIcon className="w-4 h-4" />
                Request Security
              </h4>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Always use HTTPS for API requests</li>
                <li>Implement rate limiting to prevent abuse</li>
                <li>Validate and sanitize all input data</li>
                <li>Use webhook signatures to verify authenticity</li>
              </ul>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-semibold text-secondary mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Access Control
              </h4>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Implement proper authentication and authorization</li>
                <li>Use role-based access control (RBAC) where appropriate</li>
                <li>Log all API access and monitor for suspicious activity</li>
                <li>
                  Set appropriate CORS policies for browser-based requests
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Need Help?
              </h4>
              <p className="text-sm text-blue-800">
                For more detailed security documentation and implementation
                guides, visit our{" "}
                <a href="#" className="underline font-medium">
                  Security Center
                </a>{" "}
                or contact our support team.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setSecurityOpen(false)}>Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
