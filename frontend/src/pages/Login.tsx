import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import "../styles/headercontainer.css";
import { decodeToken } from "../utils/auth";
import type { AuthPayload } from "../types/AuthPayload";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  const searchParams = new URLSearchParams(location.search);
  const message = searchParams.get("message");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const user: AuthPayload = decodeToken(token);
        if (user) {
          navigate("/dashboard");
        }
      } catch {
        localStorage.removeItem("token");
      }
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem("token", data.token);
        const user: AuthPayload = decodeToken(data.token);
        localStorage.setItem("accessLevel", user.level);
        navigate("/dashboard");
      } else {
        setError(data.message || "Invalid email or password");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
      setPassword("");
    }
  };

  return (
    <>
      <Header />
      <div className="main-container">
        <h1>Login</h1>

        {message && <p style={{ color: "white" }}>{message}</p>}

        <form className="loginform" onSubmit={handleSubmit}>
          <label>
            Email:
            <input
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Password:
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button className="loginbtn" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <div>
          <br />
          <Link to="/CreateAccount">Create Account</Link>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login;
