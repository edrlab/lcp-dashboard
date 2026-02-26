import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API_CONFIG, buildApiUrl } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

type MonthOption = {
  value: string;
  label: string;
};

const getFilenameFromContentDisposition = (contentDisposition: string | null): string | null => {
  if (!contentDisposition) {
    return null;
  }

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]).replace(/[\\/]/g, "_");
    } catch {
      return utf8Match[1].replace(/[\\/]/g, "_");
    }
  }

  const asciiMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  if (asciiMatch?.[1]) {
    return asciiMatch[1].replace(/[\\/]/g, "_");
  }

  return null;
};

const getLastTwelveMonths = (): MonthOption[] => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  });
  const now = new Date();
  const options: MonthOption[] = [];

  for (let offset = 1; offset <= 12; offset += 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const monthValue = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const monthLabel = formatter.format(date);
    options.push({ value: monthValue, label: monthLabel });
  }

  return options;
};

export function LicenseReportDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState(false);
  const monthOptions = getLastTwelveMonths();

  const handleDownload = async () => {
    if (!selectedMonth) {
      return;
    }

    setIsDownloading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.REPORT_LICENSES(selectedMonth)), {
        method: "GET",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get("Content-Disposition");
      const filenameFromHeader = getFilenameFromContentDisposition(contentDisposition);
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filenameFromHeader || `licenses-report-${selectedMonth}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);

      setIsOpen(false);
      toast({
        title: "Download started",
        description: `Report CSV for ${selectedMonth} is being downloaded.`,
      });
    } catch {
      toast({
        title: "Download failed",
        description: "Unable to download report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        className="bg-primary/10 text-primary border-primary/30 hover:bg-primary/20 hover:text-primary"
        onClick={() => setIsOpen(true)}
      >
        Report
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Download report</DialogTitle>
            <DialogDescription>
              Select a month from the last 12 months (current month excluded).
            </DialogDescription>
          </DialogHeader>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger>
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent className="max-h-[40vh] [&_[data-radix-select-viewport]]:max-h-[40vh] [&_[data-radix-select-viewport]]:overflow-y-auto">
              {monthOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="py-1">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button onClick={handleDownload} disabled={!selectedMonth || isDownloading}>
              {isDownloading ? "Downloading..." : "Download"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}