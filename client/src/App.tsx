import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import SignIn from './SignIn';
import Dashboard from './Dashboard';
import ProtectedRoute from './components/Auth/ProtectedRoute';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
      <Route path="/login" element={<SignIn />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
