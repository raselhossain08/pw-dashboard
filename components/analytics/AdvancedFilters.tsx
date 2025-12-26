"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Filter } from "lucide-react";
import { ReportType, ReportStatus } from "@/hooks/useAnalytics";

interface AnalyticsFilters {
  dateRange?: { from: Date; to: Date };
  statuses?: ReportStatus[];
  types?: ReportType[];
}

interface AdvancedFiltersProps {
  onFiltersChange: (filters: AnalyticsFilters) => void;
  currentFilters: AnalyticsFilters;
}

export function AdvancedFilters({
  onFiltersChange,
  currentFilters,
}: AdvancedFiltersProps) {
  const [localStatuses, setLocalStatuses] = React.useState<ReportStatus[]>(
    currentFilters.statuses || []
  );
  const [localTypes, setLocalTypes] = React.useState<ReportType[]>(
    currentFilters.types || []
  );

  const handleStatusToggle = (status: ReportStatus) => {
    const newStatuses = localStatuses.includes(status)
      ? localStatuses.filter((s) => s !== status)
      : [...localStatuses, status];
    setLocalStatuses(newStatuses);
    onFiltersChange({ ...currentFilters, statuses: newStatuses });
  };

  const handleTypeToggle = (type: ReportType) => {
    const newTypes = localTypes.includes(type)
      ? localTypes.filter((t) => t !== type)
      : [...localTypes, type];
    setLocalTypes(newTypes);
    onFiltersChange({ ...currentFilters, types: newTypes });
  };

  const handleClearAll = () => {
    setLocalStatuses([]);
    setLocalTypes([]);
    onFiltersChange({});
  };

  const hasActiveFilters = localStatuses.length > 0 || localTypes.length > 0;

  return (
    <div className="p-4 border rounded-lg space-y-4 bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Advanced Filters
        </h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <Label className="text-xs font-medium text-gray-700">Status</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {(
              ["draft", "scheduled", "generated", "failed"] as ReportStatus[]
            ).map((status) => (
              <Badge
                key={status}
                variant={localStatuses.includes(status) ? "default" : "outline"}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleStatusToggle(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-xs font-medium text-gray-700">
            Report Type
          </Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {(
              [
                "Overview",
                "Sales",
                "Engagement",
                "Traffic",
                "Custom",
              ] as ReportType[]
            ).map((type) => (
              <Badge
                key={type}
                variant={localTypes.includes(type) ? "default" : "outline"}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleTypeToggle(type)}
              >
                {type}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="pt-3 border-t">
          <p className="text-xs text-gray-600">
            Active filters: {localStatuses.length + localTypes.length}
          </p>
        </div>
      )}
    </div>
  );
}
