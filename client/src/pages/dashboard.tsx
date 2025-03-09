import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { AnalysisProgress } from "@/components/analysis-progress";
import { ReportMetrics } from "@/components/report-metrics";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileText } from "lucide-react";

export default function Dashboard() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const websiteQuery = useQuery({
    queryKey: [`/api/website/${id}`],
    refetchInterval: (data) => {
      return data?.status === "pending" ? 1000 : false;
    },
  });

  const reportQuery = useQuery({
    queryKey: [`/api/report/${id}`],
    enabled: websiteQuery.data?.status === "completed",
  });

  if (websiteQuery.error) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to load website analysis",
    });
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Website Analysis</h1>
        {reportQuery.data && (
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        )}
      </div>

      {websiteQuery.data && <AnalysisProgress website={websiteQuery.data} />}

      {reportQuery.data && (
        <div className="mt-8">
          <ReportMetrics report={reportQuery.data} />
        </div>
      )}
    </div>
  );
}
