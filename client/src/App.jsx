import { useState } from 'react'
import LandingPage from './LandingPage'
import EarthThreeJS from './EarthThreeJS';
// import ThreeDebug from './ThreeDebug';

// function App() {
//   return (
//     <div className="App" style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
//       <ThreeDebug />
//     </div>
//   );
// }
function App() {
  const [showEarth, setShowEarth] = useState(false)

  const handleStartExploration = () => {
    setShowEarth(true)
  }

  return (
    <>
      {!showEarth ? (
        <LandingPage onStart={handleStartExploration} />
      ) : (
        <div className="App" style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
          <EarthThreeJS />
        </div>
      )}
    </>
  )
}

export default App
