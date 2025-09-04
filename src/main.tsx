import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {

        // Force update the service worker
        registration.update();
      })
      .catch((registrationError) => {

      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
