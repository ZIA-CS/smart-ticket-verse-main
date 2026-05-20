import { useState } from "react";
import { ScanLine, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Result =
  | { kind: "success"; event: string; eventTime: string; userName: string; userEmail: string; userRole: string; status: string }
  | { kind: "already"; event: string; eventTime: string; usedAt: string; userName: string; userEmail: string; userRole: string; status: string }
  | { kind: "expired"; event: string; eventTime: string; userName: string; userEmail: string; userRole: string; status: string }
  | { kind: "notfound" }
  | { kind: "error"; msg: string };

export default function ScanPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const [tickets, events, users] = await Promise.all([
        api.getTickets(),
        api.getEvents(),
        api.getUsers(),
      ]);

      const ticket = tickets.find((t) => t.ticketCode === code.trim());
      if (!ticket) {
        setResult({ kind: "notfound" });
        setLoading(false);
        return;
      }

      const event = events.find((e) => e.id === ticket.eventId);
      const holder = users.find((u) => u.id === ticket.userId);
      const holderName = `${holder?.firstName || ""} ${holder?.lastName || ""}`.trim() || holder?.email || "Guest";
      const holderEmail = holder?.email || "—";
      const holderRole = holder?.role || "user";
      const eventTime = event?.eventDate ? new Date(event.eventDate).toLocaleString() : "—";

      if (event?.eventDate && new Date(event.eventDate).getTime() < Date.now() && ticket.status !== "used") {
        try {
          await api.scanTicket(ticket.id);
        } catch {
          // Ignore; backend marks the ticket expired.
        }
        setResult({
          kind: "expired",
          event: event?.title ?? "",
          eventTime,
          userName: holderName,
          userEmail: holderEmail,
          userRole: holderRole,
          status: "expired",
        });
        setLoading(false);
        return;
      }

      if (ticket.status === "used") {
        setResult({
          kind: "already",
          event: event?.title ?? "",
          eventTime,
          usedAt: ticket.usedAt || new Date().toISOString(),
          userName: holderName,
          userEmail: holderEmail,
          userRole: holderRole,
          status: "used",
        });
        setLoading(false);
        return;
      }

      await api.scanTicket(ticket.id);

      setResult({
        kind: "success",
        event: event?.title ?? "",
        eventTime,
        userName: holderName,
        userEmail: holderEmail,
        userRole: holderRole,
        status: "active",
      });
      setCode("");
    } catch (error: any) {
      setResult({ kind: "error", msg: error.message || "Unable to validate ticket" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="text-center">
        <div className="inline-flex p-4 rounded-full bg-primary/10 mb-3">
          <ScanLine className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">Entry Scanner</h1>
        <p className="text-muted-foreground">Enter the ticket code to validate entry.</p>
      </div>

      <form onSubmit={verify} className="glass-card rounded-xl p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="code">Ticket code</Label>
          <Input
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. a1b2c3d4e5f6…"
            className="mono"
            autoFocus
          />
        </div>
        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
          {loading ? "Verifying…" : "Validate & mark used"}
        </Button>
      </form>

      {result && (
        <div
          className={
            "glass-card rounded-xl p-6 flex items-start gap-4 animate-fade-up " +
            (result.kind === "success" ? "border-success/50" :
             result.kind === "already" ? "border-warning/50" : "border-destructive/50")
          }
        >
          {result.kind === "success" && (
            <>
              <CheckCircle2 className="h-10 w-10 text-success flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-success">Entry granted</h3>
                <p className="text-sm">{result.userName}</p>
                <p className="text-xs text-muted-foreground">{result.userEmail} · {result.userRole}</p>
                <p className="text-xs text-muted-foreground">{result.event}</p>
                <p className="text-xs text-muted-foreground mono">{result.eventTime}</p>
              </div>
            </>
          )}
          {result.kind === "already" && (
            <>
              <AlertCircle className="h-10 w-10 text-warning flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-warning">Already used</h3>
                <p className="text-sm">{result.userName}</p>
                <p className="text-xs text-muted-foreground">{result.userEmail} · {result.userRole}</p>
                <p className="text-xs text-muted-foreground">{result.event}</p>
                <p className="text-xs text-muted-foreground mono">{result.eventTime}</p>
                <p className="text-xs text-muted-foreground mono">at {new Date(result.usedAt).toLocaleString()}</p>
              </div>
            </>
          )}
          {result.kind === "expired" && (
            <>
              <AlertCircle className="h-10 w-10 text-warning flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-warning">Expired ticket</h3>
                <p className="text-sm">{result.userName}</p>
                <p className="text-xs text-muted-foreground">{result.userEmail} · {result.userRole}</p>
                <p className="text-xs text-muted-foreground">{result.event}</p>
                <p className="text-xs text-muted-foreground mono">{result.eventTime}</p>
              </div>
            </>
          )}
          {result.kind === "notfound" && (
            <>
              <XCircle className="h-10 w-10 text-destructive flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-destructive">Invalid code</h3>
                <p className="text-sm text-muted-foreground">No ticket matches that code.</p>
              </div>
            </>
          )}
          {result.kind === "error" && (
            <>
              <XCircle className="h-10 w-10 text-destructive flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-destructive">Error</h3>
                <p className="text-sm text-muted-foreground">{result.msg}</p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
