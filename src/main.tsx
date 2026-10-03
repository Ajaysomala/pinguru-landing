import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { refreshCsrfToken } from './lib/api'
import './index.css'

// Prime the in-memory CSRF token; state-changing requests wait for it.
void refreshCsrfToken()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
