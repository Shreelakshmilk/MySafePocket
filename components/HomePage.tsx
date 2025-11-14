
import React, { useState } from 'react';

interface AuthPageProps {
  onLogin: (id: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'create' | 'unlock'>('unlock');
  const [newId, setNewId] = useState<string | null>(null);
  const [unlockId, setUnlockId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleCreateId = () => {
    const createdId = `did:pixel:${crypto.randomUUID()}`;
    setNewId(createdId);
  };

  const handleUnlock = () => {
    if (unlockId.trim()) {
      onLogin(unlockId.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
       <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#fde68a_1px,transparent_1px)] [background-size:16px_16px]"></div>
       
       <div className="w-full max-w-md mx-auto">
        <div className="flex items-center space-x-3 justify-center mb-4">
            <svg
                className="w-10 h-10 text-red-900"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M14 2H6a2 2 0 00-2 2v2H2v2h2v2H2v2h2v2a2 2 0 002 2h8a2 2 0 002-2v-2h2v-2h-2v-2h2V8h-2V4a2 2 0 00-2-2zm-2 12H8v-2h4v2zm0-4H8V8h4v2z"/>
            </svg>
           <h1 className="text-5xl md:text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-red-900 to-amber-600">
            MySafePocket
          </h1>
        </div>
        <p className="text-lg text-slate-600 mb-2">A Simple & Secure Digital Identity Vault.</p>
        <p className="text-lg text-slate-600 mb-8">Your Identity. Your Control.</p>
        
        <div className="bg-white/80 backdrop-blur-sm border border-amber-200/80 rounded-lg p-6 shadow-lg">
            {newId ? (
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Your New Vault is Created!</h3>
                    <p className="text-sm text-yellow-800 bg-yellow-50 border border-yellow-300 rounded-md p-3 my-4">
                        <strong>Important:</strong> Save this secret key. You will need it to unlock your vault. We cannot recover it for you.
                    </p>
                    <div className="bg-amber-100 p-3 rounded-md font-mono text-red-900 break-all text-sm mb-4">
                        {newId}
                    </div>
                    <button
                        onClick={() => onLogin(newId)}
                        className="w-full px-8 py-3 bg-red-900 text-white font-bold rounded-lg hover:bg-red-800 transition-transform transform hover:scale-105 duration-300"
                    >
                        Continue to My Vault
                    </button>
                </div>
            ) : (
                <>
                    <div className="flex border-b border-amber-300 mb-4">
                        <button onClick={() => setMode('unlock')} className={`flex-1 py-2 font-semibold ${mode === 'unlock' ? 'text-red-900 border-b-2 border-red-900' : 'text-slate-500'}`}>Unlock Vault</button>
                        <button onClick={() => setMode('create')} className={`flex-1 py-2 font-semibold ${mode === 'create' ? 'text-red-900 border-b-2 border-red-900' : 'text-slate-500'}`}>Create New Vault</button>
                    </div>

                    {mode === 'unlock' && (
                        <div className="space-y-4">
                             <input 
                                type="text"
                                value={unlockId}
                                onChange={(e) => setUnlockId(e.target.value)}
                                placeholder="Paste your secret key here"
                                className="w-full bg-amber-50 text-slate-900 p-3 rounded-md border border-amber-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                            />
                            <button
                                onClick={handleUnlock}
                                className="w-full py-3 bg-red-900 text-white font-bold rounded-lg hover:bg-red-800 transition-colors"
                            >
                                Unlock
                            </button>
                        </div>
                    )}

                    {mode === 'create' && (
                         <div className="space-y-4">
                            <p className="text-slate-500 text-sm">Create a new, secure vault. Your name and email are not used for account recovery.</p>
                             <input 
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your Name"
                                className="w-full bg-amber-50 text-slate-900 p-3 rounded-md border border-amber-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                            />
                            <input 
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email Address"
                                className="w-full bg-amber-50 text-slate-900 p-3 rounded-md border border-amber-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                            />
                            <button
                                onClick={handleCreateId}
                                disabled={!name.trim() || !email.trim()}
                                className="w-full py-3 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-400 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
                            >
                                Create My New Vault
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
      </div>
    </div>
  );
};