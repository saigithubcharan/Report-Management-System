import React, { useEffect, useState } from "react";
import "./Home.css";
import SidePanel from "../SidePanel/SidePanel";
import NavBar from "../NavBar/NavBar";
import { Grid } from "@material-ui/core";
import Dashboard from "../Dashboard/Dashboard";
import NewReport from "../NewReport/NewReport";
import SavedReports from "../SavedReports/SavedReports";
import NotesListScreen from "../NotesListScreen/NotesListScreen";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { config } from "../../config";
import axios from "../../APIs/axios";
import { getAccountDetails } from "../Services/localStorage";
import { useNavigate } from "react-router-dom";
import HseGpt from "../HseGpt/HseGpt";
import ElectricalGpt from "../ElectricalGpt/ElectricalGpt";
import CMV from "../CMV/CMV";
import Loader from "../Loader/Loader";
import Inspection from "../Inspection/Inspection";

const Home = ({ loginSuccess }) => {
  const [selection, setSelection] = useState("dashboard");
  const [isLoginSuccess, setIsLoginSuccess] = useState(false);
  const [allData, setAllData] = useState([]);
  const [hseAllData, setHseAllData] = useState([]);
  const navigate = useNavigate();
  const { accessToken, userId } = getAccountDetails();
  const [userDetails, setUserDetails] = useState({});
  const [allReports, setAllReports] = useState([]);
  const [allHseReports, setAllHseReports] = useState([]);
  const [allCmvReports, setAllCmvReports] = useState([]);
  const [allHseCmvReports, setAllHseCmvReports] = useState([]);
  const [loading, setLoading] = useState(false);

  const loginMessage = () => {
    toast.success("Login Successful!");
  };

  useEffect(() => {
    setIsLoginSuccess(loginSuccess);
    if (!accessToken) {
      navigate("/"); // Navigate to login if there's no access token
    } else {
      getAllData(); // Fetch data if the user is logged in
      getAllHseData();
      getUserDetails();
    }
  }, [loginSuccess, accessToken, navigate]);

  useEffect(() => {
    if (isLoginSuccess) {
      loginMessage();
    }
  }, [isLoginSuccess]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
const [open, setOpen] = useState(false);
useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth <= 900);
  };

  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);


  const getAllData = async () => {
    try {
      const allData = await axios.get(`${config.PATH}/api/all-data`);
      setAllData(allData);
    } catch (err) {
      console.log(err.message);
    }
  };

  const getAllHseData = async () => {
    try {
      const data = await axios.get(`${config.PATH}/api/hse-allData`);
      setHseAllData(data);
    } catch (err) {
      console.log(err.message);
    }
  };

  const getUserDetails = async () => {
    try {
      const user = await axios.get(`${config.PATH}/api/user-details/${userId}`);
      setUserDetails(user.data.user);
    } catch (err) {
      console.log(err.message);
    }
  };

  useEffect(() => {
    if (accessToken) {
      getAllHseReports();
      getAllReports();
      getAllCmvReports();
      getAllHseCmvReports();
    }
  }, [accessToken]);

  const getAllReports = async () => {
    let allReports = await axios.get(
      `${config.PATH}/api/get-all-reports?userId=${userId}`
    );
    setAllReports(allReports.data);
  };

  const getAllCmvReports = async () => {
    let allReports = await axios.get(
      `${config.PATH}/api/get-all-cmv-reports?userId=${userId}`
    );
    setAllCmvReports(allReports.data);
  };

  const getAllHseCmvReports = async () => {
    let allReports = await axios.get(
      `${config.PATH}/api/get-all-hse-cmv-reports?userId=${userId}`
    );
    setAllHseCmvReports(allReports.data);
  };

  const getAllHseReports = async () => {
    let allReports = await axios.get(
      `${config.PATH}/api/get-all-hse-reports?userId=${userId}`
    );
    setAllHseReports(allReports.data);
  };

  return (
    <div >
      <ToastContainer autoClose={2000} />
      {loading ? <Loader /> : null}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <NavBar userDetails={userDetails} getUserDetails={getUserDetails} />
        </Grid>
        {/* <Grid className="grid-panel" item xs={2}>
          <SidePanel selection={selection} setSelection={setSelection} />
        </Grid> */}
        {!isMobile && (
  <Grid className="grid-panel" item xs={2}>
    <SidePanel selection={selection} setSelection={setSelection} />
    {/* Optional: can remove SidePanel from here if already shown separately */}
  </Grid>
)}
{isMobile && (
  <SidePanel selection={selection} setSelection={setSelection} />
)}
{/* SidePanel always rendered to show floating button in mobile */}

        {/* Center Panel */}
        <Grid className="center-cards-parent-div" item xs={10}>
          {selection === "dashboard" && accessToken ? (
            <Dashboard
              allHseReports={allHseReports}
              allReports={allReports}
              getAllReports={getAllReports}
              getAllHseReports={getAllHseReports}
            />
          ) : null}
          {selection === "new report" ? (
            <NewReport
              allData={allData}
              hseAllData={hseAllData}
              getAllHseData={getAllHseData}
              getAllData={getAllData}
              setLoading={setLoading}
              getAllReports={getAllReports}
              getAllCmvReports={getAllCmvReports}
            />
          ) : null}
          {selection === "saved report" ? (
            <SavedReports
              getAllReports={getAllReports}
              getAllHseReports={getAllHseReports}
              allReports={allReports}
              allHseReports={allHseReports}
              allData={allData}
              hseAllData={hseAllData}
              getAllHseData={getAllHseData}
              getAllData={getAllData}
              setLoading={setLoading}
            />
          ) : null}
          {selection === "notes" ? (
            <NotesListScreen
              allData={allData}
              hseAllData={hseAllData}
              setLoading={setLoading}
            />
          ) : null}
          {selection === "gpt" ? <HseGpt /> : null}
          {selection === "electrical-gpt" ? <ElectricalGpt /> : null}
          {selection === "cmv" ? (
            <CMV
              getAllReports={getAllCmvReports}
              getAllHseReports={getAllHseCmvReports}
              allReports={allCmvReports}
              allHseReports={allHseCmvReports}
              allData={allData}
              hseAllData={hseAllData}
              getAllHseData={getAllHseData}
              getAllData={getAllData}
            />
          ) : null}
          {selection === "inspection" ? <Inspection /> : null}
        </Grid>
      </Grid>
    </div>
  );
};

export default Home;
