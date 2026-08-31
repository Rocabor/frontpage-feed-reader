import React from 'react';
import ReactDOM from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { App } from './App';
import './index.css';

// Only load Vercel analytics/insights when hosted on Vercel. These components
// fetch their scripts from /_vercel/*, which only exists on the Vercel
// platform; loading them elsewhere (e.g. local/NODE_ENV=production) causes
// console errors and a false-negative Best Practices score in Lighthouse.
function VercelInsights() {
  const onVercel =
    typeof window !== 'undefined' && window.location.hostname.endsWith('.vercel.app');
  if (!onVercel) return null;
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <VercelInsights />
  </React.StrictMode>
);
