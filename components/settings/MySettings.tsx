"use client";

import * as React from "react";
import {
  Save,
  RotateCcw,
  SlidersHorizontal,
  Globe,
  Languages,
  Gauge,
  ShieldCheck,
  Plug,
  ShoppingCart,
  BarChart3,
  Mail,
  Smartphone,
  MessageSquare,
  Users as UsersIcon,
  Search as SearchIcon,
  Cog,
  Settings2,
  CreditCard,
  Key,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  EyeOff,
  Clock,
  Bell,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import {
  settingsService,
  type SettingsData,
} from "@/services/settings.service";
import { useToast } from "@/context/ToastContext";

interface SystemConfig {
  _id: string;
  key: string;
  value: string;
  category: string;
  label: string;
  description?: string;
  isSecret: boolean;
  isRequired: boolean;
  placeholder?: string;
  metadata?: Record<string, any>;
  isActive: boolean;
}

interface GroupedConfigs {
  [category: string]: SystemConfig[];
}

interface MySettingsProps {
  activeTab?: string;
  configs?: SystemConfig[];
  groupedConfigs?: GroupedConfigs;
  onConfigChange?: (key: string, value: string) => void;
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      className="relative inline-block w-12 h-6 cursor-pointer"
      onClick={() => onChange(!checked)}
    >
      <div
        className={`w-12 h-6 rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-gray-300"
        }`}
      />
      <div
        className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </div>
  );
}

export default function MySettings({
  activeTab: externalActiveTab,
  configs = [],
  groupedConfigs = {},
  onConfigChange,
}: MySettingsProps) {
  const [activeTab, setActiveTab] = React.useState(
    externalActiveTab || "General"
  );
  const { updateConfig, testConnection, bulkUpdateConfigs, isSaving } =
    useSystemSettings();
  const { push } = useToast();

  // Change tracking
  const [hasChanges, setHasChanges] = React.useState(false);
  const [pendingChanges, setPendingChanges] = React.useState<
    Record<string, any>
  >({});
  const [isLoading, setIsLoading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Payment Config Dialogs
  const [stripeDialogOpen, setStripeDialogOpen] = React.useState(false);
  const [paypalDialogOpen, setPaypalDialogOpen] = React.useState(false);
  const [isTestingConnection, setIsTestingConnection] = React.useState(false);
  const [connectionStatus, setConnectionStatus] = React.useState<{
    stripe?: "success" | "error" | null;
    paypal?: "success" | "error" | null;
  }>({});

  // Stripe Config
  const [stripePublishableKey, setStripePublishableKey] = React.useState("");
  const [stripeSecretKey, setStripeSecretKey] = React.useState("");
  const [stripeWebhookSecret, setStripeWebhookSecret] = React.useState("");
  const [showStripeSecret, setShowStripeSecret] = React.useState(false);

  // PayPal Config
  const [paypalClientId, setPaypalClientId] = React.useState("");
  const [paypalClientSecret, setPaypalClientSecret] = React.useState("");
  const [paypalMode, setPaypalMode] = React.useState<"sandbox" | "live">(
    "sandbox"
  );
  const [showPaypalSecret, setShowPaypalSecret] = React.useState(false);

  // Notification section navigation
  const [activeNotificationSection, setActiveNotificationSection] =
    React.useState("General Notifications");

  // Update local tab when external tab changes
  React.useEffect(() => {
    if (externalActiveTab) {
      setActiveTab(externalActiveTab);
    }
  }, [externalActiveTab]);

  // Initialize all settings from backend configs
  React.useEffect(() => {
    if (configs.length === 0) return;

    setIsLoading(true);
    try {
      const settings = settingsService.mapConfigsToSettings(configs);

      // General Settings
      if (settings.platformName) setPlatformName(settings.platformName);
      if (settings.platformUrl) setPlatformUrl(settings.platformUrl);
      if (settings.contactEmail) setContactEmail(settings.contactEmail);
      if (settings.supportPhone) setSupportPhone(settings.supportPhone);
      if (settings.platformDesc) setPlatformDesc(settings.platformDesc);
      if (settings.timeZone) setTimeZone(settings.timeZone);
      if (settings.dateFormat) setDateFormat(settings.dateFormat);
      if (settings.currency) setCurrency(settings.currency);
      if (settings.units) setUnits(settings.units);
      if (settings.defaultLanguage)
        setDefaultLanguage(settings.defaultLanguage);
      if (settings.autoDetectLang !== undefined)
        setAutoDetectLang(settings.autoDetectLang);
      if (settings.availableLangs) setAvailableLangs(settings.availableLangs);

      // Performance
      if (settings.cachingEnabled !== undefined)
        setCachingEnabled(settings.cachingEnabled);
      if (settings.imageOptimization !== undefined)
        setImageOptimization(settings.imageOptimization);
      if (settings.cdnEnabled !== undefined) setCdnEnabled(settings.cdnEnabled);
      if (settings.cacheDuration) setCacheDuration(settings.cacheDuration);
      if (settings.imageQuality) setImageQuality(settings.imageQuality);

      // Security
      if (settings.twoFactor !== undefined) setTwoFactor(settings.twoFactor);
      if (settings.passwordPolicy) setPasswordPolicy(settings.passwordPolicy);
      if (settings.sslEnforce !== undefined) setSslEnforce(settings.sslEnforce);
      if (settings.apiRateLimit !== undefined)
        setApiRateLimit(settings.apiRateLimit);
      if (settings.sessionTimeout) setSessionTimeout(settings.sessionTimeout);

      // Integrations
      if (settings.shopifyConnected !== undefined)
        setShopifyConnected(settings.shopifyConnected);
      if (settings.gaConnected !== undefined)
        setGaConnected(settings.gaConnected);
      if (settings.emailServiceEnabled !== undefined)
        setEmailServiceEnabled(settings.emailServiceEnabled);

      // Branding
      if (settings.brandPrimary) setBrandPrimary(settings.brandPrimary);
      if (settings.brandSecondary) setBrandSecondary(settings.brandSecondary);
      if (settings.brandAccent) setBrandAccent(settings.brandAccent);
      if (settings.logoUrl) setLogoUrl(settings.logoUrl);
      if (settings.faviconUrl) setFaviconUrl(settings.faviconUrl);

      // Payments
      if (settings.stripeEnabled !== undefined)
        setStripeEnabled(settings.stripeEnabled);
      if (settings.paypalEnabled !== undefined)
        setPaypalEnabled(settings.paypalEnabled);
      if (settings.stripeConfig) {
        setStripePublishableKey(settings.stripeConfig.publishableKey || "");
        setStripeSecretKey(settings.stripeConfig.secretKey || "");
        setStripeWebhookSecret(settings.stripeConfig.webhookSecret || "");
      }
      if (settings.paypalConfig) {
        setPaypalClientId(settings.paypalConfig.clientId || "");
        setPaypalClientSecret(settings.paypalConfig.clientSecret || "");
        setPaypalMode(settings.paypalConfig.mode || "sandbox");
      }
      if (settings.invoicePrefix) setInvoicePrefix(settings.invoicePrefix);
      if (settings.taxRate) setTaxRate(settings.taxRate);
      if (settings.paymentCurrency)
        setPaymentCurrency(settings.paymentCurrency);

      // SEO
      if (settings.seoTitle) setSeoTitle(settings.seoTitle);
      if (settings.seoDescription) setSeoDescription(settings.seoDescription);
      if (settings.seoKeywords) setSeoKeywords(settings.seoKeywords);
      if (settings.ogImage) setOgImage(settings.ogImage);
      if (settings.sitemapEnabled !== undefined)
        setSitemapEnabled(settings.sitemapEnabled);
      if (settings.robotsIndex) setRobotsIndex(settings.robotsIndex);
      if (settings.canonicalUrl) setCanonicalUrl(settings.canonicalUrl);

      // Backup
      if (settings.backupFrequency)
        setBackupFrequency(settings.backupFrequency);
      if (settings.retentionPeriod)
        setRetentionPeriod(settings.retentionPeriod);
      if (settings.backupDestination)
        setBackupDestination(settings.backupDestination);
      if (settings.encryptionEnabled !== undefined)
        setEncryptionEnabled(settings.encryptionEnabled);

      // Notifications
      if (settings.notificationPrefs) {
        const prefs = settings.notificationPrefs;
        if (prefs.system) {
          setSystemPrefs((prev) =>
            prev.map((p) => {
              const found = prefs.system?.find((s) => s.id === p.id);
              return found ? { ...p, enabled: found.enabled } : p;
            })
          );
        }
        if (prefs.emailMarketing) {
          setEmailMarketing((prev) => ({ ...prev, ...prefs.emailMarketing }));
        }
        if (prefs.emailEducation) {
          setEmailEducation((prev) => ({ ...prev, ...prefs.emailEducation }));
        }
        if (prefs.quietStart) setQuietStart(prefs.quietStart);
        if (prefs.quietEnd) setQuietEnd(prefs.quietEnd);
        if (prefs.days) setDays(prefs.days);
        if (prefs.pushEnabled !== undefined) setPushEnabled(prefs.pushEnabled);
        if (prefs.smsEnabled !== undefined) setSmsEnabled(prefs.smsEnabled);
      }
    } catch (error) {
      console.error("Failed to initialize settings from configs:", error);
      push({
        message: "Failed to load settings from backend",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [configs, push]);

  const handleSaveStripeConfig = async () => {
    try {
      const config = {
        publishableKey: stripePublishableKey,
        secretKey: stripeSecretKey,
        webhookSecret: stripeWebhookSecret,
      };
      await updateConfig("stripe_config", JSON.stringify(config));
      setStripeDialogOpen(false);
      if (onConfigChange) {
        onConfigChange("stripe_config", JSON.stringify(config));
      }
    } catch (error) {
      console.error("Failed to save Stripe config", error);
    }
  };

  const handleSavePaypalConfig = async () => {
    try {
      const config = {
        clientId: paypalClientId,
        clientSecret: paypalClientSecret,
        mode: paypalMode,
      };
      await updateConfig("paypal_config", JSON.stringify(config));
      setPaypalDialogOpen(false);
      if (onConfigChange) {
        onConfigChange("paypal_config", JSON.stringify(config));
      }
    } catch (error) {
      console.error("Failed to save PayPal config", error);
    }
  };

  const handleTestStripeConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus({ ...connectionStatus, stripe: null });
    try {
      await testConnection("stripe_config");
      setConnectionStatus({ ...connectionStatus, stripe: "success" });
    } catch (error) {
      setConnectionStatus({ ...connectionStatus, stripe: "error" });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleTestPaypalConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus({ ...connectionStatus, paypal: null });
    try {
      await testConnection("paypal_config");
      setConnectionStatus({ ...connectionStatus, paypal: "success" });
    } catch (error) {
      setConnectionStatus({ ...connectionStatus, paypal: "error" });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const [platformName, setPlatformName] = React.useState("Personal Wings");
  const [platformUrl, setPlatformUrl] = React.useState(
    "https://personalwings.com"
  );
  const [contactEmail, setContactEmail] = React.useState(
    "admin@personalwings.com"
  );
  const [supportPhone, setSupportPhone] = React.useState("+1 (555) 123-4567");
  const [platformDesc, setPlatformDesc] = React.useState(
    "Personal Wings - Premier aviation education and aircraft trading platform offering comprehensive flight training programs and premium aircraft sales services."
  );

  const [timeZone, setTimeZone] = React.useState("America/New_York (EST)");
  const [dateFormat, setDateFormat] = React.useState("MM/DD/YYYY (US)");
  const [currency, setCurrency] = React.useState("USD - US Dollar");
  const [units, setUnits] = React.useState("Imperial (Miles, Feet, Pounds)");

  const [defaultLanguage, setDefaultLanguage] = React.useState("English (US)");
  const [autoDetectLang, setAutoDetectLang] = React.useState(true);
  const [availableLangs, setAvailableLangs] = React.useState<
    Record<string, boolean>
  >({
    English: true,
    Spanish: true,
    French: false,
    German: false,
    Chinese: false,
    Arabic: false,
    Russian: false,
    Japanese: false,
  });

  const [cachingEnabled, setCachingEnabled] = React.useState(true);
  const [imageOptimization, setImageOptimization] = React.useState(true);
  const [cdnEnabled, setCdnEnabled] = React.useState(false);
  const [cacheDuration, setCacheDuration] = React.useState("6 hours");
  const [imageQuality, setImageQuality] = React.useState("Medium (Balanced)");

  const [twoFactor, setTwoFactor] = React.useState(true);
  const [passwordPolicy, setPasswordPolicy] = React.useState(
    "Standard (8+ characters, mixed case)"
  );

  const [shopifyConnected, setShopifyConnected] = React.useState(true);
  const [gaConnected, setGaConnected] = React.useState(true);
  const [emailServiceEnabled, setEmailServiceEnabled] = React.useState(false);

  const [brandPrimary, setBrandPrimary] = React.useState("#6366F1");
  const [brandSecondary, setBrandSecondary] = React.useState("#0F172A");
  const [brandAccent, setBrandAccent] = React.useState("#10B981");
  const [logoUrl, setLogoUrl] = React.useState("");
  const [faviconUrl, setFaviconUrl] = React.useState("");

  const [stripeEnabled, setStripeEnabled] = React.useState(true);
  const [paypalEnabled, setPaypalEnabled] = React.useState(false);
  const [invoicePrefix, setInvoicePrefix] = React.useState("PW-");
  const [taxRate, setTaxRate] = React.useState("8%");
  const [paymentCurrency, setPaymentCurrency] =
    React.useState("USD - US Dollar");

  const [seoTitle, setSeoTitle] = React.useState(
    "Personal Wings – Premier aviation education and aircraft trading platform"
  );
  const [seoDescription, setSeoDescription] = React.useState(
    "Comprehensive flight training programs and premium aircraft sales services."
  );
  const [seoKeywords, setSeoKeywords] = React.useState(
    "aviation, flight training, aircraft sales, pilot courses"
  );
  const [ogImage, setOgImage] = React.useState("");
  const [sitemapEnabled, setSitemapEnabled] = React.useState(true);
  const [robotsIndex, setRobotsIndex] = React.useState("Index");
  const [canonicalUrl, setCanonicalUrl] = React.useState(
    "https://personalwings.com"
  );

  const [backupFrequency, setBackupFrequency] = React.useState("Daily");
  const [retentionPeriod, setRetentionPeriod] = React.useState("30 days");
  const [backupDestination, setBackupDestination] =
    React.useState("Local Storage");
  const [encryptionEnabled, setEncryptionEnabled] = React.useState(true);
  const [lastBackup, setLastBackup] = React.useState("Nov 10, 2025 02:30 AM");

  type NotificationPref = {
    id: string;
    label: string;
    description: string;
    enabled: boolean;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  };
  const [search, setSearch] = React.useState("");
  const [enableAll, setEnableAll] = React.useState(false);
  const initialSystemPrefs: NotificationPref[] = [
    {
      id: "system-updates",
      label: "System Updates",
      description: "Platform maintenance and feature updates",
      enabled: true,
      icon: Cog,
      color: "blue",
    },
    {
      id: "security-alerts",
      label: "Security Alerts",
      description: "Login attempts and security warnings",
      enabled: true,
      icon: ShieldCheck,
      color: "red",
    },
    {
      id: "student-activity",
      label: "Student Activity",
      description: "Enrollments, completions, and progress",
      enabled: false,
      icon: UsersIcon,
      color: "purple",
    },
  ];
  const [systemPrefs, setSystemPrefs] = React.useState(initialSystemPrefs);
  const filteredSystemPrefs = systemPrefs.filter((p) =>
    `${p.label} ${p.description}`.toLowerCase().includes(search.toLowerCase())
  );
  const [emailMarketing, setEmailMarketing] = React.useState({
    newsletter: true,
    productUpdates: true,
    specialOffers: false,
  });
  const [emailEducation, setEmailEducation] = React.useState({
    courseRecommendations: true,
    learningTips: false,
    industryNews: true,
  });
  const [quietStart, setQuietStart] = React.useState("10:00 PM");
  const [quietEnd, setQuietEnd] = React.useState("6:00 AM");
  const [days, setDays] = React.useState<Record<string, boolean>>({
    Sunday: false,
    Monday: true,
    Tuesday: true,
    Wednesday: true,
    Thursday: true,
    Friday: true,
    Saturday: false,
  });
  const [pushEnabled, setPushEnabled] = React.useState(true);
  const [smsEnabled, setSmsEnabled] = React.useState(true);
  const [sslEnforce, setSslEnforce] = React.useState(true);
  const [apiRateLimit, setApiRateLimit] = React.useState(true);
  const [sessionTimeout, setSessionTimeout] = React.useState("30 minutes");

  // Scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveNotificationSection(sectionId);
    }
  };

  const scrollToId = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Track changes
  const markAsChanged = React.useCallback((key: string, value: any) => {
    setPendingChanges((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  }, []);

  // Helper to wrap setState with change tracking
  const createChangeHandler = React.useCallback(
    <T,>(setter: React.Dispatch<React.SetStateAction<T>>, key: string) => {
      return (value: T) => {
        setter(value);
        markAsChanged(key, value);
      };
    },
    [markAsChanged]
  );

  // Validation helper
  const validateSettings = React.useCallback((): {
    isValid: boolean;
    errors: string[];
  } => {
    const errors: string[] = [];

    if (!platformName?.trim()) {
      errors.push("Platform name is required");
    }

    if (platformUrl && !/^https?:\/\/.+\..+/.test(platformUrl)) {
      errors.push("Platform URL must be a valid URL");
    }

    if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      errors.push("Contact email must be a valid email address");
    }

    if (seoTitle && seoTitle.length > 60) {
      errors.push("SEO title should be 60 characters or less");
    }

    if (seoDescription && seoDescription.length > 160) {
      errors.push("SEO description should be 160 characters or less");
    }

    if (stripeEnabled && (!stripePublishableKey || !stripeSecretKey)) {
      errors.push("Stripe credentials are required when Stripe is enabled");
    }

    if (paypalEnabled && (!paypalClientId || !paypalClientSecret)) {
      errors.push("PayPal credentials are required when PayPal is enabled");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [
    platformName,
    platformUrl,
    contactEmail,
    seoTitle,
    seoDescription,
    stripeEnabled,
    stripePublishableKey,
    stripeSecretKey,
    paypalEnabled,
    paypalClientId,
    paypalClientSecret,
  ]);

  // Handle export settings
  const handleExportSettings = React.useCallback(() => {
    try {
      const settings: SettingsData = {
        platformName,
        platformUrl,
        contactEmail,
        supportPhone,
        platformDesc,
        timeZone,
        dateFormat,
        currency,
        units,
        defaultLanguage,
        autoDetectLang,
        availableLangs,
        cachingEnabled,
        imageOptimization,
        cdnEnabled,
        cacheDuration,
        imageQuality,
        twoFactor,
        passwordPolicy,
        sslEnforce,
        apiRateLimit,
        sessionTimeout,
        shopifyConnected,
        gaConnected,
        emailServiceEnabled,
        brandPrimary,
        brandSecondary,
        brandAccent,
        logoUrl,
        faviconUrl,
        stripeEnabled,
        paypalEnabled,
        stripeConfig: {
          publishableKey: stripePublishableKey,
          secretKey: stripeSecretKey,
          webhookSecret: stripeWebhookSecret,
        },
        paypalConfig: {
          clientId: paypalClientId,
          clientSecret: paypalClientSecret,
          mode: paypalMode,
        },
        invoicePrefix,
        taxRate,
        paymentCurrency,
        seoTitle,
        seoDescription,
        seoKeywords,
        ogImage,
        sitemapEnabled,
        robotsIndex,
        canonicalUrl,
        backupFrequency,
        retentionPeriod,
        backupDestination,
        encryptionEnabled,
        notificationPrefs: {
          system: systemPrefs.map((p) => ({ id: p.id, enabled: p.enabled })),
          emailMarketing,
          emailEducation,
          quietStart,
          quietEnd,
          days,
          pushEnabled,
          smsEnabled,
        },
      };

      const json = settingsService.exportSettings(settings);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `settings-export-${
        new Date().toISOString().split("T")[0]
      }.json`;
      a.click();
      URL.revokeObjectURL(url);

      push({
        message: "Settings exported successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to export settings:", error);
      push({
        message: "Failed to export settings",
        type: "error",
      });
    }
  }, [
    platformName,
    platformUrl,
    contactEmail,
    supportPhone,
    platformDesc,
    timeZone,
    dateFormat,
    currency,
    units,
    defaultLanguage,
    autoDetectLang,
    availableLangs,
    cachingEnabled,
    imageOptimization,
    cdnEnabled,
    cacheDuration,
    imageQuality,
    twoFactor,
    passwordPolicy,
    sslEnforce,
    apiRateLimit,
    sessionTimeout,
    shopifyConnected,
    gaConnected,
    emailServiceEnabled,
    brandPrimary,
    brandSecondary,
    brandAccent,
    logoUrl,
    faviconUrl,
    stripeEnabled,
    paypalEnabled,
    stripePublishableKey,
    stripeSecretKey,
    stripeWebhookSecret,
    paypalClientId,
    paypalClientSecret,
    paypalMode,
    invoicePrefix,
    taxRate,
    paymentCurrency,
    seoTitle,
    seoDescription,
    seoKeywords,
    ogImage,
    sitemapEnabled,
    robotsIndex,
    canonicalUrl,
    backupFrequency,
    retentionPeriod,
    backupDestination,
    encryptionEnabled,
    systemPrefs,
    emailMarketing,
    emailEducation,
    quietStart,
    quietEnd,
    days,
    pushEnabled,
    smsEnabled,
    push,
  ]);

  // Handle import settings
  const handleImportSettings = React.useCallback(async () => {
    if (!fileInputRef.current) return;

    fileInputRef.current.click();
  }, []);

  const handleFileChange = React.useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const settings = settingsService.importSettings(text);

        // Apply imported settings
        if (settings.platformName) setPlatformName(settings.platformName);
        if (settings.platformUrl) setPlatformUrl(settings.platformUrl);
        if (settings.contactEmail) setContactEmail(settings.contactEmail);
        if (settings.supportPhone) setSupportPhone(settings.supportPhone);
        if (settings.platformDesc) setPlatformDesc(settings.platformDesc);
        if (settings.timeZone) setTimeZone(settings.timeZone);
        if (settings.dateFormat) setDateFormat(settings.dateFormat);
        if (settings.currency) setCurrency(settings.currency);
        if (settings.units) setUnits(settings.units);
        if (settings.defaultLanguage)
          setDefaultLanguage(settings.defaultLanguage);
        if (settings.autoDetectLang !== undefined)
          setAutoDetectLang(settings.autoDetectLang);
        if (settings.availableLangs) setAvailableLangs(settings.availableLangs);
        if (settings.cachingEnabled !== undefined)
          setCachingEnabled(settings.cachingEnabled);
        if (settings.imageOptimization !== undefined)
          setImageOptimization(settings.imageOptimization);
        if (settings.cdnEnabled !== undefined)
          setCdnEnabled(settings.cdnEnabled);
        if (settings.cacheDuration) setCacheDuration(settings.cacheDuration);
        if (settings.imageQuality) setImageQuality(settings.imageQuality);
        if (settings.twoFactor !== undefined) setTwoFactor(settings.twoFactor);
        if (settings.passwordPolicy) setPasswordPolicy(settings.passwordPolicy);
        if (settings.sslEnforce !== undefined)
          setSslEnforce(settings.sslEnforce);
        if (settings.apiRateLimit !== undefined)
          setApiRateLimit(settings.apiRateLimit);
        if (settings.sessionTimeout) setSessionTimeout(settings.sessionTimeout);
        if (settings.shopifyConnected !== undefined)
          setShopifyConnected(settings.shopifyConnected);
        if (settings.gaConnected !== undefined)
          setGaConnected(settings.gaConnected);
        if (settings.emailServiceEnabled !== undefined)
          setEmailServiceEnabled(settings.emailServiceEnabled);
        if (settings.brandPrimary) setBrandPrimary(settings.brandPrimary);
        if (settings.brandSecondary) setBrandSecondary(settings.brandSecondary);
        if (settings.brandAccent) setBrandAccent(settings.brandAccent);
        if (settings.logoUrl) setLogoUrl(settings.logoUrl);
        if (settings.faviconUrl) setFaviconUrl(settings.faviconUrl);
        if (settings.stripeEnabled !== undefined)
          setStripeEnabled(settings.stripeEnabled);
        if (settings.paypalEnabled !== undefined)
          setPaypalEnabled(settings.paypalEnabled);
        if (settings.stripeConfig) {
          setStripePublishableKey(settings.stripeConfig.publishableKey || "");
          setStripeSecretKey(settings.stripeConfig.secretKey || "");
          setStripeWebhookSecret(settings.stripeConfig.webhookSecret || "");
        }
        if (settings.paypalConfig) {
          setPaypalClientId(settings.paypalConfig.clientId || "");
          setPaypalClientSecret(settings.paypalConfig.clientSecret || "");
          setPaypalMode(settings.paypalConfig.mode || "sandbox");
        }
        if (settings.invoicePrefix) setInvoicePrefix(settings.invoicePrefix);
        if (settings.taxRate) setTaxRate(settings.taxRate);
        if (settings.paymentCurrency)
          setPaymentCurrency(settings.paymentCurrency);
        if (settings.seoTitle) setSeoTitle(settings.seoTitle);
        if (settings.seoDescription) setSeoDescription(settings.seoDescription);
        if (settings.seoKeywords) setSeoKeywords(settings.seoKeywords);
        if (settings.ogImage) setOgImage(settings.ogImage);
        if (settings.sitemapEnabled !== undefined)
          setSitemapEnabled(settings.sitemapEnabled);
        if (settings.robotsIndex) setRobotsIndex(settings.robotsIndex);
        if (settings.canonicalUrl) setCanonicalUrl(settings.canonicalUrl);
        if (settings.backupFrequency)
          setBackupFrequency(settings.backupFrequency);
        if (settings.retentionPeriod)
          setRetentionPeriod(settings.retentionPeriod);
        if (settings.backupDestination)
          setBackupDestination(settings.backupDestination);
        if (settings.encryptionEnabled !== undefined)
          setEncryptionEnabled(settings.encryptionEnabled);
        if (settings.notificationPrefs) {
          const prefs = settings.notificationPrefs;
          if (prefs.system) {
            setSystemPrefs((prev) =>
              prev.map((p) => {
                const found = prefs.system?.find((s) => s.id === p.id);
                return found ? { ...p, enabled: found.enabled } : p;
              })
            );
          }
          if (prefs.emailMarketing) {
            setEmailMarketing((prev) => ({ ...prev, ...prefs.emailMarketing }));
          }
          if (prefs.emailEducation) {
            setEmailEducation((prev) => ({ ...prev, ...prefs.emailEducation }));
          }
          if (prefs.quietStart) setQuietStart(prefs.quietStart);
          if (prefs.quietEnd) setQuietEnd(prefs.quietEnd);
          if (prefs.days) setDays(prefs.days);
          if (prefs.pushEnabled !== undefined)
            setPushEnabled(prefs.pushEnabled);
          if (prefs.smsEnabled !== undefined) setSmsEnabled(prefs.smsEnabled);
        }

        setHasChanges(true);
        push({
          message:
            "Settings imported successfully. Click Save to apply changes.",
          type: "success",
        });
      } catch (error) {
        console.error("Failed to import settings:", error);
        push({
          message:
            error instanceof Error
              ? error.message
              : "Failed to import settings",
          type: "error",
        });
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [push]
  );

  // Save all changes
  const handleSaveAll = React.useCallback(async () => {
    if (!hasChanges && Object.keys(pendingChanges).length === 0) {
      push({
        message: "No changes to save",
        type: "info",
      });
      return;
    }

    // Validate before saving
    const validation = validateSettings();
    if (!validation.isValid) {
      push({
        message: `Validation failed: ${validation.errors.join(", ")}`,
        type: "error",
      });
      return;
    }

    try {
      setIsLoading(true);

      const settings: Partial<SettingsData> = {
        platformName,
        platformUrl,
        contactEmail,
        supportPhone,
        platformDesc,
        timeZone,
        dateFormat,
        currency,
        units,
        defaultLanguage,
        autoDetectLang,
        availableLangs,
        cachingEnabled,
        imageOptimization,
        cdnEnabled,
        cacheDuration,
        imageQuality,
        twoFactor,
        passwordPolicy,
        sslEnforce,
        apiRateLimit,
        sessionTimeout,
        shopifyConnected,
        gaConnected,
        emailServiceEnabled,
        brandPrimary,
        brandSecondary,
        brandAccent,
        logoUrl,
        faviconUrl,
        stripeEnabled,
        paypalEnabled,
        stripeConfig: {
          publishableKey: stripePublishableKey,
          secretKey: stripeSecretKey,
          webhookSecret: stripeWebhookSecret,
        },
        paypalConfig: {
          clientId: paypalClientId,
          clientSecret: paypalClientSecret,
          mode: paypalMode,
        },
        invoicePrefix,
        taxRate,
        paymentCurrency,
        seoTitle,
        seoDescription,
        seoKeywords,
        ogImage,
        sitemapEnabled,
        robotsIndex,
        canonicalUrl,
        backupFrequency,
        retentionPeriod,
        backupDestination,
        encryptionEnabled,
        notificationPrefs: {
          system: systemPrefs.map((p) => ({ id: p.id, enabled: p.enabled })),
          emailMarketing,
          emailEducation,
          quietStart,
          quietEnd,
          days,
          pushEnabled,
          smsEnabled,
        },
      };

      const updates = settingsService.mapSettingsToBulkUpdate(settings);
      await bulkUpdateConfigs(updates);

      setPendingChanges({});
      setHasChanges(false);

      if (onConfigChange) {
        updates.forEach((update) => {
          onConfigChange(update.key, update.value);
        });
      }

      push({
        message: "Settings saved successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
      push({
        message:
          error instanceof Error ? error.message : "Failed to save settings",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    hasChanges,
    pendingChanges,
    platformName,
    platformUrl,
    contactEmail,
    supportPhone,
    platformDesc,
    timeZone,
    dateFormat,
    currency,
    units,
    defaultLanguage,
    autoDetectLang,
    availableLangs,
    cachingEnabled,
    imageOptimization,
    cdnEnabled,
    cacheDuration,
    imageQuality,
    twoFactor,
    passwordPolicy,
    sslEnforce,
    apiRateLimit,
    sessionTimeout,
    shopifyConnected,
    gaConnected,
    emailServiceEnabled,
    brandPrimary,
    brandSecondary,
    brandAccent,
    logoUrl,
    faviconUrl,
    stripeEnabled,
    paypalEnabled,
    stripePublishableKey,
    stripeSecretKey,
    stripeWebhookSecret,
    paypalClientId,
    paypalClientSecret,
    paypalMode,
    invoicePrefix,
    taxRate,
    paymentCurrency,
    seoTitle,
    seoDescription,
    seoKeywords,
    ogImage,
    sitemapEnabled,
    robotsIndex,
    canonicalUrl,
    backupFrequency,
    retentionPeriod,
    backupDestination,
    encryptionEnabled,
    systemPrefs,
    emailMarketing,
    emailEducation,
    quietStart,
    quietEnd,
    days,
    pushEnabled,
    smsEnabled,
    bulkUpdateConfigs,
    onConfigChange,
    push,
  ]);

  // Reset to defaults (reload from backend)
  const [resetConfirmOpen, setResetConfirmOpen] = React.useState(false);

  const handleResetToDefaults = React.useCallback(async () => {
    if (hasChanges) {
      setResetConfirmOpen(true);
      return;
    }

    try {
      setIsLoading(true);
      // This will trigger the useEffect to reload from configs
      if (onConfigChange) {
        onConfigChange("refresh", "");
      }
      setPendingChanges({});
      setHasChanges(false);
      push({
        message: "Settings reset to saved values",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to reset settings:", error);
      push({
        message: "Failed to reset settings",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [hasChanges, onConfigChange, push]);

  const confirmReset = React.useCallback(async () => {
    setResetConfirmOpen(false);
    try {
      setIsLoading(true);
      if (onConfigChange) {
        onConfigChange("refresh", "");
      }
      setPendingChanges({});
      setHasChanges(false);
      push({
        message: "Settings reset to saved values",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to reset settings:", error);
      push({
        message: "Failed to reset settings",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [onConfigChange, push]);

  function resetToDefault() {
    setPlatformName("Personal Wings");
    setPlatformUrl("https://personalwings.com");
    setContactEmail("admin@personalwings.com");
    setSupportPhone("+1 (555) 123-4567");
    setPlatformDesc(
      "Personal Wings - Premier aviation education and aircraft trading platform offering comprehensive flight training programs and premium aircraft sales services."
    );
    setTimeZone("America/New_York (EST)");
    setDateFormat("MM/DD/YYYY (US)");
    setCurrency("USD - US Dollar");
    setUnits("Imperial (Miles, Feet, Pounds)");
    setDefaultLanguage("English (US)");
    setAutoDetectLang(true);
    setAvailableLangs({
      English: true,
      Spanish: true,
      French: false,
      German: false,
      Chinese: false,
      Arabic: false,
      Russian: false,
      Japanese: false,
    });
    setCachingEnabled(true);
    setImageOptimization(true);
    setCdnEnabled(false);
    setCacheDuration("6 hours");
    setImageQuality("Medium (Balanced)");
    setTwoFactor(true);
    setPasswordPolicy("Standard (8+ characters, mixed case)");
    setShopifyConnected(true);
    setGaConnected(true);
    setEmailServiceEnabled(false);
  }

  const handleRunManualBackup = React.useCallback(async () => {
    push({
      message: "Manual backup trigger is not yet connected to the backend",
      type: "info",
    });
  }, [push]);

  return (
    <>
      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Global Action Bar */}
      <div className="mb-6 flex items-center justify-between bg-card rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2">
          {hasChanges && (
            <span className="text-sm text-amber-600 font-medium">
              You have unsaved changes
            </span>
          )}
          {isLoading && (
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleImportSettings}
            disabled={isLoading || isSaving}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Import
          </Button>
          <Button
            variant="outline"
            onClick={handleExportSettings}
            disabled={isLoading || isSaving}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button
            variant="outline"
            onClick={handleResetToDefaults}
            disabled={isLoading || isSaving}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          <Button
            onClick={handleSaveAll}
            disabled={
              (!hasChanges && Object.keys(pendingChanges).length === 0) ||
              isLoading ||
              isSaving
            }
            className="flex items-center gap-2 bg-primary hover:bg-primary/90"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save All Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {activeTab === "General" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 sticky top-6">
              <h4 className="text-lg font-semibold text-secondary mb-4">
                General Settings
              </h4>
              <nav className="space-y-2">
                <button
                  type="button"
                  className="flex items-center space-x-3 px-3 py-2 bg-primary/5 text-primary rounded-lg w-full text-left"
                  onClick={() => scrollToId("platform-settings")}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="text-sm font-medium">Platform Settings</span>
                </button>
                <button
                  type="button"
                  className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors w-full text-left"
                  onClick={() => scrollToId("regional-settings")}
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-sm">Regional Settings</span>
                </button>
                <button
                  type="button"
                  className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors w-full text-left"
                  onClick={() => scrollToId("language-locale")}
                >
                  <Languages className="w-4 h-4" />
                  <span className="text-sm">Language & Locale</span>
                </button>
                <button
                  type="button"
                  className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors w-full text-left"
                  onClick={() => scrollToId("performance-settings")}
                >
                  <Gauge className="w-4 h-4" />
                  <span className="text-sm">Performance</span>
                </button>
                <button
                  type="button"
                  className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors w-full text-left"
                  onClick={() => scrollToId("general-security-settings")}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-sm">Security</span>
                </button>
                <button
                  type="button"
                  className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors w-full text-left"
                  onClick={() => scrollToId("general-integration-settings")}
                >
                  <Plug className="w-4 h-4" />
                  <span className="text-sm">Integrations</span>
                </button>
              </nav>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <h5 className="text-sm font-semibold text-gray-600 mb-3">
                  System Status
                </h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Platform Version</span>
                    <span className="font-medium">v2.4.1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last Updated</span>
                    <span className="font-medium">Oct 15, 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">System Status</span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div
              id="platform-settings"
              className="bg-card rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cache Duration
                  </label>
                  <Select
                    value={cacheDuration}
                    onValueChange={(v) => {
                      setCacheDuration(v);
                      markAsChanged("cacheDuration", v);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1 hour">1 hour</SelectItem>
                      <SelectItem value="6 hours">6 hours</SelectItem>
                      <SelectItem value="12 hours">12 hours</SelectItem>
                      <SelectItem value="24 hours">24 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image Quality
                  </label>
                  <Select
                    value={imageQuality}
                    onValueChange={(v) => {
                      setImageQuality(v);
                      markAsChanged("imageQuality", v);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High (Best)">High (Best)</SelectItem>
                      <SelectItem value="Medium (Balanced)">
                        Medium (Balanced)
                      </SelectItem>
                      <SelectItem value="Low (Fastest)">
                        Low (Fastest)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div
              id="regional-settings"
              className="bg-card rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <h4 className="text-lg font-semibold text-secondary mb-6">
                Platform Settings
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform Name
                  </label>
                  <input
                    value={platformName}
                    onChange={(e) => {
                      setPlatformName(e.target.value);
                      markAsChanged("platformName", e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform URL
                  </label>
                  <input
                    value={platformUrl}
                    onChange={(e) => {
                      setPlatformUrl(e.target.value);
                      markAsChanged("platformUrl", e.target.value);
                    }}
                    type="url"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => {
                      setContactEmail(e.target.value);
                      markAsChanged("contactEmail", e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Support Phone
                  </label>
                  <input
                    value={supportPhone}
                    onChange={(e) => {
                      setSupportPhone(e.target.value);
                      markAsChanged("supportPhone", e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform Description
                </label>
                <textarea
                  rows={3}
                  value={platformDesc}
                  onChange={(e) => {
                    setPlatformDesc(e.target.value);
                    markAsChanged("platformDesc", e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div
              id="language-locale"
              className="bg-card rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <h4 className="text-lg font-semibold text-secondary mb-6">
                Regional Settings
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Zone
                  </label>
                  <Select
                    value={timeZone}
                    onValueChange={(v) => {
                      setTimeZone(v);
                      markAsChanged("timeZone", v);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York (EST)">
                        America/New_York (EST)
                      </SelectItem>
                      <SelectItem value="America/Chicago (CST)">
                        America/Chicago (CST)
                      </SelectItem>
                      <SelectItem value="America/Denver (MST)">
                        America/Denver (MST)
                      </SelectItem>
                      <SelectItem value="America/Los_Angeles (PST)">
                        America/Los_Angeles (PST)
                      </SelectItem>
                      <SelectItem value="Europe/London (GMT)">
                        Europe/London (GMT)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Format
                  </label>
                  <Select
                    value={dateFormat}
                    onValueChange={(v) => {
                      setDateFormat(v);
                      markAsChanged("dateFormat", v);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY (US)">
                        MM/DD/YYYY (US)
                      </SelectItem>
                      <SelectItem value="DD/MM/YYYY (EU)">
                        DD/MM/YYYY (EU)
                      </SelectItem>
                      <SelectItem value="YYYY-MM-DD (ISO)">
                        YYYY-MM-DD (ISO)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <Select
                    value={currency}
                    onValueChange={(v) => {
                      setCurrency(v);
                      markAsChanged("currency", v);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD - US Dollar">
                        USD - US Dollar
                      </SelectItem>
                      <SelectItem value="EUR - Euro">EUR - Euro</SelectItem>
                      <SelectItem value="GBP - British Pound">
                        GBP - British Pound
                      </SelectItem>
                      <SelectItem value="CAD - Canadian Dollar">
                        CAD - Canadian Dollar
                      </SelectItem>
                      <SelectItem value="AUD - Australian Dollar">
                        AUD - Australian Dollar
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Measurement Units
                  </label>
                  <Select
                    value={units}
                    onValueChange={(v) => {
                      setUnits(v);
                      markAsChanged("units", v);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Imperial (Miles, Feet, Pounds)">
                        Imperial (Miles, Feet, Pounds)
                      </SelectItem>
                      <SelectItem value="Metric (Kilometers, Meters, Kilograms)">
                        Metric (Kilometers, Meters, Kilograms)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div
              id="performance-settings"
              className="bg-card rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <h4 className="text-lg font-semibold text-secondary mb-6">
                Language & Locale
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Language
                  </label>
                  <Select
                    value={defaultLanguage}
                    onValueChange={(v) => {
                      setDefaultLanguage(v);
                      markAsChanged("defaultLanguage", v);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English (US)">English (US)</SelectItem>
                      <SelectItem value="English (UK)">English (UK)</SelectItem>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                      <SelectItem value="German">German</SelectItem>
                      <SelectItem value="Chinese">Chinese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Auto-detect Language
                  </label>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-600">
                      Detect user language automatically
                    </span>
                    <Toggle
                      checked={autoDetectLang}
                      onChange={(v) => {
                        setAutoDetectLang(v);
                        markAsChanged("autoDetectLang", v);
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Available Languages
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.keys(availableLangs).map((lang) => (
                    <label key={lang} className="flex items-center space-x-2">
                      <Checkbox
                        checked={availableLangs[lang]}
                        onCheckedChange={(v) => {
                          const newLangs = { ...availableLangs, [lang]: !!v };
                          setAvailableLangs(newLangs);
                          markAsChanged("availableLangs", newLangs);
                        }}
                      />
                      <span className="text-sm">{lang}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div
              id="general-security-settings"
              className="bg-card rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <h4 className="text-lg font-semibold text-secondary mb-6">
                Performance Settings
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-secondary">
                      Caching System
                    </div>
                    <div className="text-sm text-gray-500">
                      Enable page and data caching for better performance
                    </div>
                  </div>
                  <Toggle
                    checked={cachingEnabled}
                    onChange={(v) => {
                      setCachingEnabled(v);
                      markAsChanged("cachingEnabled", v);
                    }}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-secondary">
                      Image Optimization
                    </div>
                    <div className="text-sm text-gray-500">
                      Automatically optimize images for faster loading
                    </div>
                  </div>
                  <Toggle
                    checked={imageOptimization}
                    onChange={(v) => {
                      setImageOptimization(v);
                      markAsChanged("imageOptimization", v);
                    }}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-secondary">
                      CDN Integration
                    </div>
                    <div className="text-sm text-gray-500">
                      Minify CSS and JavaScript files
                    </div>
                  </div>
                  <Toggle
                    checked={cdnEnabled}
                    onChange={(v) => {
                      setCdnEnabled(v);
                      markAsChanged("cdnEnabled", v);
                    }}
                  />
                </div>
              </div>
            </div>

            <div
              id="general-integration-settings"
              className="bg-card rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <h4 className="text-lg font-semibold text-secondary mb-6">
                Security Settings
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-secondary">
                      Two-Factor Authentication
                    </div>
                    <div className="text-sm text-gray-500">
                      Add an extra layer of account protection
                    </div>
                  </div>
                  <Toggle
                    checked={twoFactor}
                    onChange={(v) => {
                      setTwoFactor(v);
                      markAsChanged("twoFactor", v);
                    }}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-secondary">
                      SSL Enforcement
                    </div>
                    <div className="text-sm text-gray-500">
                      Force HTTPS for all endpoints
                    </div>
                  </div>
                  <Toggle
                    checked={sslEnforce}
                    onChange={(v) => {
                      setSslEnforce(v);
                      markAsChanged("sslEnforce", v);
                    }}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-secondary">
                      API Rate Limiting
                    </div>
                    <div className="text-sm text-gray-500">
                      Prevent excessive API requests
                    </div>
                  </div>
                  <Toggle
                    checked={apiRateLimit}
                    onChange={(v) => {
                      setApiRateLimit(v);
                      markAsChanged("apiRateLimit", v);
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Timeout
                  </label>
                  <Select
                    value={sessionTimeout}
                    onValueChange={setSessionTimeout}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15 minutes">15 minutes</SelectItem>
                      <SelectItem value="30 minutes">30 minutes</SelectItem>
                      <SelectItem value="60 minutes">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password Strength Policy
                  </label>
                  <Select
                    value={passwordPolicy}
                    onValueChange={setPasswordPolicy}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Basic (6+ characters)">
                        Basic (6+ characters)
                      </SelectItem>
                      <SelectItem value="Standard (8+ characters, mixed case)">
                        Standard (8+ characters, mixed case)
                      </SelectItem>
                      <SelectItem value="Strong (12+ characters, special chars)">
                        Strong (12+ characters, special chars)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-secondary mb-6">
                Integration Settings
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="text-green-600 w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-medium text-secondary">
                        Shopify Integration
                      </div>
                      <div className="text-sm text-gray-500">
                        Sync products and orders with Shopify
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      {shopifyConnected ? "Connected" : "Disconnected"}
                    </span>
                    <Toggle
                      checked={shopifyConnected}
                      onChange={(v) => {
                        setShopifyConnected(v);
                        markAsChanged("shopifyConnected", v);
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="text-blue-600 w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-medium text-secondary">
                        Google Analytics
                      </div>
                      <div className="text-sm text-gray-500">
                        Track website traffic and user behavior
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      {gaConnected ? "Connected" : "Disconnected"}
                    </span>
                    <Toggle
                      checked={gaConnected}
                      onChange={(v) => {
                        setGaConnected(v);
                        markAsChanged("gaConnected", v);
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Mail className="text-purple-600 w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-medium text-secondary">
                        Email Service
                      </div>
                      <div className="text-sm text-gray-500">
                        Send transactional and marketing emails
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      {emailServiceEnabled ? "Enabled" : "Configure"}
                    </span>
                    <Toggle
                      checked={emailServiceEnabled}
                      onChange={(v) => {
                        setEmailServiceEnabled(v);
                        markAsChanged("emailServiceEnabled", v);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Notifications" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 lg:col-span-1">
            <h4 className="text-lg font-semibold text-secondary mb-4">
              Notification Settings
            </h4>
            <nav className="space-y-1">
              {[
                {
                  label: "General Notifications",
                  icon: SlidersHorizontal,
                  id: "general-notifications",
                },
                {
                  label: "Email Preferences",
                  icon: Mail,
                  id: "email-preferences",
                },
                {
                  label: "Push Notifications",
                  icon: Smartphone,
                  id: "push-notifications",
                },
                { label: "SMS Alerts", icon: MessageSquare, id: "sms-alerts" },
                {
                  label: "Notification Schedule",
                  icon: Clock,
                  id: "notification-schedule",
                },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeNotificationSection === item.id;
                return (
                  <button
                    key={item.label}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-gray-600 hover:text-primary hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h5 className="text-sm font-semibold text-gray-600 mb-3">
                Quick Actions
              </h5>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start border-gray-300"
                  onClick={() => {
                    setEnableAll(false);
                    setSystemPrefs(
                      systemPrefs.map((p) => ({ ...p, enabled: false }))
                    );
                  }}
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Pause All Notifications
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-gray-300"
                  onClick={handleImportSettings}
                  disabled={isLoading || isSaving}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Import Settings
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-gray-300"
                  onClick={handleExportSettings}
                  disabled={isLoading || isSaving}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Settings
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-secondary">
                  General Notification Settings
                </h4>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Enable All</span>
                  <Toggle
                    checked={enableAll}
                    onChange={(v) => {
                      setEnableAll(v);
                      setSystemPrefs((prev) =>
                        prev.map((p) => ({ ...p, enabled: v }))
                      );
                      markAsChanged("enableAll", v);
                    }}
                  />
                </div>
              </div>
              <div className="relative mb-4">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Search notifications"
                />
              </div>
              <div className="space-y-4">
                {filteredSystemPrefs.map((p) => {
                  const Icon = p.icon;
                  const bgColor =
                    p.color === "blue"
                      ? "bg-blue-100"
                      : p.color === "red"
                      ? "bg-red-100"
                      : "bg-purple-100";
                  const textColor =
                    p.color === "blue"
                      ? "text-blue-600"
                      : p.color === "red"
                      ? "text-red-600"
                      : "text-purple-600";
                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center`}
                        >
                          <Icon className={`${textColor} w-5 h-5`} />
                        </div>
                        <div>
                          <div className="font-medium text-secondary">
                            {p.label}
                          </div>
                          <div className="text-sm text-gray-500">
                            {p.description}
                          </div>
                        </div>
                      </div>
                      <Toggle
                        checked={p.enabled}
                        onChange={(v) => {
                          const updated = systemPrefs.map((i) =>
                            i.id === p.id ? { ...i, enabled: v } : i
                          );
                          setSystemPrefs(updated);
                          markAsChanged("systemPrefs", updated);
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div
              id="email-preferences"
              className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 scroll-mt-6"
            >
              <h4 className="text-lg font-semibold text-secondary mb-6">
                Email Notification Preferences
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-secondary mb-4">
                    Marketing & Promotional
                  </h5>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Newsletter</div>
                        <div className="text-xs text-gray-500">
                          Weekly platform updates
                        </div>
                      </div>
                      <Toggle
                        checked={emailMarketing.newsletter}
                        onChange={(v) => {
                          const updated = { ...emailMarketing, newsletter: v };
                          setEmailMarketing(updated);
                          markAsChanged("emailMarketing", updated);
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">
                          Product Updates
                        </div>
                        <div className="text-xs text-gray-500">
                          New features and improvements
                        </div>
                      </div>
                      <Toggle
                        checked={emailMarketing.productUpdates}
                        onChange={(v) => {
                          const updated = {
                            ...emailMarketing,
                            productUpdates: v,
                          };
                          setEmailMarketing(updated);
                          markAsChanged("emailMarketing", updated);
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">
                          Special Offers
                        </div>
                        <div className="text-xs text-gray-500">
                          Discounts and promotions
                        </div>
                      </div>
                      <Toggle
                        checked={emailMarketing.specialOffers}
                        onChange={(v) => {
                          const updated = {
                            ...emailMarketing,
                            specialOffers: v,
                          };
                          setEmailMarketing(updated);
                          markAsChanged("emailMarketing", updated);
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <h5 className="font-medium text-secondary mb-4">
                    Educational Content
                  </h5>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">
                          Course Recommendations
                        </div>
                        <div className="text-xs text-gray-500">
                          Personalized learning suggestions
                        </div>
                      </div>
                      <Toggle
                        checked={emailEducation.courseRecommendations}
                        onChange={(v) => {
                          const updated = {
                            ...emailEducation,
                            courseRecommendations: v,
                          };
                          setEmailEducation(updated);
                          markAsChanged("emailEducation", updated);
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Learning Tips</div>
                        <div className="text-xs text-gray-500">
                          Educational resources and tips
                        </div>
                      </div>
                      <Toggle
                        checked={emailEducation.learningTips}
                        onChange={(v) => {
                          const updated = {
                            ...emailEducation,
                            learningTips: v,
                          };
                          setEmailEducation(updated);
                          markAsChanged("emailEducation", updated);
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Industry News</div>
                        <div className="text-xs text-gray-500">
                          Education technology updates
                        </div>
                      </div>
                      <Toggle
                        checked={emailEducation.industryNews}
                        onChange={(v) => {
                          const updated = {
                            ...emailEducation,
                            industryNews: v,
                          };
                          setEmailEducation(updated);
                          markAsChanged("emailEducation", updated);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              id="notification-schedule"
              className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 scroll-mt-6"
            >
              <h4 className="text-lg font-semibold text-secondary mb-6">
                Notification Schedule
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quiet Hours
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1">
                        Start Time
                      </label>
                      <Select
                        value={quietStart}
                        onValueChange={(v) => {
                          setQuietStart(v);
                          markAsChanged("quietStart", v);
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10:00 PM">10:00 PM</SelectItem>
                          <SelectItem value="11:00 PM">11:00 PM</SelectItem>
                          <SelectItem value="12:00 AM">12:00 AM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1">
                        End Time
                      </label>
                      <Select
                        value={quietEnd}
                        onValueChange={(v) => {
                          setQuietEnd(v);
                          markAsChanged("quietEnd", v);
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6:00 AM">6:00 AM</SelectItem>
                          <SelectItem value="7:00 AM">7:00 AM</SelectItem>
                          <SelectItem value="8:00 AM">8:00 AM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notification Days
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {Object.keys(days).map((d) => (
                      <label key={d} className="inline-flex items-center">
                        <Checkbox
                          checked={days[d]}
                          onCheckedChange={(v) => {
                            const updated = { ...days, [d]: !!v };
                            setDays(updated);
                            markAsChanged("days", updated);
                          }}
                        />
                        <span className="ml-2 text-sm">{d}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div
                  id="push-notifications"
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg scroll-mt-6"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Smartphone className="text-green-600 w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-medium text-secondary">
                        Push Notifications
                      </div>
                      <div className="text-sm text-gray-500">
                        Receive alerts on your devices
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      Enabled for all devices
                    </span>
                    <Toggle
                      checked={pushEnabled}
                      onChange={(v) => {
                        setPushEnabled(v);
                        markAsChanged("pushEnabled", v);
                      }}
                    />
                  </div>
                </div>
                <div
                  id="sms-alerts"
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg scroll-mt-6"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="text-purple-600 w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-medium text-secondary">
                        SMS Alerts
                      </div>
                      <div className="text-sm text-gray-500">
                        Get important updates via text message
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      Standard rates may apply
                    </span>
                    <Toggle
                      checked={smsEnabled}
                      onChange={(v) => {
                        setSmsEnabled(v);
                        markAsChanged("smsEnabled", v);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Branding" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-secondary mb-6">
                Brand Assets
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo URL
                  </label>
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => {
                      setLogoUrl(e.target.value);
                      markAsChanged("logoUrl", e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Favicon URL
                  </label>
                  <input
                    type="text"
                    value={faviconUrl}
                    onChange={(e) => {
                      setFaviconUrl(e.target.value);
                      markAsChanged("faviconUrl", e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-secondary mb-6">
                Brand Colors
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={brandPrimary}
                      onChange={(e) => {
                        setBrandPrimary(e.target.value);
                        markAsChanged("brandPrimary", e.target.value);
                      }}
                      className="w-12 h-10 rounded-lg"
                    />
                    <input
                      type="text"
                      value={brandPrimary}
                      onChange={(e) => {
                        setBrandPrimary(e.target.value);
                        markAsChanged("brandPrimary", e.target.value);
                      }}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secondary Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={brandSecondary}
                      onChange={(e) => setBrandSecondary(e.target.value)}
                      className="w-12 h-10 rounded-lg"
                    />
                    <input
                      type="text"
                      value={brandSecondary}
                      onChange={(e) => setBrandSecondary(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Accent Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={brandAccent}
                      onChange={(e) => {
                        setBrandAccent(e.target.value);
                        markAsChanged("brandAccent", e.target.value);
                      }}
                      className="w-12 h-10 rounded-lg"
                    />
                    <input
                      type="text"
                      value={brandAccent}
                      onChange={(e) => {
                        setBrandAccent(e.target.value);
                        markAsChanged("brandAccent", e.target.value);
                      }}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-secondary mb-6">
                Typography
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heading Font
                  </label>
                  <Select value={"Inter"} onValueChange={() => {}}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select font" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                      <SelectItem value="Nunito">Nunito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Body Font
                  </label>
                  <Select value={"Inter"} onValueChange={() => {}}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select font" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                      <SelectItem value="Nunito">Nunito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-secondary mb-6">
                Preview
              </h4>
              <div
                className="p-6 rounded-lg border border-gray-200"
                style={{
                  background: `linear-gradient(135deg, ${brandPrimary}22, ${brandAccent}22)`,
                }}
              >
                <div className="flex items-center space-x-4 mb-6">
                  <div
                    className="w-12 h-12 rounded-lg"
                    style={{ background: brandPrimary }}
                  />
                  <div>
                    <div className="font-bold text-secondary">
                      Personal Wings
                    </div>
                    <div className="text-sm text-gray-500">
                      Branding Preview
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div
                    className="h-3 rounded w-3/4"
                    style={{ background: brandSecondary }}
                  />
                  <div
                    className="h-3 rounded w-1/2"
                    style={{ background: brandAccent }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Payments" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-secondary mb-6">
                Payment Gateways
              </h4>
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg hover:border-primary/50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="text-primary w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-medium text-secondary flex items-center gap-2">
                          Stripe
                          {connectionStatus.stripe === "success" && (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          )}
                          {connectionStatus.stripe === "error" && (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          Accept credit card payments
                        </div>
                      </div>
                    </div>
                    <Toggle
                      checked={stripeEnabled}
                      onChange={(v) => {
                        setStripeEnabled(v);
                        markAsChanged("stripeEnabled", v);
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setStripeDialogOpen(true)}
                      className="flex items-center gap-2"
                    >
                      <Settings2 className="w-4 h-4" />
                      Configure
                    </Button>
                    {stripePublishableKey && stripeSecretKey && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleTestStripeConnection}
                        disabled={isTestingConnection}
                        className="flex items-center gap-2"
                      >
                        {isTestingConnection ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Key className="w-4 h-4" />
                        )}
                        Test Connection
                      </Button>
                    )}
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg hover:border-primary/50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-blue-600"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-1.21 7.686-.951 6.04h4.605c.523 0 .967-.382 1.05-.9l.048-.248.915-5.803.059-.32c.082-.518.526-.9 1.05-.9h.661c4.298 0 7.663-1.747 8.647-6.797.415-2.126.2-3.896-.96-5.178a4.316 4.316 0 0 0-1.289-.97z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-secondary flex items-center gap-2">
                          PayPal
                          {connectionStatus.paypal === "success" && (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          )}
                          {connectionStatus.paypal === "error" && (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          Process payments via PayPal
                        </div>
                      </div>
                    </div>
                    <Toggle
                      checked={paypalEnabled}
                      onChange={(v) => {
                        setPaypalEnabled(v);
                        markAsChanged("paypalEnabled", v);
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPaypalDialogOpen(true)}
                      className="flex items-center gap-2"
                    >
                      <Settings2 className="w-4 h-4" />
                      Configure
                    </Button>
                    {paypalClientId && paypalClientSecret && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleTestPaypalConnection}
                        disabled={isTestingConnection}
                        className="flex items-center gap-2"
                      >
                        {isTestingConnection ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Key className="w-4 h-4" />
                        )}
                        Test Connection
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-secondary mb-6">
                Billing Settings
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invoice Prefix
                  </label>
                  <input
                    type="text"
                    value={invoicePrefix}
                    onChange={(e) => {
                      setInvoicePrefix(e.target.value);
                      markAsChanged("invoicePrefix", e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax Rate
                  </label>
                  <Select
                    value={taxRate}
                    onValueChange={(v) => {
                      setTaxRate(v);
                      markAsChanged("taxRate", v);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select tax" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0%">0%</SelectItem>
                      <SelectItem value="5%">5%</SelectItem>
                      <SelectItem value="8%">8%</SelectItem>
                      <SelectItem value="12%">12%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <Select
                    value={paymentCurrency}
                    onValueChange={(v) => {
                      setPaymentCurrency(v);
                      markAsChanged("paymentCurrency", v);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD - US Dollar">
                        USD - US Dollar
                      </SelectItem>
                      <SelectItem value="EUR - Euro">EUR - Euro</SelectItem>
                      <SelectItem value="GBP - British Pound">
                        GBP - British Pound
                      </SelectItem>
                      <SelectItem value="CAD - Canadian Dollar">
                        CAD - Canadian Dollar
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-secondary mb-6">
                Payment Status
              </h4>
              <div className="space-y-4 text-sm">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-700">Stripe</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        stripeEnabled
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {stripeEnabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                  {stripePublishableKey && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Key className="w-3 h-3" />
                      <span>Configured</span>
                      {connectionStatus.stripe === "success" && (
                        <CheckCircle2 className="w-3 h-3 text-green-600 ml-1" />
                      )}
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-700">PayPal</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        paypalEnabled
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {paypalEnabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                  {paypalClientId && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Key className="w-3 h-3" />
                      <span>Configured ({paypalMode})</span>
                      {connectionStatus.paypal === "success" && (
                        <CheckCircle2 className="w-3 h-3 text-green-600 ml-1" />
                      )}
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Currency</span>
                    <span className="font-medium text-gray-700">
                      {paymentCurrency}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-linear-to-br from-primary/10 to-accent/10 rounded-xl p-6 border border-primary/20">
              <h5 className="text-sm font-semibold text-secondary mb-2">
                💡 Quick Tip
              </h5>
              <p className="text-xs text-gray-600">
                Always test your payment gateway credentials before going live.
                Use the "Test Connection" button to verify your API keys are
                working correctly.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "SEO" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-secondary mb-6">
                Meta Information
              </h4>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => {
                      setSeoTitle(e.target.value);
                      markAsChanged("seoTitle", e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    rows={3}
                    value={seoDescription}
                    onChange={(e) => {
                      setSeoDescription(e.target.value);
                      markAsChanged("seoDescription", e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Keywords
                  </label>
                  <input
                    type="text"
                    value={seoKeywords}
                    onChange={(e) => {
                      setSeoKeywords(e.target.value);
                      markAsChanged("seoKeywords", e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-secondary mb-6">
                Indexing & Sitemap
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Robots
                  </label>
                  <Select
                    value={robotsIndex}
                    onValueChange={(v) => {
                      setRobotsIndex(v);
                      markAsChanged("robotsIndex", v);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="robots" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Index">Index</SelectItem>
                      <SelectItem value="NoIndex">NoIndex</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sitemap
                  </label>
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <div className="text-sm font-medium">Enable Sitemap</div>
                      <div className="text-xs text-gray-500">
                        Auto-generate sitemap.xml
                      </div>
                    </div>
                    <Toggle
                      checked={sitemapEnabled}
                      onChange={(v) => {
                        setSitemapEnabled(v);
                        markAsChanged("sitemapEnabled", v);
                      }}
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Canonical URL
                  </label>
                  <input
                    type="text"
                    value={canonicalUrl}
                    onChange={(e) => {
                      setCanonicalUrl(e.target.value);
                      markAsChanged("canonicalUrl", e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-secondary mb-6">
                Social Sharing
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Open Graph Image URL
                  </label>
                  <input
                    type="text"
                    value={ogImage}
                    onChange={(e) => setOgImage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="text-sm text-gray-600">Preview</div>
                  <div className="mt-3 h-24 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                    {ogImage ? "Image loaded" : "No image"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Backups" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-secondary mb-6">
                Backup Controls
              </h4>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <div className="font-medium text-secondary">Encryption</div>
                  <div className="text-sm text-gray-500">
                    Encrypt backup archives
                  </div>
                </div>
                <Toggle
                  checked={encryptionEnabled}
                  onChange={(v) => {
                    setEncryptionEnabled(v);
                    markAsChanged("encryptionEnabled", v);
                  }}
                />
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Backup Frequency
                  </label>
                  <Select
                    value={backupFrequency}
                    onValueChange={(v) => {
                      setBackupFrequency(v);
                      markAsChanged("backupFrequency", v);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hourly">Hourly</SelectItem>
                      <SelectItem value="Daily">Daily</SelectItem>
                      <SelectItem value="Weekly">Weekly</SelectItem>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Retention Period
                  </label>
                  <Select
                    value={retentionPeriod}
                    onValueChange={(v) => {
                      setRetentionPeriod(v);
                      markAsChanged("retentionPeriod", v);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select retention" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7 days">7 days</SelectItem>
                      <SelectItem value="30 days">30 days</SelectItem>
                      <SelectItem value="90 days">90 days</SelectItem>
                      <SelectItem value="180 days">180 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destination
                  </label>
                  <Select
                    value={backupDestination}
                    onValueChange={setBackupDestination}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select destination" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Local Storage">
                        Local Storage
                      </SelectItem>
                      <SelectItem value="Amazon S3">Amazon S3</SelectItem>
                      <SelectItem value="Google Cloud Storage">
                        Google Cloud Storage
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <Button
                  className="bg-primary hover:bg-primary/90 text-white"
                  onClick={handleRunManualBackup}
                >
                  Run Manual Backup
                </Button>
                <div className="text-sm text-gray-600">
                  Last Backup: {lastBackup}
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-secondary mb-6">
                Backup Status
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Frequency</span>
                  <span>{backupFrequency}</span>
                </div>
                <div className="flex justify-between">
                  <span>Retention</span>
                  <span>{retentionPeriod}</span>
                </div>
                <div className="flex justify-between">
                  <span>Destination</span>
                  <span>{backupDestination}</span>
                </div>
                <div className="flex justify-between">
                  <span>Encryption</span>
                  <span>{encryptionEnabled ? "Enabled" : "Disabled"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Security" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-secondary mb-6">
                Security Settings
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-secondary">
                      Two-Factor Authentication
                    </div>
                    <div className="text-sm text-gray-500">
                      Require 2FA for all admin accounts
                    </div>
                  </div>
                  <Toggle
                    checked={twoFactor}
                    onChange={(v) => {
                      setTwoFactor(v);
                      markAsChanged("twoFactor", v);
                    }}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-secondary">
                      SSL Enforcement
                    </div>
                    <div className="text-sm text-gray-500">
                      Redirect all traffic to HTTPS
                    </div>
                  </div>
                  <Toggle
                    checked={sslEnforce}
                    onChange={(v) => {
                      setSslEnforce(v);
                      markAsChanged("sslEnforce", v);
                    }}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-secondary">
                      API Rate Limiting
                    </div>
                    <div className="text-sm text-gray-500">
                      Limit API requests to prevent abuse
                    </div>
                  </div>
                  <Toggle
                    checked={apiRateLimit}
                    onChange={(v) => {
                      setApiRateLimit(v);
                      markAsChanged("apiRateLimit", v);
                    }}
                  />
                </div>
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Timeout
                  </label>
                  <Select
                    value={sessionTimeout}
                    onValueChange={(v) => {
                      setSessionTimeout(v);
                      markAsChanged("sessionTimeout", v);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15 minutes">15 minutes</SelectItem>
                      <SelectItem value="30 minutes">30 minutes</SelectItem>
                      <SelectItem value="1 hour">1 hour</SelectItem>
                      <SelectItem value="2 hours">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password Policy
                  </label>
                  <Select
                    value={passwordPolicy}
                    onValueChange={(v) => {
                      setPasswordPolicy(v);
                      markAsChanged("passwordPolicy", v);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Basic (6+ characters)">
                        Basic (6+ characters)
                      </SelectItem>
                      <SelectItem value="Standard (8+ characters, mixed case)">
                        Standard (8+ characters, mixed case)
                      </SelectItem>
                      <SelectItem value="Strong (12+ characters, special chars)">
                        Strong (12+ characters, special chars)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Integrations" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-secondary mb-6">
                Integration Settings
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Plug className="text-green-600 w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-medium text-secondary">
                        Shopify Integration
                      </div>
                      <div className="text-sm text-gray-500">
                        Sync products and orders with Shopify
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      {shopifyConnected ? "Connected" : "Disconnected"}
                    </span>
                    <Toggle
                      checked={shopifyConnected}
                      onChange={setShopifyConnected}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="text-blue-600 w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-medium text-secondary">
                        Google Analytics
                      </div>
                      <div className="text-sm text-gray-500">
                        Track website traffic and user behavior
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      {gaConnected ? "Connected" : "Disconnected"}
                    </span>
                    <Toggle checked={gaConnected} onChange={setGaConnected} />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Mail className="text-purple-600 w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-medium text-secondary">
                        Email Service
                      </div>
                      <div className="text-sm text-gray-500">
                        Send transactional and marketing emails
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      {emailServiceEnabled ? "Enabled" : "Configure"}
                    </span>
                    <Toggle
                      checked={emailServiceEnabled}
                      onChange={setEmailServiceEnabled}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Advanced" && (
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <h4 className="text-lg font-semibold text-secondary mb-2">
            Advanced Settings
          </h4>
          <p className="text-sm text-gray-600">
            Configure experimental and low-level options.
          </p>
        </div>
      )}

      {/* Stripe Configuration Dialog */}
      <Dialog open={stripeDialogOpen} onOpenChange={setStripeDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <CreditCard className="text-primary w-5 h-5" />
              </div>
              Stripe Configuration
            </DialogTitle>
            <DialogDescription>
              Configure your Stripe payment gateway credentials. Get your API
              keys from the{" "}
              <a
                href="https://dashboard.stripe.com/apikeys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Stripe Dashboard
              </a>
              .
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Publishable Key
              </label>
              <input
                type="text"
                placeholder="pk_test_..."
                value={stripePublishableKey}
                onChange={(e) => {
                  setStripePublishableKey(e.target.value);
                  markAsChanged("stripePublishableKey", e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-xs text-gray-500">
                Your Stripe publishable key (starts with pk_)
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Secret Key
              </label>
              <div className="relative">
                <input
                  type={showStripeSecret ? "text" : "password"}
                  placeholder="sk_test_..."
                  value={stripeSecretKey}
                  onChange={(e) => {
                    setStripeSecretKey(e.target.value);
                    markAsChanged("stripeSecretKey", e.target.value);
                  }}
                  className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowStripeSecret(!showStripeSecret)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showStripeSecret ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Your Stripe secret key (starts with sk_) - kept secure
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Webhook Secret (Optional)
              </label>
              <div className="relative">
                <input
                  type={showStripeSecret ? "text" : "password"}
                  placeholder="whsec_..."
                  value={stripeWebhookSecret}
                  onChange={(e) => {
                    setStripeWebhookSecret(e.target.value);
                    markAsChanged("stripeWebhookSecret", e.target.value);
                  }}
                  className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowStripeSecret(!showStripeSecret)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showStripeSecret ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Your webhook signing secret for event verification
              </p>
            </div>

            {connectionStatus.stripe === "success" && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-700">
                  Connection successful! Your Stripe credentials are valid.
                </span>
              </div>
            )}

            {connectionStatus.stripe === "error" && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm text-red-700">
                  Connection failed. Please check your credentials.
                </span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStripeDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveStripeConfig}
              className="bg-primary hover:bg-primary/90"
              disabled={!stripePublishableKey || !stripeSecretKey}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PayPal Configuration Dialog */}
      <Dialog open={paypalDialogOpen} onOpenChange={setPaypalDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-blue-600"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-1.21 7.686-.951 6.04h4.605c.523 0 .967-.382 1.05-.9l.048-.248.915-5.803.059-.32c.082-.518.526-.9 1.05-.9h.661c4.298 0 7.663-1.747 8.647-6.797.415-2.126.2-3.896-.96-5.178a4.316 4.316 0 0 0-1.289-.97z" />
                </svg>
              </div>
              PayPal Configuration
            </DialogTitle>
            <DialogDescription>
              Configure your PayPal payment gateway credentials. Get your
              credentials from the{" "}
              <a
                href="https://developer.paypal.com/dashboard/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                PayPal Developer Dashboard
              </a>
              .
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Environment Mode
              </label>
              <Select
                value={paypalMode}
                onValueChange={(value: "sandbox" | "live") => {
                  setPaypalMode(value);
                  markAsChanged("paypalMode", value);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                  <SelectItem value="live">Live (Production)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Use sandbox mode for testing, live mode for production
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Client ID
              </label>
              <input
                type="text"
                placeholder="AYSq3RDGsmBLJE-otTkBtM-jBc..."
                value={paypalClientId}
                onChange={(e) => {
                  setPaypalClientId(e.target.value);
                  markAsChanged("paypalClientId", e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-xs text-gray-500">
                Your PayPal REST API Client ID
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Client Secret
              </label>
              <div className="relative">
                <input
                  type={showPaypalSecret ? "text" : "password"}
                  placeholder="EGnHDxD_qRPdaLdZz8iCr8N7..."
                  value={paypalClientSecret}
                  onChange={(e) => {
                    setPaypalClientSecret(e.target.value);
                    markAsChanged("paypalClientSecret", e.target.value);
                  }}
                  className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPaypalSecret(!showPaypalSecret)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPaypalSecret ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Your PayPal REST API Client Secret - kept secure
              </p>
            </div>

            {connectionStatus.paypal === "success" && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-700">
                  Connection successful! Your PayPal credentials are valid.
                </span>
              </div>
            )}

            {connectionStatus.paypal === "error" && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm text-red-700">
                  Connection failed. Please check your credentials.
                </span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPaypalDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavePaypalConfig}
              className="bg-primary hover:bg-primary/90"
              disabled={!paypalClientId || !paypalClientSecret}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      <Dialog open={resetConfirmOpen} onOpenChange={setResetConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reset Settings?</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Resetting will discard all your changes
              and reload settings from the server. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setResetConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmReset}
              variant="destructive"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset Settings"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
