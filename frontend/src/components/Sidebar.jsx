import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  UserSquare2, 
  Users2, 
  CalendarDays, 
  Receipt, 
  BellRing, 
  FileCheck, 
  Bot, 
  Sparkles, 
  FolderHeart, 
  LogOut,
  Stethoscope
} from 'lucide-react';

const Sidebar = ({ collapsed }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const getLinks = () => {
    const role = user.role;
    switch (role) {
      case 'admin':
        return [
          { path: '/admin', name: 'Dashboard', icon: <LayoutDashboard /> },
          { path: '/admin/doctors', name: 'Doctors Mgt', icon: <Stethoscope /> },
          { path: '/admin/patients', name: 'Patients Mgt', icon: <Users2 /> },
          { path: '/admin/appointments', name: 'Appointments', icon: <CalendarDays /> },
          { path: '/admin/billing', name: 'Billing Desk', icon: <Receipt /> },
          { path: '/admin/announcements', name: 'Announcements', icon: <BellRing /> },
          { path: '/admin/audit-logs', name: 'Audit Logs', icon: <FileCheck /> },
        ];
      case 'doctor':
        return [
          { path: '/doctor', name: 'Dashboard', icon: <LayoutDashboard /> },
          { path: '/doctor/appointments', name: 'My Appointments', icon: <CalendarDays /> },
          { path: '/doctor/prescriptions', name: 'Prescriptions', icon: <FileCheck /> },
          { path: '/doctor/patients', name: 'My Patients', icon: <Users2 /> },
        ];
      case 'receptionist':
        return [
          { path: '/receptionist', name: 'Dashboard', icon: <LayoutDashboard /> },
          { path: '/receptionist/patients', name: 'Patient Register', icon: <UserSquare2 /> },
          { path: '/receptionist/appointments', name: 'Bookings Desk', icon: <CalendarDays /> },
          { path: '/receptionist/billing', name: 'Cashier Bills', icon: <Receipt /> },
        ];
      case 'patient':
        return [
          { path: '/patient', name: 'My Dashboard', icon: <LayoutDashboard /> },
          { path: '/patient/book', name: 'Book Appointment', icon: <CalendarDays /> },
          { path: '/patient/history', name: 'Medical Records', icon: <FolderHeart /> },
          { path: '/patient/ai-symptoms', name: 'AI Symptom Checker', icon: <Sparkles /> },
          { path: '/patient/ai-chatbot', name: 'AI Health Chat', icon: <Bot /> },
        ];
      default:
        return [];
    }
  };

  const menuItems = getLinks();

  return (
    <aside className={`bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-r border-slate-200 dark:border-slate-800 h-screen fixed left-0 top-0 z-30 flex flex-col justify-between transition-all duration-300 shadow-xl shadow-slate-200/20 dark:shadow-slate-950/50 ${collapsed ? 'w-20' : 'w-64'}`}>
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-center border-b border-slate-200 dark:border-slate-800 px-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-500 to-accent-teal flex items-center justify-center text-white font-black shadow-md shadow-primary-500/20">
              S
            </div>
            {!collapsed && (
              <span className="font-black text-lg tracking-wider text-slate-900 dark:text-white">
                SANDEEP
              </span>
            )}
          </div>
        </div>

        {/* User Quick Info */}
        {!collapsed && (
          <div className="p-4 mx-4 my-6 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-center shadow-sm">
            <div className="relative w-16 h-16 mx-auto mb-3">
              <img
                src={user.profileImage || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`}
                alt="Profile"
                className="w-full h-full rounded-2xl object-cover ring-2 ring-primary-500/30"
              />
              <span className="absolute bottom-[-4px] right-[-4px] w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">{user.name}</h4>
            <span className="inline-block mt-1 px-3 py-0.5 text-[10px] font-extrabold tracking-widest text-primary-600 dark:text-accent-cyan uppercase bg-primary-500/10 rounded-full">
              {user.role}
            </span>
          </div>
        )}

        {/* Menu Links */}
        <nav className="mt-4 px-3 space-y-1.5">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md shadow-primary-500/30'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              <div className="w-5 h-5 flex-shrink-0">{item.icon}</div>
              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Logout button */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={logout}
          className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
