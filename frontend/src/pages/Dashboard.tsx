import { useEffect, useState } from "react";
import { Users, CalendarDays, Ticket as TicketIcon, CheckCircle2, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

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
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

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
    { label: "Total Users", value: stats.users, icon: Users, color: "text-primary", to: "/admin" },
    { label: "Events", value: stats.events, icon: CalendarDays, color: "text-accent", to: "/events" },
    { label: "Tickets Booked", value: stats.tickets, icon: TicketIcon, color: "text-primary-glow", to: "/tickets" },
    { label: "Tickets Used", value: stats.used, icon: CheckCircle2, color: "text-success", to: "/scan" },
  ];

  const openDetails = (eventItem: any) => {
    setSelectedEvent(eventItem);
    setDetailsOpen(true);
  };

  const book = async (eventItem: any) => {
    if (!user) return;
    setBookingId(eventItem.id);
    try {
      await api.createTicket({ eventId: eventItem.id, userId: user.id });
      const eventTime = new Date(eventItem.eventDate).toLocaleString();
      toast.success(`Ticket booked for ${eventTime}`);
    } catch (error: any) {
      toast.error(error.message || "Unable to book ticket");
    }
    setBookingId(null);
  };

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
          <Link
            key={c.label}
            to={c.to}
            className="glass-card rounded-xl p-5 hover:border-primary/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <div className="flex items-center justify-between mb-3">
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </div>
            <div className="text-3xl font-bold mono">{c.value}</div>
            <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{c.label}</div>
          </Link>
        ))}
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Upcoming events</h2>
        {upcoming.length === 0 ? (
          <p className="text-muted-foreground text-sm">No upcoming events.</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((e) => (
              <div
                key={e.id}
                role="button"
                tabIndex={0}
                onClick={() => openDetails(e)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openDetails(e);
                  }
                }}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/40 cursor-pointer hover:border-primary/40 transition-colors"
              >
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

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title || "Event details"}</DialogTitle>
          </DialogHeader>
          {selectedEvent ? (
            <div className="space-y-3">
              {selectedEvent.description ? (
                <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
              ) : null}
              <div className="text-sm space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  {new Date(selectedEvent.eventDate).toLocaleString()}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-accent" />
                  {selectedEvent.location}
                </div>
                {typeof selectedEvent.capacity === "number" ? (
                  <div className="text-muted-foreground">Capacity: {selectedEvent.capacity}</div>
                ) : null}
              </div>
            </div>
          ) : null}
          <DialogFooter>
            {selectedEvent ? (
              <Button
                variant="hero"
                onClick={() => selectedEvent && book(selectedEvent)}
                disabled={bookingId === selectedEvent.id}
              >
                <TicketIcon className="h-4 w-4" /> Book Ticket
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
