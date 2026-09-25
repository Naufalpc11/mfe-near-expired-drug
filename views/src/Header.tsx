import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Plus, List, Edit, Eye, PenTool } from 'lucide-react';

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title = "Javan Addon" }) => {
  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/create', label: 'Create', icon: Plus },
    { path: '/get-data', label: 'Get Data', icon: List },
    { path: '/post-data', label: 'Post Data', icon: Edit },
    { path: '/edit', label: 'Edit Data', icon: PenTool },
    { path: '/detail', label: 'Detail', icon: Eye },
  ];

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          </div>
          
          <nav className="flex space-x-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`
                }
              >
                <Icon size={16} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;