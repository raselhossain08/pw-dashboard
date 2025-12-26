"use client";

import * as React from "react";
import RequireAuth from "@/components/RequireAuth";
import {
  Save,
  RotateCcw,
  Settings,
  Palette,
  CreditCard,
  Search as SearchIcon,
  Bell,
  Database,
  Loader2,
  RefreshCw,
  CheckCircle2,
  Globe,
  Shield,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import MySettings from "@/components/settings/MySettings";

export default function MySettingsPage() {
  const {
    configs,
    groupedConfigs,
    isLoading,
    isSaving,
    fetchAllConfigs,
    fetchGroupedConfigs,
    bulkUpdateConfigs,
  } = useSystemSettings();

  const [activeTab, setActiveTab] = React.useState("General");
  const [hasChanges, setHasChanges] = React.useState(false);
  const [localChanges, setLocalChanges] = React.useState<
    Record<string, string>
  >({});

  React.useEffect(() => {
    fetchAllConfigs();
    fetchGroupedConfigs();
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleConfigChange = (key: string, value: string) => {
    if (key === "refresh") {
      setLocalChanges({});
      setHasChanges(false);
      fetchAllConfigs();
      fetchGroupedConfigs();
      return;
    }

    setLocalChanges((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    if (Object.keys(localChanges).length === 0) return;

    const updates = Object.entries(localChanges).map(([key, value]) => ({
      key,
      value,
    }));

    try {
      await bulkUpdateConfigs(updates);
      setLocalChanges({});
      setHasChanges(false);
    } catch (error) {
      console.error("Failed to save changes:", error);
    }
  };

  const handleResetToDefault = () => {
    setLocalChanges({});
    setHasChanges(false);
    fetchAllConfigs();
  };

  const statsData = [
    {
      label: "Active Configs",
      value: configs.length || 0,
      icon: Settings,
      bgColor: "bg-primary/10",
      iconColor: "text-primary",
      status: "All systems operational",
    },
    {
      label: "Last Updated",
      value: "Just now",
      icon: CheckCircle2,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
      status: "Synced successfully",
    },
    {
      label: "Categories",
      value: Object.keys(groupedConfigs).length || 0,
      icon: Database,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
      status: "Organized",
    },
    {
      label: "Security",
      value: "Active",
      icon: Shield,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
      status: "Protected",
    },
  ];

  return (
    <RequireAuth roles={["admin", "super_admin"]}>
      <AppLayout>
        <main className="pt-6">
          <div className="p-6">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-secondary mb-2">
                  System Settings
                </h2>
                <p className="text-gray-600">
                  Configure your platform preferences, integrations, and system
                  settings.
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={handleResetToDefault}
                  disabled={!hasChanges || isSaving}
                >
                  <RotateCcw className="w-4 h-4 mr-2" /> Reset to Default
                </Button>
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    fetchAllConfigs();
                    fetchGroupedConfigs();
                  }}
                  disabled={isLoading}
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-2 ${
                      isLoading ? "animate-spin" : ""
                    }`}
                  />
                  Refresh
                </Button>
                <Button
                  className="bg-primary hover:bg-primary/90 text-white"
                  onClick={handleSaveChanges}
                  disabled={!hasChanges || isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}{" "}
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statsData.map((stat, index) => (
                <div
                  key={index}
                  className="bg-card rounded-xl p-6 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">
                        {stat.label}
                      </p>
                      {isLoading ? (
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400 mt-1" />
                      ) : (
                        <>
                          <p className="text-2xl font-bold text-secondary mt-1">
                            {stat.value}
                          </p>
                          <p className="text-accent text-sm mt-1">
                            <Zap className="w-3 h-3 inline" /> {stat.status}
                          </p>
                        </>
                      )}
                    </div>
                    <div
                      className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}
                    >
                      <stat.icon className={`${stat.iconColor} text-lg`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-b border-gray-200 mb-8">
              <nav className="flex space-x-8">
                {[
                  "General",
                  "Branding",
                  "Payments",
                  "SEO",
                  "Notifications",
                  "Backups",
                  "Security",
                  "Integrations",
                  "Advanced",
                ].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`py-4 px-1 font-medium text-sm transition-colors ${
                      activeTab === tab
                        ? "border-b-2 border-primary text-primary"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <MySettings
                activeTab={activeTab}
                configs={configs}
                groupedConfigs={groupedConfigs}
                onConfigChange={handleConfigChange}
              />
            )}
          </div>
        </main>
      </AppLayout>
    </RequireAuth>
  );
}
