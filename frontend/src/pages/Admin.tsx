import { useEffect, useState } from "react";
import { Users, Ticket as TicketIcon, Shield } from "lucide-react";
import { api } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import type { AppRole } from "@/hooks/useAuth";

interface UserRow {
  id: string;
  email: string | null;
  firstName?: string | null;
  lastName?: string | null;
  role?: AppRole;
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [eventsById, setEventsById] = useState<Map<string, string>>(new Map());
  const [usersById, setUsersById] = useState<Map<string, string>>(new Map());

  const fetchAll = async () => {
    const [usersRes, ticketsRes, eventsRes] = await Promise.all([
      api.getUsers(),
      api.getTickets(),
      api.getEvents(),
    ]);
    setUsers(usersRes as UserRow[]);
    setTickets(
      [...ticketsRes]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 100)
    );
    setEventsById(new Map(eventsRes.map((e) => [e.id, e.title])));
    setUsersById(
      new Map(
        usersRes.map((u) => [
          u.id,
          `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email || "—",
        ])
      )
    );
  };

  useEffect(() => { fetchAll(); }, []);

  const setRole = async (userId: string, role: AppRole) => {
    try {
      await api.updateUser(userId, { role });
      toast.success("Role updated");
      fetchAll();
    } catch (error: any) {
      toast.error(error.message || "Unable to update role");
    }
  };

  const deleteTicket = async (id: string) => {
    if (!confirm("Delete this ticket?")) return;
    try {
      await api.deleteTicket(id);
      toast.success("Deleted");
      fetchAll();
    } catch (error: any) {
      toast.error(error.message || "Unable to delete ticket");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-7 w-7 text-primary" /> Admin Panel
        </h1>
        <p className="text-muted-foreground">Manage users, roles and tickets.</p>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users"><Users className="h-4 w-4 mr-1.5" />Users</TabsTrigger>
          <TabsTrigger value="tickets"><TicketIcon className="h-4 w-4 mr-1.5" />Tickets</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="glass-card rounded-xl p-2 mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Set role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => {
                const highest: AppRole = (u.role as AppRole) || "user";
                return (
                  <TableRow key={u.id}>
                    <TableCell>{`${u.firstName || ""} ${u.lastName || ""}`.trim() || "—"}</TableCell>
                    <TableCell className="mono text-xs">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant={highest === "admin" ? "default" : "secondary"} className="mr-1">{highest}</Badge>
                    </TableCell>
                    <TableCell>
                      <Select value={highest} onValueChange={(v) => setRole(u.id, v as AppRole)}>
                        <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">user</SelectItem>
                          <SelectItem value="staff">staff</SelectItem>
                          <SelectItem value="admin">admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="tickets" className="glass-card rounded-xl p-2 mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Holder</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{eventsById.get(t.eventId) || "—"}</TableCell>
                  <TableCell className="text-xs">{usersById.get(t.userId) || "—"}</TableCell>
                  <TableCell><code className="text-[11px] mono">{t.ticketCode.slice(0, 12)}…</code></TableCell>
                  <TableCell>
                    <Badge variant={t.status === "used" ? "secondary" : "default"}>{t.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" onClick={() => deleteTicket(t.id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
}
