import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { authService } from './services/AuthService'
import { apiClient } from './api'

// Функция запуска приложения
async function bootstrap() {
  try {
    // 1. Спрашиваем бэкенд: "Кто я?" (отправит куки автоматически)
    const response = await apiClient.get('/auth/whoami');
    
    // 2. Если бэкенд узнал нас - записываем в RxJS
    if (response.data) {
      authService.setUser(response.data);
    }
  } catch (e) {
    console.log('Сессия не найдена');
  }

  // 3. Только после этого рисуем интерфейс
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}

bootstrap();