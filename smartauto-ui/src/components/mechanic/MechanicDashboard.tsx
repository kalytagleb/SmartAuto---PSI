import { useEffect, useState } from 'react';
import { Order, User } from '../../types';
import { ordersApi } from '../../api/orders.api';
import { StatusBadge } from '../shared/StatusBadge';
import { AddPartModal } from './AddPartModal';

const card: React.CSSProperties = {
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '16px 20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
};

const actionBtn = (color = '#3b82f6'): React.CSSProperties => ({
    backgroundColor: color, color: '#fff', border: 'none',
    borderRadius: '6px', padding: '7px 14px', cursor: 'pointer',
    fontSize: '13px', fontWeight: 500,
});

export const MechanicDashboard = ({ user }: { user: User }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [addPartFor, setAddPartFor] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState('');

    const loadOrders = () => {
        setLoading(true);
        ordersApi.getAll()
            .then(res => setOrders(res.data.filter(o => o.mechanic?.id === user.id)))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadOrders(); }, []);

    const handleFinishRepair = async (orderId: string) => {
        try {
            setActionLoading(orderId);
            setError('');
            await ordersApi.finishRepair(orderId);
            loadOrders();
        } catch (e: any) {
            setError(e.response?.data?.message ?? 'Error');
        } finally {
            setActionLoading(null);
        }
    };

    const active = orders.filter(o => !['REPAIRED', 'COMPLETED', 'CANCELLED'].includes(o.status));
    const done   = orders.filter(o =>  ['REPAIRED', 'COMPLETED', 'CANCELLED'].includes(o.status));

    return (
        <div>
            <div style={{ marginBottom: '24px' }}>
                <h2 style={{ margin: '0 0 4px', fontSize: '22px', color: '#1e293b' }}>My Orders</h2>
                <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>Active: {active.length}</p>
            </div>

            {loading ? (
                <p style={{ color: '#64748b', textAlign: 'center', marginTop: '60px' }}>Loading...</p>
            ) : orders.length === 0 ? (
                <div style={{ ...card, textAlign: 'center', padding: '60px' }}>
                    <p style={{ color: '#64748b', margin: 0 }}>No orders assigned to you yet</p>
                </div>
            ) : (
                <div>
                    {active.length > 0 && (
                        <div style={{ marginBottom: '28px' }}>
                            <p style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 12px' }}>
                                Active
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {active.map(order => (
                                    <div key={order.id} style={card}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: '15px', color: '#1e293b' }}>
                                                    {order.car.brand} {order.car.model}
                                                    <span style={{ color: '#64748b', fontWeight: 400, marginLeft: '6px', fontSize: '13px' }}>
                                                        {order.car.licensePlate}
                                                    </span>
                                                </p>
                                                {order.description && (
                                                    <p style={{ margin: '0 0 6px', color: '#64748b', fontSize: '13px' }}>{order.description}</p>
                                                )}
                                                {order.parts.length > 0 && (
                                                    <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#94a3b8' }}>
                                                        Parts: {order.parts.map(p => p.part.name).join(', ')}
                                                    </p>
                                                )}
                                            </div>
                                            <StatusBadge status={order.status} />
                                        </div>

                                        <div style={{ display: 'flex', gap: '8px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                                            {['ACCEPTED', 'IN_REPAIR', 'WAITING_FOR_PARTS'].includes(order.status) && (
                                                <button onClick={() => setAddPartFor(order.id)} style={actionBtn('#6366f1')}>
                                                    + Add Part
                                                </button>
                                            )}
                                            {['ACCEPTED', 'IN_REPAIR'].includes(order.status) && (
                                                <button
                                                    onClick={() => handleFinishRepair(order.id)}
                                                    disabled={actionLoading === order.id}
                                                    style={actionBtn('#16a34a')}
                                                >
                                                    {actionLoading === order.id ? 'Saving...' : 'Finish Repair'}
                                                </button>
                                            )}
                                        </div>
                                        {error && <p style={{ color: '#ef4444', fontSize: '12px', margin: '8px 0 0' }}>{error}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {done.length > 0 && (
                        <div>
                            <p style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 12px' }}>
                                Completed
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {done.map(order => (
                                    <div key={order.id} style={{ ...card, opacity: 0.7 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <p style={{ margin: 0, fontWeight: 500, fontSize: '14px', color: '#475569' }}>
                                                {order.car.brand} {order.car.model} ({order.car.licensePlate})
                                            </p>
                                            <StatusBadge status={order.status} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {addPartFor && (
                <AddPartModal
                    orderId={addPartFor}
                    onClose={() => setAddPartFor(null)}
                    onSuccess={() => { setAddPartFor(null); loadOrders(); }}
                />
            )}
        </div>
    );
};
