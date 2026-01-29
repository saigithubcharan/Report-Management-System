import React, { useState, useRef } from "react";
import { TextField, Button, IconButton, InputAdornment } from "@mui/material";
import {
  AccountCircle,
  Email,
  Visibility,
  VisibilityOff,
  PhoneAndroid,
} from "@mui/icons-material";
import "./SignupForm.css";
import logo from "../../mi_logo.png";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { config } from "../../config";
import ReCAPTCHA from "react-google-recaptcha";
import { margin } from "@mui/system";

const SignupForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [color, setColor] = useState("");
  const [recaptchaValue, setRecaptchaValue] = useState(null);
  const navigate = useNavigate();
  const recaptchaRef = useRef();

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handleMobileChange = (event) => {
    // Remove any non-digit characters from the input
    const cleanedValue = event.target.value.replace(/\D/g, "");

    // Limit the input to 10 digits
    const limitedValue = cleanedValue.slice(0, 10);

    setMobile(limitedValue);
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!recaptchaValue) {
      toast.warn("Please complete the reCAPTCHA.");
      // Reset the reCAPTCHA
      recaptchaRef.current.reset();
      return;
    }
    if (password !== confirmPassword) {
      setColor("error");
      toast.warn("Passwords do not match!");
      // Reset the reCAPTCHA
      recaptchaRef.current.reset();
      return;
    }

    const payload = {
      name: name,
      email: email,
      mobile: mobile,
      password: password,
      recaptchaValue: recaptchaValue,
      appType:"web"
    };

    try {
      const response = await axios.post(`${config.PATH}/api/signup`, payload);
      console.log(response, "sameer");
      const data = response.data;
      console.log("User created successfully:", data.user);
      // Reset form fields
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setMobile("");
      navigate("/");
    } catch (error) {
      toast.error(error.response.data.message);
      // Reset the reCAPTCHA
      recaptchaRef.current.reset();
    }
  };

  const handleRecaptchaChange = (value) => {
    setRecaptchaValue(value);
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="form-styles">
      <div style={{textAlign:"center", background:"#307268"}}>
        <img src={logo} alt="mi logo" style={{height:"50%", width:"50%", marginTop:"10px"}} />
        </div>
        <br/>
        <h3 style={{ color: "grey",margin:"0px" }}>Create Account</h3>
        <TextField
          size="small"
          label="Name"
          value={name}
          onChange={handleNameChange}
          fullWidth
          margin="normal"
          required
          style={inputStyles}
          InputProps={{
            endAdornment: (
              <InputAdornment position="start">
                <AccountCircle />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          size="small"
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
        <TextField
          size="small"
          label="Mobile"
          type="number"
          value={mobile}
          onChange={handleMobileChange}
          fullWidth
          margin="normal"
          required
          style={inputStyles}
          InputProps={{
            endAdornment: (
              <InputAdornment position="start">
                <PhoneAndroid />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          size="small"
          label="Password"
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
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey="6LfyNN4nAAAAAHzv_dlXegzx8ETJuoVHszFDaE59"
          onChange={handleRecaptchaChange}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          style={buttonStyles}
        >
          Sign Up
        </Button>
        <p>
          <Link to="/">Already a user? Login</Link>
        </p>
      </form>
      <ToastContainer autoClose={2000} />
    </div>
  );
};

const inputStyles = {
  marginBottom: "0.3rem",
  width: "300px",
  backgroundColor: "whitesmoke",
  boxShadow: "5px 5px 3px grey",
  borderRadius: "6px",
};

const buttonStyles = {
  marginTop: "1rem",
  // marginBottom: "1rem",
  backgroundColor: "#efc71d",
  width: "200px",
};

export default SignupForm;
