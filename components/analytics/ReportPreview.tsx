"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReportItem } from "@/hooks/useAnalytics";
import { formatDistanceToNow } from "date-fns";
import {
  Eye,
  FileText,
  Calendar,
  User,
  Download,
  X,
  BarChart3,
} from "lucide-react";

interface ReportPreviewProps {
  report: ReportItem | null;
  open: boolean;
  onClose: () => void;
  onExport?: (report: ReportItem) => void;
}

export function ReportPreview({
  report,
  open,
  onClose,
  onExport,
}: ReportPreviewProps) {
  if (!report) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            Report Preview
          </DialogTitle>
          <DialogDescription>
            Preview of "{report.name}" report
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Report Header */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg">
            <h3 className="text-xl font-bold text-secondary mb-2">
              {report.name}
            </h3>
            {report.description && (
              <p className="text-sm text-gray-600">{report.description}</p>
            )}
          </div>

          {/* Report Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-gray-400" />
              <div>
                <div className="text-xs text-gray-500">Type</div>
                <Badge variant="outline">{report.type}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <div className="text-xs text-gray-500">Period</div>
                <div className="font-medium">{report.period}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <BarChart3 className="w-4 h-4 text-gray-400" />
              <div>
                <div className="text-xs text-gray-500">Status</div>
                <Badge
                  variant={
                    report.status === "generated" ? "default" : "outline"
                  }
                >
                  {report.status}
                </Badge>
              </div>
            </div>
            {report.createdBy && (
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-500">Created By</div>
                  <div className="font-medium">
                    {report.createdBy.firstName} {report.createdBy.lastName}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Report Dates */}
          <div className="border-t pt-4 space-y-2 text-sm">
            {report.createdAt && (
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium">
                  {formatDistanceToNow(new Date(report.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            )}
            {report.generatedAt && (
              <div className="flex justify-between">
                <span className="text-gray-600">Generated:</span>
                <span className="font-medium">
                  {formatDistanceToNow(new Date(report.generatedAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            )}
            {report.scheduledAt && (
              <div className="flex justify-between">
                <span className="text-gray-600">Scheduled For:</span>
                <span className="font-medium">
                  {new Date(report.scheduledAt).toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Report Data Preview */}
          {report.status === "generated" && (
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Report Summary</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  This report contains analytics data for the selected period.
                  Export the report to view the complete data and
                  visualizations.
                </p>
                {report.fileFormat && (
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant="secondary">
                      {report.fileFormat.toUpperCase()}
                    </Badge>
                    {report.fileUrl && (
                      <span className="text-xs text-green-600">
                        Ready to download
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
          {report.status === "generated" && onExport && (
            <Button onClick={() => onExport(report)}>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
