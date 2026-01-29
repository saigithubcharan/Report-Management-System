import React, { useState } from "react";
import { TextField, Button, InputAdornment, IconButton } from "@mui/material";
import { Email, Visibility, VisibilityOff } from "@mui/icons-material";
import logo from "../../mi_logo.png";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { config } from "../../config";
import Loader from "../Loader/Loader";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [color, setColor] = useState("");
  const [otpSent, setOtpSent] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleConfirmPasswordChange = (event) => {
    setConfirmPassword(event.target.value);
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };
  const handleOtpChange = (event) => {
    setOtp(event.target.value);
  };

  const handleSubmitForget = async (event) => {
    event.preventDefault();
    const payload = {
      email: email,
    };

    // API to send reset link on mail
    try {
      setLoading(true);
      await axios.post(`${config.PATH}/api/forgot-password`, payload);
      setOtpSent(true);
      // Reset form fields
      toast.success("OTP sent to email");
      setLoading(false);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const handleSubmitChange = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setColor("error");
      toast.warn("Passwords do not match!");
      return;
    }
    const payload = {
      email,
      otp,
      password,
    };
    try {
      await axios.post(`${config.PATH}/api/change-password`, payload);
      localStorage.setItem(
        "passwordChangedMessage",
        "Password changed successfully"
      );
      navigate("/");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  return (
    <div>
      <ToastContainer autoClose={2000} />
      {loading ? <Loader /> : null}
      <form
        onSubmit={otpSent ? handleSubmitChange : handleSubmitForget}
        className="form-styles"
      >
        <div style={{ textAlign: "center", background: "#307268" }}>
          <img
            src={logo}
            alt="mi logo"
            style={{ height: "50%", width: "50%", marginTop: "10px" }}
          />
        </div>{" "}
        <h3 style={{ color: "grey" }}>
          {otpSent ? "Change Password" : "Get OTP To Change Password"}
        </h3>
        <TextField
          size="small"
          disabled={otpSent}
          label="Email"
          type="email"
          value={email}
          onChange={handleEmailChange}
          fullWidth
          margin="normal"
          required
          style={inputStyles}
          InputProps={{
            endAdornment: (
              <InputAdornment position="start">
                <Email />
              </InputAdornment>
            ),
          }}
        />
        {otpSent && (
          <TextField
            size="small"
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
        {otpSent && (
          <TextField
            size="small"
            label="New Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={handlePasswordChange}
            fullWidth
            margin="normal"
            required
            style={inputStyles}
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
        {otpSent && (
          <TextField
            color={color}
            size="small"
            label="Confirm Password"
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            fullWidth
            margin="normal"
            required
            style={inputStyles}
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
        <Button
          type="submit"
          variant="contained"
          color="primary"
          style={buttonStyles}
        >
          {otpSent ? "Save" : "Get OTP"}
        </Button>
      </form>
    </div>
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

export default ForgotPassword;
