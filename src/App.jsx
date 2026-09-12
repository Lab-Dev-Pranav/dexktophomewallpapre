import GradientBlinds from './components/GradientBlinds'
import './App.css'

function App() {
  return (
    <main className="page">
      <GradientBlinds className="background" gradientColors={['#FF9FFC', '#5227FF']} angle={20} noise={0.5} blindCount={16} blindMinWidth={60} spotlightRadius={0.5} spotlightSoftness={1} spotlightOpacity={1} mouseDampening={0.15} distortAmount={0} shineDirection="left" mixBlendMode="lighten" />
      {/* <a className="portfolio-link" href="https://devpranav.onrender.com" target="_blank" rel="noreferrer"><h1>_dev.pranav____</h1></a> */}
    </main>
  )
}

export default App
