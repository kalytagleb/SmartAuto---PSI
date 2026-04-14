import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Car, User } from '../../types';
import { ordersApi } from '../../api/orders.api';
import { carsApi } from '../../api/cars.api';
import { Modal } from '../shared/Modal';

interface Inputs {
    carId: string;
    licensePlate: string;
    brand: string;
    model: string;
    description: string;
    location: string;
}

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px',
    border: '1px solid #d1d5db', borderRadius: '7px',
    fontSize: '14px', boxSizing: 'border-box', outline: 'none',
};

const tabBtn = (active: boolean): React.CSSProperties => ({
    padding: '6px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 500,
    cursor: 'pointer', border: '1px solid #d1d5db',
    backgroundColor: active ? '#3b82f6' : '#fff',
    color: active ? '#fff' : '#374151',
    transition: 'all 0.15s',
});

export const CreateOrderModal = ({ user, cars, onClose, onSuccess }: {
    user: User;
    cars: Car[];
    onClose: () => void;
    onSuccess: () => void;
}) => {
    const { register, handleSubmit, formState: { errors } } = useForm<Inputs>();
    const [useNewCar, setUseNewCar] = useState(cars.length === 0);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const onSubmit = async (data: Inputs) => {
        try {
            setLoading(true);
            setError('');

            let carId = data.carId;

            if (useNewCar) {
                const carRes = await carsApi.create({
                    licensePlate: data.licensePlate,
                    brand: data.brand,
                    model: data.model,
                    ownerId: user.id,
                });
                carId = carRes.data.id;
            }

            await ordersApi.create({
                customerId: user.id,
                carId,
                description: data.description,
                location: data.location,
            });

            onSuccess();
        } catch (e: any) {
            setError(e.response?.data?.message ?? 'Failed to create order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal title="New Order" onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                {cars.length > 0 && (
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', color: '#374151', marginBottom: '8px', fontWeight: 500 }}>
                            Vehicle
                        </label>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                            <button type="button" onClick={() => setUseNewCar(false)} style={tabBtn(!useNewCar)}>
                                My cars
                            </button>
                            <button type="button" onClick={() => setUseNewCar(true)} style={tabBtn(useNewCar)}>
                                Register new car
                            </button>
                        </div>
                    </div>
                )}

                {!useNewCar && cars.length > 0 && (
                    <select {...register('carId', { required: true })} style={inputStyle}>
                        {cars.map(car => (
                            <option key={car.id} value={car.id}>
                                {car.brand} {car.model} — {car.licensePlate}
                            </option>
                        ))}
                    </select>
                )}

                {useNewCar && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                        <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#64748b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Vehicle details
                        </p>
                        <input
                            {...register('licensePlate', { required: useNewCar ? 'Enter license plate' : false })}
                            placeholder="License plate (AB-123CD)"
                            style={inputStyle}
                        />
                        {errors.licensePlate && <p style={{ color: '#ef4444', fontSize: '12px', margin: '-6px 0 0' }}>{errors.licensePlate.message}</p>}
                        <input
                            {...register('brand', { required: useNewCar ? 'Enter brand' : false })}
                            placeholder="Brand"
                            style={inputStyle}
                        />
                        <input
                            {...register('model', { required: useNewCar ? 'Enter model' : false })}
                            placeholder="Model"
                            style={inputStyle}
                        />
                    </div>
                )}

                <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#374151', marginBottom: '5px', fontWeight: 500 }}>
                        Problem description
                    </label>
                    <textarea
                        {...register('description')}
                        placeholder="Describe the issue..."
                        style={{ ...inputStyle, height: '80px', resize: 'vertical', lineHeight: '1.4' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#374151', marginBottom: '5px', fontWeight: 500 }}>
                        Location / Address
                    </label>
                    <input
                        {...register('location', { required: 'Enter location' })}
                        placeholder="123 Main St"
                        style={inputStyle}
                    />
                    {errors.location && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0' }}>{errors.location.message}</p>}
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
                    {loading ? 'Creating...' : 'Create Order'}
                </button>
            </form>
        </Modal>
    );
};
