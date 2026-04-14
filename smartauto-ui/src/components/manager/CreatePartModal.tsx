import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { partsApi } from '../../api/parts.api';
import { Modal } from '../shared/Modal';

interface Inputs {
    name: string;
    stockQuantity: number;
    price: number;
}

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px',
    border: '1px solid #d1d5db', borderRadius: '7px',
    fontSize: '14px', boxSizing: 'border-box', outline: 'none',
};

const label: React.CSSProperties = {
    display: 'block', fontSize: '13px', color: '#374151', marginBottom: '5px', fontWeight: 500,
};

export const CreatePartModal = ({ onClose, onSuccess }: {
    onClose: () => void;
    onSuccess: () => void;
}) => {
    const { register, handleSubmit, formState: { errors } } = useForm<Inputs>();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const onSubmit = async (data: Inputs) => {
        try {
            setLoading(true);
            setError('');
            await partsApi.create({
                name: data.name,
                stockQuantity: Number(data.stockQuantity),
                price: Number(data.price),
            });
            onSuccess();
        } catch (e: any) {
            setError(e.response?.data?.message ?? 'Failed to create part');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal title="Add Part to Inventory" onClose={onClose} width={420}>
            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                    <label style={label}>Name</label>
                    <input
                        {...register('name', { required: 'Enter part name' })}
                        placeholder="Oil Filter"
                        style={inputStyle}
                    />
                    {errors.name && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0' }}>{errors.name.message}</p>}
                </div>

                <div>
                    <label style={label}>Stock Quantity</label>
                    <input
                        {...register('stockQuantity', {
                            required: 'Enter quantity',
                            min: { value: 0, message: 'Cannot be negative' },
                        })}
                        type="number"
                        min="0"
                        placeholder="10"
                        style={inputStyle}
                    />
                    {errors.stockQuantity && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0' }}>{errors.stockQuantity.message}</p>}
                </div>

                <div>
                    <label style={label}>Price (€)</label>
                    <input
                        {...register('price', {
                            required: 'Enter price',
                            min: { value: 0, message: 'Cannot be negative' },
                        })}
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="12.50"
                        style={inputStyle}
                    />
                    {errors.price && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0' }}>{errors.price.message}</p>}
                </div>

                {error && <p style={{ color: '#ef4444', fontSize: '13px', margin: 0 }}>{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        backgroundColor: '#3b82f6', color: '#fff', border: 'none',
                        borderRadius: '7px', padding: '10px', cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '14px', fontWeight: 600, opacity: loading ? 0.7 : 1, marginTop: '4px',
                    }}
                >
                    {loading ? 'Saving...' : 'Add Part'}
                </button>
            </form>
        </Modal>
    );
};
