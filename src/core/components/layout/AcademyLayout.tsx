import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header'; // Import Header component
// Import Sidebar component if using
// import { Sidebar } from './Sidebar';

export function AcademyLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <Header /> 
      <div className="flex flex-1 pt-16"> {/* Add padding-top because Header is fixed */}
        {/* Optional Sidebar */}
        {/* <Sidebar /> */} 
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <Outlet /> {/* Nested routes will render here */}
        </main>
      </div>
    </div>
  );
} 