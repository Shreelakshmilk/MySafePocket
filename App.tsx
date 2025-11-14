
import React, { useState } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import { AuthPage } from './components/HomePage';
import { VaultPage } from './components/VaultPage';
import { VerifierPage } from './components/VerifierPage';
import { BundlesPage } from './components/BundlesPage';
import { IssuerToolsPage } from './components/IssuerToolsPage'; // Import new page
import { Header } from './components/Header';
import { Page } from './types';

// New component for the main application layout after login
const MainApp: React.FC<{ digitalId: string; onLogout: () => void; }> = ({ digitalId, onLogout }) => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.VAULT);

  const renderPage = () => {
    switch (currentPage) {
      case Page.VAULT:
        return <VaultPage digitalId={digitalId} setCurrentPage={setCurrentPage} />;
      case Page.VERIFIER:
        return <VerifierPage />;
      case Page.BUNDLES:
        return <BundlesPage digitalId={digitalId} setCurrentPage={setCurrentPage} />;
       case Page.ISSUER_TOOLS: // Add case for ISSUER_TOOLS
        return <IssuerToolsPage />;
      default:
        return <VaultPage digitalId={digitalId} setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <>
      <Header
        isLoggedIn={true}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onLogout={onLogout}
      />
      <main className="container mx-auto px-4 py-8">
        {renderPage()}
      </main>
    </>
  );
};


const App: React.FC = () => {
  const [digitalId, setDigitalId] = useLocalStorage<string | null>('digitalId', null);

  const handleLogin = (id: string) => {
    setDigitalId(id);
  };

  const handleLogout = () => {
    setDigitalId(null);
    localStorage.removeItem('credentials');
    localStorage.removeItem('bundles');
    // Note: We don't clear the revocation list on logout, as it's a simulated public ledger.
  };

  return (
    <div className="bg-amber-50/50 min-h-screen text-slate-900 antialiased">
      <div className="absolute top-0 left-0 w-full h-full bg-grid-amber-200/[0.2] [mask-image:linear-gradient(to_bottom,white_5%,transparent_90%)]"></div>
      <div className="relative z-10">
        {!digitalId ? (
          <AuthPage onLogin={handleLogin} />
        ) : (
          <MainApp digitalId={digitalId} onLogout={handleLogout} />
        )}
      </div>
    </div>
  );
};

export default App;