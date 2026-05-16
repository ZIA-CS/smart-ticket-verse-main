import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const HomePage = () => (
  <div className="min-h-screen flex flex-col">
    <header className="border-b border-border/60 backdrop-blur-xl bg-background/70 sticky top-0 z-40">
      <div className="container flex h-16 items-center justify-between gap-4 text-left">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Sparkles className="h-6 w-6 text-primary" />
            <div className="absolute inset-0 blur-md bg-primary/40 rounded-full" />
          </div>
          <span className="font-bold text-xl sm:text-2xl tracking-tight">
            PULSE<span className="neon-text">PASS</span>
          </span>
        </div>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link to="/auth?tab=signin">Login</Link>
          </Button>
          <Button asChild variant="hero">
            <Link to="/auth?tab=signup">Registration</Link>
          </Button>
        </nav>
      </div>
    </header>

    <main className="flex-1">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
        <div className="container py-16 sm:py-20 lg:py-24 text-left">
          <div className="max-w-2xl">
            <p className="uppercase tracking-[0.3em] text-xs text-muted-foreground">Smart Ticketing, Real Time Access</p>
            <h1 className="mt-4">
              Welcome to <span className="neon-text">PulsePass</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground">
              PulsePass is your all-in-one platform for discovering events, reserving tickets, and gliding through entry
              with a single scan. From local meetups to stadium-sized shows, we make check-ins faster, safer, and more
              memorable for everyone.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button asChild variant="hero" size="lg">
                <Link to="/auth?tab=signup">Create your account</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/auth?tab=signin">Already a member</Link>
              </Button>
            </div>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Instant QR Entry", copy: "No printing, no delays. Tickets live in your wallet and scan in seconds." },
              { title: "Organizer Control", copy: "Manage access, capacity, and live attendance from one dashboard." },
              { title: "Secure by Design", copy: "Role-based access, verified tickets, and smart audit trails." },
            ].map((item) => (
              <div key={item.title} className="glass-card rounded-2xl p-6 text-left">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>

    <footer className="border-t border-border/60">
      <div className="container py-6 text-left text-xs text-muted-foreground flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <span>Built for the nights you remember and the moments you never want to miss.</span>
        <span className="inline-flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>PulsePass · Where tickets glow and gates flow.</span>
        </span>
      </div>
    </footer>
  </div>
);

export default HomePage;
