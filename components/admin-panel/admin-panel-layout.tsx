"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Footer } from "@/components/admin-panel/footer";
import { Sidebar } from "@/components/admin-panel/sidebar";
import { useSidebar } from "@/hooks/use-sidebar";
import { useStore } from "@/hooks/use-store";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isReady } = useAuth();

  const sidebar = useStore(useSidebar, (x) => x);

  useEffect(() => {
    if (!isReady) return;

    // если не залогинен
    if (!user) {
      router.replace("/");
      return;
    }

    // если не admin
    if (user.role !== "admin") {
      router.replace("/"); // или /403
    }
  }, [user, isReady, router]);

  // пока проверяем auth — ничего не рендерим
  if (!isReady || !user || user.role !== "admin") {
    return null;
  }

  if (!sidebar) return null;

  const { getOpenState, settings } = sidebar;

  return (
    <>
      <Sidebar />
      <main
        className={cn(
          "min-h-[calc(100vh-56px)] bg-zinc-50 dark:bg-zinc-900 transition-[margin-left] ease-in-out duration-300",
          !settings.disabled && (!getOpenState() ? "lg:ml-22.5" : "lg:ml-72")
        )}
      >
        {children}
      </main>
      <footer
        className={cn(
          "transition-[margin-left] ease-in-out duration-300",
          !settings.disabled && (!getOpenState() ? "lg:ml-22.5" : "lg:ml-72")
        )}
      >
        <Footer />
      </footer>
    </>
  );
}