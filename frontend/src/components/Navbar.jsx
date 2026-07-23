import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import { Menu, Sun, Moon, Bell, User, LogOut, ChevronDown, Calendar } from 'lucide-react';

const Navbar = ({ toggleSidebar, sidebarCollapsed }) => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (!user) return null;

  return (
    <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 h-16 fixed top-0 right-0 z-20 flex items-center justify-between px-4 sm:px-6 transition-all duration-300 shadow-md shadow-slate-200/20 dark:shadow-slate-950/50" 
      style={{ left: sidebarCollapsed ? '80px' : '256px' }}>
      
      {/* Left side: burger menu & path */}
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={toggleSidebar}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="hidden md:block font-extrabold text-slate-800 dark:text-slate-100 text-sm tracking-wide">
          Sandeep Super Specialty Hospital Portal
        </h2>
      </div>

      {/* Right side: Book Consultation button, theme toggle, notices & user profile dropdown */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        
        {/* Book Consultation Quick Action */}
        <Link
          to="/patient/book"
          className="flex items-center space-x-1.5 px-3 py-2 sm:px-4 sm:py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 border border-indigo-600 cursor-pointer"
        >
          <Calendar className="w-4 h-4 text-white" />
          <span className="text-white font-bold">Book Consultation</span>
        </Link>

        {/* Enhanced Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 sm:p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 hover:scale-110 hover:rotate-12 active:scale-95 transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-amber-500/20 cursor-pointer border border-slate-200 dark:border-slate-700/50"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? (
            <Sun className="w-4.5 h-4.5 text-amber-400 animate-pulse" />
          ) : (
            <Moon className="w-4.5 h-4.5 text-indigo-600" />
          )}
        </button>

        {/* Notifications */}
        <button 
          type="button"
          className="relative p-2 sm:p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border border-white dark:border-slate-900"></span>
        </button>

        {/* Vertical divider */}
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-0.5"></div>

        {/* User Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-102 active:scale-98 transition-all cursor-pointer"
          >
            <img
              src={user.profileImage || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`}
              alt="Avatar"
              className="w-8 h-8 rounded-lg object-cover ring-2 ring-primary-500/20"
            />
            <span className="hidden sm:block text-xs font-bold text-slate-800 dark:text-slate-100">
              {user.name.split(' ')[0]}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {dropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setDropdownOpen(false)}
              ></div>

              <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-20 animate-fadeIn">
                <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">
                  <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Logged in as</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate mt-0.5">{user.email}</p>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center space-x-2 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:pl-5 transition-all"
                >
                  <User className="w-4 h-4 text-primary-500" />
                  <span>My Profile</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="flex items-center space-x-2 w-full text-left px-4 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-500/10 hover:pl-5 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
