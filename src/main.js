import { createApp } from 'vue';
import './assets/main.css';
import App from './App.vue';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker for PWA in production
if ('serviceWorker' in navigator) {
  if (import.meta.env.DEV) {
    // In dev mode, unregister any stale service workers to ensure fresh code
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    });
    if ('caches' in window) {
      caches.keys().then((names) => {
        for (const name of names) {
          caches.delete(name);
        }
      });
    }
  } else {
    registerSW({ immediate: true });
  }
}

createApp(App).mount('#app');
