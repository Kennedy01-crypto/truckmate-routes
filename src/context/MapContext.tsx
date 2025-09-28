import { createContext, useContext, useRef, useState, ReactNode, useCallback } from "react";
import { Map, Marker, LngLatBounds, config } from "@maptiler/sdk";
import { geocoding } from "@maptiler/client";
import "@maptiler/sdk/dist/maptiler-sdk.css";

config.apiKey = import.meta.env.VITE_MAPTILER_API_KEY || "sZlUOIPXNT9DQqEKzkiW";

interface Location {
  lat: number;
  lng: number;
  address: string;
  type: 'current' | 'pickup' | 'dropoff';
}

interface MapContextType {
  mapContainer: React.RefObject<HTMLDivElement>;
  mapInstance: Map | null;
  initMap: (container: HTMLDivElement) => void;
  addMarker: (location: Location) => void;
  clearMarkers: () => void;
  drawRoute: (locations: Location[]) => void;
}

const MapContext = createContext<MapContextType | null>(null);

export const MapProvider = ({ children }: { children: ReactNode }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<Map | null>(null);
  const markers = useRef<Marker[]>([]);
  const [isMapInitialized, setIsMapInitialized] = useState(false);

  const initMap = (container: HTMLDivElement) => {
    if (mapInstance.current || !container) return;

    mapInstance.current = new Map({
      container,
      style: 'streets',
      center: [-70.9, 42.35],
      zoom: 9
    });

    setIsMapInitialized(true);
  };

  const addMarker = (location: Location) => {
    if (!mapInstance.current || !location) return;

    const color = getMarkerColor(location.type);
    const marker = new Marker({ color })
      .setLngLat([location.lng, location.lat])
      .addTo(mapInstance.current);
    
    markers.current.push(marker);
    fitMapToBounds();
  };

  const clearMarkers = () => {
    markers.current.forEach(marker => marker.remove());
    markers.current = [];
  };

  const drawRoute = (locations: Location[]) => {
    if (!mapInstance.current || locations.length < 2) return;

    const sourceId = 'route';
    const layerId = 'route-layer';

    if (mapInstance.current.getLayer(layerId)) {
      mapInstance.current.removeLayer(layerId);
      mapInstance.current.removeSource(sourceId);
    }

    mapInstance.current.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: locations.map(loc => [loc.lng, loc.lat])
        }
      }
    });

    mapInstance.current.addLayer({
      id: layerId,
      type: 'line',
      source: sourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#007bff',
        'line-width': 5,
        'line-opacity': 0.8
      }
    });

    fitMapToBounds();
  };

  const fitMapToBounds = () => {
    if (!mapInstance.current || markers.current.length === 0) return;

    const bounds = new LngLatBounds();
    markers.current.forEach(marker => bounds.extend(marker.getLngLat()));
    mapInstance.current.fitBounds(bounds, { padding: 100, maxZoom: 15 });
  };

  const getMarkerColor = (type: Location['type']): string => {
    switch (type) {
      case 'current': return '#28a745';
      case 'pickup': return '#ffc107';
      case 'dropoff': return '#007bff';
      default: return '#000000';
    }
  };

  return (
    <MapContext.Provider value={{
      mapContainer,
      mapInstance: mapInstance.current,
      initMap,
      addMarker,
      clearMarkers,
      drawRoute
    }}>
      {children}
    </MapContext.Provider>
  );
};

export const useMap = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMap must be used within a MapProvider');
  }
  return context;
};
