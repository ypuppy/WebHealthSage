import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  BarChart3,
  Search,
  Zap,
  Shield,
  Accessibility,
  MessageSquare,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Report() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const websiteQuery = useQuery({
    queryKey: [`/api/website/${id}`],
  });

  const reportQuery = useQuery({
    queryKey: [`/api/report/${id}`],
    enabled: !!websiteQuery.data,
  });

  if (reportQuery.isLoading || websiteQuery.isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/4"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (reportQuery.error || websiteQuery.error) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to load the report data",
    });
    return null;
  }

  const report = reportQuery.data;
  const website = websiteQuery.data;

  if (!report || !website) return null;

  const chartData = {
    labels: ['SEO', 'Performance', 'Security', 'Accessibility', 'Sentiment'],
    datasets: [
      {
        label: 'Scores',
        data: [
          report.seoScore,
          report.performanceScore,
          report.securityScore,
          report.accessibilityScore,
          report.sentimentScore,
        ],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Website Analysis Scores',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  const handleExport = () => {
    const reportData = {
      url: website.url,
      generatedAt: new Date().toISOString(),
      scores: {
        seo: report.seoScore,
        performance: report.performanceScore,
        security: report.securityScore,
        accessibility: report.accessibilityScore,
        sentiment: report.sentimentScore,
      },
      details: report.details,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `website-analysis-${id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analysis Report</h1>
          <p className="text-muted-foreground mt-1">
            {website.url}
          </p>
        </div>
        <Button onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <Bar data={chartData} options={chartOptions} className="max-h-96" />
        </CardContent>
      </Card>

      <Tabs defaultValue="seo" className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="seo">
            <Search className="h-4 w-4 mr-2" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="performance">
            <Zap className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="accessibility">
            <Accessibility className="h-4 w-4 mr-2" />
            Accessibility
          </TabsTrigger>
          <TabsTrigger value="sentiment">
            <MessageSquare className="h-4 w-4 mr-2" />
            Sentiment
          </TabsTrigger>
        </TabsList>

        <TabsContent value="seo">
          <DetailSection
            title="SEO Analysis"
            score={report.seoScore}
            issues={report.details.seo.issues}
            suggestions={report.details.seo.suggestions}
          />
        </TabsContent>

        <TabsContent value="performance">
          <DetailSection
            title="Performance Analysis"
            score={report.performanceScore}
            issues={report.details.performance.issues}
            suggestions={report.details.performance.suggestions}
          />
        </TabsContent>

        <TabsContent value="security">
          <DetailSection
            title="Security Analysis"
            score={report.securityScore}
            issues={report.details.security.issues}
            suggestions={report.details.security.suggestions}
          />
        </TabsContent>

        <TabsContent value="accessibility">
          <DetailSection
            title="Accessibility Analysis"
            score={report.accessibilityScore}
            issues={report.details.accessibility.issues}
            suggestions={report.details.accessibility.suggestions}
          />
        </TabsContent>

        <TabsContent value="sentiment">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Content Sentiment Analysis
                <span className="text-2xl font-bold">{report.sentimentScore}/100</span>
              </CardTitle>
              <CardDescription>
                Analysis of your website's content tone and emotional impact
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Overall Tone</h4>
                <p className="text-muted-foreground">{report.details.sentiment.tone}</p>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium mb-2">Suggestions for Improvement</h4>
                <ul className="list-disc pl-4 space-y-2">
                  {report.details.sentiment.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-muted-foreground">
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DetailSection({
  title,
  score,
  issues,
  suggestions,
}: {
  title: string;
  score: number;
  issues: string[];
  suggestions: string[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <span className="text-2xl font-bold">{score}/100</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-medium mb-2">Issues Found</h4>
          <ul className="list-disc pl-4 space-y-2">
            {issues.map((issue, index) => (
              <li key={index} className="text-muted-foreground">
                {issue}
              </li>
            ))}
          </ul>
        </div>
        <Separator />
        <div>
          <h4 className="font-medium mb-2">Suggested Improvements</h4>
          <ul className="list-disc pl-4 space-y-2">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="text-muted-foreground">
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
