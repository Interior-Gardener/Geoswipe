import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";

// Lazy load components for better performance
const LandingPage = lazy(() => import("./LandingPage"));
const ExplorePage = lazy(() => import("./ExplorePage"));
const QuizPage = lazy(() => import("./QuizPage"));
const HeritagePage = lazy(() => import("./HeritagePage"));
const SketchfabViewer = lazy(() => import("./SketchfabViewer"));
const HowToReachPage = lazy(() => import("./HowToReachPage"));

// Loading component
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #000000, #001122)',
    color: '#00d4ff',
    fontSize: '24px',
    fontFamily: 'Orbitron, sans-serif'
  }}>
    Loading...
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/heritage" element={<HeritagePage />} />
          <Route path="/sketchfab/:uid" element={<SketchfabViewer />} />
          <Route path="/how-to-reach/:name" element={<HowToReachPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
