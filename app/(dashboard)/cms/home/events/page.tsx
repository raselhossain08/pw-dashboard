"use client";

import AppLayout from "@/components/layout/AppLayout";
import { EventsEditor } from "@/components/cms/home/EventsEditor";
import { Calendar, Sparkles } from "lucide-react";

export default function EventsPage() {
  return (
    <AppLayout>
      <div className="min-h-screen p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto ">
          {/* Header Section */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg shadow-green-500/30">
                <Calendar className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Events Section Management
                  </h1>
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                </div>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                  Manage upcoming events with rich content editing, media uploads,
                  SEO optimization, and comprehensive event details
                </p>
              </div>
            </div>
          </div>

          {/* Events Editor Component */}
          <EventsEditor />
        </div>
      </div>
    </AppLayout>
  );
}
