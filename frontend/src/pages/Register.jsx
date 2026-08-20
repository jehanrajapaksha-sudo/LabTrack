import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/lab'} replace />;
  }

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError('Name, email, and password are required.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/lab');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="auth-layout">
        <form className="card auth-card" onSubmit={onSubmit}>
          <h1>Register lab</h1>
          <p className="muted">Create an account to submit lab reports. Admin accounts are not created here.</p>

          {error && <div className="alert alert-error">{error}</div>}

          <label>
            Lab name
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={onChange}
              autoComplete="organization"
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              autoComplete="new-password"
              required
            />
          </label>

          <label>
            Confirm password
            <input
              type="password"
              name="confirm"
              value={form.confirm}
              onChange={onChange}
              autoComplete="new-password"
              required
            />
          </label>

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Create account'}
          </button>

          <p className="muted center">
            Already registered? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </main>
    </>
  );
}
