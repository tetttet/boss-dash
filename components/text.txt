"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, Lock } from "lucide-react";

import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      await login({ email, password });

      // после логина читаем user из localStorage
      const storedUser = localStorage.getItem("auth.user");
      const user = storedUser ? JSON.parse(storedUser) : null;

      if (user?.role === "admin") {
        router.push("/dashboard");
      } else {
        router.push("/");
      }
    } catch (e: unknown) {
      if (
        e &&
        typeof e === "object" &&
        "message" in e &&
        typeof (e as { message?: unknown }).message === "string"
      ) {
        setError((e as { message: string }).message);
      } else {
        setError("Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* LEFT — IMAGE */}
      <div className="relative hidden md:block">
        <Image
          src="https://plus.unsplash.com/premium_photo-1683121263622-664434494177?w=900&auto=format&fit=crop&q=60"
          alt="Fashion brand"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute bottom-10 left-10 text-white max-w-md">
          <h1 className="text-4xl font-semibold tracking-tight">
            Timeless elegance
          </h1>
          <p className="mt-3 text-sm opacity-80">
            Discover a new level of premium experience
          </p>
        </div>
      </div>

      {/* RIGHT — LOGIN */}
      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-none shadow-none">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-medium">
              Sign in to your account
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Welcome back. Please enter your details.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <div className="text-sm text-red-500 text-center">{error}</div>
            )}

            <div className="flex items-center gap-4">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">OR</span>
              <Separator className="flex-1" />
            </div>

            {/* EMAIL */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleLogin();
                  }}
                />
              </div>
            </div>

            {/* LOGIN BUTTON */}
            <Button className="w-full" onClick={handleLogin} disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>

            <p className="text-center text-sm text-muted-foreground mt-2">
              Read documentation about Bossforskiy{" "}
              <Link href="/docs" className="underline text-black">
                here
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
