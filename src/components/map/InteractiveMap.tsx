import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Location {
  lat: number;
  lng: number;
  address: string;
  type: 'current' | 'pickup' | 'dropoff';
}

interface InteractiveMapProps {
  locations: Location[];
  onLocationSelect: (location: Omit<Location, 'type'>) => void;
  className?: string;
  showRoute?: boolean;
}

export const InteractiveMap = ({ 
  locations, 
  onLocationSelect, 
  className,
  showRoute = false 
}: InteractiveMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapInteraction, setMapInteraction] = useState<string | null>(null);

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isLoading) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    
    // Simulate coordinate conversion
    const lat = 40.7128 + (y - 50) * 0.1;
    const lng = -74.0060 + (x - 50) * 0.1;
    
    // Simulate reverse geocoding
    const address = `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    
    onLocationSelect({ lat, lng, address });
    setMapInteraction(`Selected: ${address}`);
    
    setTimeout(() => setMapInteraction(null), 2000);
  };

  return (
    <div className={cn("eld-map-container relative", className)}>
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-eld-map-bg/90 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}

      {/* Map Canvas */}
      <div 
        ref={mapRef}
        className="w-full h-full bg-gradient-to-br from-eld-map-bg to-card cursor-crosshair relative overflow-hidden"
        onClick={handleMapClick}
        style={{ minHeight: '300px' }}
      >
        {/* Grid Pattern for Visual Appeal */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" className="text-primary">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Location Markers */}
        {!isLoading && locations.map((location, index) => (
          <div
            key={index}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-fade-in"
            style={{
              left: `${50 + (location.lng + 74.0060) * 500}%`,
              top: `${50 + (40.7128 - location.lat) * 500}%`,
            }}
          >
            <div className={cn(
              "relative flex items-center justify-center w-8 h-8 rounded-full border-2 shadow-lg",
              location.type === 'current' && "bg-success border-success-foreground",
              location.type === 'pickup' && "bg-warning border-warning-foreground", 
              location.type === 'dropoff' && "bg-primary border-primary-foreground"
            )}>
              <MapPin className="h-4 w-4 text-white" />
              
              {/* Label */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                <div className="bg-card border border-border rounded px-2 py-1 text-xs">
                  {location.type === 'current' && 'Current'}
                  {location.type === 'pickup' && 'Pickup'}
                  {location.type === 'dropoff' && 'Drop-off'}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Route Line */}
        {!isLoading && showRoute && locations.length >= 2 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--primary) / 0.6)" />
              </linearGradient>
            </defs>
            {locations.slice(1).map((location, index) => {
              const prevLocation = locations[index];
              const x1 = 50 + (prevLocation.lng + 74.0060) * 500;
              const y1 = 50 + (40.7128 - prevLocation.lat) * 500;
              const x2 = 50 + (location.lng + 74.0060) * 500;
              const y2 = 50 + (40.7128 - location.lat) * 500;
              
              return (
                <line
                  key={index}
                  x1={`${x1}%`}
                  y1={`${y1}%`}
                  x2={`${x2}%`}
                  y2={`${y2}%`}
                  stroke="url(#routeGradient)"
                  strokeWidth="3"
                  strokeDasharray="10 5"
                  className="animate-route-draw"
                />
              );
            })}
          </svg>
        )}

        {/* Interaction Feedback */}
        {mapInteraction && (
          <div className="absolute top-4 left-4 bg-card border border-border rounded-lg px-3 py-2 animate-slide-up">
            <div className="flex items-center gap-2">
              <Navigation className="h-4 w-4 text-primary" />
              <span className="text-sm">{mapInteraction}</span>
            </div>
          </div>
        )}

        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button className="bg-card border border-border rounded-lg p-2 hover:bg-muted transition-colors">
            <span className="text-lg font-bold">+</span>
          </button>
          <button className="bg-card border border-border rounded-lg p-2 hover:bg-muted transition-colors">
            <span className="text-lg font-bold">−</span>
          </button>
        </div>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3">
        <h3 className="text-xs font-medium mb-2">Legend</h3>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-success"></div>
            <span>Current Location</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-warning"></div>
            <span>Pickup Point</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <span>Drop-off Point</span>
          </div>
        </div>
      </div>
    </div>
  );
};