import { Sidebar } from "@/components/Sidebar";

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="lg:pl-64 p-4 flex items-start justify-center pt-20">
        {children}
      </main>
    </div>
  );
} 