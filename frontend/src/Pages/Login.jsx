import { useState } from "react";
import "../styles/login.css";
import loginImage from "../assets/login-illustration.svg";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../config/axios";
import { notifySuccess, notifyError } from "../utils/toast";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.email || !formData.password) {
  notifyError("Please enter both email and password!");
  setLoading(false);
  return;
}

    try {
      const response = await api.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      // Store the token
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      notifySuccess("Login successful!");
      // Reset form and navigate to home
      setFormData({
        email: "",
        password: "",
        rememberMe: false,
      });

      navigate("/");
    } catch (err) {
        notifyError(
          err.response?.data?.message || "Failed to login. Please try again."
        );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  const handleCreateAccount = () => {
    // navigation logic
    navigate("/signup");
  };

  return (
    <div className="login-wrapper">
      <div className="login-left">
        <div className="login-form">
          <h2>Login</h2>

          <p className="subtitle">
            Don't have an account?{" "}
            <span onClick={handleCreateAccount} className="link">
              Create now
            </span>
          </p>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="E-mail"
              aria-label="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <div className="login-password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                aria-label="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="login-password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="eye-button"
              >
                {showPassword ? (
                  <FaRegEyeSlash size={20} color="#666" />
                ) : (
                  <FaRegEye size={20} color="#666" />
                )}
              </button>
            </div>

            <div className="remember-forgot-row">
              <div className="remember-me">
                <input
                  type="checkbox"
                  name="rememberMe"
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <label htmlFor="rememberMe">Remember me</label>
              </div>

              <span onClick={handleForgotPassword} className="forgot-link">
                Forgot Password?
              </span>
            </div>
            <button type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>

      <div className="login-right">
        <img src={loginImage} alt="Students illustration" />
      </div>
    </div>
  );
}

export default Login;
