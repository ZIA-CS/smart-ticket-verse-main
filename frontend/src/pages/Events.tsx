import { useEffect, useState } from "react";
import { CalendarDays, MapPin, Plus, Search, Trash2, Pencil, Ticket as TicketIcon } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth, useHasRole } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { z } from "zod";

interface EventRow {
  id: string;
  title: string;
  description: string | null;
  eventDate: string;
  location: string;
  capacity: number;
}

const eventSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(1000).optional(),
  eventDate: z.string().min(1),
  location: z.string().trim().min(1).max(200),
  capacity: z.coerce.number().int().min(1).max(1000000),
});

const PAGE_SIZE = 6;

export default function EventsPage() {
  const { user } = useAuth();
  const isAdmin = useHasRole("admin");
  const [events, setEvents] = useState<EventRow[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EventRow | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventRow | null>(null);

  const [form, setForm] = useState({ title: "", description: "", eventDate: "", location: "", capacity: 100 });

  const fetchEvents = async () => {
    setLoading(true);
    const all = await api.getEvents();
    const filtered = search.trim()
      ? all.filter((ev) => ev.title.toLowerCase().includes(search.trim().toLowerCase()))
      : all;
    const sorted = [...filtered].sort(
      (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
    );
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE;
    setEvents(sorted.slice(from, to));
    setTotal(sorted.length);
    setLoading(false);
  };

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => { fetchEvents(); /* eslint-disable-next-line */ }, [page, search]);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", description: "", eventDate: "", location: "", capacity: 100 });
    setDialogOpen(true);
  };
  const openEdit = (ev: EventRow) => {
    setEditing(ev);
    setForm({
      title: ev.title,
      description: ev.description ?? "",
      eventDate: new Date(ev.eventDate).toISOString().slice(0, 16),
      location: ev.location,
      capacity: ev.capacity,
    });
    setDialogOpen(true);
  };

  const openDetails = (ev: EventRow) => {
    setSelectedEvent(ev);
    setDetailsOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = eventSchema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    const payload = { ...parsed.data, eventDate: new Date(parsed.data.eventDate).toISOString() };
    const insertPayload = {
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      eventDate: payload.eventDate,
      location: parsed.data.location,
      capacity: parsed.data.capacity,
      createdBy: user?.id ?? null,
    };
    try {
      if (editing) {
        await api.updateEvent(editing.id, payload);
      } else {
        await api.createEvent(insertPayload);
      }
      toast.success(editing ? "Event updated" : "Event created");
      setDialogOpen(false);
      fetchEvents();
    } catch (error: any) {
      toast.error(error.message || "Unable to save event");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    try {
      await api.deleteEvent(id);
      toast.success("Event deleted");
      fetchEvents();
    } catch (error: any) {
      toast.error(error.message || "Unable to delete event");
    }
  };

  const book = async (eventItem: EventRow) => {
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

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const formatCountdown = (ms: number) => {
    if (ms <= 0) return "Event started";
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const parts = [
      days ? `${days}d` : "",
      `${String(hours).padStart(2, "0")}h`,
      `${String(minutes).padStart(2, "0")}m`,
      `${String(seconds).padStart(2, "0")}s`,
    ].filter(Boolean);
    return `Starts in ${parts.join(" ")}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground">Browse and book your next experience.</p>
        </div>
        {isAdmin && (
          <Button variant="hero" onClick={openCreate}>
            <Plus className="h-4 w-4" /> New event
          </Button>
        )}
      </div>

      <div className="relative max-w-md">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search events…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="pl-9"
        />
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : events.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center text-muted-foreground">No events found.</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((ev) => (
            <div
              key={ev.id}
              role="button"
              tabIndex={0}
              onClick={() => openDetails(ev)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openDetails(ev);
                }
              }}
              className="glass-card rounded-xl p-5 flex flex-col hover:border-primary/40 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-lg leading-tight">{ev.title}</h3>
              </div>
              {ev.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{ev.description}</p>}
              <div className="space-y-1.5 text-sm mb-4 mt-auto">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5 text-primary" />
                  {new Date(ev.eventDate).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatCountdown(new Date(ev.eventDate).getTime() - now)}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-accent" />
                  {ev.location}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="hero"
                  className="flex-1"
                  onClick={(event) => {
                    event.stopPropagation();
                    book(ev);
                  }}
                  disabled={bookingId === ev.id}
                >
                  <TicketIcon className="h-3.5 w-3.5" /> Book
                </Button>
                {isAdmin && (
                  <>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={(event) => {
                        event.stopPropagation();
                        openEdit(ev);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={(event) => {
                        event.stopPropagation();
                        remove(ev.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Prev</Button>
          <span className="text-sm text-muted-foreground mono">{page + 1} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit event" : "Create event"}</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Date & time</Label><Input type="datetime-local" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Capacity</Label><Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} required /></div>
            </div>
            <div className="space-y-2"><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required /></div>
            <DialogFooter><Button type="submit" variant="hero">{editing ? "Save" : "Create"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
                <div className="text-muted-foreground">Capacity: {selectedEvent.capacity}</div>
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
