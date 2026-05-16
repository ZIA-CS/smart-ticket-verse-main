import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, CalendarDays, Ticket, ScanLine, Shield, LogOut, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "staff", "user"] },
  { to: "/events", label: "Events", icon: CalendarDays, roles: ["admin", "staff", "user"] },
  { to: "/tickets", label: "My Tickets", icon: Ticket, roles: ["admin", "staff", "user"] },
  { to: "/scan", label: "Scan Entry", icon: ScanLine, roles: ["admin", "staff"] },
  { to: "/admin", label: "Admin", icon: Shield, roles: ["admin"] },
];

export default function AppLayout() {
  const { user, roles, signOut } = useAuth();
  const navigate = useNavigate();

  const visible = navItems.filter((n) => n.roles.some((r) => roles.includes(r as any)));

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border/60 backdrop-blur-xl bg-background/70 sticky top-0 z-40">
        <div className="container flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Sparkles className="h-6 w-6 text-primary" />
              <div className="absolute inset-0 blur-md bg-primary/40 rounded-full" />
            </div>
            <span className="font-bold text-xl sm:text-2xl tracking-tight">
              PULSE<span className="neon-text">PASS</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {visible.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-[15px] font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end text-xs sm:text-sm">
              <span className="text-muted-foreground truncate max-w-[160px]">{user?.email}</span>
              <span className="font-mono text-primary uppercase tracking-wider">{roles.join(" · ") || "user"}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {/* Mobile nav */}
        <nav className="md:hidden border-t border-border/60 overflow-x-auto">
          <div className="flex gap-1 px-2 py-2 min-w-max">
            {visible.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap",
                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
                  )
                }
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </header>
      <main className="flex-1 container py-10 lg:py-12 animate-fade-up">
        <Outlet />
      </main>
      <footer className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>PulsePass · Smart Event Entry</span>
        </span>
      </footer>
    </div>
  );
}
