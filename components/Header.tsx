
import React from 'react';
import { Page } from '../types';

interface HeaderProps {
  isLoggedIn: boolean;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  onLogout: () => void;
}

const NavLink: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
      active
        ? 'bg-red-900 text-white'
        : 'text-slate-600 hover:bg-amber-100 hover:text-slate-900'
    }`}
  >
    {children}
  </button>
);

export const Header: React.FC<HeaderProps> = ({ isLoggedIn, currentPage, setCurrentPage, onLogout }) => {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-amber-200/80 sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-3">
            <svg
                className="w-8 h-8 text-red-900"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M14 2H6a2 2 0 00-2 2v2H2v2h2v2H2v2h2v2a2 2 0 002 2h8a2 2 0 002-2v-2h2v-2h-2v-2h2V8h-2V4a2 2 0 00-2-2zm-2 12H8v-2h4v2zm0-4H8V8h4v2z"/>
            </svg>
          <h1 className="text-2xl font-bold tracking-tighter text-slate-900">
            MySafe<span className="text-red-900">Pocket</span>
          </h1>
        </div>
        {isLoggedIn && (
          <div className="flex items-center space-x-2 bg-amber-50 p-1 rounded-lg">
            <NavLink active={currentPage === Page.VAULT} onClick={() => setCurrentPage(Page.VAULT)}>
              My Vault
            </NavLink>
            <NavLink active={currentPage === Page.BUNDLES} onClick={() => setCurrentPage(Page.BUNDLES)}>
              Bundles
            </NavLink>
             <NavLink active={currentPage === Page.ISSUER_TOOLS} onClick={() => setCurrentPage(Page.ISSUER_TOOLS)}>
              Issuer Tools
            </NavLink>
            <NavLink active={currentPage === Page.VERIFIER} onClick={() => setCurrentPage(Page.VERIFIER)}>
              Verifier
            </NavLink>
             <button
              onClick={onLogout}
              className="px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 text-slate-600 hover:bg-red-500 hover:text-white"
            >
              Logout
            </button>
          </div>
        )}
      </nav>
    </header>
  );
};