import { useEffect, useState } from 'react';
import { Order, User } from '../../types';
import { ordersApi } from '../../api/orders.api';
import { StatusBadge } from '../shared/StatusBadge';

const card: React.CSSProperties = {
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '16px 20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
};

export const DriverDashboard = ({ user }: { user: User }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        ordersApi.getAll()
            .then(res => setOrders(res.data.filter(o => o.driver?.id === user.id)))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const active = orders.filter(o => !['COMPLETED', 'CANCELLED'].includes(o.status));
    const done   = orders.filter(o =>  ['COMPLETED', 'CANCELLED'].includes(o.status));


    return (
        <div>
            <div style={{ marginBottom: '24px' }}>
                <h2 style={{ margin: '0 0 4px', fontSize: '22px', color: '#1e293b' }}>My Deliveries</h2>
                <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>Active: {active.length}</p>
            </div>

            {loading ? (
                <p style={{ color: '#64748b', textAlign: 'center', marginTop: '60px' }}>Loading...</p>
            ) : orders.length === 0 ? (
                <div style={{ ...card, textAlign: 'center', padding: '60px' }}>
                    <p style={{ color: '#64748b', margin: 0 }}>No deliveries assigned to you yet</p>
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
                                                <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#64748b' }}>
                                                    Customer: {order.customer.fullName}
                                                </p>
                                                {order.location && (
                                                    <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                                                        📍 {order.location}
                                                    </p>
                                                )}
                                            </div>
                                            <StatusBadge status={order.status} />
                                        </div>
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
                                    <div key={order.id} style={{ ...card, opacity: 0.65 }}>
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
        </div>
    );
};
