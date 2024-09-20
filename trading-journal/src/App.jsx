import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { CustomProvider } from 'rsuite';
import { AuthProvider } from './contexts/AuthContext';
import RootLayout from './layouts/RootLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage/LoginPage';
import ManageEntitiesPage from './pages/ManageEntitiesPage';
import TradeReport from './components/TradeReport/TradeReport';
import ProtectedRoute from './components/ProtectedRoute';
import './color.css';
import 'rsuite/dist/rsuite.min.css';

const App = () => {
  return (
    <CustomProvider>
      <BrowserRouter>
        <AuthProvider>
        <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <RootLayout>
                    <HomePage />
                  </RootLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage-entities"
              element={
                <ProtectedRoute>
                  <RootLayout>
                    <ManageEntitiesPage />
                  </RootLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/report"
              element={
                <ProtectedRoute>
                  <RootLayout>
                    <TradeReport />
                  </RootLayout>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </CustomProvider>
  );
};

export default App;