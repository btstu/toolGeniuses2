'use client';

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="rounded-full w-9 h-9 bg-black dark:bg-white border-border"
    >
      <Sun className="h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100 text-white dark:text-black" />
      <Moon className="absolute h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0 text-white dark:text-black" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
} 