import { BookOpen, Brain, FileText, GraduationCap, LayoutDashboard, LineChart, MessageSquare, NotebookTabs, LogOut, User as UserIcon, Menu, X } from "lucide-react";
import { NavLink, Outlet, Navigate, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import { logout } from "../redux/authSlice";
import type { RootState } from "../redux/store";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Documents", href: "/documents", icon: FileText },
  { label: "AI Tutor", href: "/chat", icon: MessageSquare },
  { label: "Flashcards", href: "/flashcards", icon: NotebookTabs },
  { label: "Quizzes", href: "/quiz", icon: Brain },
  { label: "Planner", href: "/planner", icon: GraduationCap },
  { label: "Progress", href: "/progress", icon: LineChart }
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
    <div className="min-h-screen bg-paper text-ink">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white px-4 py-5 lg:block">
        <div className="mb-8 flex items-center gap-3 px-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand text-white">
            <BookOpen size={22} />
          </span>
          <div>
            <p className="text-lg font-bold">LearnAI</p>
            <p className="text-xs text-slate-500">Upload. Learn. Practice. Master.</p>
          </div>
        </div>
        
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
                  isActive ? "bg-blue-50 text-brand" : "text-slate-600 hover:bg-slate-100 hover:text-ink"
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User profile & Logout */}
        <div className="absolute bottom-5 left-0 w-full px-4">
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 shadow-soft">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-brand">
              <UserIcon size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">{user?.name ?? "Student"}</p>
              <p className="truncate text-xs text-slate-500">{user?.email ?? ""}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-coral transition-colors"
              title="Log Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white">
            <BookOpen size={18} />
          </span>
          <span className="font-bold text-lg">LearnAI</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-200 bg-white px-4 py-3 shadow-soft lg:hidden">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${
                    isActive ? "bg-blue-50 text-brand" : "text-slate-600 hover:bg-slate-100 hover:text-ink"
                  }`
                }
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}
          </nav>
          
          <div className="mt-4 border-t border-slate-100 pt-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-brand">
                <UserIcon size={16} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">{user?.name ?? "Student"}</p>
                <p className="truncate text-xs text-slate-500">{user?.email ?? ""}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-coral hover:bg-red-50 transition"
            >
              <LogOut size={16} />
              Log Out
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

