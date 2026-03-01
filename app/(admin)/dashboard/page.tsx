"use client";
import Link from "next/link";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useSidebar } from "@/hooks/use-sidebar";
import { useStore } from "@/hooks/use-store";
import { ChartAreaInteractive } from "@/components/charts/chart-area-interactive";
import { ChartBarInteractive } from "@/components/charts/chart-bar-interactive";
import { ChartBarMixed } from "@/components/charts/chart-bar-mixed";

export default function DashboardPage() {
  const sidebar = useStore(useSidebar, (x) => x);
  if (!sidebar) return null;
  return (
    <ContentLayout title="Dashboard">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="gap-6 mt-6">
        <ChartAreaInteractive />
        <div className="w-full flex gap-6 mt-6">
          <div className="w-2/3">
            <ChartBarInteractive />
          </div>
          <div className="w-1/3">
            <ChartBarMixed />
          </div>
        </div>
      </div>
    </ContentLayout>
  );
}
