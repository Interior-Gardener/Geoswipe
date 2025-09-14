import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";

import LandingPage from "./LandingPage";
import ExplorePage from "./ExplorePage";
import QuizPage from "./QuizPage";
import HeritagePage from "./HeritagePage";
import SketchfabViewer from "./SketchfabViewer";
import HeritageInfoPage from "./HeritageInfoPage";
import HowToReachPage from "./HowToReachPage";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/heritage" element={<HeritagePage />} />
        <Route path="/sketchfab/:uid" element={<SketchfabViewer />} />
  <Route path="/heritage/info/:name" element={<HeritageInfoPage />} />
  <Route path="/heritage/howtoreach/:name" element={<HowToReachPage />} />
      </Routes>
    </Router>
  );
}


export default App;
