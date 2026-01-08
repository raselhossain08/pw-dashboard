"use client";

import AppLayout from "@/components/layout/AppLayout";
import { BlogEditor } from "@/components/cms/home/BlogEditor";
import { FileText, Sparkles } from "lucide-react";

export default function BlogPage() {
  return (
    <AppLayout>
      <div className="min-h-screen p-4 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto ">
          {/* Header Section */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Blog Section Management
                  </h1>
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                </div>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Manage blog posts with rich content editing, media uploads,
                  and comprehensive SEO optimization
                </p>
              </div>
            </div>
          </div>

          {/* Blog Editor Component */}
          <BlogEditor />
        </div>
      </div>
    </AppLayout>
  );
}
