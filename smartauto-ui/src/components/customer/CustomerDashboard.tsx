import { useEffect, useState } from 'react';
import { Car, Order, User } from '../../types';
import { ordersApi } from '../../api/orders.api';
import { StatusBadge } from '../shared/StatusBadge';
import { CreateOrderModal } from './CreateOrderModal';
import { RegisterCarModal } from './RegisterCarModal';

const card: React.CSSProperties = {
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '16px 20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
};

const primaryBtn: React.CSSProperties = {
    backgroundColor: '#3b82f6', color: '#fff', border: 'none',
    borderRadius: '7px', padding: '8px 16px', cursor: 'pointer',
    fontSize: '14px', fontWeight: 600,
};

const outlineBtn: React.CSSProperties = {
    backgroundColor: '#fff', color: '#374151', border: '1px solid #d1d5db',
    borderRadius: '7px', padding: '8px 16px', cursor: 'pointer',
    fontSize: '14px', fontWeight: 500,
};

export const CustomerDashboard = ({ user }: { user: User }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateOrder, setShowCreateOrder] = useState(false);
    const [showRegisterCar, setShowRegisterCar] = useState(false);

    const loadOrders = () => {
        setLoading(true);
        ordersApi.getAll()
            .then(res => setOrders(res.data.filter(o => o.customer.id === user.id)))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadOrders(); }, []);

    const myCars: Car[] = [...new Map(orders.map(o => [o.car.id, o.car])).values()];

    const orderWord = (n: number) => n === 1 ? 'order' : 'orders';

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h2 style={{ margin: '0 0 4px', fontSize: '22px', color: '#1e293b' }}>My Orders</h2>
                    <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
                        {orders.length} {orderWord(orders.length)}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setShowRegisterCar(true)} style={outlineBtn}>
                        + Register Car
                    </button>
                    <button onClick={() => setShowCreateOrder(true)} style={primaryBtn}>
                        + New Order
                    </button>
                </div>
            </div>

            {loading ? (
                <p style={{ color: '#64748b', textAlign: 'center', marginTop: '60px' }}>Loading...</p>
            ) : orders.length === 0 ? (
                <div style={{ ...card, textAlign: 'center', padding: '60px 20px' }}>
                    <p style={{ color: '#64748b', fontSize: '15px', margin: '0 0 16px' }}>
                        You have no orders yet
                    </p>
                    <button onClick={() => setShowCreateOrder(true)} style={primaryBtn}>
                        Create your first order
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {orders.map(order => (
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
                                        <p style={{ margin: '0 0 6px', color: '#64748b', fontSize: '13px' }}>
                                            {order.description}
                                        </p>
                                    )}
                                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                        {order.location && (
                                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                                                📍 {order.location}
                                            </span>
                                        )}
                                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                                            {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                        {order.mechanic && (
                                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                                                Mechanic: {order.mechanic.fullName}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    <StatusBadge status={order.status} />
                                    {order.estimatedPrice && (
                                        <p style={{ margin: '8px 0 0', fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>
                                            {order.estimatedPrice} €
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showCreateOrder && (
                <CreateOrderModal
                    user={user}
                    cars={myCars}
                    onClose={() => setShowCreateOrder(false)}
                    onSuccess={() => { setShowCreateOrder(false); loadOrders(); }}
                />
            )}

            {showRegisterCar && (
                <RegisterCarModal
                    user={user}
                    onClose={() => setShowRegisterCar(false)}
                    onSuccess={() => setShowRegisterCar(false)}
                />
            )}
        </div>
    );
};
