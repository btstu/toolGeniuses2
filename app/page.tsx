import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  ImageIcon,
  Paintbrush,
  QrCode,
  Calendar,
  Mic,
  Binary,
  BarChart3,
  Ruler,
  FileText,
} from "lucide-react";

const tools = [
  {
    name: "Image to CSS",
    href: "/tools/image-css",
    icon: ImageIcon,
    gradient: "from-pink-500 to-violet-500",
    delay: "100",
 
  },
  {
    name: "RGB to HEX",
    href: "/tools/color",
    icon: Paintbrush,
    gradient: "from-green-400 to-cyan-500",
    delay: "200",
  },
  {
    name: "QR Generator",
    href: "/tools/qr",
    icon: QrCode,
    gradient: "from-blue-400 to-indigo-500",
    delay: "300",
  },
  {
    name: "Unit Converter",
    href: "/tools/units",
    icon: Ruler,
    gradient: "from-fuchsia-400 to-violet-500",
    delay: "400",
  },
  {
    name: "Date Calculator",
    href: "/tools/date",
    icon: Calendar,
    gradient: "from-yellow-500 to-orange-500",
    delay: "500",
  },
  {
    name: "Speech to Text",
    href: "/tools/speech",
    icon: Mic,
    gradient: "from-purple-400 to-pink-500",
    delay: "600",
  },
  {
    name: "ASCII Art",
    href: "/tools/ascii",
    icon: Binary,
    gradient: "from-indigo-400 to-cyan-400",
    delay: "800",
  },
  {
    name: "Crypto Tools",
    href: "/tools/crypto",
    icon: BarChart3,
    gradient: "from-rose-400 to-red-500",
    delay: "1000",
  },
  {
    name: "Image to Text",
    href: "/tools/ocr",
    icon: FileText,
    gradient: "from-emerald-400 to-teal-500",
    delay: "900",
  },
];

export default function Home() {
  return (
    <main className="flex-1 min-h-screen px-8 pb-4 pt-16">
      <div className="max-w-6xl mx-auto">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter animate-fade-in">
            🛠️ Tool Geniuses 2.0
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl opacity-0 animate-fade-in animation-delay-200">
              A collection of free modern tools for developers, designers, and creators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <Link
                key={tool.name}
                href={tool.href}
                className={cn(
                  "group relative p-6 rounded-xl overflow-hidden",
                  "border border-border/50 hover:border-border",
                  "transition-all duration-300 hover:shadow-lg",
                  "opacity-0 animate-slide-up",
                  `animation-delay-${tool.delay}`
                )}
              >
                <div
                  className={cn(
                    "absolute inset-0 opacity-25 group-hover:opacity-100 transition-opacity",
                    "bg-gradient-to-r",
                    tool.gradient
                  )}
                />
                <div className="relative">
                  <tool.icon className="w-8 h-8 mb-3 transition-transform group-hover:scale-110" />
                  <h2 className="text-xl font-semibold mb-2">{tool.name}</h2>
                  <div className="flex items-center text-muted-foreground">
                    <span className="text-sm text-muted-foreground group-hover:text-white transition-colors">Try it now →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
