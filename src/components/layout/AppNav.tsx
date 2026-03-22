"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Library, Settings, LogOut, UserCircle, Feather } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth/context";

const navItems = [
  { icon: Library,  label: "Library",  href: "/" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function AppNav() {
  const pathname        = usePathname();
  const { user, signOut } = useAuth();

  const displayName = user?.name  ?? "—";
  const displayEmail= user?.email ?? "";
  const avatar      = user ? initials(user.name) : "?";

  return (
    <nav className="fixed left-0 top-0 h-full w-14 flex flex-col items-center bg-parchment border-r border-parchment-deep z-40 py-4">

      {/* Logo */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href="/"
            className="flex items-center justify-center w-9 h-9 mb-5 text-ink hover:text-sage transition-colors"
          >
            <Feather className="w-[18px] h-[18px]" strokeWidth={1.5} />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className="font-serif">Prologue</TooltipContent>
      </Tooltip>

      {/* Nav items */}
      <div className="flex-1 flex flex-col items-center gap-1">
        {navItems.map(({ icon: Icon, label, href }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Tooltip key={href}>
              <TooltipTrigger asChild>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center justify-center w-9 h-9 rounded-lg transition-all",
                    active
                      ? "bg-parchment-warm text-ink"
                      : "text-ink-faint hover:text-ink hover:bg-parchment-warm"
                  )}
                >
                  <Icon className="w-[17px] h-[17px]" strokeWidth={1.5} />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{label}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      {/* Profile */}
      <div className="mt-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center justify-center w-9 h-9 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-sage/40 hover:opacity-85 transition-opacity"
              style={{ background: "linear-gradient(135deg, #a8c4b0, #7a9e87)" }}
              title="Profile"
            >
              <span className="text-[11px] font-semibold text-white tracking-wide select-none">
                {avatar}
              </span>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent side="right" align="end" sideOffset={12} className="w-56">
            {/* Profile header */}
            <DropdownMenuLabel className="py-3 px-3">
              <div
                className="w-8 h-8 rounded-full mb-2 flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #a8c4b0, #7a9e87)" }}
              >
                <span className="text-[10px] font-semibold text-white">{avatar}</span>
              </div>
              <p className="font-serif text-sm font-semibold text-ink leading-none">{displayName}</p>
              <p className="text-[11px] text-ink-faint mt-0.5 font-sans truncate">{displayEmail}</p>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center gap-2">
                <UserCircle className="w-4 h-4" />
                Profile &amp; Account
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Preferences
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="flex items-center gap-2 text-red-500 focus:text-red-500 cursor-pointer"
              onClick={signOut}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
