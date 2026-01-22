import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ 
  title = "Game Dialog Editor", 
  subtitle,
  actions 
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Ne pas afficher le header sur les pages de login/register
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {user && (
            <>
              <button
                onClick={() => navigate('/profile')}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center space-x-1"
              >
                <span>{user.name}</span>
              </button>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Déconnexion
              </button>
            </>
          )}
          
          {actions && (
            <div className="flex items-center space-x-3 ml-3 pl-3 border-l border-gray-200">
              {actions}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;