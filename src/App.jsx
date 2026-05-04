import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Watch from './pages/Watch'
import Admin from './pages/Admin'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/watch/:id" element={<Watch />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  )
}

export default App