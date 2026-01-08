"use client";

import AppLayout from "@/components/layout/AppLayout";
import { AboutUsEditor } from "@/components/cms/AboutUsEditor";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { Users, AlertTriangle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AboutUsPage() {
  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-3 sm:p-4 md:p-6 lg:p-8 transition-all duration-300">
        <div className="container mx-auto max-w-7xl">
          {/* Header Section */}
          <div className="mb-4 sm:mb-6 lg:mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-2">
              <div className="p-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-gray-700 dark:from-white dark:via-blue-200 dark:to-gray-300 bg-clip-text text-transparent leading-tight">
                  About Us Page Management
                </h1>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
                  Manage About Us page content with WordPress-like rich text
                  editor
                </p>
              </div>
            </div>
          </div>

          {/* About Us Editor Component with Error Boundary */}
          <ErrorBoundary
            fallback={
              <Card className="max-w-full sm:max-w-2xl mx-auto shadow-xl border-red-200 dark:border-red-800 animate-in fade-in zoom-in-95 duration-500">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="p-2 sm:p-3 bg-red-100 dark:bg-red-900/20 rounded-lg shrink-0">
                      <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg sm:text-xl">
                        Failed to Load About Us Editor
                      </CardTitle>
                      <CardDescription className="text-sm mt-1">
                        There was an error loading the About Us page editor.
                        Please try refreshing the page.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  <Button
                    onClick={() => window.location.reload()}
                    className="w-full sm:w-auto"
                  >
                    Reload Page
                  </Button>
                </CardContent>
              </Card>
            }
            onError={(error, errorInfo) => {
              console.error("About Us Editor Error:", error, errorInfo);
              // TODO: Send to error tracking service
            }}
          >
            <AboutUsEditor />
          </ErrorBoundary>
        </div>
      </div>
    </AppLayout>
  );
}
