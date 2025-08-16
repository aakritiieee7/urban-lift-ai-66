import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Search } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const AnyMapContainer = MapContainer as any;
const AnyTileLayer = TileLayer as any;
const AnyMarker = Marker as any;
const AnyPopup = Popup as any;

export type LocationData = {
  lat: number;
  lng: number;
  address?: string;
};

type Props = {
  origin?: LocationData;
  destination?: LocationData;
  onOriginChange: (location: LocationData) => void;
  onDestinationChange: (location: LocationData) => void;
};

const delhiCenter = [28.6139, 77.209] as [number, number];

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

const fetchReverseGeocode = async (lat: number, lng: number): Promise<string | undefined> => {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
    const json = await res.json();
    return json?.display_name as string | undefined;
  } catch {
    return undefined;
  }
};

const fetchSearch = async (q: string) => {
  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`);
  return (await res.json()) as Array<{ display_name: string; lat: string; lon: string }>;
};

export const LocationPicker = ({ origin, destination, onOriginChange, onDestinationChange }: Props) => {
  const [pickingMode, setPickingMode] = useState<"origin" | "destination" | null>(null);
  const [originQuery, setOriginQuery] = useState("");
  const [destinationQuery, setDestinationQuery] = useState("");
  const [originResults, setOriginResults] = useState<Array<{ name: string; lat: number; lng: number }>>([]);
  const [destinationResults, setDestinationResults] = useState<Array<{ name: string; lat: number; lng: number }>>([]);
  const originSearchRef = useRef(0);
  const destinationSearchRef = useRef(0);

  const center = origin ? [origin.lat, origin.lng] as [number, number] : delhiCenter;

  const onMapClick = async (lat: number, lng: number) => {
    if (!pickingMode) return;
    
    const address = await fetchReverseGeocode(lat, lng);
    const location = { lat, lng, address };
    
    if (pickingMode === "origin") {
      onOriginChange(location);
      setOriginQuery(address || `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    } else {
      onDestinationChange(location);
      setDestinationQuery(address || `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    }
    
    setPickingMode(null);
  };

  // Origin search
  useEffect(() => {
    if (!originQuery.trim()) { setOriginResults([]); return; }
    const id = ++originSearchRef.current;
    const t = setTimeout(async () => {
      const raw = await fetchSearch(originQuery.trim());
      if (originSearchRef.current !== id) return;
      setOriginResults(raw.slice(0, 5).map(r => ({ name: r.display_name, lat: parseFloat(r.lat), lng: parseFloat(r.lon) })));
    }, 350);
    return () => clearTimeout(t);
  }, [originQuery]);

  // Destination search
  useEffect(() => {
    if (!destinationQuery.trim()) { setDestinationResults([]); return; }
    const id = ++destinationSearchRef.current;
    const t = setTimeout(async () => {
      const raw = await fetchSearch(destinationQuery.trim());
      if (destinationSearchRef.current !== id) return;
      setDestinationResults(raw.slice(0, 5).map(r => ({ name: r.display_name, lat: parseFloat(r.lat), lng: parseFloat(r.lon) })));
    }, 350);
    return () => clearTimeout(t);
  }, [destinationQuery]);

  const selectOrigin = (result: { name: string; lat: number; lng: number }) => {
    onOriginChange({ lat: result.lat, lng: result.lng, address: result.name });
    setOriginQuery(result.name);
    setOriginResults([]);
  };

  const selectDestination = (result: { name: string; lat: number; lng: number }) => {
    onDestinationChange({ lat: result.lat, lng: result.lng, address: result.name });
    setDestinationQuery(result.name);
    setDestinationResults([]);
  };

  return (
    <div className="space-y-6">
      {/* Location Input Boxes */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Origin */}
        <div className="relative">
          <Label htmlFor="origin" className="text-sm font-medium">Pickup Location</Label>
          <div className="relative mt-2">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
            </div>
            <Input
              id="origin"
              placeholder="Enter pickup address"
              value={originQuery}
              onChange={(e) => setOriginQuery(e.target.value)}
              onFocus={() => setPickingMode("origin")}
              className="pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setPickingMode("origin")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
          {originResults.length > 0 && (
            <Card className="absolute z-50 mt-1 w-full">
              <CardContent className="p-2">
                {originResults.map((result, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectOrigin(result)}
                    className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-accent"
                  >
                    {result.name}
                  </button>
                ))}
              </CardContent>
            </Card>
          )}
          {origin && (
            <div className="mt-2 text-xs text-muted-foreground">
              Selected: {origin.address || `${origin.lat.toFixed(5)}, ${origin.lng.toFixed(5)}`}
            </div>
          )}
        </div>

        {/* Destination */}
        <div className="relative">
          <Label htmlFor="destination" className="text-sm font-medium">Drop-off Location</Label>
          <div className="relative mt-2">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
            </div>
            <Input
              id="destination"
              placeholder="Enter drop-off address"
              value={destinationQuery}
              onChange={(e) => setDestinationQuery(e.target.value)}
              onFocus={() => setPickingMode("destination")}
              className="pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setPickingMode("destination")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
          {destinationResults.length > 0 && (
            <Card className="absolute z-50 mt-1 w-full">
              <CardContent className="p-2">
                {destinationResults.map((result, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectDestination(result)}
                    className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-accent"
                  >
                    {result.name}
                  </button>
                ))}
              </CardContent>
            </Card>
          )}
          {destination && (
            <div className="mt-2 text-xs text-muted-foreground">
              Selected: {destination.address || `${destination.lat.toFixed(5)}, ${destination.lng.toFixed(5)}`}
            </div>
          )}
        </div>
      </div>

      {/* Interactive Map */}
      <div className="space-y-3">
        {pickingMode && (
          <div className="rounded-lg bg-primary/10 p-3 text-sm">
            <span className="font-medium">Click on the map to select your {pickingMode === "origin" ? "pickup" : "drop-off"} location</span>
          </div>
        )}
        <div className="overflow-hidden rounded-lg border">
          <AnyMapContainer center={center} zoom={11} scrollWheelZoom={false} className="h-72 w-full">
            <AnyTileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ClickHandler onPick={onMapClick} />
            {origin && (
              <AnyMarker position={[origin.lat, origin.lng]}>
                <AnyPopup>Pickup: {origin.address || `${origin.lat.toFixed(5)}, ${origin.lng.toFixed(5)}`}</AnyPopup>
              </AnyMarker>
            )}
            {destination && (
              <AnyMarker position={[destination.lat, destination.lng]}>
                <AnyPopup>Drop-off: {destination.address || `${destination.lat.toFixed(5)}, ${destination.lng.toFixed(5)}`}</AnyPopup>
              </AnyMarker>
            )}
          </AnyMapContainer>
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;