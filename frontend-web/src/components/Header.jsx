import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const location = useLocation();
  const { usuario, sair } = useAuth();

  const links = [
    { to: '/', label: 'Mapa de coleta' },
    { to: '/denuncia', label: 'Fazer denúncia' },
    { to: '/calculadora', label: 'Calculadora' },
    { to: '/legislacao', label: 'Legislação' },
  ];

  return (
    <header className="header">
      <div className="container header-content">
        <Link to="/" className="logo">
          🌱 E-Descarte
        </Link>
        <nav className="nav">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className={location.pathname === l.to ? 'active' : ''}>
              {l.label}
            </Link>
          ))}
          {usuario ? (
            <button onClick={sair}>Sair ({usuario.nome.split(' ')[0]})</button>
          ) : (
            <Link to="/login">Entrar</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
