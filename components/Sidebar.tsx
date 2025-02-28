'use client';

import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Paintbrush, Ruler, Clock, DollarSign, QrCode, FileText, Mic, Palette } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";

const tools = [
  {
    name: "Color Tools",
    icon: <Paintbrush className="w-5 h-5" />,
    href: "/tools/color",
    color: "bg-gradient-to-r from-pink-500 to-violet-500",
    emoji: ""
  },
  {
    name: "Unit Converter",
    icon: <Ruler className="w-5 h-5" />,
    href: "/tools/units",
    color: "bg-gradient-to-r from-green-400 to-cyan-500",
    emoji: ""
  },
  {
    name: "Date Calculator",
    icon: <Clock className="w-5 h-5" />,
    href: "/tools/date",
    color: "bg-gradient-to-r from-blue-400 to-indigo-500",
    emoji: ""
  },
  {
    name: "Crypto Tools",
    icon: <DollarSign className="w-5 h-5" />,
    href: "/tools/crypto",
    color: "bg-gradient-to-r from-yellow-500 to-orange-500",
    emoji: ""
  },
  {
    name: "QR Generator",
    icon: <QrCode className="w-5 h-5" />,
    href: "/tools/qr",
    color: "bg-gradient-to-r from-purple-400 to-pink-500",
    emoji: ""
  },
  {
    name: "ASCII Art",
    icon: <FileText className="w-5 h-5" />,
    href: "/tools/ascii",
    color: "bg-gradient-to-r from-indigo-400 to-cyan-400",
    emoji: ""
  },
  {
    name: "Speech to Text",
    icon: <Mic className="w-5 h-5" />,
    href: "/tools/speech",
    color: "bg-gradient-to-r from-rose-400 to-red-500",
    emoji: ""
  },
  {
    name: "Image to CSS",
    icon: <Palette className="w-5 h-5" />,
    href: "/tools/image-css",
    color: "bg-gradient-to-r from-fuchsia-400 to-violet-500",
    emoji: ""
  },
  {
    name: "Image to Text",
    icon: <FileText className="w-5 h-5" />,
    href: "/tools/ocr",
    color: "bg-gradient-to-r from-emerald-400 to-teal-500",
    emoji: ""
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="fixed left-4 top-4 lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0 bg-background border-r">
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <SidebarContent setOpen={setOpen} />
      </SheetContent>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex h-screen w-64 flex-col fixed left-0 top-0 border-r bg-background">
        <SidebarContent setOpen={setOpen} />
      </aside>
    </Sheet>
  );
}

function SidebarContent({ setOpen }: { setOpen: (open: boolean) => void }) {
  const pathname = usePathname();
  
  return (
    <div className="flex flex-col gap-2 p-4 bg-background">
      <Link href="/" className="text-xl font-semibold mb-4 text-foreground">🛠️ ToolsGeniuses 2.0</Link>
      {tools.map((tool) => (
        <Link
          key={tool.href}
          href={tool.href}
          onClick={() => setOpen(false)}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
            pathname === tool.href 
              ? "bg-secondary text-secondary-foreground" 
              : "hover:bg-secondary/50"
          )}
        >
          <div className={`p-2 rounded-md ${tool.color} text-white`}>
            {tool.icon}
          </div>
          <span>{tool.emoji} {tool.name}</span>
        </Link>
      ))}
    </div>
  );
} 