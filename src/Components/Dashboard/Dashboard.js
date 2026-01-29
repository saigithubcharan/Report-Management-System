import React, { useEffect, useState } from "react";
import { Tabs, Tab } from "@mui/material";
import "./Dashboard.css";
import ElectricalScoreDashboard from "../ElectricalScoreDashboard/ElectricalScoreDashboard";
import HSEDashboard from "../HSEDashboard/HSEDashboard";
import CmvElectricalDashboard from "../CmvElectricalDashboard/CmvElectricalDashboard";
import HseCmvDashboard from "../HseCmvDashboard/HseCmvDashboard";
const Dashboard = ({ allReports, getAllReports, allHseReports, getAllHseReports}) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
//  console.log("data",allHseReports)
  useEffect(() => {
    getAllReports();
    getAllHseReports();
  }, []);

  return (
    <div className="dashboard">
      <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" >
        <Tab label="Electrical Dashboard" />
        <Tab label="HSE Dashboard" />
      </Tabs>
      {activeTab === 0 && <CmvElectricalDashboard allReports={allReports} />}
      {activeTab === 1 && <HseCmvDashboard allHseReports={allHseReports} />}
    </div>
  );
};

export default Dashboard;


