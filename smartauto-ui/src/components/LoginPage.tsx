import { useState } from "react";
import { useForm } from "react-hook-form";
import { authApi } from "../api";
import { authService } from "../services/AuthService";

interface LoginInputs {
    email: string;
    pass: string;
}

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px',
    border: '1px solid #d1d5db', borderRadius: '7px',
    fontSize: '14px', boxSizing: 'border-box', outline: 'none',
};

export const LoginPage = ({ onSwitch }: { onSwitch: () => void }) => {
    const { register, handleSubmit } = useForm<LoginInputs>();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const onSubmit = async (data: LoginInputs) => {
        try {
            setLoading(true);
            setError('');
            const response = await authApi.login(data.email, data.pass);
            authService.setUser(response.data.user);
        } catch {
            setError('Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
            <div style={{ width: '380px', backgroundColor: '#fff', borderRadius: '12px', padding: '32px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                <h2 style={{ margin: '0 0 6px', fontSize: '22px', color: '#1e293b' }}>Sign in to SmartAuto</h2>
                <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#64748b' }}>Enter your credentials to continue</p>

                <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input
                        {...register('email', { required: true })}
                        placeholder="Email"
                        type="email"
                        style={inputStyle}
                    />
                    <input
                        {...register('pass', { required: true })}
                        placeholder="Password"
                        type="password"
                        style={inputStyle}
                    />

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
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p style={{ marginTop: '20px', fontSize: '14px', color: '#64748b', textAlign: 'center' }}>
                    Don't have an account?{' '}
                    <button
                        onClick={onSwitch}
                        style={{ border: 'none', background: 'none', color: '#3b82f6', cursor: 'pointer', fontWeight: 500, fontSize: '14px' }}
                    >
                        Register
                    </button>
                </p>
            </div>
        </div>
    );
};
