import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { FavoritesProvider } from './context/FavoritesContext'
import { SavedRoutesProvider } from './context/SavedRoutesContext'
import App from './App'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <FavoritesProvider>
        <SavedRoutesProvider>
          <App />
        </SavedRoutesProvider>
      </FavoritesProvider>
    </BrowserRouter>
  </StrictMode>,
)
