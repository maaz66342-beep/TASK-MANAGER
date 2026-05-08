import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>🚀 Create Account</h1>
        <p>Join and start managing tasks</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text" name="name"
              value={form.name} onChange={handleChange}
              placeholder="John Doe" required minLength={2}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email" name="email"
              value={form.email} onChange={handleChange}
              placeholder="you@example.com" required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password" name="password"
              value={form.password} onChange={handleChange}
              placeholder="Min 6 characters" required minLength={6}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center">
          Already have an account?{' '}
          <Link to="/login" className="link-text">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
