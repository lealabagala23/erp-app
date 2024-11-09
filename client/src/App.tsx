import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './components/auth/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Signup from './components/auth/Signup';
import MainWrapper from './components/wrappers/MainWrapper';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute />}>
        <Route path="*" element={<MainWrapper />} />
      </Route>
      <Route path="/log-in" element={<Login />} />
      <Route path="/sign-up" element={<Signup />} />
      <Route path="*" element={<Navigate to="/log-in" />} />
    </Routes>
  );
};

export default App;
