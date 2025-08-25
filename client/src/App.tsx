import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useAuth, AuthProvider } from "./providers/AuthProvider";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import Alert from "./components/Alert";

const PrivateRoute: React.FC<{ element: React.ReactNode, tokenRequired: boolean }> = ({ element, tokenRequired }) => {
  const { isAuthenticated } = useAuth()
  if (tokenRequired) {
    if (isAuthenticated)
      return element
    else
      return <Navigate to={'/login'} />
  } else if (!tokenRequired) {
    if (isAuthenticated)
      return <Navigate to={'/'} />
    else
      return element
  }
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Alert />
      <Router>
        <Routes>
          <Route path="/login" element={<PrivateRoute element={<LoginPage />} tokenRequired={false} />} />
          <Route path="/" element={<PrivateRoute element={<Dashboard />} tokenRequired={true} />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;