import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Package, Shield, Building, Award, MapPin } from "lucide-react";
import shipperBg from "@/assets/shipper-auth-bg.jpg";

import { signInWithIdentifier } from "@/lib/auth";

const ShipperLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signInWithIdentifier(email, password);
    setLoading(false);
    if (error) {
      toast({ title: "Login failed", description: error.message });
      return;
    }
    // Route based on whether a profile already exists
    const { data: userRes } = await supabase.auth.getUser();
    const uid = userRes.user?.id;
    if (!uid) {
      navigate("/auth/shipper/login");
      return;
    }
    const { data: profile } = await (supabase as any)
      .from("profiles")
      .select("role")
      .eq("user_id", uid)
      .maybeSingle();

    if (!profile) {
      toast({ title: "Complete your profile", description: "Finish setup to start using your dashboard." });
      navigate("/profile-setup?role=shipper");
      return;
    }
    toast({ title: "Welcome back!", description: "Logged in successfully." });
    navigate(profile.role === "carrier" ? "/carrier-dashboard" : "/shipper/home");
  };

  return (
    <>
      <Helmet>
        <title>Shipper Login | UrbanLift.AI</title>
        <meta name="description" content="Secure shipper portal for Delhi logistics. Streamline with AI-powered pooling." />
        <link rel="canonical" href="/auth/shipper/login" />
      </Helmet>
      <Navbar />
      
      <main className="min-h-screen bg-background relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-10">
            <img src={shipperBg} alt="" className="w-full h-full object-cover" />
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-16 h-16 bg-delhi-primary/20 rounded-full animate-float"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-delhi-orange/20 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-delhi-gold/30 rounded-full animate-float" style={{animationDelay: '4s'}}></div>

        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-12 animate-fade-in">
              <div className="mb-6">
                <h1 className="text-4xl font-bold text-delhi-navy">Delhi Government Logistics Platform</h1>
                <p className="text-delhi-navy/70 text-lg font-medium">Department of Industries GNCTD × DSIIDC</p>
              </div>
              <h2 className="text-3xl font-bold text-delhi-navy mb-4">Shipper Portal</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Professional logistics management for Delhi's industrial ecosystem. Pool shipments with AI-powered optimization.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Features Section */}
              <div className="space-y-8 animate-slide-up">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-delhi-navy flex items-center gap-3">
                    <Package className="w-8 h-8 text-delhi-primary" />
                    Enterprise Shipper Features
                  </h3>
                  
                  <div className="grid gap-4">
                    <div className="flex items-start gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-delhi-primary/10 hover:border-delhi-primary/20 transition-all duration-300 hover:shadow-lg">
                      <Shield className="w-6 h-6 text-delhi-primary mt-1" />
                      <div>
                        <h4 className="font-semibold text-delhi-navy">Government-Grade Security</h4>
                        <p className="text-sm text-muted-foreground">DSIIDC certified platform with enterprise-level data protection</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-delhi-primary/10 hover:border-delhi-primary/20 transition-all duration-300 hover:shadow-lg">
                      <Building className="w-6 h-6 text-delhi-orange mt-1" />
                      <div>
                        <h4 className="font-semibold text-delhi-navy">Industrial Integration</h4>
                        <p className="text-sm text-muted-foreground">Seamless integration with Delhi's industrial infrastructure</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-delhi-primary/10 hover:border-delhi-primary/20 transition-all duration-300 hover:shadow-lg">
                      <Award className="w-6 h-6 text-delhi-gold mt-1" />
                      <div>
                        <h4 className="font-semibold text-delhi-navy">Innovation Program</h4>
                        <p className="text-sm text-muted-foreground">Cutting-edge AI solutions developed with government support</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-delhi-primary/10 hover:border-delhi-primary/20 transition-all duration-300 hover:shadow-lg">
                      <MapPin className="w-6 h-6 text-delhi-success mt-1" />
                      <div>
                        <h4 className="font-semibold text-delhi-navy">Delhi-Specific Optimization</h4>
                        <p className="text-sm text-muted-foreground">Routes optimized for NCT Delhi's industrial corridors</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Login Form */}
              <div className="animate-slide-up" style={{animationDelay: '0.2s'}}>
                <Card className="shadow-[var(--shadow-delhi)] border-delhi-primary/20 bg-white/90 backdrop-blur-sm">
                  <CardHeader className="text-center bg-muted/20 rounded-t-lg">
                    <CardTitle className="text-2xl font-bold text-delhi-navy flex items-center justify-center gap-3">
                      <Package className="w-8 h-8 text-delhi-primary" />
                      Shipper Access Portal
                    </CardTitle>
                    <p className="text-delhi-navy/70 text-sm">Enter your credentials to access the professional dashboard</p>
                  </CardHeader>
                  <CardContent className="pt-8">
                    <form onSubmit={onSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="identifier" className="text-delhi-navy font-medium">Email or Login ID</Label>
                        <Input 
                          id="identifier" 
                          type="text" 
                          required 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)}
                          className="border-delhi-primary/20 focus:border-delhi-primary focus:ring-delhi-primary/20 h-12"
                          placeholder="your.email@company.com or username"
                        />
                        <p className="text-xs text-delhi-navy/60">Use your email or unique login ID (username).</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-delhi-navy font-medium">Password</Label>
                        <Input 
                          id="password" 
                          type="password" 
                          required 
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)}
                          className="border-delhi-primary/20 focus:border-delhi-primary focus:ring-delhi-primary/20 h-12"
                          placeholder="Enter your secure password"
                        />
                        <p className="text-xs text-delhi-navy/60">Minimum 8 characters. Keep it secure.</p>
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full h-12 text-base font-semibold" 
                        disabled={loading} 
                        variant="delhi-shipper"
                        size="lg"
                      >
                        {loading ? "Authenticating..." : "Access Shipper Dashboard"}
                      </Button>
                    </form>
                  </CardContent>
                  <CardFooter className="flex-col space-y-4 bg-muted/20 rounded-b-lg">
                    <div className="text-sm text-delhi-navy/70 text-center">
                      New to the platform? 
                      <Link to="/auth/shipper/register" className="ml-2 font-semibold text-delhi-primary hover:text-delhi-orange transition-colors underline">
                        Register Your Business
                      </Link>
                    </div>
                    <div className="text-xs text-delhi-navy/50 text-center">
                      DSIIDC Certified Platform
                    </div>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default ShipperLogin;