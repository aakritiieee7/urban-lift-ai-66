import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import "leaflet/dist/leaflet.css";

type Shipment = {
  id: string;
  origin: string;
  destination: string;
  status: string;
  capacity_kg: number;
  created_at: string;
};

// Parse coordinate strings like "28.6139, 77.2090" to LatLngExpression
function parseCoordinates(coordStr: string): LatLngExpression | null {
  const match = coordStr?.match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/);
  if (!match) return null;
  return [parseFloat(match[1]), parseFloat(match[2])];
}

const delhiCenter: LatLngExpression = [28.6139, 77.2090];

const AnyMapContainer = MapContainer as any;
const AnyTileLayer = TileLayer as any;
const AnyCircleMarker = CircleMarker as any;

const LiveMap = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const { userId } = useAuth();

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const { data, error } = await supabase
          .from("shipments")
          .select("id, origin, destination, status, capacity_kg, created_at")
          .eq("shipper_id", userId || "")
          .order("created_at", { ascending: false })
          .limit(10);

        if (error) {
          console.error("Error fetching shipments:", error);
          return;
        }

        setShipments(data || []);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchShipments();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="w-full h-[420px] flex items-center justify-center bg-card rounded-lg border">
        <p>Loading shipments...</p>
      </div>
    );
  }

  // Filter shipments that have valid coordinates
  const validShipments = shipments.filter(shipment => {
    const pickup = parseCoordinates(shipment.origin);
    const drop = parseCoordinates(shipment.destination);
    return pickup && drop;
  });

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

        {validShipments.map((shipment) => {
          const pickup = parseCoordinates(shipment.origin);
          const drop = parseCoordinates(shipment.destination);
          
          if (!pickup || !drop) return null;

          return (
            <div key={shipment.id}>
              {/* Pickup marker */}
              <AnyCircleMarker 
                center={pickup} 
                radius={10} 
                pathOptions={{ color: "hsl(var(--primary))", fillColor: "hsl(var(--primary))", fillOpacity: 0.7 }}
              >
                <Tooltip>
                  <div className="text-sm">
                    <strong>Pickup: {shipment.id.slice(0, 8)}</strong><br/>
                    Status: {shipment.status}<br/>
                    Weight: {shipment.capacity_kg}kg<br/>
                    Created: {new Date(shipment.created_at).toLocaleDateString()}
                  </div>
                </Tooltip>
              </AnyCircleMarker>

              {/* Drop marker */}
              <AnyCircleMarker 
                center={drop} 
                radius={10} 
                pathOptions={{ color: "hsl(var(--destructive))", fillColor: "hsl(var(--destructive))", fillOpacity: 0.7 }}
              >
                <Tooltip>
                  <div className="text-sm">
                    <strong>Drop: {shipment.id.slice(0, 8)}</strong><br/>
                    Status: {shipment.status}<br/>
                    Weight: {shipment.capacity_kg}kg<br/>
                    Destination: {shipment.destination.split(',')[0]}
                  </div>
                </Tooltip>
              </AnyCircleMarker>
            </div>
          );
        })}

        {validShipments.length === 0 && (
          <div className="leaflet-top leaflet-right">
            <div className="leaflet-control leaflet-bar bg-white p-2 text-sm">
              No shipments with valid coordinates found
            </div>
          </div>
        )}
      </AnyMapContainer>
    </div>
  );
};

export default LiveMap;
