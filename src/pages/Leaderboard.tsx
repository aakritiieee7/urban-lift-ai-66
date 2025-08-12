import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Award, Crown, Medal } from "lucide-react";

type Row = { user_id: string; points: number };

const Leaderboard = () => {
  const [rows, setRows] = useState<Row[]>([]);

  const load = async () => {
    const { data } = await supabase
      .from("points_balances")
      .select("user_id, points")
      .order("points", { ascending: false })
      .limit(50);
    setRows(data ?? []);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("points-realtime")
      .on('postgres_changes', { event: '*', schema: 'public', table: 'points_balances' }, () => load())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'points_events' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const maxPoints = useMemo(() => Math.max(1, ...rows.map(r => r.points)), [rows]);

  return (
    <>
      <Helmet>
        <title>Leaderboard | UrbanLift.AI</title>
        <meta name="description" content="Top users ranked by realtime points." />
        <link rel="canonical" href="/leaderboard" />
      </Helmet>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-4 text-3xl font-semibold">Leaderboard</h1>
        <div className="grid gap-4">
          {rows.length === 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">No scores yet</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">Create shipments or post in Community to earn points.</CardContent>
            </Card>
          )}
          {rows.map((u, idx) => (
            <Card key={u.user_id} className={idx < 3 ? "border-primary/50 shadow-sm" : undefined}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                  {idx === 0 && <Crown className="h-5 w-5 text-primary" aria-hidden />}
                  {idx === 1 && <Medal className="h-5 w-5 text-primary" aria-hidden />}
                  {idx === 2 && <Award className="h-5 w-5 text-primary" aria-hidden />}
                  <CardTitle className="text-base">#{idx + 1} User {u.user_id.slice(0, 8)}</CardTitle>
                </div>
                <div className="text-xs text-muted-foreground">{u.points} pts</div>
              </CardHeader>
              <CardContent>
                <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>{Math.round((u.points / maxPoints) * 100)}%</span>
                </div>
                <Progress value={Math.round((u.points / maxPoints) * 100)} />
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
};

export default Leaderboard;
