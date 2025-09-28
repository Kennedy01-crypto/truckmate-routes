import { useEffect, useRef, useState, useCallback } from "react";
import {
  Map,
  config,
  Marker,
  LngLatBounds,
  ControlPosition,
  Style,
} from "@maptiler/sdk";
import { GeocodingControl } from "@maptiler/geocoding-control/maptilersdk";
import { geocoding } from "@maptiler/client";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import "@maptiler/geocoding-control/style.css"; // Don't forget the control's CSS
import { cn } from "@/lib/utils";

// 🚨 SECURITY: Use an environment variable for the API key
config.apiKey = import.meta.env.VITE_MAPTILER_API_KEY || "sZlUOIPXNT9DQqEKzkiW";

interface Location {
  lat: number;
  lng: number;
  address: string;
  type: "current" | "pickup" | "dropoff";
}

interface InteractiveMapProps {
  locations: Location[];
  onLocationSelect: (location: Omit<Location, "type">) => void;
  className?: string;
  showRoute?: boolean;
}

// Helper function for marker color logic
const getMarkerColor = (type: Location["type"]): string => {
  switch (type) {
    case "current":
      return "#28a745"; // Green
    case "pickup":
      return "#ffc107"; // Yellow/Orange
    case "dropoff":
      return "#007bff"; // Blue
    default:
      return "#000000";
  }
};

export const InteractiveMap = ({
  locations,
  onLocationSelect,
  className,
  showRoute = false,
}: InteractiveMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const markers = useRef<Marker[]>([]);
  const geocodingControlRef = useRef<GeocodingControl | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Consolidated state for display coordinates
  const [mapCenter, setMapCenter] = useState({
    lng: -70.9,
    lat: 42.35,
    zoom: 9,
  });

  // Use useCallback to memoize the click handler (good practice for dependencies)
  const handleMapClick = useCallback(
    async (e: any) => {
      const { lng, lat } = e.lngLat;
      try {
        // Use the client library for reverse geocoding
        const results = await geocoding.reverse([lng, lat]);
        if (results.features.length > 0) {
          onLocationSelect({
            lat,
            lng,
            address: results.features[0].place_name,
          });
        }
      } catch (error) {
        console.error("Error during reverse geocoding:", error);
        // Optional: Add user feedback here (e.g., a toast notification)
      }
    },
    [onLocationSelect]
  );

  // Effect for Map Initialization and Event Listeners
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    // 1. Initialize the Map
    const initialCenter = [mapCenter.lng, mapCenter.lat] as [number, number];
    map.current = new Map({
      container: mapContainer.current,
      style: Style.STREETS,
      center: initialCenter,
      zoom: mapCenter.zoom,
    });

    const mapInstance = map.current;

    mapInstance.on('load', () => {
      setIsMapLoaded(true);
    });

    // 2. Add Geocoding Control (Search Bar)
    geocodingControlRef.current = new GeocodingControl({
      country: "US", // Example: Restrict search to the US
      placeholder: "Search for an address...",
    });
    mapInstance.addControl(
      geocodingControlRef.current,
      "top-left" as ControlPosition
    );

    // 3. Add Search Result Listener
    geocodingControlRef.current.on("pick", (event) => {
      const feature = event.feature;
      // Ensure the geometry is a Point before accessing coordinates
      if (feature.geometry.type === "Point") {
        const [lng, lat] = feature.geometry.coordinates;
        onLocationSelect({
          lat,
          lng,
          address: feature.place_name,
        });
      }
    });

    // 4. Add Move Listener (for display coordinates)
    const moveHandler = () => {
      setMapCenter({
        lng: parseFloat(mapInstance.getCenter().lng.toFixed(4)),
        lat: parseFloat(mapInstance.getCenter().lat.toFixed(4)),
        zoom: parseFloat(mapInstance.getZoom().toFixed(2)),
      });
    };
    mapInstance.on("move", moveHandler);

    // 5. Add Click Listener (for location selection)
    mapInstance.on("click", handleMapClick);

    // 6. Cleanup function
    return () => {
      if (mapInstance) {
        mapInstance.off("move", moveHandler);
        mapInstance.off("click", handleMapClick);

        if (geocodingControlRef.current) {
          mapInstance.removeControl(geocodingControlRef.current);
        }

        mapInstance.remove();
        map.current = null;
      }
    };
  }, [
    mapCenter.lng,
    mapCenter.lat,
    mapCenter.zoom,
    handleMapClick,
    onLocationSelect,
  ]);

  // Effect for Marker Management and Map Fitting
  useEffect(() => {
    const mapInstance = map.current;
    if (!mapInstance || !isMapLoaded) return;

    // Clear existing markers
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    // Add new markers
    locations.forEach((location) => {
      const color = getMarkerColor(location.type);
      const marker = new Marker({ color })
        .setLngLat([location.lng, location.lat])
        .addTo(mapInstance);
      markers.current.push(marker);
    });

    // Fit map to bounds if locations exist
    if (locations.length > 0) {
      const bounds = new LngLatBounds();
      locations.forEach((location) => {
        bounds.extend([location.lng, location.lat]);
      });
      mapInstance.fitBounds(bounds, {
        padding: 100,
        maxZoom: 15,
        duration: 1000,
      });
    }
  }, [locations, isMapLoaded]);

  // Effect for Route Drawing (Straight Line Route)
  useEffect(() => {
    const mapInstance = map.current;
    if (!mapInstance || !isMapLoaded) return;

    const sourceId = "route";
    const layerId = "route-layer";

    // Cleanup existing route layers/sources
    if (mapInstance.getLayer(layerId)) {
      mapInstance.removeLayer(layerId);
    }
    if (mapInstance.getSource(sourceId)) {
      mapInstance.removeSource(sourceId);
    }

    if (showRoute && locations.length > 1) {
      const coordinates = locations.map((loc) => [loc.lng, loc.lat]);

      // Add the GeoJSON source for the straight line route
      mapInstance.addSource(sourceId, {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: coordinates, // Replace with fetched route geometry for real roads
          },
        },
      });

      // Add the route line layer
      mapInstance.addLayer({
        id: layerId,
        type: "line",
        source: sourceId,
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#007bff",
          "line-width": 5,
          "line-opacity": 0.8,
        },
      });
    }
  }, [locations, showRoute, isMapLoaded]);

  return (
    <div
      className={cn("relative w-full h-full", className)}
      style={{ minHeight: "400px" }}
    >
      <div className="absolute top-0 right-0 m-3 p-2 bg-gray-800 text-white text-xs rounded z-10">
        Longitude: {mapCenter.lng} | Latitude: {mapCenter.lat} | Zoom:{" "}
        {mapCenter.zoom}
      </div>
      <div
        ref={mapContainer}
        className="absolute top-0 right-0 bottom-0 left-0"
      />
    </div>
  );
};