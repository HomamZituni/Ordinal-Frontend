import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CardDetail from './pages/CardDetail';
import Rewards from './pages/Rewards';
import ProtectedRoute from './components/ProtectedRoute';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/cards/:id" 
          element={
            <ProtectedRoute>
              <CardDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/cards/:cardId/rewards" 
          element={
            <ProtectedRoute>
              <Rewards />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
