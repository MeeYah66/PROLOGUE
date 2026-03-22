"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Library, Settings, LogOut, UserRound, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";
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
  { icon: Library,   label: "Library",  href: "/" },
  { icon: UserRound, label: "Profile",  href: "/profile" },
  { icon: Settings,  label: "Settings", href: "/settings" },
];

function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function Avatar({ avatarUrl, name, size = "md" }: { avatarUrl?: string; name: string; size?: "sm" | "md" }) {
  const sz = size === "sm" ? "w-7 h-7 text-[10px]" : "w-8 h-8 text-[11px]";
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={name}
        className={cn(sz, "rounded-full object-cover shrink-0")}
      />
    );
  }
  return (
    <div
      className={cn(sz, "rounded-full flex items-center justify-center shrink-0")}
      style={{ backgroundColor: "#2d2d2d" }}
    >
      <span className="font-semibold tracking-wide select-none" style={{ color: "#c9a84c" }}>
        {initials(name)}
      </span>
    </div>
  );
}

export function AppNav() {
  const pathname          = usePathname();
  const { user, signOut } = useAuth();

  const displayName  = user?.name  ?? "—";
  const displayEmail = user?.email ?? "";

  return (
    <nav className="fixed left-0 top-0 h-full w-48 flex flex-col bg-parchment border-r border-parchment-deep z-40 py-5 px-3">

      {/* Brand */}
      <Link href="/" className="flex items-center gap-2.5 px-2 mb-7 group">
        <div className="w-7 h-7 rounded-lg bg-ink flex items-center justify-center shrink-0 group-hover:bg-ink-soft transition-colors">
          <PenLine className="w-3.5 h-3.5 text-parchment" strokeWidth={2} />
        </div>
        <span className="font-serif text-base font-semibold text-ink tracking-tight">
          Prologue
        </span>
      </Link>

      {/* Nav items */}
      <div className="flex-1 flex flex-col gap-0.5">
        {navItems.map(({ icon: Icon, label, href }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                active
                  ? "bg-parchment-warm text-ink font-medium"
                  : "text-ink-faint hover:text-ink hover:bg-parchment-warm"
              )}
            >
              <Icon className="w-[17px] h-[17px] shrink-0" strokeWidth={1.5} />
              {label}
            </Link>
          );
        })}
      </div>

      {/* Profile */}
      <div className="mt-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 w-full px-2 py-2 rounded-lg hover:bg-parchment-warm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/30">
              <Avatar avatarUrl={user?.avatarUrl} name={displayName} size="sm" />
              <div className="text-left min-w-0">
                <p className="text-xs font-medium text-ink truncate leading-none">{displayName}</p>
                <p className="text-[10px] text-ink-faint truncate mt-0.5 leading-none">{displayEmail}</p>
              </div>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent side="right" align="end" sideOffset={12} className="w-56">
            <DropdownMenuLabel className="py-3 px-3">
              <Avatar avatarUrl={user?.avatarUrl} name={displayName} size="md" />
              <p className="font-serif text-sm font-semibold text-ink leading-none mt-2">{displayName}</p>
              <p className="text-[11px] text-ink-faint mt-0.5 font-sans truncate">{displayEmail}</p>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center gap-2">
                <UserRound className="w-4 h-4" />
                Profile &amp; Identity
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
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
