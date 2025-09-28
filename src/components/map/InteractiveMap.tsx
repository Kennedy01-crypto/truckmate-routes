import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Loader2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

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
  mapboxToken?: string;
}

export const InteractiveMap = ({ 
  locations, 
  onLocationSelect, 
  className,
  showRoute = false,
  mapboxToken 
}: InteractiveMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mapInteraction, setMapInteraction] = useState<string | null>(null);
  const [needsToken, setNeedsToken] = useState(!mapboxToken);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) {
      setIsLoading(false);
      return;
    }

    try {
      // Initialize map
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-98.5795, 39.8283], // Center of US
        zoom: 3
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        setIsLoading(false);
      });

      // Handle map clicks for location selection
      map.current.on('click', async (e) => {
        const { lng, lat } = e.lngLat;
        
        try {
          // Reverse geocoding
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}`
          );
          const data = await response.json();
          const address = data.features[0]?.place_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          
          onLocationSelect({ lat, lng, address });
          setMapInteraction(`Selected: ${address}`);
          setTimeout(() => setMapInteraction(null), 3000);
        } catch (error) {
          console.error('Reverse geocoding failed:', error);
          onLocationSelect({ lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
        }
      });

    } catch (error) {
      console.error('Map initialization failed:', error);
      setIsLoading(false);
    }

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, onLocationSelect]);

  // Update markers when locations change
  useEffect(() => {
    if (!map.current || !mapboxToken) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    locations.forEach((location) => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.fontSize = '16px';
      el.style.fontWeight = 'bold';
      el.style.color = 'white';
      el.style.cursor = 'pointer';
      
      switch (location.type) {
        case 'current':
          el.style.backgroundColor = 'hsl(var(--success))';
          el.innerHTML = '📍';
          break;
        case 'pickup':
          el.style.backgroundColor = 'hsl(var(--warning))';
          el.innerHTML = '🚛';
          break;
        case 'dropoff':
          el.style.backgroundColor = 'hsl(var(--primary))';
          el.innerHTML = '🎯';
          break;
      }

      const marker = new mapboxgl.Marker(el)
        .setLngLat([location.lng, location.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`<div style="color: black;"><strong>${location.type.charAt(0).toUpperCase() + location.type.slice(1)}</strong><br/>${location.address}</div>`))
        .addTo(map.current!);

      markersRef.current.push(marker);
    });

    // Fit map to show all locations
    if (locations.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      locations.forEach(location => bounds.extend([location.lng, location.lat]));
      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [locations, mapboxToken]);

  if (needsToken && !mapboxToken) {
    return (
      <div className={cn("eld-map-container relative flex items-center justify-center", className)} style={{ minHeight: '300px' }}>
        <div className="text-center p-6 bg-card border border-border rounded-lg">
          <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Map API Required</h3>
          <p className="text-sm text-muted-foreground mb-4">
            To use real maps, you need a Mapbox token. Get yours from{' '}
            <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              mapbox.com
            </a>
          </p>
          <p className="text-xs text-muted-foreground">
            For now, we'll show a demo map. Add your token in the parent component.
          </p>
        </div>
      </div>
    );
  }

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
        ref={mapContainer}
        className="w-full h-full relative overflow-hidden"
        style={{ minHeight: '300px' }}
      />

      {/* Interaction Feedback */}
      {mapInteraction && (
        <div className="absolute top-4 left-4 bg-card border border-border rounded-lg px-3 py-2 animate-slide-up z-10">
          <div className="flex items-center gap-2">
            <Navigation className="h-4 w-4 text-primary" />
            <span className="text-sm">{mapInteraction}</span>
          </div>
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3 z-10">
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