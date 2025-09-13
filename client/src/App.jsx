import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import LandingPage from "./LandingPage";
import ExplorePage from "./ExplorePage";
import QuizPage from "./QuizPage";
import HeritagePage from "./HeritagePage";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/heritage" element={<HeritagePage />} />
      </Routes>
    </Router>
  );
}


export default App;
