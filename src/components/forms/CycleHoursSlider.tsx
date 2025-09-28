import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CycleHoursSliderProps {
  value: number;
  onChange: (value: number) => void;
  maxHours?: number;
  className?: string;
}

export const CycleHoursSlider = ({
  value,
  onChange,
  maxHours = 70,
  className
}: CycleHoursSliderProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleValueChange = (newValue: number[]) => {
    onChange(newValue[0]);
  };

  const getStatusColor = () => {
    const percentage = (value / maxHours) * 100;
    if (percentage >= 90) return 'text-destructive';
    if (percentage >= 75) return 'text-warning';
    return 'text-success';
  };

  const getStatusIcon = () => {
    const percentage = (value / maxHours) * 100;
    if (percentage >= 90) return <AlertTriangle className="h-4 w-4" />;
    if (percentage >= 75) return <Clock className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  const getRemainingHours = () => {
    return Math.max(0, maxHours - value);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Current Cycle Used (Hours)</label>
        <div className={cn("flex items-center gap-2", getStatusColor())}>
          {getStatusIcon()}
          <span className="text-sm font-medium">{value}/{maxHours} hrs</span>
        </div>
      </div>

      {/* Slider Container */}
      <div className="relative">
        <Slider
          value={[value]}
          onValueChange={handleValueChange}
          max={maxHours}
          min={0}
          step={0.5}
          className="w-full"
          onPointerDown={() => setIsDragging(true)}
          onPointerUp={() => setIsDragging(false)}
        />
        
        {/* Hour Markers */}
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>0</span>
          <span>17.5</span>
          <span>35</span>
          <span>52.5</span>
          <span>70</span>
        </div>
      </div>

      {/* Status Display */}
      <div className="eld-card p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Hours Remaining</p>
            <p className={cn("text-lg font-bold", getStatusColor())}>
              {getRemainingHours().toFixed(1)}h
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">70/8 Day Cycle</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 bg-muted rounded-full h-2">
                <div 
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    value >= maxHours * 0.9 ? "bg-destructive" :
                    value >= maxHours * 0.75 ? "bg-warning" : "bg-success"
                  )}
                  style={{ width: `${Math.min((value / maxHours) * 100, 100)}%` }}
                />
              </div>
              <span className="text-xs font-medium">
                {Math.round((value / maxHours) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Warning Messages */}
        {value >= maxHours * 0.9 && (
          <div className="mt-3 p-2 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-xs text-destructive font-medium">
              ⚠️ Approaching 70-hour limit - Plan mandatory rest period
            </p>
          </div>
        )}
        
        {value >= maxHours * 0.75 && value < maxHours * 0.9 && (
          <div className="mt-3 p-2 bg-warning/10 border border-warning/20 rounded-lg">
            <p className="text-xs text-warning font-medium">
              ⏰ Monitor hours closely - {getRemainingHours().toFixed(1)} hours until limit
            </p>
          </div>
        )}
      </div>

      {/* Quick Set Buttons */}
      <div className="grid grid-cols-4 gap-2">
        {[10, 20, 30, 40].map((hours) => (
          <button
            key={hours}
            onClick={() => onChange(hours)}
            className={cn(
              "px-3 py-2 text-xs rounded-lg border transition-all",
              value === hours 
                ? "bg-primary text-primary-foreground border-primary" 
                : "bg-card border-border hover:bg-muted"
            )}
          >
            {hours}h
          </button>
        ))}
      </div>
    </div>
  );
};