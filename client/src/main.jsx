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

// Ripple click effect — adds a ripple animation to any button when clicked
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn");
  if (!btn || btn.disabled) return;
  // Skip ripple on mobile for performance
  if (window.innerWidth < 768) return;
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const ripple = document.createElement("span");
  ripple.className = "ripple";
  ripple.style.width = ripple.style.height = size + "px";
  ripple.style.left = (e.clientX - rect.left - size / 2) + "px";
  ripple.style.top = (e.clientY - rect.top - size / 2) + "px";
  btn.appendChild(ripple);
  ripple.addEventListener("animationend", () => ripple.remove());
});

// Find the <div id="root"> in public/index.html and render our App inside it
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
