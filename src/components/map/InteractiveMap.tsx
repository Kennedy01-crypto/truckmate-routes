import { useEffect, useCallback } from "react";
import { GeocodingControl } from "@maptiler/geocoding-control/maptilersdk";
import { geocoding } from "@maptiler/client";
import "@maptiler/geocoding-control/style.css";
import { cn } from "@/lib/utils";
import { useMap } from "@/context/MapContext";

interface InteractiveMapProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  className?: string;
}

export const InteractiveMap = ({ onLocationSelect, className }: InteractiveMapProps) => {
  const { mapContainer, mapInstance, initMap } = useMap();

  const handleMapClick = useCallback(
    async (e: any) => {
      const { lng, lat } = e.lngLat;
      try {
        const results = await geocoding.reverse([lng, lat]);
        if (results.features.length > 0) {
          onLocationSelect({
            lat,
            lng,
            address: results.features[0].place_name,
          });
        }
      } catch (error) {
        console.error("Reverse geocoding failed:", error);
      }
    },
    [onLocationSelect]
  );

  useEffect(() => {
    if (!mapContainer.current || !mapInstance) return;

    const currentMap = mapInstance;
    const geocodingControl = new GeocodingControl({
      country: "US",
      placeholder: "Search for an address...",
    });

    currentMap.addControl(geocodingControl, "top-left");
    currentMap.on("click", handleMapClick);

    geocodingControl.on("pick", (event) => {
      const feature = event.feature;
      if (feature.geometry.type === "Point") {
        const [lng, lat] = feature.geometry.coordinates;
        onLocationSelect({
          lat,
          lng,
          address: feature.place_name,
        });
      }
    });

    return () => {
      currentMap.off("click", handleMapClick);
      currentMap.removeControl(geocodingControl);
    };
  }, [mapInstance, handleMapClick, onLocationSelect]);

  useEffect(() => {
    if (mapContainer.current && !mapInstance) {
      initMap(mapContainer.current);
    }
  }, [mapContainer, mapInstance, initMap]);

  return (
    <div className={cn("relative w-full h-full", className)} style={{ minHeight: "400px" }}>
      <div ref={mapContainer} className="absolute top-0 right-0 bottom-0 left-0" />
    </div>
  );
};
