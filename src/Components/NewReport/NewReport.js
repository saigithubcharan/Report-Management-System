import React, { useEffect, useState } from "react";
import "./NewReport.css";
import { motion } from "framer-motion";
import { ElectricBolt, HealthAndSafety } from "@mui/icons-material";
import ReportModal from "../ReportModal/ReportModal";
import HseReportModal from "../HseReportModal/HseReportModal";
import { ReportProvider } from "../ReportContext/ReportContext";
import { HSEReportProvider } from "../ReportContext/ReportContextHSE";

const NewReport = ({ allData,hseAllData,getAllData,getAllHseData,setLoading,getAllHseReports,getAllReports}) => {
  const [openModal, setOpenModal] = useState(false);
  const [openHseModal, setOpenHseModal] = useState(false)
  const [areaList, setAreaList] = useState([]);
  const [hseAreaList, setHseAreaList] = useState([])
  const [selectedSector, setSelectedSector] = useState(null);
  const [selectedParam, setSelectedParam] = useState(null)

  const handleOpenModal = (modalType) => {
    if (modalType === "electrical") { 
      setOpenModal(true);
    } else {
      setOpenHseModal(true)
    }
  };

  useEffect(() => {
    populateAreaList();
    populateHSEAreaList();
  }, [selectedParam]);

  const populateAreaList = async () => {
    try {
      const area = allData.data.map((e) => e.area);
      let uniqueAreaList = [...new Set(area)];
      setAreaList(uniqueAreaList);
    } catch (err) {
      console.log(err);
    }
  };



  // const populateHSEAreaList = async () => {
  //   try {
  //     if (selectedSector && selectedSector.value) {
  //       // Extract values from selectedParam if it contains any
  //       const selectedParamValues = selectedParam.map(param => param.value);
  
  //       // Filter and get unique areas based on selectedParam values
  //       // const area = hseAllData.data
  //       const area = (hseAllData?.data || [])
  //       .filter((e) => selectedParamValues.includes(e.table_type))
  //         .map((e) => e.area);
  
  //       let uniqueAreaList = [...new Set(area)];
  //       setHseAreaList(uniqueAreaList);
  //     } else {
      
  //       setHseAreaList([]);
  //     }
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };
  
  const populateHSEAreaList = async () => {
    try {

        const area = (hseAllData?.data || [])
        .map((e) => e.area);
       
        let uniqueAreaList = [...new Set(area)];
        setHseAreaList(uniqueAreaList);
    
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="new-report">
      <div className="heading">Create New Report</div>
      <div className="card-holder">
        <motion.div
          className="card1"
          initial="initial"
          animate="animate"
          whileHover={{ scale: 1.05 }}
          onClick={() => handleOpenModal("electrical")}
        >
          <ElectricBolt fontSize="large" />
          <p>Electrical Safety</p>
        </motion.div>
        <motion.div
          className="card2"
          initial="initial"
          animate="animate"
          whileHover={{ scale: 1.05 }}
            onClick={() => handleOpenModal("hse")}
        >
          <HealthAndSafety fontSize="large" />
          <p>Health, Safety & Environment</p>
        </motion.div>
      </div>
      <ReportProvider>
      <ReportModal
        open={openModal}
        setOpenModal={setOpenModal}
        areaList={areaList}
        allData={allData}
        getAllData={getAllData}
        setLoading={setLoading}
        getAllReports={getAllReports}
      />
        </ReportProvider>
      <HSEReportProvider allData={allData}>
      <HseReportModal
      open={openHseModal}
      setOpenHseModal={setOpenHseModal}
      hseAreaList={hseAreaList}
      allData={hseAllData}
      getAllHseData={getAllHseData}
      setLoading={setLoading}
      getAllHseReports={getAllHseReports}
      selectedSector={selectedSector}
      setSelectedSector={setSelectedSector}
      selectedParam={selectedParam}
      setSelectedParam={setSelectedParam}
    />
    </HSEReportProvider>
    
    </div>
  );
};

export default NewReport;
