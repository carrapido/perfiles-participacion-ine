import '@fontsource-variable/inter'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const raiz = document.getElementById('root')
if (!raiz) throw new Error('index.html no tiene el elemento #root')

createRoot(raiz).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
