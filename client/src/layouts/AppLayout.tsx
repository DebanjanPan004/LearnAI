import { BookOpen, Brain, FileText, GraduationCap, LayoutDashboard, LineChart, MessageSquare, NotebookTabs, LogOut, User as UserIcon, Menu, X } from "lucide-react";
import { NavLink, Outlet, Navigate, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import { logout } from "../redux/authSlice";
import type { RootState } from "../redux/store";

const navItems = [
  { label: "Dashboard",  href: "/dashboard",  icon: LayoutDashboard },
  { label: "Documents",  href: "/documents",  icon: FileText },
  { label: "AI Tutor",   href: "/chat",        icon: MessageSquare },
  { label: "Flashcards", href: "/flashcards",  icon: NotebookTabs },
  { label: "Quizzes",    href: "/quiz",        icon: Brain },
  { label: "Planner",   href: "/planner",     icon: GraduationCap },
  { label: "Progress",  href: "/progress",    icon: LineChart },
];

export function AppLayout() {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth");
  };

  return (
    <div className="min-h-screen" style={{ background: "transparent" }}>

      {/* ───── Desktop Sidebar ───── */}
      <aside
        className="fixed inset-y-0 left-0 hidden w-64 lg:flex flex-col"
        style={{
          background: "linear-gradient(180deg, #1f4536 0%, #163327 100%)",
          borderRight: "1px solid rgba(201,162,39,0.2)",
        }}
      >
        {/* Brand */}
        <div className="px-5 pt-6 pb-5" style={{ borderBottom: "1px solid rgba(201,162,39,0.15)" }}>
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ background: "linear-gradient(135deg, #6b1f2a, #4a151d)", boxShadow: "0 0 0 1px rgba(201,162,39,0.4)" }}
            >
              <BookOpen size={20} color="#e7c766" />
            </span>
            <div>
              <p
                className="text-base leading-tight"
                style={{ fontFamily: "var(--font-display)", color: "#e7c766", letterSpacing: "0.04em" }}
              >
                LearnAI
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ fontFamily: "var(--font-mono)", color: "rgba(231,199,102,0.5)", letterSpacing: "0.15em", textTransform: "uppercase", fontSize: "9px" }}
              >
                Your Study Shelf
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded px-3 py-2.5 text-sm transition-all ${
                  isActive
                    ? "text-parchment"
                    : "hover:bg-white/5"
                }`
              }
              style={({ isActive }) => isActive ? {
                background: "linear-gradient(90deg, rgba(107,31,42,0.7), rgba(107,31,42,0.3))",
                color: "#f2e8d5",
                borderLeft: "2px solid #c9a227",
                paddingLeft: "10px",
                fontFamily: "var(--font-body)",
              } : {
                color: "rgba(242,232,213,0.6)",
                borderLeft: "2px solid transparent",
                fontFamily: "var(--font-body)",
              }}
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User Profile */}
        <div className="px-3 pb-5" style={{ borderTop: "1px solid rgba(201,162,39,0.15)" }}>
          <div
            className="flex items-center gap-3 rounded-md p-3 mt-4"
            style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(201,162,39,0.15)" }}
          >
            <span
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
              style={{ background: "rgba(107,31,42,0.5)", border: "1px solid rgba(201,162,39,0.3)" }}
            >
              <UserIcon size={16} color="#e7c766" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium" style={{ color: "#f2e8d5", fontFamily: "var(--font-body)" }}>
                {user?.name ?? "Student"}
              </p>
              <p className="truncate" style={{ fontSize: "10px", color: "rgba(231,199,102,0.5)", fontFamily: "var(--font-mono)" }}>
                {user?.email ?? ""}
              </p>
            </div>
            <button
              onClick={handleLogout}
              style={{ color: "rgba(231,199,102,0.45)" }}
              className="hover:text-brass-light transition-colors"
              title="Log Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ───── Mobile Top Header ───── */}
      <header
        className="flex h-16 items-center justify-between px-4 lg:hidden"
        style={{
          background: "linear-gradient(90deg, #163327, #1f4536)",
          borderBottom: "1px solid rgba(201,162,39,0.2)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-lg"
            style={{ background: "linear-gradient(135deg, #6b1f2a, #4a151d)", boxShadow: "0 0 0 1px rgba(201,162,39,0.4)" }}
          >
            <BookOpen size={18} color="#e7c766" />
          </span>
          <span style={{ fontFamily: "var(--font-display)", color: "#e7c766", fontSize: "18px", letterSpacing: "0.04em" }}>
            LearnAI
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-md p-1.5 transition"
          style={{ color: "rgba(231,199,102,0.7)" }}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* ───── Mobile Dropdown Menu ───── */}
      {mobileMenuOpen && (
        <div
          className="px-4 py-3 lg:hidden"
          style={{
            background: "linear-gradient(180deg, #1f4536, #163327)",
            borderBottom: "1px solid rgba(201,162,39,0.2)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          <nav className="space-y-0.5">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded px-3 py-2.5 text-sm transition-all ${isActive ? "" : ""}`
                }
                style={({ isActive }) => isActive ? {
                  background: "rgba(107,31,42,0.6)",
                  color: "#f2e8d5",
                  borderLeft: "2px solid #c9a227",
                  paddingLeft: "10px",
                  fontFamily: "var(--font-body)",
                } : {
                  color: "rgba(242,232,213,0.6)",
                  fontFamily: "var(--font-body)",
                }}
              >
                <item.icon size={17} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-4 pt-4 flex items-center justify-between" style={{ borderTop: "1px solid rgba(201,162,39,0.15)" }}>
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{ background: "rgba(107,31,42,0.5)", border: "1px solid rgba(201,162,39,0.3)" }}
              >
                <UserIcon size={15} color="#e7c766" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm" style={{ color: "#f2e8d5", fontFamily: "var(--font-body)" }}>
                  {user?.name ?? "Student"}
                </p>
                <p className="truncate" style={{ fontSize: "10px", color: "rgba(231,199,102,0.5)", fontFamily: "var(--font-mono)" }}>
                  {user?.email ?? ""}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded px-3 py-1.5 text-sm transition"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                letterSpacing: "0.1em",
                color: "#e7c766",
                border: "1px solid rgba(107,31,42,0.5)",
                background: "rgba(107,31,42,0.25)",
              }}
            >
              <LogOut size={14} />
              Log Out
            </button>
          </div>
        </div>
      )}

      {/* ───── Main Content ───── */}
      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
