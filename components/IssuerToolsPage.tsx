
import React from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Credential, RevocationEntry } from '../types';

export const IssuerToolsPage: React.FC = () => {
    const [credentials] = useLocalStorage<Credential[]>('credentials', []);
    const [revocationList, setRevocationList] = useLocalStorage<RevocationEntry[]>('revocationList', []);

    const isRevoked = (credentialId: string) => {
        return revocationList.some(entry => entry.credentialId === credentialId);
    };

    const handleRevoke = (credentialId: string) => {
        if (isRevoked(credentialId)) return;
        const newEntry: RevocationEntry = {
            credentialId,
            revocationDate: new Date().toISOString()
        };
        setRevocationList(prev => [...prev, newEntry]);
    };

    const handleReinstate = (credentialId: string) => {
        setRevocationList(prev => prev.filter(entry => entry.credentialId !== credentialId));
    };

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-3xl font-bold tracking-tight">Issuer Tools</h2>
                <p className="text-slate-500 mt-1">Manage the status of all issued credentials. This acts as a simulated public revocation ledger.</p>
            </div>
            
            <div className="bg-white border border-amber-200/80 rounded-lg shadow-md">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-amber-50/60">
                            <tr>
                                <th scope="col" className="px-6 py-3">Document Type</th>
                                <th scope="col" className="px-6 py-3">Credential ID</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {credentials.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-8 text-slate-500">No credentials have been issued yet.</td>
                                </tr>
                            ) : credentials.map(cred => (
                                <tr key={cred.id} className="bg-white border-b border-amber-200/80 hover:bg-amber-50/40">
                                    <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                        {cred.documentType}
                                    </th>
                                    <td className="px-6 py-4 font-mono text-xs">{cred.id}</td>
                                    <td className="px-6 py-4">
                                        {isRevoked(cred.id) ? (
                                            <span className="px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">Revoked</span>
                                        ) : (
                                            <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">Active</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {isRevoked(cred.id) ? (
                                            <button 
                                                onClick={() => handleReinstate(cred.id)}
                                                className="font-medium text-green-600 hover:underline"
                                            >
                                                Reinstate
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleRevoke(cred.id)}
                                                className="font-medium text-red-600 hover:underline"
                                            >
                                                Revoke
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};