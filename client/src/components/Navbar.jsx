import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, LayoutDashboard, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="shadow-sm border-b border-slate-100 bg-white sticky top-0 z-40">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5 text-slate-800">
        <Link to="/app" className="flex items-center gap-2">
          <img src="/logo.svg" alt="logo" className="h-9 w-auto" />
          <span className="text-xl font-bold tracking-tight text-slate-800">
            Resu<span className="text-orange-500">AI</span>
          </span>
        </Link>

        {user && (
          <div className="flex items-center gap-4 relative">
            <Link 
              to="/app" 
              className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-orange-600 px-3 py-2 rounded-lg transition"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>

            <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 group cursor-pointer focus:outline-none"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-sm border-2 border-white ring-2 ring-orange-100 group-hover:ring-orange-200 transition">
                {getInitials(user.name)}
              </div>
              <span className="text-sm font-semibold text-slate-700 hidden sm:block">
                Hi, {user.name.split(' ')[0]}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition" />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setDropdownOpen(false)}
                ></div>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-lg py-2 z-20 animate-fade-in">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs text-slate-400">Logged in as</p>
                    <p className="text-sm font-semibold text-slate-800 truncate">{user.email}</p>
                  </div>

                  <Link
                    to="/app"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-orange-600 transition"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition cursor-pointer text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;