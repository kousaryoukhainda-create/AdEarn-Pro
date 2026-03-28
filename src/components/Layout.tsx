import React from 'react';
import { UserProfile } from '../types';
import { auth } from '../firebase';
import { 
  LayoutDashboard, 
  PlayCircle, 
  Wallet, 
  Settings, 
  LogOut, 
  ShieldAlert,
  Menu,
  X
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { AppSettings } from '../types';

interface LayoutProps {
  user: UserProfile;
  children: React.ReactNode;
}

export default function Layout({ user, children }: LayoutProps) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [settings, setSettings] = React.useState<AppSettings | null>(null);

  React.useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as AppSettings);
      }
    });
    return () => unsub();
  }, []);

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { label: 'Watch Ads', icon: PlayCircle, path: '/ads' },
    { label: 'Withdraw', icon: Wallet, path: '/withdraw' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  if (user.role === 'admin') {
    navItems.push({ label: 'Admin Panel', icon: ShieldAlert, path: '/admin' });
  }

  const handleLogout = () => auth.signOut();

  const appName = settings?.appName || 'AdEarn Pro';

  return (
    <div className="min-h-screen bg-dark-bg text-gray-300 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-dark-surface border-r border-dark-border p-8">
        <div className="flex items-center gap-4 mb-12 px-2">
          <div className="w-10 h-10 gold-gradient rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(217,119,6,0.3)]">
            <ShieldAlert className="text-white w-6 h-6" />
          </div>
          <span className="font-black text-2xl tracking-tighter gold-text uppercase">{appName}</span>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-300 group",
                location.pathname === item.path 
                  ? "gold-gradient text-white shadow-[0_0_20px_rgba(217,119,6,0.2)]" 
                  : "text-gray-500 hover:bg-white/5 hover:text-gold-400"
              )}
            >
              <item.icon size={20} className={cn(
                "transition-transform duration-300 group-hover:scale-110",
                location.pathname === item.path ? "text-white" : "text-gray-600 group-hover:text-gold-400"
              )} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-dark-border">
          <div className="flex items-center gap-4 px-2 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-dark-border flex items-center justify-center text-gold-400 font-black text-xl border border-gold-500/20">
              {user.email[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-100 truncate">{user.email}</p>
              <p className="text-[10px] text-gold-500/70 uppercase tracking-widest font-black">{user.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold text-red-500/80 hover:bg-red-500/10 hover:text-red-500 transition-all duration-300"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-dark-surface/90 backdrop-blur-md border-b border-dark-border px-6 py-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-3">
          <ShieldAlert className="text-gold-500 w-7 h-7" />
          <span className="font-black text-xl gold-text uppercase tracking-tighter">{appName}</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-xl bg-dark-border text-gold-400"
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-dark-bg z-40 pt-24 px-6">
          <nav className="space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-4 px-6 py-5 rounded-2xl text-lg font-bold transition-all",
                  location.pathname === item.path 
                    ? "gold-gradient text-white shadow-xl" 
                    : "text-gray-500 bg-dark-surface/50"
                )}
              >
                <item.icon size={24} />
                {item.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-6 py-5 rounded-2xl text-lg font-bold text-red-500 bg-red-500/5 mt-4"
            >
              <LogOut size={24} />
              Logout
            </button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 pt-24 md:pt-0 overflow-auto">
        <div className="max-w-6xl mx-auto p-8 md:p-12">
          {children}
        </div>
      </main>
    </div>
  );
}
