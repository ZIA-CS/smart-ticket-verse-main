import { useEffect, useState } from "react";
import { CheckCircle2, Clock, Copy } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import QrCode from "@/components/QrCode";
import { toast } from "sonner";

interface TicketWithEvent {
  id: string;
  ticketCode: string;
  status: string;
  usedAt: string | null;
  createdAt: string;
  eventId: string;
  userId: string;
  event: { title: string; eventDate: string; location: string } | null;
}

export default function TicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TicketWithEvent[]>([]);

  const fetch = async () => {
    if (!user) return;
    const [allTickets, events] = await Promise.all([api.getTickets(), api.getEvents()]);
    const eventMap = new Map(events.map((e) => [e.id, e]));
    const mine = allTickets
      .filter((t) => t.userId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((t) => ({
        ...t,
        event: eventMap.get(t.eventId)
          ? {
              title: eventMap.get(t.eventId)!.title,
              eventDate: eventMap.get(t.eventId)!.eventDate,
              location: eventMap.get(t.eventId)!.location,
            }
          : null,
      }));
    setTickets(mine as TicketWithEvent[]);
  };

  useEffect(() => { fetch(); /* eslint-disable-next-line */ }, [user]);

  const copy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Tickets</h1>
        <p className="text-muted-foreground">Show the code to staff at the entrance.</p>
      </div>

      {tickets.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center text-muted-foreground">
          No tickets yet — book one from the Events page.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {tickets.map((t) => {
            const isExpired =
              t.status !== "used" &&
              t.event?.eventDate &&
              new Date(t.event.eventDate).getTime() < Date.now();
            const displayStatus = isExpired ? "expired" : t.status;
            return (
            <div key={t.id} className="glass-card rounded-xl p-5 flex gap-4">
              <div className={displayStatus === "used" || displayStatus === "expired" ? "opacity-40 grayscale" : ""}>
                <QrCode value={t.ticketCode} size={140} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold leading-tight">{t.event?.title}</h3>
                  {displayStatus === "used" ? (
                    <Badge variant="secondary" className="gap-1"><CheckCircle2 className="h-3 w-3" />Used</Badge>
                  ) : displayStatus === "expired" ? (
                    <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Expired</Badge>
                  ) : (
                    <Badge className="bg-primary text-primary-foreground gap-1"><Clock className="h-3 w-3" />Active</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t.event && new Date(t.event.eventDate).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">{t.event?.location}</p>

                <div className="mt-3 flex items-center gap-2">
                  <code className="text-[11px] mono bg-muted px-2 py-1 rounded truncate">{t.ticketCode}</code>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => copy(t.ticketCode)}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                {t.usedAt && (
                  <p className="text-[10px] text-muted-foreground mt-2 mono">
                    used {new Date(t.usedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          );
          })}
        </div>
      )}
    </div>
  );
}
