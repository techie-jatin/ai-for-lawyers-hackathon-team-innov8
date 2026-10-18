import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { DesignPresetProvider } from './context/DesignPresetContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DesignPresetProvider>
      <App />
    </DesignPresetProvider>
  </StrictMode>,
)
