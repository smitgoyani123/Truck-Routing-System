import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./LoginForm.css";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function LoginForm({ setIsLoggedIn }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSignIn, setIsSignIn] = useState(true);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const toggleMode = () => {
    setIsSignIn(!isSignIn);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: "", email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (data) => {
    const endpoint = isLogin ? "/login" : "/signup";
    let userInfo = {};
    if (endpoint === "/signup") {
      userInfo = {
        username: data.username,
        email: data.email,
        pass1: data.password,
        pass2: data.confirmPassword,
      };
    } else if (endpoint === "/login") {
      userInfo = {
        username: data.username,
        password: data.password,
      };
    }
    console.log("SignIn/SignUp data:", userInfo);
    localStorage.setItem("userInfo", JSON.stringify(userInfo));

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_LOGIN_URL}${endpoint}/`,
        userInfo
      );
      localStorage.setItem("token", res.data.refresh);
      console.log("Login successful token:", res.data.refresh);
      toast.success("Login successful!", { position: "bottom-right" });
      localStorage.setItem("loggedIn", "true");
      setIsLoggedIn(true);
      navigate("/");
    
    } catch (err) {
      toast.error("Error", { position: "bottom-right" });

    }

  };

  return (
    <div className="container">
      <div className="login-image" />
      <div className="login-form-wrapper">
        <form className="login-form" onSubmit={handleSubmit(handleLoginSubmit)}>
          <p className="login-heading">{isLogin ? "Sign In" : "Sign Up"}</p>
          <input
            type="text"
            id="username"
            placeholder="Username"
            onChange={handleChange}
            {...register("username", {
              required: "Username is required",
            })}
          />
          {errors.username && (
            <p className="error">{errors.username.message}</p>
          )}
          {!isLogin && (
            <input
              type="email"
              id="email"
              placeholder="Email"
              onChange={handleChange}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email format",
                },
              })}
            />
          )}
          {errors.email && <p className="error">{errors.email.message}</p>}
          <div className="pass-holder">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="Password"
              onChange={handleChange}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              })}
            />
            <div className="eye" onClick={togglePasswordVisibility}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
          </div>
          {errors.password && (
            <p className="error">{errors.password.message}</p>
          )}
          {!isLogin && (
            <div className="pass-holder">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                placeholder="Confirm Password"
                onChange={handleChange}
                {...register("confirmPassword", {
                  required: "Confirm Password is required",
                  validate: (value) =>
                    value === getValues("password") || "Passwords do not match",
                })}
              />
              <div className="eye" onClick={toggleConfirmPasswordVisibility}>
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>
          )}
          {errors.confirmPassword && (
            <p className="error">{errors.confirmPassword.message}</p>
          )}
          <a href="#" className="forgot-pass">
            Forgot password?
          </a>
          <p className="toggle-link">
            {isLogin ? "Don't have an Account? " : "Already have an account? "}
            <span onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Sign Up" : "Sign In"}
            </span>
          </p>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Registering..." : "Login"}
          </button>
        </form>
      </div>
      {/* <ToastContainer position="bottom-right"  closeButton={false} autoClose={300}/> */}
    </div>
  );
}

export default LoginForm;
