import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Part } from '../../types';
import { partsApi } from '../../api/parts.api';
import { ordersApi } from '../../api/orders.api';
import { Modal } from '../shared/Modal';

interface Inputs {
    partId: string;
    quantity: number;
}

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px',
    border: '1px solid #d1d5db', borderRadius: '7px',
    fontSize: '14px', boxSizing: 'border-box', outline: 'none',
};

export const AddPartModal = ({ orderId, onClose, onSuccess }: {
    orderId: string;
    onClose: () => void;
    onSuccess: () => void;
}) => {
    const { register, handleSubmit, formState: { errors } } = useForm<Inputs>({
        defaultValues: { quantity: 1 },
    });
    const [parts, setParts] = useState<Part[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        partsApi.getAll()
            .then(res => setParts(res.data))
            .catch(() => setError('Failed to load parts list'));
    }, []);

    const onSubmit = async (data: Inputs) => {
        try {
            setLoading(true);
            setError('');
            await ordersApi.addPart(orderId, {
                partId: data.partId,
                quantity: Number(data.quantity),
            });
            onSuccess();
        } catch (e: any) {
            setError(e.response?.data?.message ?? 'Failed to add part');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal title="Add Part to Order" onClose={onClose} width={400}>
            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#374151', marginBottom: '5px', fontWeight: 500 }}>
                        Part
                    </label>
                    {parts.length === 0 && !error ? (
                        <p style={{ color: '#64748b', fontSize: '13px' }}>Loading parts...</p>
                    ) : (
                        <select {...register('partId', { required: 'Select a part' })} style={inputStyle}>
                            <option value="">Choose a part...</option>
                            {parts.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.name} — {p.price} € (in stock: {p.stockQuantity})
                                </option>
                            ))}
                        </select>
                    )}
                    {errors.partId && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0' }}>{errors.partId.message}</p>}
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#374151', marginBottom: '5px', fontWeight: 500 }}>
                        Quantity
                    </label>
                    <input
                        {...register('quantity', {
                            required: 'Enter quantity',
                            min: { value: 1, message: 'Minimum 1' },
                        })}
                        type="number"
                        min="1"
                        style={inputStyle}
                    />
                    {errors.quantity && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0' }}>{errors.quantity.message}</p>}
                </div>

                {error && <p style={{ color: '#ef4444', fontSize: '13px', margin: 0 }}>{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        backgroundColor: '#3b82f6', color: '#fff', border: 'none',
                        borderRadius: '7px', padding: '10px', cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '14px', fontWeight: 600, opacity: loading ? 0.7 : 1,
                    }}
                >
                    {loading ? 'Adding...' : 'Add Part'}
                </button>
            </form>
        </Modal>
    );
};
