import { React } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { CustomProvider } from 'rsuite';
import { AuthProvider } from './contexts/AuthContext';
import RootLayout from './layouts/RootLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage/LoginPage';
import ManageEntitiesPage from './pages/ManageEntitiesPage';
import TradeReportPage from './pages/TradeReportPage';
import ClosedTradesPage from './pages/ClosedTradesPage';
import UploadDataPage from './pages/UploadDataPage'; // Import the new UploadData page
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
                    <TradeReportPage />
                  </RootLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/closed-trades"
              element={
                <ProtectedRoute>
                  <RootLayout>
                    <ClosedTradesPage />
                  </RootLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload-data"
              element={
                <ProtectedRoute>
                  <RootLayout>
                    <UploadDataPage />
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