import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";

export default function Settings() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      <Card className="p-8">
        <p className="text-muted-foreground text-center py-12">
          Settings page coming soon...
        </p>
      </Card>
    </DashboardLayout>
  );
}
