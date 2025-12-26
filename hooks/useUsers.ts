"use client";

import { useEffect } from "react";
import { usersService, User, CreateUserDto, UpdateUserDto } from "@/services/users.service";
import { useToast } from "@/context/ToastContext";
import { useUsersStore, UserStats } from "@/store/usersStore";

export interface UsersResponse {
  users: User[];
  total: number;
}

export function useUsers() {
  const { push } = useToast();
  const {
    users,
    stats,
    total,
    isLoading,
    isStatsLoading,
    isActionLoading,
    error,
    selectedUsers,
    filters,
    setUsers,
    setStats,
    setTotal,
    addUser,
    updateUser: updateUserInStore,
    removeUser,
    removeUsers,
    setLoading,
    setStatsLoading,
    setActionLoading,
    setError,
    clearErrors,
    setFilters,
    clearSelection,
  } = useUsersStore();

  // Fetch all users with filters
  const fetchUsers = async (params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: boolean;
  } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await usersService.getAllUsers(params) as UsersResponse;
      setUsers(data.users);
      setTotal(data.total);
      setFilters(params);
      return data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch users";
      setError(errorMessage);
      push({
        type: "error",
        message: errorMessage,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fetch user stats
  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const data = await usersService.getUserStats() as UserStats;
      setStats(data);
      return data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch stats";
      push({
        type: "error",
        message: errorMessage,
      });
      throw error;
    } finally {
      setStatsLoading(false);
    }
  };

  // Create user
  const createUser = async (userData: CreateUserDto) => {
    setActionLoading(true);
    try {
      const newUser = await usersService.createUser(userData) as User;
      addUser(newUser);
      push({
        type: "success",
        message: `User ${userData.name || userData.email} created successfully`,
      });
      return newUser;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to create user";
      push({
        type: "error",
        message: errorMessage,
      });
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  // Update user
  const updateUser = async (id: string, userData: UpdateUserDto) => {
    setActionLoading(true);
    try {
      const updatedUser = await usersService.updateUser(id, userData) as User;
      updateUserInStore(id, updatedUser);
      push({
        type: "success",
        message: "User updated successfully",
      });
      return updatedUser;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to update user";
      push({
        type: "error",
        message: errorMessage,
      });
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  // Delete user
  const deleteUser = async (id: string) => {
    setActionLoading(true);
    try {
      await usersService.deleteUser(id);
      removeUser(id);
      push({
        type: "success",
        message: "User deleted successfully",
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to delete user";
      push({
        type: "error",
        message: errorMessage,
      });
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  // Activate user
  const activateUser = async (id: string) => {
    setActionLoading(true);
    try {
      const updatedUser = await usersService.activateUser(id) as User;
      updateUserInStore(id, updatedUser);
      push({
        type: "success",
        message: "User activated successfully",
      });
      return updatedUser;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to activate user";
      push({
        type: "error",
        message: errorMessage,
      });
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  // Deactivate user
  const deactivateUser = async (id: string) => {
    setActionLoading(true);
    try {
      const updatedUser = await usersService.deactivateUser(id) as User;
      updateUserInStore(id, updatedUser);
      push({
        type: "success",
        message: "User deactivated successfully",
      });
      return updatedUser;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to deactivate user";
      push({
        type: "error",
        message: errorMessage,
      });
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  // Bulk delete users
  const bulkDeleteUsers = async (ids: string[]) => {
    if (ids.length === 0) return;
    setActionLoading(true);
    try {
      await usersService.bulkDeleteUsers(ids);
      removeUsers(ids);
      clearSelection();
      push({
        type: "success",
        message: `${ids.length} user${ids.length > 1 ? "s" : ""} deleted successfully`,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to delete users";
      push({
        type: "error",
        message: errorMessage,
      });
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  // Bulk activate users
  const bulkActivateUsers = async (ids: string[]) => {
    if (ids.length === 0) return;
    setActionLoading(true);
    try {
      await usersService.bulkActivateUsers(ids);
      ids.forEach((id) => {
        updateUserInStore(id, { isActive: true, status: "active" } as Partial<User>);
      });
      clearSelection();
      push({
        type: "success",
        message: `${ids.length} user${ids.length > 1 ? "s" : ""} activated successfully`,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to activate users";
      push({
        type: "error",
        message: errorMessage,
      });
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  // Bulk deactivate users
  const bulkDeactivateUsers = async (ids: string[]) => {
    if (ids.length === 0) return;
    setActionLoading(true);
    try {
      await usersService.bulkDeactivateUsers(ids);
      ids.forEach((id) => {
        updateUserInStore(id, { isActive: false, status: "inactive" } as Partial<User>);
      });
      clearSelection();
      push({
        type: "success",
        message: `${ids.length} user${ids.length > 1 ? "s" : ""} deactivated successfully`,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to deactivate users";
      push({
        type: "error",
        message: errorMessage,
      });
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  // Export users (returns CSV data)
  const exportUsers = async (userIds?: string[]) => {
    setActionLoading(true);
    try {
      push({
        type: "info",
        message: "Preparing export...",
      });

      let data: UsersResponse;
      if (userIds && userIds.length > 0) {
        // Export selected users
        data = await usersService.getAllUsers({ limit: 10000 }) as UsersResponse;
        data.users = data.users.filter((u) => userIds.includes(u._id));
      } else {
        // Export all users
        data = await usersService.getAllUsers({ limit: 10000 }) as UsersResponse;
      }

      // Convert to CSV
      const headers = ["ID", "Name", "Email", "Role", "Status", "Created At", "Last Login"];
      const rows = data.users.map((user) => [
        user._id,
        user.name || "",
        user.email,
        user.role,
        user.isActive ? "Active" : "Inactive",
        new Date(user.createdAt).toLocaleDateString(),
        user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
      ].join("\n");

      // Trigger download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      push({
        type: "success",
        message: `${data.users.length} user${data.users.length > 1 ? "s" : ""} exported successfully`,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to export users";
      push({
        type: "error",
        message: errorMessage,
      });
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  // Refresh data
  const refresh = async () => {
    await Promise.all([fetchUsers(filters), fetchStats()]);
  };

  // Send verification email
  const sendVerificationEmail = async (id: string) => {
    setActionLoading(true);
    try {
      await usersService.sendVerificationEmail(id);
      push({
        type: "success",
        message: "Verification email sent successfully",
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to send verification email";
      push({
        type: "error",
        message: errorMessage,
      });
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  // Reset user password
  const resetPassword = async (id: string, newPassword: string) => {
    setActionLoading(true);
    try {
      await usersService.resetUserPassword(id, newPassword);
      push({
        type: "success",
        message: "Password reset successfully",
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to reset password";
      push({
        type: "error",
        message: errorMessage,
      });
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  return {
    users,
    stats,
    loading: isLoading,
    statsLoading: isStatsLoading,
    actionLoading: isActionLoading,
    total,
    selectedUsers,
    error,
    fetchUsers,
    fetchStats,
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
    clearErrors,
  };
}
