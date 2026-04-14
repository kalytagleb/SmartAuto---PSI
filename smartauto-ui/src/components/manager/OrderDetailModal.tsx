import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Order, User, UserRole } from '../../types';
import { ordersApi } from '../../api/orders.api';
import { usersApi } from '../../api/users.api';
import { Modal } from '../shared/Modal';
import { StatusBadge } from '../shared/StatusBadge';

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 12px',
    border: '1px solid #d1d5db', borderRadius: '7px',
    fontSize: '14px', boxSizing: 'border-box', outline: 'none',
};

const sectionTitle: React.CSSProperties = {
    fontSize: '11px', fontWeight: 600, color: '#64748b',
    textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 10px',
};

const infoRow: React.CSSProperties = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '14px',
};

const smallBtn = (color = '#3b82f6'): React.CSSProperties => ({
    backgroundColor: color, color: '#fff', border: 'none',
    borderRadius: '6px', padding: '6px 12px', cursor: 'pointer',
    fontSize: '13px', fontWeight: 500,
});

interface AssignForm {
    managerId: string;
    mechanicId: string;
    driverId: string;
}

export const OrderDetailModal = ({ order: initialOrder, onClose, onUpdate }: {
    order: Order;
    onClose: () => void;
    onUpdate: () => void;
}) => {
    const [order, setOrder] = useState(initialOrder);
    const [mechanics, setMechanics] = useState<User[]>([]);
    const [drivers, setDrivers] = useState<User[]>([]);
    const [managers, setManagers] = useState<User[]>([]);
    const [signatureData, setSignatureData] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit } = useForm<AssignForm>({
        defaultValues: {
            managerId:  order.manager?.id  ?? '',
            mechanicId: order.mechanic?.id ?? '',
            driverId:   order.driver?.id   ?? '',
        },
    });

    useEffect(() => {
        Promise.all([
            usersApi.getAvailable('MECHANIC' as UserRole),
            usersApi.getAvailable('DRIVER'   as UserRole),
            usersApi.getAvailable('MANAGER'  as UserRole),
        ]).then(([m, d, mg]) => {
            setMechanics(m.data);
            setDrivers(d.data);
            setManagers(mg.data);
        }).catch(console.error);
    }, []);

    const handleAssign = async (data: AssignForm) => {
        try {
            setLoading(true);
            setError('');
            const payload: Record<string, string> = {};
            if (data.managerId)  payload.managerId  = data.managerId;
            if (data.mechanicId) payload.mechanicId = data.mechanicId;
            if (data.driverId)   payload.driverId   = data.driverId;
            const res = await ordersApi.assignStaff(order.id, payload);
            setOrder(res.data);
            onUpdate();
        } catch (e: any) {
            setError(e.response?.data?.message ?? 'Assignment failed');
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async () => {
        if (!signatureData.trim()) { setError('Enter signature data'); return; }
        try {
            setLoading(true);
            setError('');
            const res = await ordersApi.complete(order.id, signatureData);
            setOrder(res.data);
            onUpdate();
        } catch (e: any) {
            setError(e.response?.data?.message ?? 'Failed to complete order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal title={`Order — ${order.car.brand} ${order.car.model}`} onClose={onClose} width={560}>
            {/* Order info */}
            <div style={{ marginBottom: '20px' }}>
                <p style={sectionTitle}>Order Details</p>
                <div style={infoRow}>
                    <span style={{ color: '#64748b' }}>Status</span>
                    <StatusBadge status={order.status} />
                </div>
                <div style={infoRow}>
                    <span style={{ color: '#64748b' }}>Vehicle</span>
                    <span>{order.car.brand} {order.car.model} ({order.car.licensePlate})</span>
                </div>
                <div style={infoRow}>
                    <span style={{ color: '#64748b' }}>Customer</span>
                    <span>{order.customer.fullName}</span>
                </div>
                {order.location && (
                    <div style={infoRow}>
                        <span style={{ color: '#64748b' }}>Location</span>
                        <span>{order.location}</span>
                    </div>
                )}
                {order.description && (
                    <div style={{ ...infoRow, alignItems: 'flex-start', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ color: '#64748b' }}>Description</span>
                        <span>{order.description}</span>
                    </div>
                )}
                {order.estimatedPrice && (
                    <div style={infoRow}>
                        <span style={{ color: '#64748b' }}>Estimated Price</span>
                        <span style={{ fontWeight: 600 }}>{order.estimatedPrice} €</span>
                    </div>
                )}
                {order.parts.length > 0 && (
                    <div style={{ marginTop: '8px' }}>
                        <p style={{ ...sectionTitle, marginBottom: '6px' }}>Parts Used</p>
                        {order.parts.map((op, i) => (
                            <div key={i} style={{ ...infoRow, fontSize: '13px' }}>
                                <span>{op.part.name} × {op.quantity}</span>
                                <span style={{ color: '#64748b' }}>{op.unitPrice} € / unit</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Assign staff */}
            <div style={{ marginBottom: '20px' }}>
                <p style={sectionTitle}>Assign Staff</p>
                <form onSubmit={handleSubmit(handleAssign)} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                        <label style={{ fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}>Manager</label>
                        <select {...register('managerId')} style={inputStyle}>
                            <option value="">— not assigned —</option>
                            {managers.map(m => <option key={m.id} value={m.id}>{m.fullName}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}>Mechanic</label>
                        <select {...register('mechanicId')} style={inputStyle}>
                            <option value="">— not assigned —</option>
                            {mechanics.map(m => <option key={m.id} value={m.id}>{m.fullName}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}>Driver</label>
                        <select {...register('driverId')} style={inputStyle}>
                            <option value="">— not assigned —</option>
                            {drivers.map(d => <option key={d.id} value={d.id}>{d.fullName}</option>)}
                        </select>
                    </div>
                    <button type="submit" disabled={loading} style={smallBtn()}>
                        {loading ? 'Saving...' : 'Save Assignment'}
                    </button>
                </form>
            </div>

            {/* Complete order */}
            {order.status === 'REPAIRED' && (
                <div>
                    <p style={sectionTitle}>Complete Order</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            value={signatureData}
                            onChange={e => setSignatureData(e.target.value)}
                            placeholder="Customer signature data"
                            style={{ ...inputStyle, flex: 1 }}
                        />
                        <button onClick={handleComplete} disabled={loading} style={smallBtn('#16a34a')}>
                            Complete
                        </button>
                    </div>
                </div>
            )}

            {error && <p style={{ color: '#ef4444', fontSize: '13px', margin: '12px 0 0' }}>{error}</p>}
        </Modal>
    );
};
