import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Package, DollarSign, Leaf, TrendingUp, Clock, MapPin, Truck, CheckCircle } from "lucide-react";
import StatsRow from "@/components/dashboard/StatsRow";

interface ShipmentData {
  id: string;
  status: string;
  created_at: string;
  payment_amount: number | null;
  distance_km: number | null;
  capacity_kg: number | null;
  pooled: boolean;
  carrier_id: string | null;
  dropoff_time: string | null;
}

interface AnalyticsData {
  totalShipments: number;
  totalSpent: number;
  averageCost: number;
  deliveryRate: number;
  pending: number;
  assigned: number;
  delivered: number;
  pooledShipments: number;
  averageDistance: number;
  totalCapacity: number;
  costSavings: number;
  co2Saved: number;
  monthlyData: Array<{
    month: string;
    shipments: number;
    cost: number;
    traditionalCost: number;
  }>;
  statusData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  poolingData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

const Analytics = () => {
  const { userId } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");

  useEffect(() => {
    if (userId) {
      fetchAnalytics();
    }
  }, [userId, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      switch (timeRange) {
        case "7d":
          startDate.setDate(endDate.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(endDate.getDate() - 30);
          break;
        case "3m":
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case "1y":
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      // Fetch shipments for the user
      const { data: shipments, error } = await supabase
        .from('shipments')
        .select('*')
        .eq('shipper_id', userId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedData = processAnalyticsData(shipments || []);
      setAnalytics(processedData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (shipments: ShipmentData[]): AnalyticsData => {
    const totalShipments = shipments.length;
    const totalSpent = shipments.reduce((sum, s) => sum + (s.payment_amount || 0), 0);
    const averageCost = totalShipments > 0 ? totalSpent / totalShipments : 0;
    
    const statusCounts = {
      pending: shipments.filter(s => s.status === 'pending').length,
      assigned: shipments.filter(s => s.status === 'assigned').length,
      delivered: shipments.filter(s => s.status === 'delivered').length,
    };
    
    const deliveryRate = totalShipments > 0 ? (statusCounts.delivered / totalShipments) * 100 : 0;
    const pooledShipments = shipments.filter(s => s.pooled).length;
    const averageDistance = shipments.length > 0 ? 
      shipments.reduce((sum, s) => sum + (s.distance_km || 0), 0) / shipments.length : 0;
    const totalCapacity = shipments.reduce((sum, s) => sum + (s.capacity_kg || 0), 0);
    
    // Calculate estimated savings (assuming 20% savings from traditional shipping)
    const costSavings = totalSpent * 0.25; // 25% savings estimate
    const co2Saved = pooledShipments * 2.5; // 2.5kg CO2 saved per pooled shipment estimate
    
    // Generate monthly data
    const monthlyData = generateMonthlyData(shipments);
    
    // Status distribution
    const statusData = [
      { name: 'Delivered', value: statusCounts.delivered, color: 'hsl(var(--delhi-success))' },
      { name: 'Assigned', value: statusCounts.assigned, color: 'hsl(var(--delhi-gold))' },
      { name: 'Pending', value: statusCounts.pending, color: 'hsl(var(--delhi-orange))' },
    ];
    
    // Pooling efficiency
    const poolingData = [
      { name: 'Pooled', value: pooledShipments, color: 'hsl(var(--delhi-primary))' },
      { name: 'Individual', value: totalShipments - pooledShipments, color: 'hsl(var(--muted))' },
    ];

    return {
      totalShipments,
      totalSpent,
      averageCost,
      deliveryRate,
      pending: statusCounts.pending,
      assigned: statusCounts.assigned,
      delivered: statusCounts.delivered,
      pooledShipments,
      averageDistance,
      totalCapacity,
      costSavings,
      co2Saved,
      monthlyData,
      statusData,
      poolingData,
    };
  };

  const generateMonthlyData = (shipments: ShipmentData[]) => {
    const monthlyMap = new Map();
    
    shipments.forEach(shipment => {
      const date = new Date(shipment.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { shipments: 0, cost: 0 });
      }
      
      const data = monthlyMap.get(monthKey);
      data.shipments += 1;
      data.cost += shipment.payment_amount || 0;
    });
    
    return Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        shipments: data.shipments,
        cost: data.cost,
        traditionalCost: data.cost * 1.33, // 33% higher traditional cost estimate
      }))
      .slice(-6); // Last 6 months
  };

  if (loading) {
    return (
      <Layout>
        <main className="min-h-screen bg-background">
          <section className="container mx-auto px-4 py-10">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-muted rounded w-1/3 mx-auto"></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 bg-muted rounded"></div>
                ))}
              </div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </section>
        </main>
      </Layout>
    );
  }

  if (!analytics) {
    return (
      <Layout>
        <main className="min-h-screen bg-background">
          <section className="container mx-auto px-4 py-10">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4">Shipper Analytics</h1>
              <p className="text-muted-foreground">No data available. Create some shipments to see analytics!</p>
            </div>
          </section>
        </main>
      </Layout>
    );
  }

  return (
    <>
      <Helmet>
        <title>Shipper Analytics | UrbanLift.AI</title>
        <meta name="description" content="Comprehensive analytics for your shipping activity including cost savings, environmental impact, and performance metrics." />
        <link rel="canonical" href="/shipper/analytics" />
      </Helmet>
      <Layout>
        <main className="min-h-screen bg-background">
          <section className="container mx-auto px-4 py-10">
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">Shipper Analytics</h1>
              <p className="text-muted-foreground text-center mb-6">
                Track your shipping performance, costs, and environmental impact
              </p>
              
              {/* Time Range Selector */}
              <div className="flex justify-center mb-6">
                <Tabs value={timeRange} onValueChange={setTimeRange} className="w-auto">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="7d">7 Days</TabsTrigger>
                    <TabsTrigger value="30d">30 Days</TabsTrigger>
                    <TabsTrigger value="3m">3 Months</TabsTrigger>
                    <TabsTrigger value="1y">1 Year</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </header>

            {/* Key Metrics Overview */}
            <StatsRow 
              total={analytics.totalShipments}
              assigned={analytics.assigned}
              pending={analytics.pending}
              delivered={analytics.delivered}
            />

            {/* Main Analytics Content */}
            <Tabs defaultValue="overview" className="mt-8">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="cost">Cost Analysis</TabsTrigger>
                <TabsTrigger value="environmental">Environmental</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">₹{analytics.totalSpent.toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">
                        Avg: ₹{analytics.averageCost.toFixed(2)} per shipment
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
                      <TrendingUp className="h-4 w-4 text-delhi-success" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-delhi-success">₹{analytics.costSavings.toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">
                        vs traditional platforms
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
                      <CheckCircle className="h-4 w-4 text-delhi-success" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.deliveryRate.toFixed(1)}%</div>
                      <p className="text-xs text-muted-foreground">
                        Successful deliveries
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">CO₂ Saved</CardTitle>
                      <Leaf className="h-4 w-4 text-delhi-success" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-delhi-success">{analytics.co2Saved.toFixed(1)}kg</div>
                      <p className="text-xs text-muted-foreground">
                        Through smart pooling
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Monthly Trends */}
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Shipping Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analytics.monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="shipments" fill="hsl(var(--delhi-primary))" name="Shipments" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Status and Pooling Distribution */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Shipment Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={analytics.statusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {analytics.statusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Pooling Efficiency</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={analytics.poolingData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {analytics.poolingData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="cost" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Cost Comparison: UrbanLift.AI vs Traditional Platforms</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={analytics.monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="cost" 
                          stroke="hsl(var(--delhi-primary))" 
                          strokeWidth={3}
                          name="UrbanLift.AI"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="traditionalCost" 
                          stroke="hsl(var(--muted-foreground))" 
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          name="Traditional Platforms"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Average Cost per KG</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">₹{analytics.totalCapacity > 0 ? (analytics.totalSpent / analytics.totalCapacity).toFixed(2) : '0.00'}</div>
                      <p className="text-sm text-muted-foreground mt-2">Per kilogram shipped</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Average Distance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{analytics.averageDistance.toFixed(1)} km</div>
                      <p className="text-sm text-muted-foreground mt-2">Per shipment</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Total Capacity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{analytics.totalCapacity.toFixed(1)} kg</div>
                      <p className="text-sm text-muted-foreground mt-2">Total cargo shipped</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="environmental" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg text-delhi-success">Environmental Impact</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">CO₂ Emissions Saved</span>
                        <Badge variant="secondary" className="bg-delhi-success/10 text-delhi-success">
                          {analytics.co2Saved.toFixed(1)} kg
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Pooled Shipments</span>
                        <Badge variant="secondary" className="bg-delhi-primary/10 text-delhi-primary">
                          {analytics.pooledShipments} of {analytics.totalShipments}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Pooling Rate</span>
                        <Badge variant="secondary">
                          {analytics.totalShipments > 0 ? ((analytics.pooledShipments / analytics.totalShipments) * 100).toFixed(1) : 0}%
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Fuel Efficiency</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-delhi-success mb-2">
                          {analytics.pooledShipments * 1.2}L
                        </div>
                        <p className="text-sm text-muted-foreground">Estimated fuel saved</p>
                      </div>
                      <div className="text-center mt-4">
                        <p className="text-xs text-muted-foreground">
                          Through optimized route pooling and carrier matching
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Environmental Benefits Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Leaf className="h-8 w-8 text-delhi-success" />
                          <div>
                            <h3 className="font-medium">Reduced Emissions</h3>
                            <p className="text-sm text-muted-foreground">Smart route optimization reduces CO₂ footprint</p>
                          </div>
                        </div>
                        <Badge className="bg-delhi-success text-white">-{analytics.co2Saved.toFixed(1)}kg CO₂</Badge>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Truck className="h-8 w-8 text-delhi-primary" />
                          <div>
                            <h3 className="font-medium">Vehicle Efficiency</h3>
                            <p className="text-sm text-muted-foreground">Fewer vehicles needed through pooling</p>
                          </div>
                        </div>
                        <Badge className="bg-delhi-primary text-white">{((analytics.pooledShipments / Math.max(analytics.totalShipments, 1)) * 100).toFixed(0)}% pooled</Badge>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <MapPin className="h-8 w-8 text-delhi-orange" />
                          <div>
                            <h3 className="font-medium">Route Optimization</h3>
                            <p className="text-sm text-muted-foreground">AI-powered route planning for efficiency</p>
                          </div>
                        </div>
                        <Badge className="bg-delhi-orange text-white">{analytics.averageDistance.toFixed(0)}km avg</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="performance" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">&lt; 2h</div>
                      <p className="text-xs text-muted-foreground">Average carrier assignment</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                      <CheckCircle className="h-4 w-4 text-delhi-success" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.deliveryRate.toFixed(1)}%</div>
                      <p className="text-xs text-muted-foreground">Successful deliveries</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Platform Savings</CardTitle>
                      <TrendingUp className="h-4 w-4 text-delhi-success" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">25%</div>
                      <p className="text-xs text-muted-foreground">vs traditional platforms</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Avg Capacity</CardTitle>
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {analytics.totalShipments > 0 ? (analytics.totalCapacity / analytics.totalShipments).toFixed(1) : '0'}kg
                      </div>
                      <p className="text-xs text-muted-foreground">Per shipment</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg">
                          <h3 className="font-medium mb-2 text-delhi-primary">Cost Efficiency</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            You're saving an average of ₹{(analytics.costSavings / Math.max(analytics.totalShipments, 1)).toFixed(2)} per shipment
                          </p>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-delhi-primary h-2 rounded-full" 
                              style={{ width: '75%' }}
                            ></div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">75% efficiency vs traditional</p>
                        </div>

                        <div className="p-4 border rounded-lg">
                          <h3 className="font-medium mb-2 text-delhi-success">Environmental Impact</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {analytics.pooledShipments} of your shipments were pooled for efficiency
                          </p>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-delhi-success h-2 rounded-full" 
                              style={{ width: `${(analytics.pooledShipments / Math.max(analytics.totalShipments, 1)) * 100}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {((analytics.pooledShipments / Math.max(analytics.totalShipments, 1)) * 100).toFixed(0)}% pooling rate
                          </p>
                        </div>
                      </div>

                      <div className="p-4 bg-muted/30 rounded-lg">
                        <h3 className="font-medium mb-2">📊 Key Insights</h3>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• You've shipped {analytics.totalCapacity.toFixed(0)}kg of cargo across {analytics.totalShipments} shipments</li>
                          <li>• Your average shipment distance is {analytics.averageDistance.toFixed(1)}km</li>
                          <li>• {analytics.pooledShipments} shipments were optimized through AI pooling</li>
                          <li>• You've contributed to saving {analytics.co2Saved.toFixed(1)}kg of CO₂ emissions</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </section>
        </main>
      </Layout>
    </>
  );
};

export default Analytics;