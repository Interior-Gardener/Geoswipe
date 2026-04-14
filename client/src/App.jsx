import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import GlobalGestureCursor from "./GlobalGestureCursor";
import CameraCapture from "./components/CameraCapture";
import HeritageStoryBook from "./HeritageStoryBook";
import StoryBookDemo from "./StoryBookDemo";
import { useTheme } from "./context/ThemeContext";

// Lazy load components for better performance
const LandingPage = lazy(() => import("./LandingPage"));
const ExplorePage = lazy(() => import("./ExplorePage"));
const QuizPage = lazy(() => import("./QuizPage"));
const FlagGuessPage = lazy(() => import("./FlagGuessPage"));
const HeritagePage = lazy(() => import("./HeritagePage"));
const TripPlannerPage = lazy(() => import("./TripPlannerPage"));
const SafetyNavigationPage = lazy(() => import("./SafetyNavigationPage"));
const SketchfabViewer = lazy(() => import("./SketchfabViewer"));
const HowToReachPage = lazy(() => import("./HowToReachPage"));

// Multiplayer pages
const MultiplayerFlagPage = lazy(() => import("./MultiplayerFlagPage"));
const MultiplayerQuizPage = lazy(() => import("./MultiplayerQuizPage"));

// Heritage Quiz pages
const HeritageQuiz = lazy(() => import("./HeritageQuiz"));
const HeritageMultiplayerQuiz = lazy(() => import("./HeritageMultiplayerQuiz"));

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

function isHeritageEcosystemPath(pathname = "") {
  const prefixes = [
    "/heritage",
    "/trip-planner",
    "/heritage-quiz",
    "/multiplayer/heritage-quiz",
    "/safety-navigation",
    "/sketchfab",
    "/how-to-reach",
    "/heritage-storybook",
    "/storybook-demo"
  ];

  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function AppShell() {
  const [showCameraPreview, setShowCameraPreview] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const isHeritageRoute = useMemo(
    () => isHeritageEcosystemPath(location.pathname),
    [location.pathname]
  );

  useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    if (isHeritageRoute) {
      document.body.classList.add("heritage-theme-active");
      document.body.setAttribute("data-heritage-theme", theme);
    } else {
      document.body.classList.remove("heritage-theme-active");
      document.body.removeAttribute("data-heritage-theme");
    }

    return () => {
      if (!isHeritageRoute) {
        document.body.classList.remove("heritage-theme-active");
        document.body.removeAttribute("data-heritage-theme");
      }
    };
  }, [isHeritageRoute, theme]);

  return (
    <>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/flag-game" element={<FlagGuessPage />} />
          <Route path="/multiplayer/flag-game" element={<MultiplayerFlagPage />} />
          <Route path="/multiplayer/quiz" element={<MultiplayerQuizPage />} />
          <Route path="/heritage" element={<HeritagePage />} />
          <Route path="/safety-navigation" element={<SafetyNavigationPage />} />
          <Route path="/trip-planner" element={<TripPlannerPage />} />
          <Route path="/trip-planner/:name" element={<TripPlannerPage />} />
          <Route path="/heritage-quiz" element={<HeritageQuiz />} />
          <Route path="/heritage-quiz/:name" element={<HeritageQuiz />} />
          <Route path="/multiplayer/heritage-quiz" element={<HeritageMultiplayerQuiz />} />
          <Route path="/multiplayer/heritage-quiz/:name" element={<HeritageMultiplayerQuiz />} />
          <Route path="/sketchfab/:uid" element={<SketchfabViewer />} />
          <Route path="/how-to-reach/:name" element={<HowToReachPage />} />
          <Route path="/heritage-storybook/:name" element={<HeritageStoryBook />} />
          <Route path="/storybook-demo" element={<StoryBookDemo />} />
        </Routes>
      </Suspense>

      {isHeritageRoute && (
        <button
          className="heritage-theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to day mode" : "Switch to night mode"}
          title={theme === "dark" ? "Switch to day mode" : "Switch to night mode"}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      )}

      {/* Global gesture cursor - appears on all pages */}
      <GlobalGestureCursor />
      {/* Browser-based gesture camera */}
      <CameraCapture
        enabled={true}
        showPreview={showCameraPreview}
        targetFPS={30}
        quality={0.7}
        width={640}
        height={480}
      />
      {/* Camera preview toggle button */}
      <button
        onClick={() => setShowCameraPreview(!showCameraPreview)}
        style={{
          position: 'fixed',
          bottom: 20,
          left: 20,
          zIndex: 1001,
          background: showCameraPreview ? '#00d4ff' : 'rgba(0, 0, 0, 0.8)',
          color: showCameraPreview ? '#000' : '#00d4ff',
          border: '2px solid #00d4ff',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          fontFamily: 'Orbitron, sans-serif',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)',
          padding: '0'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.1)';
          e.target.style.boxShadow = '0 6px 20px rgba(0, 212, 255, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 4px 15px rgba(0, 212, 255, 0.3)';
        }}
        title={showCameraPreview ? "Hide Camera Preview" : "Show Camera Preview"}
      >
        <div style={{ lineHeight: '1' }}>
          {showCameraPreview ? '👁️' : '📷'}
        </div>
        <div style={{ fontSize: '8px', marginTop: '2px', fontWeight: 'bold' }}>
          {showCameraPreview ? 'HIDE' : 'SHOW'}
        </div>
      </button>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}

export default App;
