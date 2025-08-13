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
import { Truck, Building2, UserPlus, CheckCircle } from "lucide-react";
import carrierBg from "@/assets/carrier-auth-bg.jpg";


const CarrierRegister = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  // Carrier profile details
  const [serviceRegions, setServiceRegions] = useState("");
  const [vehicleTypes, setVehicleTypes] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [licenses, setLicenses] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ 
      email, 
      password, 
      options: { 
        emailRedirectTo: `${window.location.origin}/`,
        data: { 
          name, 
          role: 'carrier',
          company: company,
          company_name: company,
          service_regions: serviceRegions,
          vehicle_types: vehicleTypes,
          years_experience: yearsExperience ? Number(yearsExperience) : 0,
          licenses,
          contact_email: contactEmail || email,
          contact_phone: contactPhone,
        } 
      } 
    });

    if (signUpError) {
      setLoading(false);
      toast({ title: "Error", description: signUpError.message });
      return;
    }

    const userId = signUpData.user?.id;
    if (!userId) {
      setLoading(false);
      toast({ title: "Registration pending", description: "Please verify your email to continue." });
      return;
    }

    // Create/update profile row
    const payload = {
      user_id: userId,
      role: 'carrier',
      company_name: company,
      service_regions: serviceRegions,
      vehicle_types: vehicleTypes,
      years_experience: yearsExperience ? Number(yearsExperience) : 0,
      licenses,
      contact_email: contactEmail || email,
      contact_phone: contactPhone,
      auth_email: email,
    } as any;

    const { error: upsertError } = await (supabase as any)
      .from('profiles')
      .upsert(payload, { onConflict: 'user_id' });

    if (upsertError) {
      toast({ title: 'Profile save warning', description: upsertError.message });
    }


    setLoading(false);
    toast({ title: "Welcome aboard!", description: "Carrier registration successful!" });
    navigate("/carrier-dashboard");
  };

  return (
    <>
      <Helmet>
        <title>Register Carrier | UrbanLift.AI</title>
        <meta name="description" content="Register your fleet for AI-powered route optimization in Delhi." />
        <link rel="canonical" href="/auth/carrier/register" />
      </Helmet>
      <Navbar />
      
      <main className="min-h-screen bg-background relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-1/3 h-full opacity-10">
            <img src={carrierBg} alt="" className="w-full h-full object-cover" />
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-32 right-16 w-20 h-20 bg-delhi-orange/20 rounded-full animate-float"></div>
        <div className="absolute bottom-32 left-16 w-16 h-16 bg-delhi-navy/20 rounded-full animate-float" style={{animationDelay: '3s'}}></div>

        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-12 animate-fade-in">
                <div className="mb-6">
                  <h1 className="text-4xl font-bold text-delhi-navy">Delhi Government Logistics Platform</h1>
                  <p className="text-delhi-navy/70 text-lg font-medium">Join as Professional Carrier</p>
                </div>
              <h2 className="text-3xl font-bold text-delhi-navy mb-4">Register Your Fleet</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join Delhi's premier logistics network. Optimize your delivery routes with cutting-edge AI technology.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Benefits Section */}
              <div className="space-y-8 animate-slide-up order-2 lg:order-1">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-delhi-navy flex items-center gap-3">
                    <Truck className="w-8 h-8 text-delhi-orange" />
                    Fleet Benefits
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-delhi-orange/10">
                      <CheckCircle className="w-6 h-6 text-delhi-success mt-1" />
                      <div>
                        <h4 className="font-semibold text-delhi-navy">Route Optimization</h4>
                        <p className="text-sm text-muted-foreground">AI-powered routing saves up to 30% fuel costs</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-delhi-orange/10">
                      <CheckCircle className="w-6 h-6 text-delhi-success mt-1" />
                      <div>
                        <h4 className="font-semibold text-delhi-navy">Government Partnership</h4>
                        <p className="text-sm text-muted-foreground">Official DSIIDC logistics partner program</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-delhi-orange/10">
                      <CheckCircle className="w-6 h-6 text-delhi-success mt-1" />
                      <div>
                        <h4 className="font-semibold text-delhi-navy">Real-Time Tracking</h4>
                        <p className="text-sm text-muted-foreground">Live monitoring and performance analytics</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-delhi-orange/10">
                      <CheckCircle className="w-6 h-6 text-delhi-success mt-1" />
                      <div>
                        <h4 className="font-semibold text-delhi-navy">Priority Access</h4>
                        <p className="text-sm text-muted-foreground">First access to high-value shipment opportunities</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-muted/10 rounded-xl border border-delhi-orange/20">
                  <h4 className="font-bold text-delhi-navy mb-3 flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Government Innovation Program
                  </h4>
                  <p className="text-sm text-delhi-navy/80">
                    Part of Delhi Government's innovation initiative by Department of Industries GNCTD, DSIIDC, and NSUT.
                  </p>
                </div>
              </div>

              {/* Registration Form */}
              <div className="animate-slide-up order-1 lg:order-2" style={{animationDelay: '0.2s'}}>
                <Card className="shadow-[var(--shadow-delhi)] border-delhi-orange/20 bg-white/90 backdrop-blur-sm">
                  <CardHeader className="text-center bg-muted/20 rounded-t-lg">
                    <CardTitle className="text-2xl font-bold text-delhi-navy flex items-center justify-center gap-3">
                      <UserPlus className="w-8 h-8 text-delhi-orange" />
                      Fleet Registration
                    </CardTitle>
                    <p className="text-delhi-navy/70 text-sm">Register your logistics business</p>
                  </CardHeader>
                  <CardContent className="pt-8">
                    <form onSubmit={onSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="company" className="text-delhi-navy font-medium">Logistics Company</Label>
                        <Input 
                          id="company" 
                          required 
                          value={company} 
                          onChange={(e) => setCompany(e.target.value)}
                          className="border-delhi-orange/20 focus:border-delhi-orange focus:ring-delhi-orange/20 h-12"
                          placeholder="Your Logistics Ltd."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-delhi-navy font-medium">Fleet Manager Name</Label>
                        <Input 
                          id="name" 
                          required 
                          value={name} 
                          onChange={(e) => setName(e.target.value)}
                          className="border-delhi-orange/20 focus:border-delhi-orange focus:ring-delhi-orange/20 h-12"
                          placeholder="Your Full Name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-delhi-navy font-medium">Login Email</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          required 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)}
                          className="border-delhi-orange/20 focus:border-delhi-orange focus:ring-delhi-orange/20 h-12"
                          placeholder="fleet@logistics.com"
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="serviceRegions" className="text-delhi-navy font-medium">Service Regions</Label>
                          <Input 
                            id="serviceRegions" 
                            required 
                            value={serviceRegions} 
                            onChange={(e) => setServiceRegions(e.target.value)}
                            className="border-delhi-orange/20 focus:border-delhi-orange focus:ring-delhi-orange/20 h-12"
                            placeholder="Delhi NCR, ..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="vehicleTypes" className="text-delhi-navy font-medium">Vehicle Types</Label>
                          <Input 
                            id="vehicleTypes" 
                            required 
                            value={vehicleTypes} 
                            onChange={(e) => setVehicleTypes(e.target.value)}
                            className="border-delhi-orange/20 focus:border-delhi-orange focus:ring-delhi-orange/20 h-12"
                            placeholder="2W, 3W, 4W, LCV"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="yearsExperience" className="text-delhi-navy font-medium">Years of Experience</Label>
                          <Input 
                            id="yearsExperience" 
                            type="number"
                            min={0}
                            value={yearsExperience}
                            onChange={(e) => setYearsExperience(e.target.value)}
                            className="border-delhi-orange/20 focus:border-delhi-orange focus:ring-delhi-orange/20 h-12"
                            placeholder="5"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="licenses" className="text-delhi-navy font-medium">Licenses/Permits</Label>
                          <Input 
                            id="licenses" 
                            value={licenses}
                            onChange={(e) => setLicenses(e.target.value)}
                            className="border-delhi-orange/20 focus:border-delhi-orange focus:ring-delhi-orange/20 h-12"
                            placeholder="License numbers, etc."
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="contactEmail" className="text-delhi-navy font-medium">Contact Email</Label>
                          <Input 
                            id="contactEmail" 
                            type="email"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            className="border-delhi-orange/20 focus:border-delhi-orange focus:ring-delhi-orange/20 h-12"
                            placeholder="ops@logistics.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contactPhone" className="text-delhi-navy font-medium">Contact Phone</Label>
                          <Input 
                            id="contactPhone" 
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            className="border-delhi-orange/20 focus:border-delhi-orange focus:ring-delhi-orange/20 h-12"
                            placeholder="+91 98765 43210"
                          />
                        </div>
                      </div>


                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-delhi-navy font-medium">Secure Password</Label>
                        <Input 
                          id="password" 
                          type="password" 
                          required 
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)}
                          className="border-delhi-orange/20 focus:border-delhi-orange focus:ring-delhi-orange/20 h-12"
                          placeholder="Create a strong password"
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full h-12 text-base font-semibold" 
                        disabled={loading} 
                        variant="delhi-carrier"
                        size="lg"
                      >
                        {loading ? "Registering Fleet..." : "Register Carrier Account"}
                      </Button>
                    </form>
                  </CardContent>
                  <CardFooter className="flex-col space-y-4 bg-muted/20 rounded-b-lg">
                    <div className="text-sm text-delhi-navy/70 text-center">
                      Already have an account? 
                      <Link to="/auth/carrier/login" className="ml-2 font-semibold text-delhi-orange hover:text-delhi-navy transition-colors underline">
                        Login Here
                      </Link>
                    </div>
                    <div className="text-xs text-delhi-navy/50 text-center">
                      By registering, you join the Delhi logistics innovation ecosystem
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

export default CarrierRegister;