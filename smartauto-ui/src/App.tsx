import { useState } from 'react';
import { useObservable } from './hooks/useObservable';
import { authService } from './services/AuthService';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { Layout } from './components/Layout';
import { CustomerDashboard } from './components/customer/CustomerDashboard';
import { ManagerDashboard } from './components/manager/ManagerDashboard';
import { MechanicDashboard } from './components/mechanic/MechanicDashboard';
import { DriverDashboard } from './components/driver/DriverDashboard';

function App() {
  const user = useObservable(authService.currentUser$, null);
  const [isLoginMode, setIsLoginMode] = useState(true);

  if (!user) {
    return isLoginMode
      ? <LoginPage onSwitch={() => setIsLoginMode(false)} />
      : <RegisterPage onSwitch={() => setIsLoginMode(true)} />;
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'CUSTOMER': return <CustomerDashboard user={user} />;
      case 'MANAGER':  return <ManagerDashboard />;
      case 'MECHANIC': return <MechanicDashboard user={user} />;
      case 'DRIVER':   return <DriverDashboard user={user} />;
      default:         return <p>Неизвестная роль: {user.role}</p>;
    }
  };

  return (
    <Layout user={user}>
      {renderDashboard()}
    </Layout>
  );
}

export default App;
