import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ServiceDashboard from './pages/ServiceDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/service-dashboard" 
            element={
              <ProtectedRoute requiredRole="user">
                <ServiceDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/provider-dashboard" 
            element={
              <ProtectedRoute requiredRole="provider">
                <ProviderDashboard />
              </ProtectedRoute>
            } 
          />
          {/* Add more routes here as needed */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;