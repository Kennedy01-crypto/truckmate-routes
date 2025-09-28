import { useState, useRef, useEffect } from "react";
import { MapPin, Search, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface LocationSuggestion {
  id: string;
  address: string;
  lat: number;
  lng: number;
  type: string;
}

interface LocationInputProps {
  label: string;
  value: string;
  onChange: (value: string, coordinates?: { lat: number; lng: number }) => void;
  placeholder: string;
  icon?: React.ReactNode;
  variant?: 'current' | 'pickup' | 'dropoff';
  className?: string;
  mapboxToken?: string;
}

export const LocationInput = ({
  label,
  value,
  onChange,
  placeholder,
  icon,
  variant = 'current',
  className,
  mapboxToken
}: LocationInputProps) => {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Real geocoding with Mapbox API
  useEffect(() => {
    if (value.length > 2 && mapboxToken) {
      const timeoutId = setTimeout(async () => {
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(value)}.json?access_token=${mapboxToken}&types=poi,address,place&limit=5`
          );
          const data = await response.json();
          
          const newSuggestions: LocationSuggestion[] = data.features?.map((feature: any, index: number) => ({
            id: `${index}`,
            address: feature.place_name,
            lat: feature.center[1],
            lng: feature.center[0],
            type: feature.properties?.category || feature.place_type?.[0] || 'location'
          })) || [];
          
          setSuggestions(newSuggestions);
          setShowSuggestions(newSuggestions.length > 0);
        } catch (error) {
          console.error('Geocoding error:', error);
          setSuggestions([]);
          setShowSuggestions(false);
        }
      }, 300); // Debounce API calls

      return () => clearTimeout(timeoutId);
    } else if (value.length > 2) {
      // Fallback mock suggestions when no token
      const mockSuggestions: LocationSuggestion[] = [
        {
          id: '1',
          address: `${value} - Interstate 95, Mile Marker 45`,
          lat: 40.7128,
          lng: -74.0060,
          type: 'highway'
        },
        {
          id: '2', 
          address: `${value} - Distribution Center`,
          lat: 40.7580,
          lng: -73.9855,
          type: 'facility'
        },
        {
          id: '3',
          address: `${value} - Truck Stop & Fuel`,
          lat: 40.6892,
          lng: -74.0445,
          type: 'fuel'
        }
      ];
      setSuggestions(mockSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    
    setIsValid(value.length > 5); // Updated validation
  }, [value, mapboxToken]);

  const handleSuggestionClick = (suggestion: LocationSuggestion) => {
    onChange(suggestion.address, { lat: suggestion.lat, lng: suggestion.lng });
    setShowSuggestions(false);
    setIsValid(true);
  };

  const clearInput = () => {
    onChange('');
    setIsValid(false);
    inputRef.current?.focus();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'current':
        return 'border-success focus:ring-success/20';
      case 'pickup':
        return 'border-warning focus:ring-warning/20';
      case 'dropoff':
        return 'border-primary focus:ring-primary/20';
      default:
        return 'border-border focus:ring-primary/20';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'current':
        return 'text-success';
      case 'pickup':
        return 'text-warning';
      case 'dropoff':
        return 'text-primary';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className={cn("relative", className)}>
      <label className="block text-sm font-medium mb-2">{label}</label>
      
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
          {icon || <MapPin className={cn("h-4 w-4", getIconColor())} />}
        </div>
        
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "pl-10 pr-10 transition-all duration-200",
            getVariantStyles(),
            isValid && "border-success",
            "eld-input"
          )}
        />
        
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {isValid && (
            <Check className="h-4 w-4 text-success" />
          )}
          {value && (
            <button
              onClick={clearInput}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {!value && (
            <Search className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto animate-slide-up">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border last:border-0"
            >
              <div className="flex items-start gap-3">
                <MapPin className={cn("h-4 w-4 mt-1 flex-shrink-0", getIconColor())} />
                <div>
                  <p className="text-sm font-medium">{suggestion.address}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {suggestion.type} • {suggestion.lat.toFixed(4)}, {suggestion.lng.toFixed(4)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};