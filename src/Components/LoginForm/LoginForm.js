import React, { useState, useRef, useEffect } from "react";
import { TextField, Button, IconButton, InputAdornment } from "@mui/material";
import { Email, Visibility, VisibilityOff } from "@mui/icons-material";
import "./LoginForm.css";
import logo from "../../mi_logo.png";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { config } from "../../config";
import { setAccountDetails } from "../Services/localStorage";
import ReCAPTCHA from "react-google-recaptcha";
import Loader from "../Loader/Loader";

const LoginForm = ({ setLoginSuccess }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpField, setShowOtpField] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [recaptchaValue, setRecaptchaValue] = useState(null);
  const recaptchaRef = useRef();
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const passwordChangedMessage = localStorage.getItem("passwordChangedMessage");
    if (passwordChangedMessage) {
      toast.success(passwordChangedMessage);
      localStorage.removeItem("passwordChangedMessage");
    }
  }, []);

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const handleOtpChange = (event) => {
    setOtp(event.target.value);
  };

  const handleLogin = async () => {
    if (!recaptchaValue) {
      toast.warn("Please complete the reCAPTCHA.");
      // Reset the reCAPTCHA
      recaptchaRef.current.reset();
      return;
    }
    const payload = {
      email: email,
      password: password,
      recaptchaValue: recaptchaValue,
      appType:"web"
    };

    try {
      setLoading(true)
      const accountDetails = await axios.post(
        `${config.PATH}/api/login`,
        payload
      );
      setAccountDetails(accountDetails.data);
      setShowOtpField(true);
      setOtpSent(true);
      setLoading(false)
      toast.success("OTP sent on email");
    } catch (error) {
      toast.error(error.response.data.message);
      recaptchaRef.current.reset();
      setLoading(false)
    }
  };

  const handleVerify = async () => {
    const payload = {
      email: email,
      otp: otp,
    };

    try {
      await axios.post(`${config.PATH}/api/verify-otp`, payload);
      setLoginSuccess(true);
      // navigate("/home");
      window.location.href = "/home"
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (showOtpField) {
      handleVerify();
    } else {
      handleLogin();
    }
  };

  const handleRecaptchaChange = (value) => {
    setRecaptchaValue(value);
  };

  return (
    <>
      <ToastContainer autoClose={2000} />
      {loading?<Loader/>:null}
      <form onSubmit={handleSubmit} className="form-styles">
        <div style={{textAlign:"center", background:"#307268"}}>
        <img src={logo} alt="mi logo" style={{height:"50%", width:"50%", marginTop:"10px"}} />
        </div>
        <h3 style={{ color: "grey" }}>
          {showOtpField ? "Verify OTP to login" : "Login"}
        </h3>
        <TextField
          disabled={otpSent}
          label="Email"
          type="email"
          value={email}
          onChange={handleEmailChange}
          fullWidth
          margin="normal"
          required
          style={inputStyles}
          InputLabelProps={{ shrink: true }}
          placeholder={email === "" ? "Enter your email" : ""}
          InputProps={{
            endAdornment: (
              <InputAdornment position="start">
                <Email />
              </InputAdornment>
            ),
          }}
        />
        {!showOtpField && (
          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={handlePasswordChange}
            fullWidth
            margin="normal"
            required
            style={inputStyles}
            InputLabelProps={{ shrink: true }}
            placeholder={password === "" ? "Enter your password" : ""}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                    style={{ left: "-12px" }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        )}
        {showOtpField && (
          <TextField
            label="OTP"
            type="text"
            value={otp}
            onChange={handleOtpChange}
            fullWidth
            margin="normal"
            required
            style={inputStyles}
          />
        )}
        {!showOtpField ? (
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey="6LfyNN4nAAAAAHzv_dlXegzx8ETJuoVHszFDaE59"
            onChange={handleRecaptchaChange}
          />
        ) : null}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          style={buttonStyles}
        >
          {showOtpField ? "Verify" : "Login"}
        </Button>
        {!showOtpField && (
          <p style={{textAlign:"center"}}>
            <Link to="/signup">
              New User? Sign Up
            </Link>
            <br/><br/>
            <Link to="/forgot-password">
              Forgot Password? Create New Password
            </Link>
          </p>
        )}
      </form>
    </>
  );
};

const inputStyles = {
  marginBottom: "1rem",
  width: "300px",
  backgroundColor: "whitesmoke",
  boxShadow: "5px 5px 3px grey",
  borderRadius: "6px",
};

const buttonStyles = {
  marginTop: "1rem",
  marginBottom: "1rem",
  backgroundColor: "#efc71d",
  width: "200px",
};

export default LoginForm;
