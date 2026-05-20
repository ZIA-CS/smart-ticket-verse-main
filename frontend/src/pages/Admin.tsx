import { Fragment, useEffect, useState } from "react";
import { Users, Ticket as TicketIcon, Shield } from "lucide-react";
import { api } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
  const [roleFilter, setRoleFilter] = useState<"all" | AppRole>("all");
  const [usersPage, setUsersPage] = useState(1);
  const usersPageSize = 10;

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

  const filteredUsers = users.filter((u) => {
    const role: AppRole = (u.role as AppRole) || "user";
    return roleFilter === "all" ? true : role === roleFilter;
  });

  const totalUsersPages = Math.max(1, Math.ceil(filteredUsers.length / usersPageSize));
  const safeUsersPage = Math.min(usersPage, totalUsersPages);
  const pagedUsers = filteredUsers.slice(
    (safeUsersPage - 1) * usersPageSize,
    safeUsersPage * usersPageSize
  );

  const goToUsersPage = (page: number) => {
    const next = Math.max(1, Math.min(totalUsersPages, page));
    setUsersPage(next);
  };

  useEffect(() => {
    if (usersPage !== safeUsersPage) {
      setUsersPage(safeUsersPage);
    }
  }, [usersPage, safeUsersPage]);

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
          <div className="flex flex-col gap-3 px-2 py-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Filter</span>
              <Select
                value={roleFilter}
                onValueChange={(v) => {
                  setRoleFilter(v as "all" | AppRole);
                  setUsersPage(1);
                }}
              >
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredUsers.length} users
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>First Name</TableHead>
                <TableHead>Last Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Set role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedUsers.map((u) => {
                const highest: AppRole = (u.role as AppRole) || "user";
                return (
                  <TableRow key={u.id}>
                    <TableCell>{u.firstName || "—"}</TableCell>
                    <TableCell>{u.lastName || "—"}</TableCell>
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
          <div className="flex flex-col gap-2 px-2 py-3 md:flex-row md:items-center md:justify-between">
            <div className="text-xs text-muted-foreground">
              Page {safeUsersPage} of {totalUsersPages}
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      goToUsersPage(safeUsersPage - 1);
                    }}
                    className={safeUsersPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {(() => {
                  const pages: number[] = [];
                  if (totalUsersPages <= 5) {
                    for (let i = 1; i <= totalUsersPages; i += 1) pages.push(i);
                  } else {
                    const candidates = new Set([
                      1,
                      totalUsersPages,
                      safeUsersPage,
                      safeUsersPage - 1,
                      safeUsersPage + 1,
                    ]);
                    [...candidates]
                      .filter((page) => page >= 1 && page <= totalUsersPages)
                      .sort((a, b) => a - b)
                      .forEach((page) => pages.push(page));
                  }

                  return pages.map((page, index) => {
                    const prev = pages[index - 1];
                    const showEllipsis = index > 0 && prev !== undefined && page - prev > 1;
                    return (
                      <Fragment key={`page-${page}`}>
                        {showEllipsis ? (
                          <PaginationItem key={`ellipsis-${page}`}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        ) : null}
                        <PaginationItem>
                          <PaginationLink
                            href="#"
                            isActive={page === safeUsersPage}
                            onClick={(event) => {
                              event.preventDefault();
                              goToUsersPage(page);
                            }}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      </Fragment>
                    );
                  });
                })()}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      goToUsersPage(safeUsersPage + 1);
                    }}
                    className={safeUsersPage === totalUsersPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
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
