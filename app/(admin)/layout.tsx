import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import AdminOnlyProvider from "@/components/providers/auth-provider";

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminPanelLayout>
      <AdminOnlyProvider>{children}</AdminOnlyProvider>
    </AdminPanelLayout>
  );
}
