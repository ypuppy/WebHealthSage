import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Website } from "@shared/schema";

export function AnalysisProgress({ website }: { website: Website }) {
  const progress = website.status === "completed" ? 100 : 
                  website.status === "failed" ? 0 : 50;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analysis Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <Progress value={progress} className="w-full" />
        <p className="mt-2 text-sm text-muted-foreground capitalize">
          Status: {website.status}
        </p>
      </CardContent>
    </Card>
  );
}
