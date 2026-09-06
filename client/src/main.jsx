// React import retained for JSX-runtime compatibility across the app.
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { HeritageSelectionProvider } from './context/HeritageSelectionContext';
import { ThemeProvider } from './context/ThemeContext';
// Design system first so feature stylesheets can layer on top of the tokens.
import './styles/design-system.css';
import './styles/theme-system.css';

// NOTE: intentionally NOT wrapped in <React.StrictMode>.
//
// StrictMode double-invokes effects in development only. EarthThreeJS builds a
// full Three.js scene imperatively - WebGL context, renderer, textures, DOM
// overlays and the dat.GUI customization panel - and that setup is not
// idempotent. Double-invoking it produced two stacked canvases and two control
// panels, leaving the visible globe wired to a torn-down scene, so the Earth
// customization panel did nothing in `npm run dev` while working correctly in
// production builds.
//
// Removing StrictMode makes development behave like production. Restore it only
// alongside a rewrite that makes the Three.js effect safe to run twice.
ReactDOM.createRoot(document.getElementById('root')).render(
  <ThemeProvider>
    <HeritageSelectionProvider>
      <App />
    </HeritageSelectionProvider>
  </ThemeProvider>
);
