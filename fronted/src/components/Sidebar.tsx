import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { Upload, TrendingUp, Bookmark, Settings, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Upload & Strategy",
    icon: Upload,
    href: "/",
  },
  {
    title: "Backtest Results",
    icon: TrendingUp,
    href: "/backtest",
  },
  {
    title: "Saved Reports",
    icon: Bookmark,
    href: "/saved-reports",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/settings",
  },
];

export const Sidebar = () => {
  const location = useLocation();
  const [hasNewReport, setHasNewReport] = React.useState(false);

  React.useEffect(() => {
    // Check if there's a new saved report
    const checkNewReport = () => {
      const hasNew = localStorage.getItem("hasNewSavedReport") === "true";
      setHasNewReport(hasNew);
    };

    checkNewReport();

    // Listen for new report saves
    window.addEventListener("reportSaved", checkNewReport);
    return () => window.removeEventListener("reportSaved", checkNewReport);
  }, []);

  // Clear notification when user visits Saved Reports page
  React.useEffect(() => {
    if (location.pathname === "/saved-reports" && hasNewReport) {
      localStorage.removeItem("hasNewSavedReport");
      setHasNewReport(false);
    }
  }, [location.pathname, hasNewReport]);

  return (
    <aside className="w-[280px] h-screen bg-sidebar border-r border-sidebar-border flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center group-hover:opacity-90 transition-all">
            <img src="/logo.jpg" alt="ChimeraMatrix Logo" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base text-sidebar-primary group-hover:text-sidebar-primary/90 transition-colors leading-none">
              ChimeraMatrix
            </span>
            <span className="text-[10px] text-sidebar-foreground/60 leading-none mt-0.5">
              Predictive Content Intelligence
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.title}
                  {item.href === "/saved-reports" && hasNewReport && (
                    <span className="absolute right-3 w-2 h-2 bg-accent rounded-full animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};
