import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import MapaColeta from './pages/MapaColeta';
import Denuncia from './pages/Denuncia';
import Calculadora from './pages/Calculadora';
import Legislacao from './pages/Legislacao';
import Login from './pages/Login';
import './styles/global.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <main style={{ paddingBottom: 48 }}>
          <Routes>
            <Route path="/" element={<MapaColeta />} />
            <Route path="/denuncia" element={<Denuncia />} />
            <Route path="/calculadora" element={<Calculadora />} />
            <Route path="/legislacao" element={<Legislacao />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}
