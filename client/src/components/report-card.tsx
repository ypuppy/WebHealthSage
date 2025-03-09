import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ReportCardProps {
  title: string;
  score: number;
  description: string;
  issues: string[];
}

export function ReportCard({ title, score, description, issues }: ReportCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <Badge variant={score >= 70 ? "default" : "destructive"}>
            {score}/100
          </Badge>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Progress value={score} className="mb-4" />
        {issues.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Issues Found:</h4>
            <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
              {issues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
