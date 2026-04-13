import './App.css'
import { useObservable } from './hooks/useObservable'
import { authService } from './services/AuthService'
import { RegisterPage } from './components/RegisterPage'

function App() {
  const user = useObservable(authService.currentUser$, null);

  if (!user) {
    return <RegisterPage />
  }

  return (
    <div>
      
    </div>
  )
}

export default App
