import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Watch from './pages/Watch'
import Admin from './pages/Admin'
import Login from './pages/Login'

function ProtectedRoute({ children }) {
  const subscribed = localStorage.getItem('subscribed') === 'true'
  return subscribed ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      } />
      <Route path="/watch/:id" element={
        <ProtectedRoute>
          <Watch />
        </ProtectedRoute>
      } />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  )
}

export default App