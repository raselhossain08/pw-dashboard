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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Clock, Loader2 } from "lucide-react";
import { ReportItem, ReportType } from "@/hooks/useAnalytics";

interface ScheduleReportDialogProps {
  open: boolean;
  onClose: () => void;
  onSchedule: (data: ScheduleData) => void;
  report?: ReportItem | null;
  isScheduling?: boolean;
}

export interface ScheduleData {
  reportId?: string;
  name: string;
  type: ReportType;
  period: string;
  frequency: "once" | "daily" | "weekly" | "monthly";
  scheduledDate: string;
  scheduledTime: string;
  recipients: string[];
  autoExport: boolean;
  exportFormat: "pdf" | "csv" | "xlsx";
}

export function ScheduleReportDialog({
  open,
  onClose,
  onSchedule,
  report,
  isScheduling = false,
}: ScheduleReportDialogProps) {
  const [formData, setFormData] = React.useState<ScheduleData>({
    reportId: report?._id || report?.id,
    name: report?.name || "",
    type: report?.type || "Overview",
    period: report?.period || "month",
    frequency: "once",
    scheduledDate: new Date().toISOString().split("T")[0],
    scheduledTime: "09:00",
    recipients: [],
    autoExport: true,
    exportFormat: "pdf",
  });

  const [emailInput, setEmailInput] = React.useState("");

  React.useEffect(() => {
    if (report) {
      setFormData((prev) => ({
        ...prev,
        reportId: report._id || report.id,
        name: report.name,
        type: report.type,
        period: report.period,
      }));
    }
  }, [report]);

  const handleAddEmail = () => {
    if (emailInput && emailInput.includes("@")) {
      setFormData((prev) => ({
        ...prev,
        recipients: [...prev.recipients, emailInput],
      }));
      setEmailInput("");
    }
  };

  const handleRemoveEmail = (email: string) => {
    setFormData((prev) => ({
      ...prev,
      recipients: prev.recipients.filter((e) => e !== email),
    }));
  };

  const handleSubmit = () => {
    onSchedule(formData);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Schedule Report
          </DialogTitle>
          <DialogDescription>
            Configure automatic report generation and delivery
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="schedule-name">Report Name</Label>
            <Input
              id="schedule-name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Weekly Sales Report"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="schedule-type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(v) =>
                  setFormData({ ...formData, type: v as ReportType })
                }
              >
                <SelectTrigger id="schedule-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Overview">Overview</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Engagement">Engagement</SelectItem>
                  <SelectItem value="Traffic">Traffic</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="schedule-period">Period</Label>
              <Select
                value={formData.period}
                onValueChange={(v) => setFormData({ ...formData, period: v })}
              >
                <SelectTrigger id="schedule-period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Daily</SelectItem>
                  <SelectItem value="week">Weekly</SelectItem>
                  <SelectItem value="month">Monthly</SelectItem>
                  <SelectItem value="year">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="schedule-frequency">Frequency</Label>
            <Select
              value={formData.frequency}
              onValueChange={(v) =>
                setFormData({
                  ...formData,
                  frequency: v as ScheduleData["frequency"],
                })
              }
            >
              <SelectTrigger id="schedule-frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="once">Once</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="schedule-date">Date</Label>
              <Input
                id="schedule-date"
                type="date"
                value={formData.scheduledDate}
                onChange={(e) =>
                  setFormData({ ...formData, scheduledDate: e.target.value })
                }
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div>
              <Label htmlFor="schedule-time">Time</Label>
              <Input
                id="schedule-time"
                type="time"
                value={formData.scheduledTime}
                onChange={(e) =>
                  setFormData({ ...formData, scheduledTime: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <Label>Email Recipients (Optional)</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddEmail()}
                placeholder="Enter email address"
                type="email"
              />
              <Button type="button" variant="outline" onClick={handleAddEmail}>
                Add
              </Button>
            </div>
            {formData.recipients.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.recipients.map((email) => (
                  <div
                    key={email}
                    className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {email}
                    <button
                      onClick={() => handleRemoveEmail(email)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="auto-export"
                checked={formData.autoExport}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, autoExport: checked as boolean })
                }
              />
              <Label
                htmlFor="auto-export"
                className="text-sm font-normal cursor-pointer"
              >
                Automatically export report after generation
              </Label>
            </div>

            {formData.autoExport && (
              <div className="ml-6">
                <Label htmlFor="export-format" className="text-xs">
                  Export Format
                </Label>
                <Select
                  value={formData.exportFormat}
                  onValueChange={(v) =>
                    setFormData({
                      ...formData,
                      exportFormat: v as "pdf" | "csv" | "xlsx",
                    })
                  }
                >
                  <SelectTrigger id="export-format" className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="xlsx">XLSX</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isScheduling}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isScheduling}>
            {isScheduling ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Scheduling...
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Report
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
