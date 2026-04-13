import { useForm } from "react-hook-form";
import { authApi } from "../api";
import { authService } from "../services/AuthService";

interface RegisterInputs {
    fullName: string;
    email: string;
    passwordRaw: string;
}

export const RegisterPage = () => {
    const {register, handleSubmit, formState: {errors}} = useForm<RegisterInputs>();

    const onSubmit = async (data: RegisterInputs) => {
        try {
            // Send data to NestJS
            const response = await authApi.register(data);

            // Update RxJS stream. All components can see user.
            authService.setUser(response.data.user);
            alert('Successfull Registration');
        } catch (err: any) {
            alert('Error.')
        }
    };

    return (
        <div style={{maxWidth: '400px', margin: 'auto', padding: '2em'}}>
            <h1>Registration</h1>

            <form onSubmit={handleSubmit(onSubmit)} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                <div>
                    <label>Full Name</label>
                    <input 
                        {...register('fullName', {required: 'Input your name'})}
                        placeholder="Gleb Kalyta"
                    />
                    {errors.fullName && <span style={{color: 'red'}}>{errors.fullName.message}</span>}
                </div>

                <div>
                    <label>Email</label>
                    <input 
                        {...register('email', {required: 'Input your email', pattern: /^\S+@\S+$/i})}
                        type="email"
                    />
                </div>

                <div>
                    <label>Password</label>
                    <input 
                        {...register('passwordRaw', {required: 'Create password', minLength: 6})}
                        type="password"
                    />
                </div>

                <button type="submit">Register</button>
            </form>
        </div>
    )
}