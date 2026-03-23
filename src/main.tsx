
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './routes/App'
import { DialogProvider } from './contexts/DialogContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DialogProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </DialogProvider>
  </React.StrictMode>,
)
