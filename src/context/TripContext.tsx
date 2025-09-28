import { createContext, useState, useEffect, useContext, ReactNode, useRef } from "react";
import { Map, Marker, LngLatBounds } from "@maptiler/sdk";
import { geocoding } from "@maptiler/client";

interface TripData {
  currentLocation: string;
  pickupLocation: string;
  dropoffLocation: string;
  cycleHours: number;
  mapLocations: any[];
  plannedAt: string;
}

interface TripContextType {
  tripData: TripData | null;
  setTripData: (data: TripData | null) => void;
  updateCurrentLocation: (location: string) => void;
  updatePickupLocation: (location: string) => void;
  updateDropoffLocation: (location: string) => void;
  updateCycleHours: (hours: number) => void;
  planTrip: (locations: any[]) => void;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export const TripProvider = ({ children }: { children: ReactNode }) => {
  const [tripData, setTripData] = useState<TripData | null>(() => {
    const storedTripData = localStorage.getItem("tripData");
    return storedTripData ? JSON.parse(storedTripData) : null;
  });

  useEffect(() => {
    if (tripData) {
      localStorage.setItem("tripData", JSON.stringify(tripData));
    } else {
      localStorage.removeItem("tripData");
    }
  }, [tripData]);

  const updateCurrentLocation = (location: string) => {
    setTripData(prevData => ({ ...prevData!, currentLocation: location }));
  };

  const updatePickupLocation = (location: string) => {
    setTripData(prevData => ({ ...prevData!, pickupLocation: location }));
  };

  const updateDropoffLocation = (location: string) => {
    setTripData(prevData => ({ ...prevData!, dropoffLocation: location }));
  };

  const updateCycleHours = (hours: number) => {
    setTripData(prevData => ({ ...prevData!, cycleHours: hours }));
  };

  const planTrip = (locations: any[]) => {
    setTripData(prevData => ({
      ...prevData!,
      mapLocations: locations,
      plannedAt: new Date().toISOString(),
    }));
  };

  return (
    <TripContext.Provider
      value={{
        tripData,
        setTripData,
        updateCurrentLocation,
        updatePickupLocation,
        updateDropoffLocation,
        updateCycleHours,
        planTrip,
      }}
    >
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => {
  const context = useContext(TripContext);
  if (context === undefined) {
    throw new Error("useTrip must be used within a TripProvider");
  }
  return context;
};
