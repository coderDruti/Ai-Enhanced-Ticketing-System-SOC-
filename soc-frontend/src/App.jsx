import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TicketProvider } from './context/TicketContext';
import Login from './pages/login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';


function App() {
  return (
    <BrowserRouter>
    <TicketProvider>
      <Routes>
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Catch-all route --> redirects unknown URLs to the login page*/}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </TicketProvider>
  </BrowserRouter>
  )
}

export default App