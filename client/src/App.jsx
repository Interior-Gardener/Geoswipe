import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import GlobalGestureCursor from "./GlobalGestureCursor";
import CameraCapture from "./components/CameraCapture";
import AppNav from "./components/AppNav";
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

// Branded route-transition loader. Replaces a bare "Loading..." string with a
// determinate-feeling progress affordance so waits read as intentional.
const LoadingSpinner = () => (
  <div className="gs-page-loader" role="status" aria-live="polite">
    <div className="gs-page-loader__inner">
      <div className="gs-page-loader__mark">GEOSWIPE</div>
      <div className="gs-page-loader__bar" />
      <div className="gs-page-loader__hint">Preparing your journey</div>
    </div>
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
  const { theme } = useTheme();

  // Gesture control must stay alive wherever the user steers with their hand:
  // the landing page, the globe, and every game launched from it. Previously
  // this was limited to "/" and "/explore", so CameraCapture unmounted the
  // moment a game started and the frame stream (and therefore gestures) died.
  // Heritage Mode is map-driven and deliberately excluded.
  const isCameraVisibleRoute = useMemo(() => {
    const gestureRoutes = [
      "/",
      "/explore",
      "/quiz",
      "/flag-game",
      "/multiplayer/quiz",
      "/multiplayer/flag-game"
    ];
    return gestureRoutes.includes(location.pathname);
  }, [location.pathname]);

  const isHeritageRoute = useMemo(
    () => isHeritageEcosystemPath(location.pathname),
    [location.pathname]
  );

  // Theme is applied to the ROOT element for every route, not just the
  // heritage ecosystem, so light/dark works across the whole product.
  // `data-heritage-theme` is kept on <body> for the legacy heritage rules.
  useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    document.documentElement.setAttribute("data-gs-theme", theme);
    document.body.setAttribute("data-heritage-theme", theme);

    if (isHeritageRoute) {
      document.body.classList.add("heritage-theme-active");
    } else {
      document.body.classList.remove("heritage-theme-active");
    }

    return undefined;
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

      {/* Global navigation: home/section switcher, theme toggle and the
          "how it works" guide. Replaces the per-page back/home buttons and the
          heritage-only theme toggle. */}
      <AppNav />

      {/* Global gesture cursor - appears on all pages */}
      <GlobalGestureCursor />
      {isCameraVisibleRoute && (
        <>
          {/* Browser-based gesture camera */}
          <CameraCapture
            enabled={true}
            showPreview={showCameraPreview}
            targetFPS={30}
            width={640}
            height={480}
          />
          {/* Camera preview toggle */}
          <button
            type="button"
            onClick={() => setShowCameraPreview(!showCameraPreview)}
            className={`gs-fab gs-fab--lg gs-camera-toggle${showCameraPreview ? ' gs-fab--active' : ''}`}
            aria-pressed={showCameraPreview}
            aria-label={showCameraPreview ? 'Hide camera preview' : 'Show camera preview'}
            title={showCameraPreview ? 'Hide camera preview' : 'Show camera preview'}
          >
            <span aria-hidden="true">{showCameraPreview ? '👁️' : '📷'}</span>
          </button>
        </>
      )}
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
