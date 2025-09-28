import { Link, useLocation } from "react-router-dom";
import { MapPin, FileText, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Plan Trip",
    href: "/plan",
    icon: MapPin,
  },
  {
    title: "Review Logs",
    href: "/logs",
    icon: FileText,
  },
];

export const MobileNavigation = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-eld-nav-bg border-t border-eld-nav-border backdrop-blur-md z-50">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-all duration-200",
                isActive 
                  ? "text-primary bg-primary/10 shadow-[var(--shadow-glow)]" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "animate-pulse-glow")} />
              <span className="text-xs font-medium">{item.title}</span>
            </Link>
          );
        })}
        
        {/* App Branding */}
        <div className="flex flex-col items-center gap-1 py-2 px-4">
          <Truck className="h-5 w-5 text-primary" />
          <span className="text-xs font-medium text-primary">ELD Pro</span>
        </div>
      </div>
    </nav>
  );
};