import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CardDetail from './pages/CardDetail';
import Rewards from './pages/Rewards';

function App() {
return (
<BrowserRouter>
<Routes>
<Route path="/" element ={<Login />} />
<Route path="/register" element={<Register />} />
<Route path="/dashboard" element={<Dashboard />} />
<Route path= "/cards/:id" element={<CardDetail />} />
<Route path="/cards/:cardId/rewards" element={<Rewards />} />
</Routes>
</BrowserRouter>
);
}

export default App;
