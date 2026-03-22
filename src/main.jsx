import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Init Telegram Mini App
if (window.Telegram?.WebApp) {
  window.Telegram.WebApp.ready()
  window.Telegram.WebApp.expand()
  window.Telegram.WebApp.setHeaderColor('#06060f')
  window.Telegram.WebApp.setBackgroundColor('#06060f')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
