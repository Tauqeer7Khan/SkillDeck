import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Home,
  BookOpen,
  Code,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Trophy,
  BarChart3
} from 'lucide-react';

const Layout = () => {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Questions', href: '/questions', icon: BookOpen },
    { name: 'Practice', href: '/practice', icon: Code },
    { name: 'Progress', href: '/dashboard', icon: BarChart3 }, // Will scroll to progress section
    { name: 'Profile', href: '/profile', icon: User },
  ];

  // Add admin routes if user is admin
  if (isAdmin()) {
    navigation.push({ name: 'Admin', href: '/admin', icon: Settings });
  }

  const isActive = (href) => {
    if (href === '/dashboard' && location.pathname === '/dashboard') return true;
    return location.pathname === href;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex text-foreground">
      {/* Sidebar for mobile */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div className={`absolute inset-0 bg-black/50 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setSidebarOpen(false)} />
        <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-card border-r border-border transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <SidebarContent
            navigation={navigation}
            user={user}
            isActive={isActive}
            handleLogout={handleLogout}
            theme={theme}
            toggleTheme={toggleTheme}
            onClose={() => setSidebarOpen(false)}
          />
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <SidebarContent
            navigation={navigation}
            user={user}
            isActive={isActive}
            handleLogout={handleLogout}
            theme={theme}
            toggleTheme={toggleTheme}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-card shadow-md border-b border-border">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                className="lg:hidden p-2 -ml-2 mr-2 rounded-[12px] text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="lg:hidden flex items-center">
                <Trophy className="h-6 w-6 text-primary" />
                <span className="ml-2 text-lg font-bold text-foreground tracking-tight">InterviewPrep</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-foreground">{user?.username}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center shadow-sm ring-2 ring-primary/20">
                <span className="text-white text-sm font-medium">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const SidebarContent = ({ navigation, user, isActive, handleLogout, theme, toggleTheme, onClose }) => {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-card border-r border-border">
      <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-border">
        <Trophy className="h-8 w-8 text-primary" />
        <span className="ml-2 text-xl font-bold text-foreground tracking-tight">InterviewPrep</span>
        {onClose && (
          <button
            className="ml-auto p-2 rounded-[12px] text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={`group relative flex items-center px-4 py-3 my-1 text-sm font-medium rounded-[12px] transition-all duration-200 ease-in-out overflow-hidden ${isActive(item.href)
                  ? 'bg-primary/10 text-primary dark:text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground hover:shadow-sm'
                  }`}
              >
                {isActive(item.href) && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-md transition-all duration-200"></span>
                )}
                <Icon className={`mr-3 h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${isActive(item.href) ? 'text-primary' : ''}`} />
                <span className="relative inline-block">
                  {item.name}
                  <span className={`absolute left-0 -bottom-1 w-full h-0.5 bg-primary transform origin-left transition-transform duration-200 ${isActive(item.href) ? 'scale-x-0' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="flex-shrink-0 flex border-t border-border p-4">
          <div className="flex items-center justify-between w-full">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
              title="Toggle theme"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            <button
              onClick={handleLogout}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
