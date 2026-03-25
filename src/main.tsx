import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SerendieProvider } from "@serendie/ui"
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SerendieProvider lang="ja" colorTheme="konjo" colorMode="light">
      <App />
    </SerendieProvider>
  </StrictMode>,
)
