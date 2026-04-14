import { useState } from "react";
import { useForm } from "react-hook-form";
import { authApi } from "../api";
import { authService } from "../services/AuthService";

interface RegisterInputs {
    fullName: string;
    email: string;
    passwordRaw: string;
}

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px',
    border: '1px solid #d1d5db', borderRadius: '7px',
    fontSize: '14px', boxSizing: 'border-box', outline: 'none',
};

const label: React.CSSProperties = {
    display: 'block', fontSize: '13px', color: '#374151', marginBottom: '5px', fontWeight: 500,
};

export const RegisterPage = ({ onSwitch }: { onSwitch: () => void }) => {
    const { register, handleSubmit, formState: { errors } } = useForm<RegisterInputs>();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const onSubmit = async (data: RegisterInputs) => {
        try {
            setLoading(true);
            setError('');
            const response = await authApi.register(data);
            authService.setUser(response.data.user);
        } catch (e: any) {
            setError(e.response?.data?.message ?? 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
            <div style={{ width: '380px', backgroundColor: '#fff', borderRadius: '12px', padding: '32px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                <h2 style={{ margin: '0 0 6px', fontSize: '22px', color: '#1e293b' }}>Create an Account</h2>
                <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#64748b' }}>Fill in your details to get started</p>

                <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                        <label style={label}>Full Name</label>
                        <input
                            {...register('fullName', { required: 'Enter your name' })}
                            placeholder="John Smith"
                            style={inputStyle}
                        />
                        {errors.fullName && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0' }}>{errors.fullName.message}</p>}
                    </div>

                    <div>
                        <label style={label}>Email</label>
                        <input
                            {...register('email', { required: 'Enter your email', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
                            type="email"
                            placeholder="john@example.com"
                            style={inputStyle}
                        />
                        {errors.email && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0' }}>{errors.email.message}</p>}
                    </div>

                    <div>
                        <label style={label}>Password</label>
                        <input
                            {...register('passwordRaw', { required: 'Enter a password', minLength: { value: 6, message: 'Minimum 6 characters' } })}
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
                        {loading ? 'Creating account...' : 'Register'}
                    </button>
                </form>

                <p style={{ marginTop: '20px', fontSize: '14px', color: '#64748b', textAlign: 'center' }}>
                    Already have an account?{' '}
                    <button
                        onClick={onSwitch}
                        style={{ border: 'none', background: 'none', color: '#3b82f6', cursor: 'pointer', fontWeight: 500, fontSize: '14px' }}
                    >
                        Sign In
                    </button>
                </p>
            </div>
        </div>
    );
};
