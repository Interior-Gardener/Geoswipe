import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy, useState } from "react";
import GlobalGestureCursor from "./GlobalGestureCursor";
import CameraCapture from "./components/CameraCapture";
import HeritageStoryBook from "./HeritageStoryBook";
import StoryBookDemo from "./StoryBookDemo";

// Lazy load components for better performance
const LandingPage = lazy(() => import("./LandingPage"));
const ExplorePage = lazy(() => import("./ExplorePage"));
const QuizPage = lazy(() => import("./QuizPage"));
const FlagGuessPage = lazy(() => import("./FlagGuessPage"));
const HeritagePage = lazy(() => import("./HeritagePage"));
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

function App() {
  const [showCameraPreview, setShowCameraPreview] = useState(false);

  return (
    <Router>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/flag-game" element={<FlagGuessPage />} />
          <Route path="/multiplayer/flag-game" element={<MultiplayerFlagPage />} />
          <Route path="/multiplayer/quiz" element={<MultiplayerQuizPage />} />
          <Route path="/heritage" element={<HeritagePage />} />
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
    </Router>
  );
}

export default App;
