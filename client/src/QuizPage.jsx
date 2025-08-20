import React, { useState } from "react";
import EarthThreeJS from "./EarthThreeJS";
import CountryQuiz from "./CountryQuiz";

const QuizPage = () => {
  const [selectedCountry, setSelectedCountry] = useState(null);

  return (
    <div style={{ display: "flex" }}>
      {/* Pass setter to Earth so it can update */}
      <EarthThreeJS setSelectedCountry={setSelectedCountry} />
      

      {/* 📋 QuizDisplay overlay */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          zIndex: 1000,         // 👈 ensures it's above Earth
          background: "rgba(0, 20, 40, 0.8)",
          padding: "20px",
          borderRadius: "12px",
          color: "white",
        }}
      >
        <CountryQuiz selectedCountry={selectedCountry}  clearSelection={() => setSelectedCountry(null)}/>
      </div>
    </div>
  );
};

export default QuizPage;
