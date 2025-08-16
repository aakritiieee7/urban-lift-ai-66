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
      setOriginResults(raw.slice(0, 8).map(r => ({ name: r.display_name, lat: parseFloat(r.lat), lng: parseFloat(r.lon) })));
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
      setDestinationResults(raw.slice(0, 8).map(r => ({ name: r.display_name, lat: parseFloat(r.lat), lng: parseFloat(r.lon) })));
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
    <div className="space-y-8">
      {/* Main Layout Grid */}
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Left Side - Location Inputs */}
        <div className="space-y-6">
          {/* Pickup Location */}
          <div className="relative">
            <div className="mb-4">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-delhi-navy to-delhi-primary bg-clip-text text-transparent flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-delhi-primary to-delhi-gold flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                Pickup Location
              </h3>
              <p className="text-delhi-navy/60 text-sm mt-1">Where should we collect your shipment?</p>
            </div>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <MapPin className="h-5 w-5" />
              </div>
              <Input
                id="origin"
                placeholder="Enter pickup address or search location"
                value={originQuery}
                onChange={(e) => setOriginQuery(e.target.value)}
                onFocus={() => setPickingMode("origin")}
                className="pl-12 pr-12 h-12 text-base bg-gradient-to-r from-white to-delhi-primary/5 border-delhi-primary/20 focus:border-delhi-primary focus:ring-delhi-primary/20"
              />
              <button
                type="button"
                onClick={() => setPickingMode("origin")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-delhi-primary transition-colors"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
            {originResults.length > 0 && (
              <Card className="absolute z-[9999] mt-2 w-full shadow-xl border-delhi-primary/20 max-h-72 overflow-y-auto">
                <CardContent className="p-3 bg-card/95 backdrop-blur-sm">
                  {originResults.map((result, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => selectOrigin(result)}
                      className="block w-full rounded-lg px-4 py-3 text-left text-sm hover:bg-gradient-to-r hover:from-delhi-primary/10 hover:to-delhi-gold/10 hover:text-delhi-navy transition-all duration-200 border-b border-delhi-primary/10 last:border-0"
                    >
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-delhi-primary mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{result.name}</span>
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}
            {origin && (
              <div className="mt-3 p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                <div className="text-sm text-green-800 font-medium flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  Selected: {origin.address || `${origin.lat.toFixed(5)}, ${origin.lng.toFixed(5)}`}
                </div>
              </div>
            )}
          </div>

          {/* Drop-off Location */}
          <div className="relative">
            <div className="mb-4">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-delhi-navy to-delhi-primary bg-clip-text text-transparent flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-delhi-gold to-delhi-primary flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                Drop-off Location
              </h3>
              <p className="text-delhi-navy/60 text-sm mt-1">Where should we deliver your shipment?</p>
            </div>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <MapPin className="h-5 w-5" />
              </div>
              <Input
                id="destination"
                placeholder="Enter drop-off address or search location"
                value={destinationQuery}
                onChange={(e) => setDestinationQuery(e.target.value)}
                onFocus={() => setPickingMode("destination")}
                className="pl-12 pr-12 h-12 text-base bg-gradient-to-r from-white to-delhi-gold/5 border-delhi-gold/20 focus:border-delhi-gold focus:ring-delhi-gold/20"
              />
              <button
                type="button"
                onClick={() => setPickingMode("destination")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-delhi-gold transition-colors"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
            {destinationResults.length > 0 && (
              <Card className="absolute z-[9999] mt-2 w-full shadow-xl border-delhi-gold/20 max-h-72 overflow-y-auto">
                <CardContent className="p-3 bg-card/95 backdrop-blur-sm">
                  {destinationResults.map((result, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => selectDestination(result)}
                      className="block w-full rounded-lg px-4 py-3 text-left text-sm hover:bg-gradient-to-r hover:from-delhi-gold/10 hover:to-delhi-primary/10 hover:text-delhi-navy transition-all duration-200 border-b border-delhi-gold/10 last:border-0"
                    >
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-delhi-gold mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{result.name}</span>
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}
            {destination && (
              <div className="mt-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                <div className="text-sm text-blue-800 font-medium flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  Selected: {destination.address || `${destination.lat.toFixed(5)}, ${destination.lng.toFixed(5)}`}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Interactive Map */}
        <div className="space-y-4 lg:sticky lg:top-6">
          <div className="mb-4">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-delhi-navy to-delhi-primary bg-clip-text text-transparent flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-delhi-primary to-delhi-navy flex items-center justify-center">
                <Search className="h-4 w-4 text-white" />
              </div>
              Interactive Map
            </h3>
            <p className="text-delhi-navy/60 text-sm mt-1">Click on the map to select locations visually</p>
          </div>
          
          {pickingMode && (
            <div className="rounded-lg bg-gradient-to-r from-delhi-primary/15 to-delhi-gold/15 border-2 border-delhi-primary/30 p-4 text-sm animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-delhi-primary to-delhi-gold flex items-center justify-center">
                  <MapPin className="h-3 w-3 text-white" />
                </div>
                <span className="font-semibold text-delhi-navy">
                  Click on the map to select your {pickingMode === "origin" ? "pickup" : "drop-off"} location
                </span>
              </div>
            </div>
          )}
          
          <div className="overflow-hidden rounded-xl border-2 border-delhi-primary/20 shadow-2xl">
            <AnyMapContainer center={center} zoom={11} scrollWheelZoom={false} className="h-96 w-full">
              <AnyTileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <ClickHandler onPick={onMapClick} />
              {origin && (
                <AnyMarker position={[origin.lat, origin.lng]}>
                  <AnyPopup>
                    <div className="font-medium text-green-700">
                      🟢 Pickup: {origin.address || `${origin.lat.toFixed(5)}, ${origin.lng.toFixed(5)}`}
                    </div>
                  </AnyPopup>
                </AnyMarker>
              )}
              {destination && (
                <AnyMarker position={[destination.lat, destination.lng]}>
                  <AnyPopup>
                    <div className="font-medium text-blue-700">
                      🔵 Drop-off: {destination.address || `${destination.lat.toFixed(5)}, ${destination.lng.toFixed(5)}`}
                    </div>
                  </AnyPopup>
                </AnyMarker>
              )}
            </AnyMapContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;