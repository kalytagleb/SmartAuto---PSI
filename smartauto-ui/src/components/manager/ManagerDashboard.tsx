import { useEffect, useState } from 'react';
import { Order } from '../../types';
import { ordersApi } from '../../api/orders.api';
import { StatusBadge } from '../shared/StatusBadge';
import { OrderDetailModal } from './OrderDetailModal';
import { CreateUserModal } from './CreateUserModal';
import { CreatePartModal } from './CreatePartModal';

const card: React.CSSProperties = {
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '14px 18px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    cursor: 'pointer',
};

const primaryBtn: React.CSSProperties = {
    backgroundColor: '#3b82f6', color: '#fff', border: 'none',
    borderRadius: '7px', padding: '8px 14px', cursor: 'pointer',
    fontSize: '13px', fontWeight: 600,
};

const outlineBtn: React.CSSProperties = {
    backgroundColor: '#fff', color: '#374151', border: '1px solid #d1d5db',
    borderRadius: '7px', padding: '8px 14px', cursor: 'pointer',
    fontSize: '13px', fontWeight: 500,
};

const statusLabel: Record<string, string> = {
    ALL: 'All', NEW: 'New', ACCEPTED: 'Accepted', IN_REPAIR: 'In Repair',
    WAITING_FOR_PARTS: 'Waiting', REPAIRED: 'Repaired', DELIVERING: 'Delivering',
    COMPLETED: 'Completed', CANCELLED: 'Cancelled',
};

const STATUSES = ['ALL', 'NEW', 'ACCEPTED', 'IN_REPAIR', 'WAITING_FOR_PARTS', 'REPAIRED', 'DELIVERING', 'COMPLETED', 'CANCELLED'];

export const ManagerDashboard = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Order | null>(null);
    const [showCreateUser, setShowCreateUser] = useState(false);
    const [showCreatePart, setShowCreatePart] = useState(false);
    const [filter, setFilter] = useState('ALL');

    const loadOrders = () => {
        setLoading(true);
        ordersApi.getAll()
            .then(res => setOrders(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadOrders(); }, []);

    const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                    <h2 style={{ margin: '0 0 4px', fontSize: '22px', color: '#1e293b' }}>Manager Panel</h2>
                    <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>Total orders: {orders.length}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setShowCreatePart(true)} style={outlineBtn}>+ Part</button>
                    <button onClick={() => setShowCreateUser(true)} style={outlineBtn}>+ Employee</button>
                    <button onClick={loadOrders} style={primaryBtn}>Refresh</button>
                </div>
            </div>

            {/* Status filter tabs */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
                {STATUSES.map(s => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        style={{
                            padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 500,
                            cursor: 'pointer', border: '1px solid',
                            borderColor: filter === s ? '#3b82f6' : '#e2e8f0',
                            backgroundColor: filter === s ? '#eff6ff' : '#fff',
                            color: filter === s ? '#1d4ed8' : '#475569',
                        }}
                    >
                        {statusLabel[s]}
                        {' '}({s === 'ALL' ? orders.length : orders.filter(o => o.status === s).length})
                    </button>
                ))}
            </div>

            {/* Orders list */}
            {loading ? (
                <p style={{ color: '#64748b', textAlign: 'center', marginTop: '60px' }}>Loading...</p>
            ) : filtered.length === 0 ? (
                <div style={{ ...card, textAlign: 'center', padding: '40px', cursor: 'default' }}>
                    <p style={{ color: '#64748b', margin: 0 }}>No orders found</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {filtered.map(order => (
                        <div
                            key={order.id}
                            style={card}
                            onClick={() => setSelected(order)}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                                (e.currentTarget as HTMLDivElement).style.borderColor = '#93c5fd';
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                                (e.currentTarget as HTMLDivElement).style.borderColor = '#e2e8f0';
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: '14px', color: '#1e293b' }}>
                                        {order.car.brand} {order.car.model}
                                        <span style={{ color: '#94a3b8', fontWeight: 400, marginLeft: '6px', fontSize: '12px' }}>
                                            {order.car.licensePlate}
                                        </span>
                                    </p>
                                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: '12px', color: '#64748b' }}>Customer: {order.customer.fullName}</span>
                                        {order.mechanic && <span style={{ fontSize: '12px', color: '#64748b' }}>Mechanic: {order.mechanic.fullName}</span>}
                                        {order.driver   && <span style={{ fontSize: '12px', color: '#64748b' }}>Driver: {order.driver.fullName}</span>}
                                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                                            {new Date(order.createdAt).toLocaleDateString('en-GB')}
                                        </span>
                                    </div>
                                    {order.description && (
                                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                                            {order.description.length > 80 ? order.description.slice(0, 80) + '...' : order.description}
                                        </p>
                                    )}
                                </div>
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    <StatusBadge status={order.status} />
                                    {order.estimatedPrice && (
                                        <p style={{ margin: '6px 0 0', fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                                            {order.estimatedPrice} €
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selected && (
                <OrderDetailModal
                    order={selected}
                    onClose={() => setSelected(null)}
                    onUpdate={() => { setSelected(null); loadOrders(); }}
                />
            )}
            {showCreateUser && <CreateUserModal onClose={() => setShowCreateUser(false)} onSuccess={() => setShowCreateUser(false)} />}
            {showCreatePart && <CreatePartModal onClose={() => setShowCreatePart(false)} onSuccess={() => setShowCreatePart(false)} />}
        </div>
    );
};
