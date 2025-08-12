import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

// Simple live demo map centered on Delhi with pickup, drop, and a moving carrier.
const delhiCenter: LatLngExpression = [28.6139, 77.2090];

const pickup: LatLngExpression = [28.6448, 77.2167]; // Connaught Place
const drop: LatLngExpression = [28.5355, 77.3910];   // Noida

const AnyMapContainer = MapContainer as any;
const AnyTileLayer = TileLayer as any;
const AnyCircleMarker = CircleMarker as any;

const LiveMap = () => {
  const [carrier, setCarrier] = useState<[number, number]>([28.60, 77.20]);

  useEffect(() => {
    const id = setInterval(() => {
      setCarrier(([lat, lng]) => {
        // micro random walk within bounds
        const dLat = (Math.random() - 0.5) * 0.002;
        const dLng = (Math.random() - 0.5) * 0.002;
        const next: [number, number] = [lat + dLat, lng + dLng];
        return next;
      });
    }, 1500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="w-full overflow-hidden rounded-lg border bg-card">
      <AnyMapContainer
        center={delhiCenter}
        zoom={11}
        scrollWheelZoom={false}
        className="h-[420px] w-full"
      >
        <AnyTileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Pickup marker */}
        <AnyCircleMarker center={pickup} radius={10} pathOptions={{ color: "hsl(var(--primary))" }}>
          <Tooltip>Pickup</Tooltip>
        </AnyCircleMarker>

        {/* Drop marker */}
        <AnyCircleMarker center={drop} radius={10} pathOptions={{ color: "hsl(var(--brand-2))" }}>
          <Tooltip>Drop</Tooltip>
        </AnyCircleMarker>

        {/* Carrier live marker */}
        <AnyCircleMarker center={carrier} radius={8} pathOptions={{ color: "hsl(var(--foreground))" }}>
          <Tooltip>Carrier (live)</Tooltip>
        </AnyCircleMarker>
      </AnyMapContainer>
    </div>
  );
};

export default LiveMap;
