import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboard = user?.role === 'admin' ? '/admin' : '/lab';

  return (
    <header className="nav">
      <Link to={user ? dashboard : '/login'} className="nav-brand">
        Lab Report System
      </Link>
      {user && (
        <div className="nav-right">
          <span className="nav-user">
            {user.name} <em>({user.role})</em>
          </span>
          <button type="button" className="btn btn-ghost" onClick={handleLogout}>
            Log out
          </button>
        </div>
      )}
    </header>
  );
}
