import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Register service worker for PWA
// Use base path from environment variable for GitHub Pages compatibility
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const basePath = import.meta.env.VITE_BASE_PATH || '/';
    const swPath = `${basePath}sw.js`.replace('//', '/'); // Handle double slashes
    
    // Unregister old service workers first to force refresh
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (let registration of registrations) {
        // Unregister old service workers with old cache name
        if (registration.active && registration.active.scriptURL.includes('sw.js')) {
          registration.unregister().then((success) => {
            if (success) {
              console.log('Old service worker unregistered');
            }
          });
        }
      }
      
      // Register new service worker after a short delay
      setTimeout(() => {
        navigator.serviceWorker.register(swPath)
          .then((registration) => {
            console.log('SW registered: ', registration);
            // Force update on next page load
            registration.update();
          })
          .catch((registrationError) => {
            console.error('SW registration failed: ', registrationError);
          });
      }, 100);
    });
  });
}

// Error boundary for rendering
try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} catch (error) {
  console.error('Failed to render app:', error);
  // Show user-friendly error message
  document.body.innerHTML = `
    <div style="padding: 20px; text-align: center; font-family: sans-serif;">
      <h1>Loading Error</h1>
      <p>The app failed to load. Please try:</p>
      <ol style="text-align: left; display: inline-block;">
        <li>Clear your browser cache</li>
        <li>Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)</li>
        <li>If the problem persists, try uninstalling and reinstalling the app</li>
      </ol>
      <p style="color: #666; margin-top: 20px;">Error: ${error.message}</p>
    </div>
  `;
}
