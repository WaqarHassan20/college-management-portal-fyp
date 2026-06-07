"use client";

import { Bell, Menu, RefreshCw, X } from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  audience: "All" | "Students" | "Faculty";
  priority: "Low" | "Medium" | "High";
}

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const [allAnnouncements, setAllAnnouncements] = useState<Announcement[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const { user } = useUser();
  const userId = user?.id || "anonymous";
  const role = (user?.publicMetadata?.role as string || "student").toLowerCase();
  const isAdmin = role === "admin";

  // Filter out any dismissed announcements
  const visibleAnnouncements = allAnnouncements.filter(
    (a) => !dismissedIds.includes(a.id)
  );

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.get<Announcement[]>("/api/announcements");
      const data = Array.isArray(res.data) ? res.data : [];
      setAllAnnouncements(data);
    } catch (err) {
      console.error("Failed to fetch announcements for bell:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load user-scoped dismissed announcements from localStorage
  useEffect(() => {
    if (userId) {
      const stored = localStorage.getItem(`dismissed_announcements_${userId}`);
      if (stored) {
        try {
          setDismissedIds(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse dismissed announcements:", e);
        }
      }
    }
  }, [userId]);

  // Recalculate unread count based on visible non-dismissed announcements
  useEffect(() => {
    const lastReadStr = localStorage.getItem(`last_read_announcement_time_${userId}`);
    const visible = allAnnouncements.filter((a) => !dismissedIds.includes(a.id));
    if (lastReadStr) {
      const lastReadTime = new Date(lastReadStr).getTime();
      const unread = visible.filter(
        (a) => new Date(a.date).getTime() > lastReadTime
      ).length;
      setUnreadCount(unread);
    } else {
      setUnreadCount(visible.length);
    }
  }, [allAnnouncements, dismissedIds, userId]);

  useEffect(() => {
    fetchAnnouncements();

    // Poll every 30 seconds for live updates
    const interval = setInterval(fetchAnnouncements, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenChange = (open: boolean) => {
    if (open && userId) {
      // Mark as read when opened
      const nowStr = new Date().toISOString();
      localStorage.setItem(`last_read_announcement_time_${userId}`, nowStr);
      setUnreadCount(0);
    }
  };

  const dismissAnnouncement = (id: string) => {
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    if (userId) {
      localStorage.setItem(`dismissed_announcements_${userId}`, JSON.stringify(updated));
    }
  };

  const dismissAllAnnouncements = () => {
    const allIds = allAnnouncements.map((a) => a.id);
    const updated = Array.from(new Set([...dismissedIds, ...allIds]));
    setDismissedIds(updated);
    if (userId) {
      localStorage.setItem(`dismissed_announcements_${userId}`, JSON.stringify(updated));
    }
    setUnreadCount(0);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b-2 border-border bg-card/80 backdrop-blur-md px-4 lg:px-6">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden flex h-9 w-9 items-center justify-center rounded-none border-2 border-border bg-card shadow-[2px_2px_0px_0px_var(--border)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--border)] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_var(--border)] transition-all cursor-pointer"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Right section */}
      <div className="ml-auto flex items-center gap-3">
        {/* Notifications */}
        {!isAdmin && (
          <DropdownMenu onOpenChange={handleOpenChange}>
            <DropdownMenuTrigger asChild>
              <button
                className="relative h-9 w-9 rounded-none border-2 border-border bg-card flex items-center justify-center shadow-[2px_2px_0px_0px_var(--border)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--border)] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_var(--border)] transition-all cursor-pointer focus:outline-none"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4 text-muted-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-none border border-border bg-system-danger text-[9px] font-black text-white shadow-[1px_1px_0px_0px_var(--border)]">
                    {unreadCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-80 rounded-none border-2 border-border bg-card p-0 shadow-[4px_4px_0px_0px_var(--border)] text-foreground z-50"
            >
              <DropdownMenuLabel className="p-4 flex items-center justify-between border-b-2 border-border font-black text-sm uppercase tracking-wider rounded-none">
                <div className="flex items-center gap-2">
                  <span>Notifications</span>
                  {loading && <RefreshCw className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
                </div>
                {visibleAnnouncements.length > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dismissAllAnnouncements();
                    }}
                    className="text-[10px] font-bold text-brand-primary hover:underline uppercase tracking-wide cursor-pointer focus:outline-none"
                  >
                    Clear All
                  </button>
                )}
              </DropdownMenuLabel>

              <div className="max-h-80 overflow-y-auto divide-y-2 divide-border">
                {visibleAnnouncements.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    No notifications yet.
                  </div>
                ) : (
                  visibleAnnouncements.slice(0, 5).map((a) => (
                    <div key={a.id} className="relative p-4 hover:bg-muted/50 transition-colors flex flex-col gap-1.5 group/card">
                      <div className="flex items-start justify-between gap-2 pr-6">
                        <span className="font-bold text-sm line-clamp-1 text-foreground leading-tight">
                          {a.title}
                        </span>
                        <span className="text-[10px] font-black px-1.5 py-0.5 border border-border uppercase shrink-0 tracking-wider shadow-[1px_1px_0px_0px_var(--border)] rounded-none bg-card select-none">
                          {a.priority}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dismissAnnouncement(a.id);
                        }}
                        className="absolute top-3 right-3 opacity-0 group-hover/card:opacity-100 p-1 hover:bg-accent border border-transparent hover:border-border transition-all cursor-pointer text-muted-foreground hover:text-foreground"
                        title="Dismiss"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed whitespace-pre-wrap">
                        {a.content}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
                        <span>By: {a.author}</span>
                        <span>{formatRelativeTime(a.date)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <DropdownMenuSeparator className="-mx-0 my-0 bg-border h-0.5" />
              
              <Link
                href="/dashboard/announcements"
                className="flex w-full items-center justify-center p-3 text-xs font-black uppercase tracking-wider hover:bg-muted transition-colors border-t-0 text-brand-primary"
              >
                View All Announcements
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* User button */}
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "h-9 w-9 ring-2 ring-brand-primary/20",
            },
          }}
        />
      </div>
    </header>
  );
}
