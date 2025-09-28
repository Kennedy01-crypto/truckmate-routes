import { Link, useLocation } from "react-router-dom";
import { MapPin, FileText, Truck, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  {
    title: "Plan Trip",
    href: "/plan",
    icon: MapPin,
    description: "Plan routes and manage trip details"
  },
  {
    title: "Review Logs",
    href: "/logs", 
    icon: FileText,
    description: "View and manage ELD logs"
  },
];

interface DesktopNavigationProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const DesktopNavigation = ({ isOpen, onToggle }: DesktopNavigationProps) => {
  const location = useLocation();

  return (
    <>
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 bg-card border border-border hover:bg-muted"
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Sidebar */}
      <aside className={cn(
        "bg-card border-r border-border transition-all duration-300 flex flex-col",
        isOpen ? "w-64" : "w-16"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg">
              <Truck className="h-5 w-5 text-primary-foreground" />
            </div>
            {isOpen && (
              <div className="animate-fade-in">
                <h1 className="font-bold text-lg eld-gradient-text">ELD Pro</h1>
                <p className="text-xs text-muted-foreground">Electronic Logging Device</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]" 
                        : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <item.icon className={cn(
                      "h-5 w-5 flex-shrink-0",
                      isActive && "animate-pulse-glow"
                    )} />
                    {isOpen && (
                      <div className="animate-fade-in">
                        <p className="font-medium">{item.title}</p>
                        <p className="text-xs opacity-70">{item.description}</p>
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div className={cn(
            "text-center text-xs text-muted-foreground",
            !isOpen && "hidden"
          )}>
            <p className="eld-gradient-text font-medium">Professional ELD System</p>
            <p>v2.1.0</p>
          </div>
        </div>
      </aside>
    </>
  );
};