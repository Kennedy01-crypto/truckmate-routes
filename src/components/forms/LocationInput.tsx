import { useState, useRef, useEffect } from "react";
import { MapPin, Search, X, Check, Loader } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { geocoding, type GeocodingResult } from "@maptiler/client";
import { config } from "@maptiler/sdk";

// Configure the API key
config.apiKey = import.meta.env.VITE_MAPTILER_API_KEY || "sZlUOIPXNT9DQqEKzkiW";

// Custom hook for debouncing
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface LocationInputProps {
  label: string;
  value: string;
  onChange: (value: string, coordinates?: { lat: number; lng: number }) => void;
  placeholder: string;
  icon?: React.ReactNode;
  variant?: 'current' | 'pickup' | 'dropoff';
  className?: string;
}

export const LocationInput = ({
  label,
  value,
  onChange,
  placeholder,
  icon,
  variant = 'current',
  className
}: LocationInputProps) => {
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedSearchTerm = useDebounce(value, 500);

  useEffect(() => {
    if (debouncedSearchTerm.length > 2) {
      const fetchSuggestions = async () => {
        setIsLoading(true);
        try {
          const results = await geocoding.forward(debouncedSearchTerm, {
            country: ["US"],
            types: ["address", "street", "poi"],
          });
          setSuggestions(results.features);
          setShowSuggestions(true);
        } catch (error) {
          console.error("Error fetching geocoding suggestions:", error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      };
      fetchSuggestions();
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    setIsValid(value.length > 10); // Simple validation, can be improved
  }, [debouncedSearchTerm]);

  const handleSuggestionClick = (suggestion: GeocodingResult) => {
    const [lng, lat] = suggestion.center;
    onChange(suggestion.place_name, { lat, lng });
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
          {isLoading ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {isValid && <Check className="h-4 w-4 text-success" />}
              {value && (
                <button
                  onClick={clearInput}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {!value && <Search className="h-4 w-4 text-muted-foreground" />}
            </>
          )}
        </div>
      </div>

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
                  <p className="text-sm font-medium">{suggestion.place_name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {suggestion.place_type.join(', ')}
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
