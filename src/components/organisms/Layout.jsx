import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        
        <div className="flex-1 lg:ml-0">
          <Header 
            onMenuClick={() => setSidebarOpen(true)}
            searchValue={searchValue}
            onSearchChange={(e) => setSearchValue(e.target.value)}
          />
          
          <main className="p-4 lg:p-8">
            <Outlet context={{ searchValue }} />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;