import { useEffect, useState } from "react";
import { Users, CalendarDays, Ticket as TicketIcon, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

interface Stats {
  users: number;
  events: number;
  tickets: number;
  used: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ users: 0, events: 0, tickets: 0, used: 0 });
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [displayName, setDisplayName] = useState<string>("Guest");

  useEffect(() => {
    (async () => {
      const [users, events, tickets] = await Promise.all([
        api.getUsers(),
        api.getEvents(),
        api.getTickets(),
      ]);

      const full = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
      setDisplayName(full || user?.email?.split("@")[0] || "Guest");
      setStats({
        users: users.length,
        events: events.length,
        tickets: tickets.length,
        used: tickets.filter((t) => t.status === "used").length,
      });
      setUpcoming(
        [...events]
          .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
          .slice(0, 3)
      );
    })();
  }, [user]);

  const cards = [
    { label: "Total Users", value: stats.users, icon: Users, color: "text-primary" },
    { label: "Events", value: stats.events, icon: CalendarDays, color: "text-accent" },
    { label: "Tickets Booked", value: stats.tickets, icon: TicketIcon, color: "text-primary-glow" },
    { label: "Tickets Used", value: stats.used, icon: CheckCircle2, color: "text-success" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Welcome back, <span className="neon-text">{displayName}</span>
        </h1>
        <p className="text-muted-foreground">Manage your events, tickets, and scans from one place.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="glass-card rounded-xl p-5 hover:border-primary/40 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </div>
            <div className="text-3xl font-bold mono">{c.value}</div>
            <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Upcoming events</h2>
        {upcoming.length === 0 ? (
          <p className="text-muted-foreground text-sm">No upcoming events.</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((e) => (
              <div key={e.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/40">
                <div>
                  <div className="font-medium">{e.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(e.eventDate).toLocaleString()} · {e.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
