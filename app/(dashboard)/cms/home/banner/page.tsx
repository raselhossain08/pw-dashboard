"use client";

import AppLayout from "@/components/layout/AppLayout";
import { BannerEditor } from "@/components/cms/home/BannerEditor";
import { Video, Sparkles } from "lucide-react";

export default function BannerPage() {
  return (
    <AppLayout>
      <div className="min-h-screen p-4 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto ">
          {/* Header Section */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-lg">
                <Video className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Home Banner Management
                  </h1>
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
                </div>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Manage homepage video banners with dynamic content, media uploads, and comprehensive SEO optimization
                </p>
              </div>
            </div>
          </div>

          {/* Banner Editor Component */}
          <BannerEditor />
        </div>
      </div>
    </AppLayout>
  );
}
