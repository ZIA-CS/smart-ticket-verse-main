import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { Sparkles, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const signInSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(72),
});
const signUpSchema = signInSchema.extend({
  fullName: z.string().trim().min(1).max(100),
});

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signIn, register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"signin" | "signup">("signin");

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const canSignIn = email.trim().length > 0 && password.length > 0;
  const canSignUp = fullName.trim().length > 0 && email.trim().length > 0 && password.length > 0;

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    const requested = searchParams.get("tab");
    if (requested === "signup" || requested === "signin") {
      setTab(requested);
    }
  }, [searchParams]);

  useEffect(() => {
    setEmail("");
    setPassword("");
    if (tab === "signin") setFullName("");
  }, [tab]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSignIn) {
      toast.error("Email and password are required");
      return;
    }
    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    try {
      await signIn(parsed.data.email, parsed.data.password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSignUp) {
      toast.error("Full name, email, and password are required");
      return;
    }
    const parsed = signUpSchema.safeParse({ email, password, fullName });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    try {
      const parts = parsed.data.fullName.trim().split(/\s+/);
      const firstName = parts[0] || "";
      const lastName = parts.slice(1).join(" ");
      await register({
        email: parsed.data.email,
        password: parsed.data.password,
        firstName,
        lastName,
      });
      toast.success("Account created. Please sign in.");
      setTab("signin");
      navigate("/auth?tab=signin", { replace: true });
    } catch (error: any) {
      toast.error(error.message || "Unable to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <Sparkles className="h-7 w-7 text-primary animate-pulse-neon rounded-full" />
            <h1 className="text-3xl font-bold tracking-tight">
              PULSE<span className="neon-text">PASS</span>
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">Smart event ticketing & entry</p>
        </div>

        <div className="glass-card rounded-2xl p-6 neon-border">
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4" autoComplete="off">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="off" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="off" />
                </div>
                <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading || !canSignIn}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4" autoComplete="off">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required autoComplete="off" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-up">Email</Label>
                  <Input id="email-up" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="off" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-up">Password</Label>
                  <Input id="password-up" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="off" />
                </div>
                <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading || !canSignUp}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="mt-6 pt-6 border-t border-border/60 text-center text-xs text-muted-foreground">
            Use your email and password to sign in.
          </p>
        </div>
      </div>
    </div>
  );
}
