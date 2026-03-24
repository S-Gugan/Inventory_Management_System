import React, { useState } from 'react';
import './Login.css'; // We will create this next

const Login = ({ setToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    try {
      const response = await fetch("http://127.0.0.1:8000/token", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Invalid credentials. Please try again.");
      }

      const data = await response.json();
      localStorage.setItem("token", data.access_token);
      setToken(data.access_token);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">📦</div>
          <h2>Welcome Back</h2>
          <p>Please enter your details to manage inventory</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label>Username</label>
            <input 
              type="text" 
              placeholder="e.g. admin"
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-button" disabled={isSubmitting}>
            {isSubmitting ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <div className="login-footer">
          <p>Secure Inventory Access v1.0</p>
        </div>
      </div>
    </div>
  );
};

export default Login;