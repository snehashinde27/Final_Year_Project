import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Splash from './pages/Splash';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import AdminSignup from './pages/Auth/AdminSignup';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminCameras from './pages/Admin/Cameras';
import AdminViolations from './pages/Admin/Violations';
import UserDashboard from './pages/User/Dashboard';
import NotFound from './pages/NotFound';
import PlaceholderPage from './components/PlaceholderPage';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 font-sans">
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin-signup" element={<AdminSignup />} />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute role="admin">
            <DashboardLayout role="admin" />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="cameras" element={<AdminCameras />} />
          <Route path="violations" element={<AdminViolations />} />
          <Route path="challans" element={<PlaceholderPage title="Challan Management" />} />
          <Route path="stats" element={<PlaceholderPage title="System Statistics" />} />
        </Route>

        {/* User Routes */}
        <Route path="/user" element={
          <ProtectedRoute role="user">
            <DashboardLayout role="user" />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="challans" element={<PlaceholderPage title="My Challans" />} />
          <Route path="payments" element={<PlaceholderPage title="Payment History" />} />
          <Route path="profile" element={<PlaceholderPage title="User Profile" />} />
          <Route path="support" element={<PlaceholderPage title="Support" />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
