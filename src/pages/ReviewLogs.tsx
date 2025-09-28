import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  Share2, 
  Edit, 
  Calendar, 
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Printer
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { InteractiveMap } from "@/components/map/InteractiveMap";

interface TripData {
  currentLocation: string;
  pickupLocation: string;
  dropoffLocation: string;
  cycleHours: number;
  mapLocations: any[];
  plannedAt: string;
}

interface ELDLog {
  id: string;
  date: string;
  drivingTime: number;
  onDutyTime: number;
  sleeperTime: number;
  offDutyTime: number;
  segments: LogSegment[];
}

interface LogSegment {
  startTime: string;
  endTime: string;
  status: 'driving' | 'onduty' | 'sleeper' | 'offduty';
  location: string;
  duration: number;
}

export default function ReviewLogs() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [tripData, setTripData] = useState<TripData | null>(null);
  const [eldLogs, setEldLogs] = useState<ELDLog[]>([]);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    // Load trip data from localStorage (in real app, from state management/API)
    const stored = localStorage.getItem('currentTrip');
    if (stored) {
      const data = JSON.parse(stored);
      setTripData(data);
      generateELDLogs(data);
    } else {
      // No trip data, redirect to planning
      toast({
        title: "No Trip Data",
        description: "Please plan a trip first to view ELD logs.",
        variant: "destructive"
      });
      navigate('/plan');
    }
  }, [navigate, toast]);

  const generateELDLogs = (data: TripData) => {
    // Generate mock ELD logs based on trip data
    const logs: ELDLog[] = [];
    const startDate = new Date(data.plannedAt);
    
    // Generate 3 days of logs for a multi-day trip
    for (let day = 0; day < 3; day++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + day);
      
      const segments: LogSegment[] = [
        {
          startTime: "06:00",
          endTime: "07:00", 
          status: 'onduty',
          location: day === 0 ? data.currentLocation : "Rest Area Mile 45",
          duration: 1
        },
        {
          startTime: "07:00",
          endTime: "12:00",
          status: 'driving',
          location: day === 1 ? data.pickupLocation : "Highway I-95",
          duration: 5
        },
        {
          startTime: "12:00", 
          endTime: "13:00",
          status: 'offduty',
          location: "Truck Stop & Fuel",
          duration: 1
        },
        {
          startTime: "13:00",
          endTime: "18:00", 
          status: 'driving',
          location: day === 2 ? data.dropoffLocation : "Highway I-75",
          duration: 5
        },
        {
          startTime: "18:00",
          endTime: "06:00",
          status: 'sleeper',
          location: "Authorized Parking Area",
          duration: 12
        }
      ];

      logs.push({
        id: `log-${day + 1}`,
        date: date.toISOString().split('T')[0],
        drivingTime: 10,
        onDutyTime: 1,
        sleeperTime: 12,
        offDutyTime: 1,
        segments
      });
    }
    
    setEldLogs(logs);
  };

  const currentLog = eldLogs[currentLogIndex];

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: "PDF Generated",
        description: "ELD log sheets have been prepared for download."
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleShareLogs = () => {
    toast({
      title: "Share Feature",
      description: "Log sharing functionality would integrate with fleet management systems."
    });
  };

  const handleEditTrip = () => {
    navigate('/plan');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'driving': return 'bg-eld-log-driving';
      case 'onduty': return 'bg-eld-log-onduty';
      case 'sleeper': return 'bg-eld-log-sleeper';
      case 'offduty': return 'bg-eld-log-offduty';
      default: return 'bg-muted';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'driving': return 'Driving';
      case 'onduty': return 'On Duty';
      case 'sleeper': return 'Sleeper Berth';
      case 'offduty': return 'Off Duty';
      default: return status;
    }
  };

  if (!tripData || eldLogs.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading ELD logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden">
      {/* Main Log Display */}
      <div className="lg:w-2/3 flex-1 overflow-y-auto">
        <div className="p-4 lg:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold eld-gradient-text">ELD Log Review</h1>
              <p className="text-muted-foreground">Electronic Logging Device Records</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {eldLogs.length} Days
              </Badge>
            </div>
          </div>

          {/* Log Navigation */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentLogIndex(Math.max(0, currentLogIndex - 1))}
              disabled={currentLogIndex === 0}
              className="eld-button-secondary"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous Day
            </Button>

            <div className="text-center">
              <p className="font-semibold">Day {currentLogIndex + 1} of {eldLogs.length}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(currentLog.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long', 
                  day: 'numeric'
                })}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentLogIndex(Math.min(eldLogs.length - 1, currentLogIndex + 1))}
              disabled={currentLogIndex === eldLogs.length - 1}
              className="eld-button-secondary"
            >
              Next Day
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {/* Daily Summary */}
          <Card className="eld-card p-4 mb-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-eld-log-driving rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm text-muted-foreground">Driving</p>
                <p className="font-bold">{currentLog.drivingTime}h</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-eld-log-onduty rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Clock className="h-6 w-6 text-black" />
                </div>
                <p className="text-sm text-muted-foreground">On Duty</p>
                <p className="font-bold">{currentLog.onDutyTime}h</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-eld-log-sleeper rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm text-muted-foreground">Sleeper</p>
                <p className="font-bold">{currentLog.sleeperTime}h</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-eld-log-offduty rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm text-muted-foreground">Off Duty</p>
                <p className="font-bold">{currentLog.offDutyTime}h</p>
              </div>
            </div>
          </Card>

          {/* Detailed Log Timeline */}
          <Card className="eld-card p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Daily Log Sheet
            </h3>
            
            <div className="space-y-3">
              {currentLog.segments.map((segment, index) => (
                <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                  <div className={`w-4 h-4 rounded-full ${getStatusColor(segment.status)}`}></div>
                  
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div>
                      <p className="font-medium">{segment.startTime} - {segment.endTime}</p>
                      <p className="text-sm text-muted-foreground">{segment.duration}h duration</p>
                    </div>
                    
                    <div>
                      <Badge variant="outline" className="text-xs">
                        {getStatusLabel(segment.status)}
                      </Badge>
                    </div>
                    
                    <div>
                      <p className="text-sm flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {segment.location}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Side Panel */}
      <div className="lg:w-1/3 border-t lg:border-t-0 lg:border-l border-border">
        <div className="p-4 lg:p-6 space-y-6">
          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={handleGeneratePDF}
              disabled={isGeneratingPDF}
              className="w-full eld-button-primary"
            >
              {isGeneratingPDF ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Generating PDF...
                </>
              ) : (
                <>
                  <Printer className="h-4 w-4 mr-2" />
                  Print Log Sheets
                </>
              )}
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={handleShareLogs} className="eld-button-secondary">
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
              <Button variant="outline" onClick={handleEditTrip} className="eld-button-secondary">
                <Edit className="h-4 w-4 mr-1" />
                Edit Trip
              </Button>
            </div>
          </div>

          {/* Trip Info */}
          <Card className="eld-card p-4">
            <h3 className="font-semibold mb-3">Trip Information</h3>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-muted-foreground">From:</p>
                <p className="font-medium">{tripData.currentLocation}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Pickup:</p>
                <p className="font-medium">{tripData.pickupLocation}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Drop-off:</p>
                <p className="font-medium">{tripData.dropoffLocation}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Cycle Hours:</p>
                <p className="font-medium">{tripData.cycleHours}/70 hours</p>
              </div>
            </div>
          </Card>

          {/* Route Map */}
          <Card className="eld-card p-4">
            <h3 className="font-semibold mb-3">Route Overview</h3>
            <InteractiveMap
              locations={tripData.mapLocations}
              onLocationSelect={() => {}}
              showRoute={true}
              className="h-48"
            />
          </Card>
        </div>
      </div>
    </div>
  );
}