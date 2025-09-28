import { useState } from "react";
import { useMap } from "@/context/MapContext";
import { InteractiveMap } from "@/components/map/InteractiveMap";
import { LocationInput } from "@/components/forms/LocationInput";
import { CycleHoursSlider } from "@/components/forms/CycleHoursSlider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Navigation, Clock, Route, Truck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Location {
  lat: number;
  lng: number;
  address: string;
  type: 'current' | 'pickup' | 'dropoff';
}

export default function PlanTrip() {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [currentLocation, setCurrentLocation] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [cycleHours, setCycleHours] = useState(35.5);
  const [mapLocations, setMapLocations] = useState<Location[]>([]);
  const { addMarker, drawRoute } = useMap();
  const [isCalculating, setIsCalculating] = useState(false);

  const handleLocationChange = (
    type: 'current' | 'pickup' | 'dropoff',
    address: string,
    coordinates?: { lat: number; lng: number }
  ) => {
    switch (type) {
      case 'current':
        setCurrentLocation(address);
        break;
      case 'pickup':
        setPickupLocation(address);
        break;
      case 'dropoff':
        setDropoffLocation(address);
        break;
    }

      if (coordinates) {
        const newLocation = { ...coordinates, address, type };
        addMarker(newLocation);      
        setMapLocations(prev => {
          const filtered = prev.filter(loc => loc.type !== type);
          const updatedLocations = [...filtered, newLocation];
          if (updatedLocations.length >= 2) {
            drawRoute(updatedLocations);
          }
          return updatedLocations;
      });
    }
  };

  const handleMapLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    toast({
      title: "Location Selected",
      description: `Click on a location input field, then select this point: ${location.address}`
    });
  };

  const handlePlanTrip = async () => {
    if (!currentLocation || !pickupLocation || !dropoffLocation) {
      toast({
        title: "Missing Information",
        description: "Please fill in all location fields before planning the trip.",
        variant: "destructive"
      });
      return;
    }

    setIsCalculating(true);
    
    // Simulate API call for route calculation
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Trip Planned Successfully",
        description: "ELD logs and route have been calculated. Redirecting to review..."
      });
      
      // Store trip data (in real app, this would be in state management/backend)
      const tripData = {
        currentLocation,
        pickupLocation, 
        dropoffLocation,
        cycleHours,
        mapLocations,
        plannedAt: new Date().toISOString()
      };
      
      localStorage.setItem('currentTrip', JSON.stringify(tripData));
      
      setTimeout(() => {
        navigate('/logs');
      }, 1000);
      
    } catch (error) {
      toast({
        title: "Planning Error",
        description: "Failed to calculate trip. Please check your inputs and try again.",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden">
      {/* Map Section */}
      <div className="lg:w-2/3 h-64 lg:h-full">
        <InteractiveMap
          onLocationSelect={handleMapLocationSelect}
          className="h-full"
        />
      </div>

      {/* Input Panel */}
      <div className="lg:w-1/3 flex-1 overflow-y-auto">
        <div className="p-4 lg:p-6 space-y-6">
          {/* Header */}
          <div className="text-center lg:text-left">
            <h1 className="text-2xl font-bold eld-gradient-text mb-2">Plan Your Trip</h1>
            <p className="text-muted-foreground text-sm">
              Enter locations and cycle hours to generate compliant ELD logs
            </p>
          </div>

          {/* Location Inputs */}
          <Card className="eld-card p-4 space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Trip Locations</h2>
            </div>

            <LocationInput
              label="Current Location"
              value={currentLocation}
              onChange={(value, coords) => handleLocationChange('current', value, coords)}
              placeholder="Enter your current location..."
              variant="current"
              icon={<Navigation className="h-4 w-4" />}
            />

            <LocationInput
              label="Pickup Location" 
              value={pickupLocation}
              onChange={(value, coords) => handleLocationChange('pickup', value, coords)}
              placeholder="Enter pickup location..."
              variant="pickup"
              icon={<Truck className="h-4 w-4" />}
            />

            <LocationInput
              label="Drop-off Location"
              value={dropoffLocation}
              onChange={(value, coords) => handleLocationChange('dropoff', value, coords)}
              placeholder="Enter drop-off location..."
              variant="dropoff"
              icon={<Route className="h-4 w-4" />}
            />
          </Card>

          {/* Cycle Hours */}
          <Card className="eld-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Hours of Service</h2>
            </div>
            
            <CycleHoursSlider
              value={cycleHours}
              onChange={setCycleHours}
            />
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={handlePlanTrip}
              disabled={isCalculating}
              className="w-full eld-button-primary py-6 text-lg font-semibold"
            >
              {isCalculating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2"></div>
                  Calculating HOS Compliance...
                </>
              ) : (
                <>
                  <Route className="h-5 w-5 mr-2" />
                  Plan Trip & Generate Logs
                </>
              )}
            </Button>

            <Button 
              variant="outline"
              className="w-full eld-button-secondary"
              onClick={() => {
                setCurrentLocation("");
                setPickupLocation("");
                setDropoffLocation("");
                setCycleHours(0);
                setMapLocations([]);
              }}
            >
              Clear All Fields
            </Button>
          </div>

          {/* Trip Summary */}
          {mapLocations.length > 0 && (
            <Card className="eld-card p-4 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <h3 className="font-semibold mb-2 text-primary">Trip Summary</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-muted-foreground">Locations:</span> {mapLocations.length} points</p>
                <p><span className="text-muted-foreground">Cycle Hours:</span> {cycleHours}/70 hours</p>
                <p><span className="text-muted-foreground">Remaining:</span> {(70 - cycleHours).toFixed(1)} hours</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
