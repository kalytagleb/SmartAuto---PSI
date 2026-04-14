import React from 'react';

interface ModalProps {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
    width?: number;
}

export const Modal = ({ title, onClose, children, width = 500 }: ModalProps) => (
    <div
        style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000,
        }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
        <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            width: `${width}px`,
            maxWidth: '95vw',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
        }}>
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '16px 20px',
                borderBottom: '1px solid #f1f5f9',
                position: 'sticky', top: 0,
                backgroundColor: '#fff', borderRadius: '12px 12px 0 0',
            }}>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#1e293b' }}>{title}</h3>
                <button
                    onClick={onClose}
                    style={{
                        border: 'none', background: 'none', fontSize: '20px',
                        cursor: 'pointer', color: '#94a3b8', lineHeight: 1, padding: '0 4px',
                    }}
                >
                    ✕
                </button>
            </div>
            <div style={{ padding: '20px' }}>
                {children}
            </div>
        </div>
    </div>
);
