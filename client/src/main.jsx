/**
 * main.jsx — Application Entry Point
 * 
 * This is the very first file that runs when the app loads.
 * It finds the HTML element with id="root" and renders our React app inside it.
 * StrictMode helps catch common mistakes during development (removed in production).
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css' // Global styles (colors, fonts, dark mode, responsive rules)
import App from './App.jsx'

// Find the <div id="root"> in public/index.html and render our App inside it
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
