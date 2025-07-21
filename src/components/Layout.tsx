import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.tsx';
import { 
  Users, 
  Search, 
  BarChart3, 
  LogOut, 
  Menu, 
  X,
  Target
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onPageChange }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', icon: BarChart3, key: 'dashboard' },
    { name: 'Clients', icon: Users, key: 'clients' },
    { name: 'Opportunities', icon: Search, key: 'opportunities' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="fixed top-0 left-0 w-64 h-full bg-white shadow-xl">
            <SidebarContent 
              navigation={navigation} 
              currentPage={currentPage} 
              onPageChange={onPageChange}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <SidebarContent 
            navigation={navigation} 
            currentPage={currentPage} 
            onPageChange={onPageChange}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <button
                  className="lg:hidden -ml-2 mr-2 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-6 w-6" />
                </button>
                <h1 className="text-xl font-semibold text-gray-900 capitalize">
                  {currentPage}
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.name.charAt(0)}
                    </span>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-2"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

interface SidebarContentProps {
  navigation: Array<{ name: string; icon: any; key: string }>;
  currentPage: string;
  onPageChange: (page: string) => void;
  onClose?: () => void;
}

const SidebarContent: React.FC<SidebarContentProps> = ({ 
  navigation, 
  currentPage, 
  onPageChange,
  onClose 
}) => (
  <>
    <div className="flex items-center h-16 px-6 border-b border-gray-200">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <Target className="w-5 h-5 text-white" />
        </div>
        <span className="text-lg font-semibold text-gray-900">KEF</span>
      </div>
      {onClose && (
        <button
          className="ml-auto lg:hidden"
          onClick={onClose}
        >
          <X className="h-6 w-6 text-gray-400" />
        </button>
      )}
    </div>
    <nav className="flex-1 px-4 py-6 space-y-2">
      {navigation.map((item) => (
        <button
          key={item.key}
          onClick={() => {
            onPageChange(item.key);
            onClose?.();
          }}
          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            currentPage === item.key
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <item.icon className="mr-3 h-5 w-5" />
          {item.name}
        </button>
      ))}
    </nav>
  </>
);

export default Layout;