"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  ChevronRight,
  Database,
  LogOut,
  RefreshCw,
  ShoppingCart,
  Users,
  Baby,
} from "lucide-react";

const menuGroups = [
  {
    label: "",
    items: [
      {
        label: "Tổng quan",
        href: "/dashboard",
        icon: BarChart3,
      },
    ],
  },
  {
    label: "DATA",
    items: [
      {
        label: "Lead",
        href: "/dashboard/leads",
        icon: Users,
      },
      {
        label: "Co-Data",
        href: "/dashboard/co-data",
        icon: Database,
      },
    ],
  },
  {
    label: "ENGAGEMENT",
    items: [
      {
        label: "Co-Edu",
        href: "/dashboard/co-edu",
        icon: BookOpen,
      },
      {
        label: "Co-Lead",
        href: "/dashboard/co-lead",
        icon: Baby,
      },
    ],
  },
  {
    label: "SALES",
    items: [
      {
        label: "Co-Sell",
        href: "/dashboard/co-sell",
        icon: ShoppingCart,
      },
    ],
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/dashboard/login", {
        method: "DELETE",
      });
    } finally {
      router.push("/dashboard/login");
      router.refresh();
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside className="flex h-screen w-[250px] shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#173B8F] text-white">
            <BarChart3 size={21} strokeWidth={2} />
          </div>

          <div>
            <div className="text-[15px] font-bold tracking-tight text-slate-900">
              ZMOMS
            </div>
            <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">
              Dashboard
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <div className="space-y-6">
          {menuGroups.map((group, groupIndex) => (
            <div key={group.label || `group-${groupIndex}`}>
              {group.label && (
                <div className="mb-2 px-3 text-[10px] font-bold tracking-[0.14em] text-slate-400">
                  {group.label}
                </div>
              )}

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                        active
                          ? "bg-[#173B8F] text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <Icon
                        size={18}
                        strokeWidth={active ? 2.2 : 1.9}
                        className={
                          active
                            ? "text-white"
                            : "text-slate-400 group-hover:text-slate-600"
                        }
                      />

                      <span className="flex-1">{item.label}</span>

                      {active && <ChevronRight size={15} strokeWidth={2.2} />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div className="border-t border-slate-200 p-3">
        <button
          type="button"
          onClick={handleRefresh}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <RefreshCw size={17} strokeWidth={1.9} />
          <span>Làm mới dữ liệu</span>
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <LogOut size={17} strokeWidth={1.9} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
