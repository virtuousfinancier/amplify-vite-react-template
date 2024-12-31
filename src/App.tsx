import vfiPNG from './assets/virtuousfinance-icon-500x500px.png'
import vfiSVG from '/virtuousfinance-icon-500x500px.svg'
import './App.css'

import VolatilitySurface from './components/VolatilitySurface'

function App() {
  return (
    <div className="container mx-auto p-4">
      <VolatilitySurface />
      <img src={vfiPNG} className="logo vfi" alt="vfi logo" />
      <img src={vfiSVG} className="logo vfi" alt="vfi logo" />
    </div>
  )
}

export default App