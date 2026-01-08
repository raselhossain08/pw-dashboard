"use client";

import AppLayout from "@/components/layout/AppLayout";
import { AboutSectionEditor } from "@/components/cms/home/AboutSectionEditor";
import { Heart } from "lucide-react";

export default function AboutSectionPage() {
  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto ">
          {/* Header Section */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/30">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  About Section Management
                </h1>
              </div>
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 ml-14">
              Manage about section content with dynamic data and SEO
              optimization
            </p>
          </div>

          {/* About Section Editor Component */}
          <AboutSectionEditor />
        </div>
      </div>
    </AppLayout>
  );
}
