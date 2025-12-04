import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
  rightPanel?: ReactNode;
}

export const DashboardLayout = ({ children, rightPanel }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-[220px] flex">
        <main className="flex-1 p-8">{children}</main>
        {rightPanel && (
          <aside className="w-[420px] bg-[hsl(var(--panel-bg))] p-6 sticky top-0 h-screen overflow-y-auto shadow-2xl">
            {rightPanel}
          </aside>
        )}
      </div>
    </div>
  );
};
