"use client";

import Image from "next/image";
import * as React from "react";
import {
  Bell,
  Bot,
  ChevronDown,
  GraduationCap,
  Search,
  Menu,
  User,
  Settings,
  LogOut,
  Clock,
  Book,
  Users as UsersIcon,
  Video,
  Calendar,
  Heart,
  MessageSquare,
  Newspaper,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarMobile } from "./Sidebar";
import { motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api-client";
import type { NotificationItem } from "@/services/profile.service";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const MotionButton = motion(Button);

export default function Header() {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);
  const router = useRouter();
  const { user, logout } = useAuth();
  const [logoutOpen, setLogoutOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<NotificationItem[]>(
    []
  );
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [suggestOpen, setSuggestOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [anchorWidth, setAnchorWidth] = React.useState<number>(0);

  React.useEffect(() => {
    const updateWidth = () => {
      if (anchorRef.current) setAnchorWidth(anchorRef.current.offsetWidth);
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const suggestions = React.useMemo(
    () => [
      {
        label: "AI Assistant",
        href: "/ai-assitant",
        icon: Bot,
        keywords: ["ai", "assistant", "chat"],
      },
      {
        label: "Courses",
        href: "/courses",
        icon: Book,
        keywords: ["course", "courses", "lms"],
      },
      {
        label: "Users",
        href: "/users",
        icon: UsersIcon,
        keywords: ["user", "users"],
      },
      {
        label: "Home Banner",
        href: "/cms/home/banner",
        icon: Video,
        keywords: ["banner", "home banner", "video"],
      },
      {
        label: "Home SEO",
        href: "/cms/home",
        icon: Search,
        keywords: ["seo", "score", "optimize"],
      },
      {
        label: "About Section",
        href: "/cms/home/about-section",
        icon: Heart,
        keywords: ["about"],
      },
      {
        label: "Events",
        href: "/cms/home/events",
        icon: Calendar,
        keywords: ["event", "events"],
      },
      {
        label: "Testimonials",
        href: "/cms/home/testimonials",
        icon: MessageSquare,
        keywords: ["testimonial", "testimonials"],
      },
      {
        label: "Blog",
        href: "/cms/home/blog",
        icon: Newspaper,
        keywords: ["blog", "blogs"],
      },
      {
        label: "Header",
        href: "/cms/header",
        icon: ImageIcon,
        keywords: ["header", "navbar"],
      },
      {
        label: "Footer",
        href: "/cms/footer",
        icon: ImageIcon,
        keywords: ["footer"],
      },
    ],
    []
  );

  const filteredSuggestions = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return suggestions.slice(0, 6);
    return suggestions.filter(
      (s) =>
        s.label.toLowerCase().includes(q) ||
        s.keywords.some((k) => k.includes(q))
    );
  }, [searchQuery, suggestions]);

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      const res = await apiFetch<{
        notifications: NotificationItem[];
        total?: number;
      }>("/notifications");
      const list = (res.data?.notifications ??
        res.data ??
        []) as NotificationItem[];
      if (mounted) setNotifications(Array.isArray(list) ? list : []);
      const uc = await apiFetch<{ count: number }>(
        "/notifications/unread-count"
      );
      if (mounted) setUnreadCount(Number(uc.data?.count ?? 0));
    };
    load();
    const id = setInterval(load, 30000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "User";
  const avatarUrl =
    user?.avatar ||
    "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg";
  const email = user?.email || "";

  const formatTime = (iso?: string) => {
    try {
      const d = iso ? new Date(iso) : new Date();
      return d.toLocaleString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };
  // Prevent hydration mismatch by only rendering Radix UI components after mount
  if (!isMounted) {
    return (
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-b border-gray-200 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-primary">
                Personal Wings
              </span>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-b border-gray-200 z-50"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <MotionButton
                  variant="ghost"
                  size="icon"
                  aria-label="Open menu"
                  className="text-secondary hover:bg-primary hover:text-white transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Menu className="w-5 h-5" />
                </MotionButton>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-80">
                <SidebarMobile />
              </SheetContent>
            </Sheet>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
              <GraduationCap className="text-primary-foreground w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-secondary">Personal Wings</h1>
          </div>
          <div className="md:hidden">
            <Sheet open={searchOpen} onOpenChange={setSearchOpen}>
              <SheetTrigger asChild>
                <MotionButton
                  variant="ghost"
                  size="icon"
                  aria-label="Open search"
                  className="text-muted-foreground hover:text-white hover:bg-primary transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Search className="w-5 h-5" />
                </MotionButton>
              </SheetTrigger>
              <SheetContent side="top" className="p-6 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const q = searchQuery.trim().toLowerCase();
                        if (q) {
                          const match = suggestions.find(
                            (s) =>
                              s.label.toLowerCase().includes(q) ||
                              s.keywords.some((k) => k.includes(q))
                          );
                          router.push(match?.href || "/cms");
                          setSearchOpen(false);
                        }
                      }
                    }}
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground"
                  />
                </div>
                <Command>
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Quick Links">
                      {filteredSuggestions.map((s) => (
                        <CommandItem
                          key={s.href}
                          onSelect={() => {
                            router.push(s.href);
                            setSearchOpen(false);
                          }}
                        >
                          <s.icon className="w-4 h-4" />
                          <span>{s.label}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex-1 max-w-md mx-8 hidden md:block">
          <Popover open={suggestOpen} onOpenChange={setSuggestOpen}>
            <PopoverTrigger asChild>
              <div ref={anchorRef} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSuggestOpen(true);
                  }}
                  onFocus={() => setSuggestOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const q = searchQuery.trim().toLowerCase();
                      if (q) {
                        const match = suggestions.find(
                          (s) =>
                            s.label.toLowerCase().includes(q) ||
                            s.keywords.some((k) => k.includes(q))
                        );
                        router.push(match?.href || "/cms");
                        setSuggestOpen(false);
                      }
                    }
                  }}
                  placeholder="Search... (Cmd+K)"
                  className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground"
                />
              </div>
            </PopoverTrigger>
            <PopoverContent
              style={{ width: anchorWidth || undefined }}
              className="p-0"
              align="start"
              onOpenAutoFocus={(e) => {
                e.preventDefault();
              }}
            >
              <Command>
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup heading="Quick Links">
                    {filteredSuggestions.map((s) => (
                      <CommandItem
                        key={s.href}
                        onMouseDown={() => {
                          router.push(s.href);
                          setSuggestOpen(false);
                        }}
                      >
                        <s.icon className="w-4 h-4" />
                        <span>{s.label}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <MotionButton
                variant="ghost"
                size="icon"
                className="relative text-muted-foreground hover:text-white hover:bg-primary transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -mt-1 -mr-1 w-2 h-2 bg-destructive rounded-full right-1 top-1 animate-pulse" />
                )}
              </MotionButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold text-foreground">
                  Notifications
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {unreadCount > 0
                    ? `You have ${unreadCount} unread`
                    : "All caught up"}
                </p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-muted-foreground">
                    No notifications
                  </div>
                ) : (
                  notifications.map((n, i) => (
                    <DropdownMenuItem
                      key={i}
                      className="cursor-pointer hover:bg-primary/5 focus:bg-primary/10 px-4 py-3"
                      onSelect={() => router.push("/activity-logs")}
                    >
                      <div className="flex gap-3 w-full">
                        <div className="shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Bell className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium text-foreground">
                            {n.title || "Notification"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {n.message}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(n.createdAt)}
                          </p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
              <div className="px-4 py-2 border-t border-border">
                <Button
                  variant="ghost"
                  className="w-full text-xs font-medium text-primary hover:text-white hover:bg-primary transition-all duration-200"
                  onClick={() => router.push("/activity-logs")}
                >
                  View all notifications
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <MotionButton
            variant="ghost"
            size="icon"
            aria-label="AI Assistant"
            className="text-muted-foreground hover:text-white hover:bg-primary transition-all duration-200"
            onClick={() => router.push("/ai-assitant")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bot className="w-5 h-5" />
          </MotionButton>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <MotionButton variant="link" size="sm" className="gap-2">
                <Image
                  src={avatarUrl}
                  alt="User"
                  width={28}
                  height={28}
                  className="rounded-full ring-2 ring-primary/20"
                  unoptimized
                />
                <span className="hidden sm:inline text-sm font-medium text-secondary">
                  {displayName}
                </span>
                <ChevronDown className="text-muted-foreground w-4 h-4" />
              </MotionButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <div className="px-3 py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <Image
                    src={avatarUrl}
                    alt="User"
                    width={40}
                    height={40}
                    className="rounded-full ring-2 ring-primary/20"
                    unoptimized
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      {displayName}
                    </p>
                    <p className="text-xs text-muted-foreground">{email}</p>
                  </div>
                </div>
              </div>
              <div className="py-1">
                <DropdownMenuItem
                  className="cursor-pointer px-3 py-2"
                  onSelect={() => router.push("/profile")}
                >
                  <User className="w-4 h-4 mr-3" />
                  <span className="text-sm">My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer px-3 py-2"
                  onSelect={() => router.push("/my-settings")}
                >
                  <Settings className="w-4 h-4 mr-3" />
                  <span className="text-sm">Settings</span>
                </DropdownMenuItem>
              </div>
              <div className="border-t border-border py-1">
                <DropdownMenuItem
                  className="cursor-pointer px-3 py-2"
                  onSelect={() => setLogoutOpen(true)}
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  <span className="text-sm font-medium">Log out</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {/* AI Assistant button now navigates to /ai-agents */}
      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out? You will be signed out from your
              dashboard and redirected to the login page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:bg-secondary hover:text-white transition-all duration-200">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await logout();
                router.replace("/login");
              }}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.header>
  );
}
