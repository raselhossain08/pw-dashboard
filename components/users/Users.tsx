"use client";

import * as React from "react";
import {
  Search as SearchIcon,
  Eye,
  Edit,
  Trash,
  Users as UsersIcon,
  CheckCircle,
  Clock,
  Download,
  Plus,
  ShieldCheck,
  Check,
  X,
  Loader2,
  MoreHorizontal,
  UserCheck,
  UserX,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUsers } from "@/hooks/useUsers";
import { useUsersStore } from "@/store/usersStore";
import { UserFormDialog } from "./UserFormDialog";
import { UserViewDialog } from "./UserViewDialog";
import { User, CreateUserDto, UpdateUserDto } from "@/services/users.service";
import { Badge } from "@/components/ui/badge";

// User Analytics Component
function UserAnalytics() {
  const [analytics, setAnalytics] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { apiClient } = await import("@/lib/api-client");
        const [analyticsRes, roleDistRes, activityRes] = await Promise.all([
          apiClient.get("/admin/users/analytics"),
          apiClient.get("/admin/users/role-distribution"),
          apiClient.get("/admin/users/activity-summary?days=30"),
        ]);

        setAnalytics({
          ...(analyticsRes.data || {}),
          roleDistribution: roleDistRes.data,
          activitySummary: activityRes.data,
        });
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <h3 className="text-lg font-semibold text-secondary mb-4">
          User Analytics
        </h3>
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const { roleDistribution, activitySummary } = analytics;

  return (
    <div className="space-y-6 mb-6">
      {/* Role Distribution */}
      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-secondary mb-4">
          Role Distribution
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {roleDistribution?.distribution?.map((role: any) => (
            <div
              key={role._id}
              className="text-center p-4 bg-gray-50 rounded-lg"
            >
              <div className="text-2xl font-bold text-primary mb-1">
                {role.count}
              </div>
              <div className="text-sm text-gray-600 capitalize mb-1">
                {role._id?.replace("_", " ") || "Unknown"}
              </div>
              <div className="text-xs text-gray-500">{role.active} active</div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Summary */}
      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-secondary mb-4">
          Activity Summary ({activitySummary?.period})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {activitySummary?.newUsers || 0}
            </div>
            <div className="text-sm text-gray-600">New Users</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {activitySummary?.activeUsers || 0}
            </div>
            <div className="text-sm text-gray-600">Active Users</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {activitySummary?.totalLogins || 0}
            </div>
            <div className="text-sm text-gray-600">Total Logins</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {activitySummary?.avgActivePerDay || 0}
            </div>
            <div className="text-sm text-gray-600">Avg Active/Day</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Users() {
  const {
    users,
    stats,
    loading,
    statsLoading,
    actionLoading,
    total,
    selectedUsers,
    fetchUsers,
    refresh,
    createUser,
    updateUser,
    deleteUser,
    activateUser,
    deactivateUser,
    bulkDeleteUsers,
    bulkActivateUsers,
    bulkDeactivateUsers,
    exportUsers,
    sendVerificationEmail,
    resetPassword,
  } = useUsers();

  const { toggleUserSelection, selectAllUsers, clearSelection } =
    useUsersStore();

  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(10);
  const [activeTab, setActiveTab] = React.useState("all");

  const [formDialogOpen, setFormDialogOpen] = React.useState(false);
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(
    null
  );
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = React.useState(false);
  const [bulkActivateConfirm, setBulkActivateConfirm] = React.useState(false);
  const [bulkDeactivateConfirm, setBulkDeactivateConfirm] =
    React.useState(false);
  const [addUserOpen, setAddUserOpen] = React.useState(false);
  const [addRoleOpen, setAddRoleOpen] = React.useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = React.useState(false);
  const [newPassword, setNewPassword] = React.useState("");
  const [verifyEmailConfirm, setVerifyEmailConfirm] = React.useState<
    string | null
  >(null);

  // Debounced search
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  React.useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setPage(1);
      loadUsers();
    }, 500);
  }, [search]);

  React.useEffect(() => {
    loadUsers();
  }, [page, roleFilter, statusFilter, activeTab]);

  const loadUsers = () => {
    const params: any = {
      page,
      limit,
    };

    if (search) params.search = search;
    if (roleFilter !== "all") params.role = roleFilter;
    if (statusFilter !== "all") params.isActive = statusFilter === "active";

    // Apply tab-specific filtering
    if (activeTab === "students") params.role = "student";
    else if (activeTab === "instructors") params.role = "instructor";
    else if (activeTab === "admins") params.role = "admin";

    fetchUsers(params);
  };

  const handleCreateUser = async (data: CreateUserDto) => {
    await createUser(data);
    loadUsers();
  };

  const handleUpdateUser = async (data: UpdateUserDto) => {
    if (selectedUser) {
      await updateUser(selectedUser._id, data);
      loadUsers();
    }
  };

  const handleDeleteUser = async () => {
    if (confirmDeleteId) {
      await deleteUser(confirmDeleteId);
      setConfirmDeleteId(null);
      loadUsers();
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;
    await bulkDeleteUsers(selectedUsers);
    setBulkDeleteConfirm(false);
    loadUsers();
  };

  const handleBulkActivate = async () => {
    if (selectedUsers.length === 0) return;
    await bulkActivateUsers(selectedUsers);
    setBulkActivateConfirm(false);
    loadUsers();
  };

  const handleBulkDeactivate = async () => {
    if (selectedUsers.length === 0) return;
    await bulkDeactivateUsers(selectedUsers);
    setBulkDeactivateConfirm(false);
    loadUsers();
  };

  const handleBulkExport = async () => {
    if (selectedUsers.length === 0) {
      await exportUsers();
    } else {
      await exportUsers(selectedUsers);
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    if (user.isActive) {
      await deactivateUser(user._id);
    } else {
      await activateUser(user._id);
    }
    loadUsers();
  };

  const handleExport = async () => {
    await exportUsers();
  };

  const handleRefresh = async () => {
    await refresh();
  };

  const handleSendVerificationEmail = async (userId: string) => {
    await sendVerificationEmail(userId);
    setVerifyEmailConfirm(null);
    loadUsers();
  };

  const handleResetPassword = async () => {
    if (selectedUser && newPassword) {
      await resetPassword(selectedUser._id, newPassword);
      setResetPasswordOpen(false);
      setNewPassword("");
      setSelectedUser(null);
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      clearSelection();
    } else {
      selectAllUsers(filteredUsers.map((u) => u._id));
    }
  };

  const handleSelectUser = (userId: string) => {
    toggleUserSelection(userId);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-purple-600 text-white";
      case "admin":
        return "bg-red-500 text-white";
      case "instructor":
        return "bg-blue-500 text-white";
      case "student":
        return "bg-green-500 text-white";
      case "affiliate":
        return "bg-yellow-600 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusBadge = (status: string, isActive: boolean) => {
    if (!isActive) return "bg-gray-500 text-white";
    switch (status) {
      case "active":
        return "bg-green-500 text-white";
      case "inactive":
        return "bg-gray-500 text-white";
      case "pending":
        return "bg-yellow-500 text-white";
      case "suspended":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const filteredUsers = users.filter((u) => {
    if (activeTab === "students" && u.role !== "student") return false;
    if (activeTab === "instructors" && u.role !== "instructor") return false;
    if (activeTab === "admins" && !["admin", "super_admin"].includes(u.role))
      return false;
    return true;
  });

  const totalPages = Math.ceil(total / limit);

  const renderPaginationItems = () => {
    const items = [];
    const maxVisible = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => setPage(i)}
            isActive={page === i}
            className="cursor-pointer"
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    return items;
  };

  return (
    <main className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-secondary mb-2">
            Users Management
          </h2>
          <p className="text-gray-600">
            Manage all users, roles, and permissions across your platform.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            className="border-gray-300"
            onClick={handleRefresh}
            disabled={loading || actionLoading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Refresh
          </Button>
          <Button
            variant="outline"
            className="border-gray-300"
            onClick={handleExport}
            disabled={loading || actionLoading}
          >
            {actionLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Export Users
          </Button>
          <Button
            onClick={() => {
              setSelectedUser(null);
              setFormDialogOpen(true);
            }}
            disabled={actionLoading}
          >
            <Plus className="w-4 h-4 mr-2" /> Invite User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Users</p>
              {statsLoading ? (
                <Loader2 className="w-6 h-6 text-primary animate-spin mt-1" />
              ) : (
                <p className="text-2xl font-bold text-secondary mt-1">
                  {stats?.totalUsers || 0}
                </p>
              )}
              <p className="text-accent text-sm mt-1">
                +{stats?.recentUsers || 0} this week
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <UsersIcon className="text-primary w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Active Users</p>
              {statsLoading ? (
                <Loader2 className="w-6 h-6 text-green-600 animate-spin mt-1" />
              ) : (
                <p className="text-2xl font-bold text-secondary mt-1">
                  {stats?.activeUsers || 0}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-green-600 w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Students</p>
              {statsLoading ? (
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin mt-1" />
              ) : (
                <p className="text-2xl font-bold text-secondary mt-1">
                  {stats?.students || 0}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <UsersIcon className="text-blue-600 w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Instructors</p>
              {statsLoading ? (
                <Loader2 className="w-6 h-6 text-purple-600 animate-spin mt-1" />
              ) : (
                <p className="text-2xl font-bold text-secondary mt-1">
                  {stats?.instructors || 0}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <ShieldCheck className="text-purple-600 w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* User Analytics */}
      <UserAnalytics />

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { key: "all", label: "All Users" },
            { key: "students", label: "Students" },
            { key: "instructors", label: "Instructors" },
            { key: "admins", label: "Admins" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setPage(1);
              }}
              className={`py-4 px-1 font-medium text-sm transition-colors ${
                activeTab === tab.key
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedUsers.length > 0 && activeTab !== "Roles & Permissions" && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-secondary">
                {selectedUsers.length} user{selectedUsers.length > 1 ? "s" : ""}{" "}
                selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelection}
                className="text-gray-600 hover:text-gray-900"
              >
                Clear Selection
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={actionLoading}>
                    <MoreHorizontal className="w-4 h-4 mr-2" />
                    Bulk Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setBulkActivateConfirm(true)}
                    disabled={actionLoading}
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Activate Selected
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setBulkDeactivateConfirm(true)}
                    disabled={actionLoading}
                  >
                    <UserX className="w-4 h-4 mr-2" />
                    Deactivate Selected
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleBulkExport}
                    disabled={actionLoading}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Selected
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setBulkDeleteConfirm(true)}
                    disabled={actionLoading}
                    className="text-red-600"
                  >
                    <Trash className="w-4 h-4 mr-2" />
                    Delete Selected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setBulkDeleteConfirm(true)}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash className="w-4 h-4 mr-2" />
                )}
                Delete ({selectedUsers.length})
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeTab !== "Roles & Permissions" && (
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Role:</span>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="instructor">Instructor</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="affiliate">Affiliate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Status:</span>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex items-center mt-4">
            <div className="relative w-full">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                type="text"
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Search users..."
              />
            </div>
          </div>
        </div>
      )}

      {activeTab !== "Roles & Permissions" && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <UsersIcon className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-600 font-medium">No users found</p>
              <p className="text-gray-500 text-sm">
                Try adjusting your filters or search term
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    <Checkbox
                      checked={
                        selectedUsers.length === filteredUsers.length &&
                        filteredUsers.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    User
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Role
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Courses
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Last Active
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u, idx) => (
                  <tr
                    key={u._id}
                    className={`border-b border-gray-100 ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="py-4 px-4">
                      <Checkbox
                        checked={selectedUsers.includes(u._id)}
                        onCheckedChange={() => handleSelectUser(u._id)}
                      />
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={u.avatar} alt={u.name || u.email} />
                          <AvatarFallback>
                            {(u.name || u.email || "U")
                              .slice(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-secondary">
                            {u.name || u.email || "Unknown User"}
                          </div>
                          <div className="text-xs text-gray-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={getRoleBadge(u.role)}>{u.role}</Badge>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={getStatusBadge(u.status, u.isActive)}>
                        {u.isActive ? u.status || "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {u.enrolledCourses || 0} courses
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {u.lastLogin
                        ? new Date(u.lastLogin).toLocaleDateString()
                        : "Never"}
                    </td>
                    <td className="py-4 px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(u);
                              setViewDialogOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(u);
                              setFormDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleUserStatus(u)}
                            disabled={actionLoading}
                          >
                            {u.isActive ? (
                              <>
                                <UserX className="w-4 h-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-4 h-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          {!u.emailVerified && (
                            <DropdownMenuItem
                              onClick={() => setVerifyEmailConfirm(u._id)}
                              disabled={actionLoading}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Send Verification Email
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(u);
                              setResetPasswordOpen(true);
                            }}
                            disabled={actionLoading}
                          >
                            <ShieldCheck className="w-4 h-4 mr-2" />
                            Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setConfirmDeleteId(u._id)}
                            className="text-red-600"
                            disabled={actionLoading}
                          >
                            <Trash className="w-4 h-4 mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab !== "Roles & Permissions" && (
        <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {filteredUsers.length} of {total} users
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage(Math.max(1, page - 1))}
                  className={
                    page === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
              {renderPaginationItems()}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  className={
                    page === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {activeTab === "Roles & Permissions" && (
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mt-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-secondary">
              Roles & Permissions
            </h3>
            <Button onClick={() => setAddRoleOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add Role
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              {
                key: "admin",
                label: "Administrator",
                desc: "Full system access",
              },
              {
                key: "instructor",
                label: "Instructor",
                desc: "Course management",
              },
              { key: "student", label: "Student", desc: "Learning access" },
              {
                key: "affiliate",
                label: "Affiliate",
                desc: "Marketing access",
              },
            ].map((role) => {
              const count = users.filter((u) => u.role === role.key).length;
              return (
                <div
                  key={role.key}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold text-secondary">
                        {role.label}
                      </h4>
                      <p className="text-sm text-gray-600">{role.desc}</p>
                    </div>
                    <Badge className={getRoleBadge(role.key)}>
                      {count} users
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Users</span>
                      <span className="text-accent">
                        {role.key === "admin" || role.key === "super_admin"
                          ? "Full Access"
                          : "View Only"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Courses</span>
                      <span className="text-accent">
                        {role.key === "admin" || role.key === "super_admin"
                          ? "Full Access"
                          : role.key === "instructor"
                          ? "Manage Own"
                          : "Enroll"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Settings</span>
                      <span className="text-gray-500">
                        {role.key === "admin" || role.key === "super_admin"
                          ? "Full Access"
                          : "No Access"}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button variant="ghost" className="text-primary">
                      Edit
                    </Button>
                    <Button variant="ghost" className="text-red-500">
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Permission
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Administrator
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Instructor
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Content Manager
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Student
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  "Manage Users",
                  "Manage Courses",
                  "Edit Content",
                  "Access Analytics",
                  "Manage Settings",
                ].map((perm) => (
                  <tr key={perm} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-sm text-gray-600">{perm}</td>
                    <td className="py-3 px-4 text-center">
                      <Check className="w-4 h-4 text-accent inline" />
                    </td>
                    <td className="py-3 px-4 text-center">
                      {perm === "Manage Users" || perm === "Manage Settings" ? (
                        <X className="w-4 h-4 text-gray-400 inline" />
                      ) : (
                        <Check className="w-4 h-4 text-accent inline" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {perm === "Edit Content" ? (
                        <Check className="w-4 h-4 text-accent inline" />
                      ) : (
                        <X className="w-4 h-4 text-gray-400 inline" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {perm === "Access Analytics" ||
                      perm === "Edit Content" ? (
                        <X className="w-4 h-4 text-gray-400 inline" />
                      ) : (
                        <Check className="w-4 h-4 text-accent inline" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Form Dialog */}
      <UserFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        user={selectedUser}
        onSubmit={(data) => {
          if (selectedUser) {
            return handleUpdateUser(data as UpdateUserDto);
          } else {
            return handleCreateUser(data as CreateUserDto);
          }
        }}
      />

      {/* User View Dialog */}
      <UserViewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        user={selectedUser}
      />
      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!confirmDeleteId}
        onOpenChange={(o) => !o && setConfirmDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The user will be permanently
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmDeleteId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteConfirm} onOpenChange={setBulkDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {selectedUsers.length} user
              {selectedUsers.length > 1 ? "s" : ""}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All selected users will be
              permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setBulkDeleteConfirm(false)}
              disabled={actionLoading}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete All"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Activate Confirmation Dialog */}
      <AlertDialog
        open={bulkActivateConfirm}
        onOpenChange={setBulkActivateConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Activate {selectedUsers.length} user
              {selectedUsers.length > 1 ? "s" : ""}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              All selected users will be activated and can access the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setBulkActivateConfirm(false)}
              disabled={actionLoading}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkActivate}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Activating...
                </>
              ) : (
                "Activate All"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Deactivate Confirmation Dialog */}
      <AlertDialog
        open={bulkDeactivateConfirm}
        onOpenChange={setBulkDeactivateConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Deactivate {selectedUsers.length} user
              {selectedUsers.length > 1 ? "s" : ""}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              All selected users will be deactivated and will not be able to
              access the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setBulkDeactivateConfirm(false)}
              disabled={actionLoading}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDeactivate}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deactivating...
                </>
              ) : (
                "Deactivate All"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Send Verification Email Confirmation Dialog */}
      <AlertDialog
        open={!!verifyEmailConfirm}
        onOpenChange={(o) => !o && setVerifyEmailConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Verification Email?</AlertDialogTitle>
            <AlertDialogDescription>
              A verification email will be sent to the user's email address.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setVerifyEmailConfirm(null)}
              disabled={actionLoading}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                verifyEmailConfirm &&
                handleSendVerificationEmail(verifyEmailConfirm)
              }
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Email"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset User Password</DialogTitle>
            <DialogDescription>
              Enter a new password for{" "}
              {selectedUser?.name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                minLength={6}
              />
              <p className="text-xs text-gray-500">
                Password must be at least 6 characters long
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setResetPasswordOpen(false);
                setNewPassword("");
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleResetPassword}
              disabled={actionLoading || !newPassword || newPassword.length < 6}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
