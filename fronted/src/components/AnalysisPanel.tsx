import { Card } from "./ui/card";
import { Badge } from "./ui/badge";

interface AnalysisData {
  category: string;
  emotion: string;
  visualStyle: string;
  keywords: string[];
  audience: string;
  hookType: string;
}

interface AnalysisPanelProps {
  data: AnalysisData | null;
}

export const AnalysisPanel = ({ data }: AnalysisPanelProps) => {
  if (!data) {
    return (
      <Card className="p-6 h-full">
        <h3 className="text-sm font-semibold text-foreground mb-4">
          AI Analysis Summary
        </h3>
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">
            Upload a video to see AI analysis
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 h-full">
      <h3 className="text-sm font-semibold text-foreground mb-6">
        AI Analysis Summary
      </h3>

      <div className="space-y-5">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Category</p>
          <Badge variant="secondary" className="text-sm">
            {data.category}
          </Badge>
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Emotion</p>
          <p className="text-sm text-foreground">{data.emotion}</p>
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Visual Style</p>
          <p className="text-sm text-foreground leading-relaxed">{data.visualStyle}</p>
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Keywords</p>
          <div className="flex flex-wrap gap-2">
            {data.keywords.map((keyword) => (
              <Badge key={keyword} variant="outline" className="text-xs">
                {keyword}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Target Audience</p>
          <p className="text-sm text-foreground">{data.audience}</p>
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Top Hook Type</p>
          <Badge className="text-sm bg-primary">{data.hookType}</Badge>
        </div>
      </div>
    </Card>
  );
};
