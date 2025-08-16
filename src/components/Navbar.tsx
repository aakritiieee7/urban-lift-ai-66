import { Link, NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Truck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";


const Navbar = () => {
  const { userId } = useAuth();
  const [role, setRole] = useState<"shipper" | "carrier" | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      const r = (data.user?.user_metadata as any)?.role as "shipper" | "carrier" | undefined;
      if (mounted) setRole(r ?? null);
    })();
    return () => { mounted = false; };
  }, [userId]);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <header className="w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="inline-flex items-center gap-2 font-semibold hover:opacity-90 transition-opacity">
          <Truck className="h-6 w-6" aria-hidden="true" />
          <span className="text-base md:text-lg font-semibold">UrbanLift</span>
        </Link>
        <div className="flex items-center gap-2">
          {userId && role === 'shipper' ? (
            <>
              <NavLink to="/shipper/transit" className="px-3 py-2 rounded-md hover:bg-accent">
                Transit
              </NavLink>
              <NavLink to="/shipper/track" className="px-3 py-2 rounded-md hover:bg-accent">
                Track
              </NavLink>
              <NavLink to="/shipper/community" className="px-3 py-2 rounded-md hover:bg-accent">
                Community
              </NavLink>
              <NavLink to="/shipper/analytics" className="px-3 py-2 rounded-md hover:bg-accent">
                Analytics
              </NavLink>
              <Link to="/profile">
                <Button variant="outline" size="sm">Profile</Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={logout}>Logout</Button>
            </>
          ) : userId && role === 'carrier' ? (
            <>
              <NavLink to="/carrier/transit" className="px-3 py-2 rounded-md hover:bg-accent">
                Transit
              </NavLink>
              <NavLink to="/carrier/track" className="px-3 py-2 rounded-md hover:bg-accent">
                Track
              </NavLink>
              <NavLink to="/carrier/community" className="px-3 py-2 rounded-md hover:bg-accent">
                Community
              </NavLink>
              <NavLink to="/carrier/analytics" className="px-3 py-2 rounded-md hover:bg-accent">
                Analytics
              </NavLink>
              <Link to="/profile">
                <Button variant="outline" size="sm">Profile</Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={logout}>Logout</Button>
            </>
          ) : (
            <>
              <NavLink to="/community" className="px-3 py-2 rounded-md hover:bg-accent">
                Community
              </NavLink>
              <NavLink to="/leaderboard" className="px-3 py-2 rounded-md hover:bg-accent">
                Leaderboard
              </NavLink>
              <NavLink to="/transits" className="px-3 py-2 rounded-md hover:bg-accent">
                Transits
              </NavLink>
              <NavLink to="/ai-pooling" className="px-3 py-2 rounded-md hover:bg-accent">
                AI Pooling
              </NavLink>
              {userId ? (
                <>
                  <Link to="/profile">
                    <Button variant="outline" size="sm">Profile</Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={logout}>Logout</Button>
                </>
              ) : (
                <>
                  <Link to="/auth/shipper/login">
                    <Button variant="outline" size="sm" className="">
                      <Users className="mr-2" /> Shipper Login
                    </Button>
                  </Link>
                  <Link to="/auth/carrier/login">
                    <Button variant="default" size="sm" className="">
                      <Truck className="mr-2" /> Carrier Login
                    </Button>
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
