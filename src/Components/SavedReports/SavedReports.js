import React, { useState, useEffect } from "react";
import "./SavedReports.css";
import { motion } from "framer-motion";
import { ElectricBolt, HealthAndSafety } from "@mui/icons-material";
import ReportListModal from "../ReportListModal/ReportListModal";
import HseReportListModal from "../HseReportListModal/HseReportListModal";
import axios from "../../APIs/axios";
import { config } from "../../config";
import { getAccountDetails } from "../Services/localStorage";

const SavedReports = ({
  allData,
  hseAllData,
  getAllData,
  getAllHseData,
  allReports,
  allHseReports,
  getAllReports,
  getAllHseReports,
}) => {
  const [openReportList, setOpenReportList] = useState(false);
  const [openHseReportList, setOpenHseReportList] = useState(false);
  const { userId } = getAccountDetails();

  const handleOpenReportList = async (reportType) => {
    if (reportType === "electrical") {
      setOpenReportList(true);
    } else if (reportType === "hse") {
      setOpenHseReportList(true);
    }
  };

  useEffect(() => {
    getAllReports();
    getAllHseReports();
  }, []);

  return (
    <div className="new-report">
      <div className="heading">View Saved Report</div>
      <div className="card-holder">
        <motion.div
          className="card1"
          initial="initial"
          animate="animate"
          whileHover={{ scale: 1.05 }}
          onClick={() => handleOpenReportList("electrical")}
        >
          <ElectricBolt fontSize="large" />
          <p>Electrical Safety</p>
        </motion.div>
        <motion.div
          className="card2"
          initial="initial"
          animate="animate"
          whileHover={{ scale: 1.05 }}
          onClick={() => handleOpenReportList("hse")}
        >
          <HealthAndSafety fontSize="large" />
          <p>Health, Safety & Environment</p>
        </motion.div>
      </div>

      {openReportList ? (
        <ReportListModal
          setOpenReportList={setOpenReportList}
          allReports={allReports}
          allData={allData}
          openReportList={true}
          getAllData={getAllData}
          getAllReports={getAllReports}
        />
      ) : openHseReportList ? (
        <HseReportListModal
          setOpenReportList={setOpenHseReportList}
          allReports={allHseReports}
          allData={hseAllData}
          openReportList={true}
          getAllHseData={getAllHseData}
          getAllHseReports={getAllHseReports}
        />
      ) : null}
    </div>
  );
};

export default SavedReports;
