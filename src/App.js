import React, { useState } from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Home from "./Components/Home/Home";
import SignupForm from "./Components/SignupForm/SignupForm";
import LoginForm from "./Components/LoginForm/LoginForm";
import ForgotPassword from "./Components/ForgotPassword/ForgotPassword";
import { getAccountDetails } from "./Components/Services/localStorage";
import Inspection from "./Components/Inspection/Inspection";
import Templates from "./Components/Templates/Templates";
import CreateTemplate from "./Components/CreateTemplate/CreateTemplate";
import UpdateTemplate from "./Components/UpdateTemplate/UpdateTemplate";
import InspectionScreen from "./Components/InspectionScreen/InspectionScreen";
import CMVTable from "./Components/CMVTable/CMVTable";
import DocGenerateTest from "./Components/ExportWordDoc/DocGenerateTest";

function App() {
  const [loginSuccess, setLoginSuccess] = useState(false);
  const { accessToken, userId } = getAccountDetails();
  return (
    <div className="App">
      <Router>
        <Routes>
          {/* Redirect to home if accessToken is present */}
          <Route path="/" element={accessToken ? <Navigate to="/home" /> : <LoginForm setLoginSuccess={setLoginSuccess} />} />
          <Route path="/signup" element={accessToken ? <Navigate to="/home" /> : <SignupForm />} />
          <Route path="/home" element={<Home loginSuccess={loginSuccess} />} />
          <Route path="/forgot-password" element={accessToken ? <Navigate to="/home" /> : <ForgotPassword />} />
          <Route path="/inspection" element={<Inspection />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/create-template" element={<CreateTemplate />} />
          <Route path="/update-template/:templateId" element={<UpdateTemplate />} />
          <Route path="/start-inspection/:templateId" element={<InspectionScreen />} />
          <Route path="/cmv/:report_id" element={<CMVTable />} />
          {/* <Route path="/docGenerateTest" element={<DocGenerateTest/>} /> */}
        </Routes>
      </Router>
    </div>
  );
}

export default App;

