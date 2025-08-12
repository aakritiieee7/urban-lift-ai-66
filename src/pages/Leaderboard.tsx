import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Award, Crown, Medal } from "lucide-react";

type Row = { user_id: string; points: number; name?: string | null; company?: string | null };

const Leaderboard = () => {
  const [rows, setRows] = useState<Row[]>([]);

  const load = async () => {
    const { data: balances } = await supabase
      .from("points_balances")
      .select("user_id, points")
      .order("points", { ascending: false })
      .limit(50);
    const rowsBase = balances ?? [];
    if (rowsBase.length === 0) { setRows([]); return; }
    const ids = rowsBase.map(b => b.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, company_name, business_name, username")
      .in("user_id", ids);
    const nameMap: Record<string, string | null> = {};
    const companyMap: Record<string, string | null> = {};
    profiles?.forEach((p: any) => {
      nameMap[p.user_id] = p.username || p.business_name || p.company_name || null;
      companyMap[p.user_id] = p.company_name || p.business_name || null;
    });
    setRows(rowsBase.map(b => ({ ...b, name: nameMap[b.user_id] ?? null, company: companyMap[b.user_id] ?? null })));

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
  const displayName = (r: Row) => r.name ? r.name : `User ${r.user_id.slice(0,8)}`;

  const top3 = rows.slice(0, 3);
  const rest = rows.slice(3);

  return (
    <>
      <Helmet>
        <title>Top Businesses Leaderboard | UrbanLift.AI</title>
        <meta name="description" content="Live leaderboard of top shippers and carriers by points." />
        <link rel="canonical" href="/leaderboard" />
      </Helmet>
      <Navbar />
      <main className="container mx-auto max-w-3xl px-4 py-8 text-center">
        <h1 className="mb-2 text-3xl font-semibold">Leaderboard</h1>
        <p className="mb-6 text-sm label-caps">Our Revolutionary Owners • Live Rankings</p>

        <div className="space-y-4">
          {rows.length === 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">No scores yet</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">Create shipments or post in Community to earn points.</CardContent>
            </Card>
          )}

          {top3.length > 0 && (
            <section className="grid gap-4 md:grid-cols-3">
              {top3.map((u, idx) => (
                <Card
                  key={u.user_id}
                  className={idx === 0 ? "border-delhi-gold/40 shadow-sm" : "border-primary/40 shadow-sm"}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-2">
                      {idx === 0 && <Crown className="h-6 w-6 text-delhi-gold" aria-hidden />}
                      {idx === 1 && <Medal className="h-6 w-6 text-primary" aria-hidden />}
                      {idx === 2 && <Award className="h-6 w-6 text-primary" aria-hidden />}
                      <CardTitle className="text-base">#{idx + 1} {displayName(u)}{u.company ? ` • ${u.company}` : ''}</CardTitle>
                    </div>
                    
                  </CardHeader>
                  <CardContent>
                    <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span>{Math.round((u.points / maxPoints) * 100)}%</span>
                    </div>
                    <Progress value={Math.round((u.points / maxPoints) * 100)} />
                    <div className="mt-3 text-sm">
                      <span className="label-caps">Points</span>
                      <div className="text-xl font-semibold">{u.points}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </section>
          )}

          {rest.length > 0 && (
            <section className="grid gap-3">
              {rest.map((u, i) => {
                const rank = i + 4;
                return (
                  <Card key={u.user_id}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">{rank}</div>
                        <CardTitle className="text-base">{displayName(u)}{u.company ? ` • ${u.company}` : ''}</CardTitle>
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
                );
              })}
            </section>
          )}
        </div>
      </main>
    </>
  );
};

export default Leaderboard;
