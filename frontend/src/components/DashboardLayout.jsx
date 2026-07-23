import React, { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Loader from './Loader';

const DashboardLayout = () => {
  const { user, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (loading) {
    return <Loader fullPage />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Sidebar collapsed={collapsed} />
      
      <div 
        className="flex flex-col min-h-screen transition-all duration-300"
        style={{ paddingLeft: collapsed ? '80px' : '256px' }}
      >
        <Navbar 
          toggleSidebar={() => setCollapsed(!collapsed)} 
          sidebarCollapsed={collapsed} 
        />
        
        {/* Main Content Area */}
        <main className="flex-grow p-6 mt-16 overflow-y-auto fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
