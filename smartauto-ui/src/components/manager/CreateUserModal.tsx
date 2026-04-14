import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { UserRole } from '../../types';
import { usersApi } from '../../api/users.api';
import { Modal } from '../shared/Modal';

interface Inputs {
    fullName: string;
    email: string;
    role: UserRole;
    passwordRaw: string;
}

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px',
    border: '1px solid #d1d5db', borderRadius: '7px',
    fontSize: '14px', boxSizing: 'border-box', outline: 'none',
};

const label: React.CSSProperties = {
    display: 'block', fontSize: '13px', color: '#374151', marginBottom: '5px', fontWeight: 500,
};

export const CreateUserModal = ({ onClose, onSuccess }: {
    onClose: () => void;
    onSuccess: () => void;
}) => {
    const { register, handleSubmit, formState: { errors } } = useForm<Inputs>({
        defaultValues: { role: 'MECHANIC' },
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const onSubmit = async (data: Inputs) => {
        try {
            setLoading(true);
            setError('');
            await usersApi.create(data);
            onSuccess();
        } catch (e: any) {
            setError(e.response?.data?.message ?? 'Failed to create user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal title="Create Employee" onClose={onClose} width={420}>
            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                    <label style={label}>Full Name</label>
                    <input
                        {...register('fullName', { required: 'Enter full name' })}
                        placeholder="John Smith"
                        style={inputStyle}
                    />
                    {errors.fullName && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0' }}>{errors.fullName.message}</p>}
                </div>

                <div>
                    <label style={label}>Email</label>
                    <input
                        {...register('email', { required: 'Enter email' })}
                        type="email"
                        placeholder="john@example.com"
                        style={inputStyle}
                    />
                    {errors.email && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0' }}>{errors.email.message}</p>}
                </div>

                <div>
                    <label style={label}>Role</label>
                    <select {...register('role')} style={inputStyle}>
                        <option value="MECHANIC">Mechanic</option>
                        <option value="DRIVER">Driver</option>
                        <option value="MANAGER">Manager</option>
                        <option value="CUSTOMER">Customer</option>
                    </select>
                </div>

                <div>
                    <label style={label}>Password</label>
                    <input
                        {...register('passwordRaw', { required: 'Enter password', minLength: { value: 6, message: 'Minimum 6 characters' } })}
                        type="password"
                        placeholder="At least 6 characters"
                        style={inputStyle}
                    />
                    {errors.passwordRaw && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0' }}>{errors.passwordRaw.message}</p>}
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
                    {loading ? 'Creating...' : 'Create'}
                </button>
            </form>
        </Modal>
    );
};
