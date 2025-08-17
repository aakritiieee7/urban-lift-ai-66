import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Trash2, Star, MapPin, Clock, Package } from "lucide-react";

interface Shipment {
  id: string;
  origin: string;
  destination: string;
  status: string;
  created_at: string;
  carrier_id?: string | null;
  capacity_kg?: number | null;
  pickup_time?: string | null;
  dropoff_time?: string | null;
}

interface ShipmentsListProps {
  refresh: boolean;
  onRefreshComplete: () => void;
}

const ShipmentsList = ({ refresh, onRefreshComplete }: ShipmentsListProps) => {
  const { userId } = useAuth();
  const { toast } = useToast();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [review, setReview] = useState<string>("");
  const [selectedShipment, setSelectedShipment] = useState<string>("");

  const fetchShipments = async () => {
    if (!userId) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from("shipments")
      .select("*")
      .eq("shipper_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message });
    } else {
      setShipments(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchShipments();
  }, [userId]);

  useEffect(() => {
    if (refresh) {
      fetchShipments();
      onRefreshComplete();
    }
  }, [refresh, onRefreshComplete]);

  const markAsDone = async (shipmentId: string) => {
    const { error } = await supabase
      .from("shipments")
      .update({ status: "delivered", dropoff_time: new Date().toISOString() })
      .eq("id", shipmentId);

    if (error) {
      toast({ title: "Error", description: error.message });
    } else {
      toast({ title: "Success", description: "Shipment marked as delivered" });
      fetchShipments();
    }
  };

  const deleteShipment = async (shipmentId: string) => {
    const { error } = await supabase
      .from("shipments")
      .delete()
      .eq("id", shipmentId);

    if (error) {
      toast({ title: "Error", description: error.message });
    } else {
      toast({ title: "Success", description: "Shipment deleted" });
      fetchShipments();
    }
  };

  const submitRating = async () => {
    if (!selectedShipment) return;

    // For now, we'll just show a success message
    // In a real app, you'd store this in a ratings table
    toast({ 
      title: "Rating Submitted", 
      description: `Thank you for rating ${rating} stars!` 
    });
    
    setRating(5);
    setReview("");
    setSelectedShipment("");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "border-green-500/30 text-green-600 bg-green-50";
      case "assigned":
        return "border-blue-500/30 text-blue-600 bg-blue-50";
      case "in_transit":
        return "border-yellow-500/30 text-yellow-600 bg-yellow-50";
      default:
        return "border-gray-500/30 text-gray-600 bg-gray-50";
    }
  };

  if (loading) {
    return (
      <Card className="border-primary/20">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">Loading shipments...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Your Shipments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {shipments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No shipments yet. Create your first shipment above!
          </div>
        ) : (
          shipments.map((shipment) => (
            <div
              key={shipment.id}
              className="rounded-lg border border-primary/10 bg-card/50 p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">
                      {shipment.origin} → {shipment.destination}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(shipment.created_at).toLocaleDateString()}
                    </div>
                    {shipment.capacity_kg && (
                      <div className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        {shipment.capacity_kg} kg
                      </div>
                    )}
                  </div>
                </div>
                
                <Badge className={`text-xs ${getStatusColor(shipment.status)}`}>
                  {shipment.status}
                </Badge>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {shipment.status !== "delivered" && (
                  <>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => markAsDone(shipment.id)}
                      className="flex items-center gap-1"
                    >
                      <CheckCircle className="h-3 w-3" />
                      Mark as Done
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive" className="flex items-center gap-1">
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Shipment</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this shipment? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteShipment(shipment.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}

                {shipment.status === "delivered" && shipment.carrier_id && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedShipment(shipment.id)}
                        className="flex items-center gap-1"
                      >
                        <Star className="h-3 w-3" />
                        Rate Driver
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Rate Your Driver</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="rating">Rating</Label>
                          <Select value={rating.toString()} onValueChange={(v) => setRating(Number(v))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select rating" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 Star - Poor</SelectItem>
                              <SelectItem value="2">2 Stars - Fair</SelectItem>
                              <SelectItem value="3">3 Stars - Good</SelectItem>
                              <SelectItem value="4">4 Stars - Very Good</SelectItem>
                              <SelectItem value="5">5 Stars - Excellent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="review">Review (optional)</Label>
                          <Textarea
                            id="review"
                            placeholder="Share your experience with this driver..."
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                          />
                        </div>
                        
                        <Button onClick={submitRating} className="w-full">
                          Submit Rating
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default ShipmentsList;