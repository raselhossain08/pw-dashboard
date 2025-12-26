"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User } from "@/services/users.service";
import {
  Mail,
  Phone,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

interface UserViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export function UserViewDialog({
  open,
  onOpenChange,
  user,
}: UserViewDialogProps) {
  if (!user) return null;

  const getRoleBadgeColor = (role: string) => {
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

  const getStatusBadgeColor = (status: string) => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-start gap-4 pb-4 border-b">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-xl">
                {user.name?.charAt(0) || user.email?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-secondary">{user.name}</h3>
              <p className="text-gray-600 flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4" />
                {user.email}
              </p>
              <div className="flex gap-2 mt-3">
                <Badge className={getRoleBadgeColor(user.role)}>
                  {user.role.replace("_", " ").toUpperCase()}
                </Badge>
                <Badge className={getStatusBadgeColor(user.status)}>
                  {user.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              {user.emailVerified ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">Email Verified</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-500" />
                  <span className="text-sm font-medium">
                    Email Not Verified
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              {user.isActive ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">Account Active</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-500" />
                  <span className="text-sm font-medium">Account Inactive</span>
                </>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <h4 className="font-semibold text-lg text-secondary">
              Contact Information
            </h4>
            <div className="flex items-center gap-3 text-gray-700">
              <Mail className="w-4 h-4 text-gray-500" />
              <span>{user.email}</span>
              {user.emailVerified ? (
                <Badge className="bg-green-100 text-green-800 text-xs">
                  Verified
                </Badge>
              ) : (
                <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Not Verified
                </Badge>
              )}
            </div>
            {user.phone && (
              <div className="flex items-center gap-3 text-gray-700">
                <Phone className="w-4 h-4 text-gray-500" />
                <span>{user.phone}</span>
              </div>
            )}
          </div>

          {/* Bio */}
          {user.bio && (
            <div className="space-y-2">
              <h4 className="font-semibold text-lg text-secondary">Bio</h4>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                {user.bio}
              </p>
            </div>
          )}

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Created At
              </h4>
              <p className="text-gray-600 text-sm">
                {formatDate(user.createdAt)}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Last Updated
              </h4>
              <p className="text-gray-600 text-sm">
                {formatDate(user.updatedAt)}
              </p>
            </div>
          </div>

          {user.lastLogin && (
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Last Login
              </h4>
              <p className="text-gray-600 text-sm">
                {formatDate(user.lastLogin)}
              </p>
            </div>
          )}

          {user.enrolledCourses !== undefined && (
            <div className="space-y-2 p-4 bg-primary/10 rounded-lg">
              <h4 className="font-semibold text-primary">Enrolled Courses</h4>
              <p className="text-2xl font-bold text-primary">
                {user.enrolledCourses}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
