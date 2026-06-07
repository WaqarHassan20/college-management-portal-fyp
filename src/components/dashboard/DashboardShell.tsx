"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { getNavItems } from "@/lib/sidebar-config";
import type { UserRole } from "@/types";
import { api } from "@/lib/axios";

interface DashboardShellProps {
  children: React.ReactNode;
  role: UserRole;
  roleLabel: string;
}

export function DashboardShell({ children, role, roleLabel }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [prevRole, setPrevRole] = useState(role);
  const [navItems, setNavItems] = useState(() => getNavItems(role));

  if (role !== prevRole) {
    setPrevRole(role);
    setNavItems(getNavItems(role));
  }

  useEffect(() => {
    if (role !== "admin") return;

    let isMounted = true;

    const fetchPendingCount = async () => {
      try {
        const { data } = await api.get<unknown[]>("/api/admissions?status=Pending&limit=100");
        if (!isMounted) return;
        const count = Array.isArray(data) ? data.length : 0;
        setNavItems((prev) =>
          prev.map((item) =>
            item.title === "Admissions"
              ? { ...item, badge: count > 0 ? count : undefined }
              : item
          )
        );
      } catch (err) {
        console.error("Failed to fetch pending admissions count:", err);
      }
    };

    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 30000); // Check every 30s

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [role]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        navItems={navItems}
        roleLabel={roleLabel}
        isMobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader
          onMenuClick={() => setMobileOpen(!mobileOpen)}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
