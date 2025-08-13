import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { clusterShipments, type Shipment as AlgoShipment } from "@/lib/matching";

function parseCoord(s: string): { lat: number; lng: number } | null {
  const m = s?.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
  if (!m) return null;
  return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
}

const AIPooling = () => {
  const { toast } = useToast();
  const [shipments, setShipments] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('shipments')
        .select('id, origin, destination, pickup_time, dropoff_time, status, pooled')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) {
        toast({ title: 'Error', description: error.message });
      }
      setShipments(data ?? []);
    })();
  }, []);

  const pools = useMemo(() => {
    const algos: AlgoShipment[] = shipments
      .map((r) => {
        const po = parseCoord(r.origin);
        const pd = parseCoord(r.destination);
        if (!po || !pd) return null as any;
        return { id: r.id, pickup: po, drop: pd, readyAt: r.pickup_time ?? undefined, dueBy: r.dropoff_time ?? undefined };
      })
      .filter(Boolean);
    try {
      return clusterShipments(algos).slice(0, 5);
    } catch (e) {
      return [];
    }
  }, [shipments]);

  return (
    <>
      <Helmet>
        <title>AI Pooling | UrbanLift.AI</title>
        <meta name="description" content="See AI-suggested pooled shipments from public transits (demo)." />
        <link rel="canonical" href="/ai-pooling" />
      </Helmet>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 space-y-6">
          <header>
            <h1 className="text-2xl font-semibold">AI Pooling (Demo)</h1>
          </header>
          {pools.length === 0 ? (
            <p className="text-muted-foreground">No pools found yet. Add more shipments to see grouping.</p>
          ) : (
            pools.map((pool, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle>Pool #{idx + 1} • <Badge variant="secondary">{pool.shipments.length} shipments</Badge></CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pool.shipments.map((sh) => {
                    const s = shipments.find(x => x.id === sh.id) ?? { id: sh.id, origin: '', destination: '', status: '', pooled: false };
                    return (
                      <div key={sh.id} className="flex flex-wrap items-center justify-between gap-2 border-b pb-2 last:border-b-0">
                        <div className="min-w-0">
                          <div className="font-medium truncate max-w-[520px]" title={`${s.origin} → ${s.destination}`}>{s.origin} → {s.destination}</div>
                          <div className="text-sm text-muted-foreground">{s.status}{s.pooled ? ' • pooled' : ''}</div>
                        </div>
                        <Badge>#{String(sh.id).slice(0,8)}</Badge>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </>
  );
};

export default AIPooling;
