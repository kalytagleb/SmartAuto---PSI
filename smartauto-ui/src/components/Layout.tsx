import React from 'react';
import { User } from '../types';
import { authService } from '../services/AuthService';

const roleLabel: Record<string, string> = {
    CUSTOMER: 'Customer',
    MANAGER:  'Manager',
    MECHANIC: 'Mechanic',
    DRIVER:   'Driver',
};

interface LayoutProps {
    user: User;
    children: React.ReactNode;
}

export const Layout = ({ user, children }: LayoutProps) => (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
        <header style={{
            backgroundColor: '#1e293b',
            color: '#fff',
            padding: '0 24px',
            height: '56px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0,
            boxShadow: '0 1px 0 rgba(255,255,255,0.05)',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '17px', fontWeight: 700, letterSpacing: '-0.3px' }}>
                    SmartAuto
                </span>
                <span style={{
                    backgroundColor: '#334155',
                    borderRadius: '5px',
                    padding: '2px 8px',
                    fontSize: '11px',
                    color: '#94a3b8',
                    fontWeight: 500,
                    letterSpacing: '0.3px',
                    textTransform: 'uppercase',
                }}>
                    {roleLabel[user.role] ?? user.role}
                </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ color: '#cbd5e1', fontSize: '14px' }}>{user.fullName}</span>
                <button
                    onClick={() => authService.logout()}
                    style={{
                        backgroundColor: 'transparent',
                        color: '#f87171',
                        border: '1px solid #f87171',
                        borderRadius: '6px',
                        padding: '5px 12px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 500,
                    }}
                    onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#ef4444';
                        (e.currentTarget as HTMLButtonElement).style.color = '#fff';
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                        (e.currentTarget as HTMLButtonElement).style.color = '#f87171';
                    }}
                >
                    Log out
                </button>
            </div>
        </header>
        <main style={{ flex: 1, padding: '28px 24px', maxWidth: '1200px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
            {children}
        </main>
    </div>
);
