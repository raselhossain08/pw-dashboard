"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading skeleton for About Section Editor
 * Provides visual feedback during data fetching
 */
export function AboutSectionSkeleton() {
  return (
    <div className="w-full space-y-6 animate-pulse">
      {/* Header Actions Skeleton */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <Skeleton className="h-6 w-24" />
        <div className="flex items-center gap-2 flex-wrap">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="space-y-6">
        <div className="flex gap-2 p-1 bg-white/80 rounded-xl">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
        </div>

        {/* Content Card Skeleton */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-t-lg py-4">
            <Skeleton className="h-6 w-48 bg-white/20" />
            <Skeleton className="h-4 w-64 bg-white/20 mt-2" />
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Image Upload Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>

            {/* Title Input Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Subtitle Input Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Description Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-32 w-full" />
            </div>

            {/* CTA Skeleton */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>

            {/* Submit Button Skeleton */}
            <div className="flex justify-end">
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * Compact skeleton for individual sections
 */
export function AboutSectionItemSkeleton() {
  return (
    <div className="p-4 border rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <div className="grid md:grid-cols-3 gap-3">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * Preview skeleton
 */
export function AboutSectionPreviewSkeleton() {
  return (
    <div className="space-y-6 mt-4 animate-pulse">
      {/* Image */}
      <Skeleton className="relative w-full h-64 rounded-lg" />

      {/* Title & Subtitle */}
      <div>
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-6 w-2/3 mt-2" />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>

      {/* Highlights */}
      <div className="space-y-4">
        <Skeleton className="h-7 w-32" />
        <div className="grid md:grid-cols-2 gap-4">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-4">
        <Skeleton className="h-7 w-28" />
        <div className="grid md:grid-cols-3 gap-4">
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
      </div>

      {/* CTA */}
      <Skeleton className="h-12 w-40 rounded-lg" />
    </div>
  );
}


