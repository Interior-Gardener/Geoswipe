import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import LandingPage from "./LandingPage";
import EarthThreeJS from "./EarthThreeJS";
import QuizDisplay from "./QuizDisplay";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPageWithApi />} />
        <Route path="/explore" element={<EarthThreeJSFullScreen />} />
      </Routes>
    </Router>
  );
}

// Wrapper for LandingPage to handle backend call + navigation
function LandingPageWithApi() {
  const navigate = useNavigate();

  const handleStartExploration = () => {
    fetch(`http://localhost:3000/api/start`)
      .then(res => res.json())
      .then(data => {
        if (data.allow) {
          navigate("/explore");
        }
    })
    .catch(err => console.error(err));
  };

  return <LandingPage onStart={handleStartExploration} />;
}

// Wrapper for EarthThreeJS with fullscreen style
function EarthThreeJSFullScreen() {
  return (
    <div
      className="App"
      style={{
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
        overflow: "hidden"
      }}
    >
      <EarthThreeJS />
    </div>
  );
}

export default App;
