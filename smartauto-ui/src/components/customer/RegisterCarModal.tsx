import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User } from '../../types';
import { carsApi } from '../../api/cars.api';
import { Modal } from '../shared/Modal';

interface Inputs {
    licensePlate: string;
    brand: string;
    model: string;
}

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px',
    border: '1px solid #d1d5db', borderRadius: '7px',
    fontSize: '14px', boxSizing: 'border-box', outline: 'none',
};

const label: React.CSSProperties = {
    display: 'block', fontSize: '13px', color: '#374151', marginBottom: '5px', fontWeight: 500,
};

export const RegisterCarModal = ({ user, onClose, onSuccess }: {
    user: User;
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
            await carsApi.create({ ...data, ownerId: user.id });
            onSuccess();
        } catch (e: any) {
            setError(e.response?.data?.message ?? 'Failed to register car');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal title="Register a Car" onClose={onClose} width={420}>
            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                    <label style={label}>License Plate</label>
                    <input
                        {...register('licensePlate', { required: 'Enter license plate' })}
                        placeholder="AB-123CD"
                        style={inputStyle}
                    />
                    {errors.licensePlate && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0' }}>{errors.licensePlate.message}</p>}
                </div>

                <div>
                    <label style={label}>Brand</label>
                    <input
                        {...register('brand', { required: 'Enter brand' })}
                        placeholder="Toyota"
                        style={inputStyle}
                    />
                    {errors.brand && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0' }}>{errors.brand.message}</p>}
                </div>

                <div>
                    <label style={label}>Model</label>
                    <input
                        {...register('model', { required: 'Enter model' })}
                        placeholder="Corolla"
                        style={inputStyle}
                    />
                    {errors.model && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0' }}>{errors.model.message}</p>}
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
                    {loading ? 'Saving...' : 'Register'}
                </button>
            </form>
        </Modal>
    );
};
