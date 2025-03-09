import { Report } from "@shared/schema";
import { ReportCard } from "./report-card";

export function ReportMetrics({ report }: { report: Report }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ReportCard
        title="SEO"
        score={report.seoScore}
        description="Search Engine Optimization Analysis"
        issues={report.details.seo.issues}
      />
      <ReportCard
        title="Performance"
        score={report.performanceScore}
        description="Website Speed and Performance"
        issues={report.details.performance.issues}
      />
      <ReportCard
        title="Security"
        score={report.securityScore}
        description="Security Headers and Best Practices"
        issues={report.details.security.issues}
      />
      <ReportCard
        title="Accessibility"
        score={report.accessibilityScore}
        description="Web Accessibility Standards"
        issues={report.details.accessibility.issues}
      />
      <ReportCard
        title="Sentiment"
        score={report.sentimentScore}
        description="Content Tone and Emotional Impact"
        issues={[report.details.sentiment.tone]}
      />
    </div>
  );
}
