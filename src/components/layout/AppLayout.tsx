import { useState } from "react";
import { Outlet } from "react-router-dom";
import { MobileNavigation } from "./MobileNavigation";
import { DesktopNavigation } from "./DesktopNavigation";
import { useIsMobile } from "@/hooks/use-mobile";

export const AppLayout = () => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Desktop Layout */}
      {!isMobile && (
        <div className="flex h-screen">
          <DesktopNavigation isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-hidden">
            <Outlet />
          </main>
        </div>
      )}

      {/* Mobile Layout */}
      {isMobile && (
        <div className="flex flex-col h-screen">
          <main className="flex-1 overflow-hidden pb-20">
            <Outlet />
          </main>
          <MobileNavigation />
        </div>
      )}
    </div>
  );
};