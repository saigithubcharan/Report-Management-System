import React, { useState, useEffect,useCallback } from "react";
import {
  Modal,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
    Dialog,
    Button,
     DialogTitle,
  DialogContent,
  DialogActions,
  TextareaAutosize,
} from "@mui/material";
import "./ViewHseReportDetails.css";
import CloseIcon from "@material-ui/icons/Close";
import IconButton from "@material-ui/core/IconButton";
import { config } from "../../config";
import axios from "../../APIs/axios";
import Chart from "react-apexcharts";
import ImageViewerModal from "../ImageViewerModal/ImageViewerModal";
import InsertPhotoOutlinedIcon from "@mui/icons-material/InsertPhotoOutlined";

const ViewHseReportDetails = ({
  selectedReportData,
  setOpenViewReport,
  reportHeader,
}) => {
  const [criticalObservation, setCriticalObservations] = useState([]);
    const [selectedObservation, setSelectedObservation] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
  const [data, setData] = useState([]);
  const [scorePercent, setScorePercent] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [facilityInfo, setFacilityInfo] = useState({
    "Name of Facility": "", 
    "Address & Location": "",
    "Geographical Co-ordinates Seismic Zone": "",
    "Brief Property Description:": "",
    "Type of Construction": "",
    "Number of Floors":"",
    "Average Worker Foot Fall:": "",
    "No Objection Certificate": "",
  });

  const formattedDateTime = `${
    selectedReportData.date_time.split("T")[0].split("-")[2]
  }-${selectedReportData.date_time.split("T")[0].split("-")[1]}-${
    selectedReportData.date_time.split("T")[0].split("-")[0]
  } ${selectedReportData.date_time.split("T")[1]}`;

  const formattedStartDate = `${new Date(
    selectedReportData.start_date
  ).getDate()}-${
    new Date(selectedReportData.start_date).getMonth() + 1
  }-${new Date(selectedReportData.start_date).getFullYear()}`;

  const formattedEndDate = `${new Date(
    selectedReportData.end_date
  ).getDate()}-${
    new Date(selectedReportData.end_date).getMonth() + 1
  }-${new Date(selectedReportData.end_date).getFullYear()}`;

  // useEffect(() => {
  //   getCriticalObservations();
  //   fetchDataForCharts();
  //   getFacilityInfo();
  // }, []);
useEffect(() => {
  if (selectedReportData) {
    if (selectedReportData.AllObservations) {
      fetchDataForCharts();
    }
    getCriticalObservations();
    getFacilityInfo();
  }
}, [selectedReportData]);

  const getFacilityInfo = async () => {
    const response = await axios.get(
      `${config.PATH}/api/get-facility-info/${selectedReportData.report_id}`
    );
    const data = response.data;
    // Update each field individually
    setFacilityInfo(data);
  };

  const fetchDataForCharts = () => {
    const observations =
      // selectedReportData.AllObservations.filter((e) => e.is_selected === 1) ||
      // [];
 (selectedReportData?.AllObservations || []).filter((e) => e.is_selected === 1) || [];
 console.log("datatatata",selectedReportData.AllObservations.score)
    const totalScore =
      observations.length > 0
        // ? observations
        //     .map((e) => e.score || 0)
        //     .reduce((acc, score) => acc + score, 0)
        ? observations.reduce((acc, e) => acc + (e.score || 0), 0)
        : 0;

    const percentage = Math.floor(
      (totalScore / (observations.length * 5)) * 100
    );

    setScorePercent(isNaN(percentage) ? 0 : percentage);
    setData(observations);
      console.log("charts observation", observations);
  console.log("data length", observations.length);
  };

  const handleClose = () => {
    setOpenViewReport(false);
  };

  const getCriticalObservations = async () => {
    try {
      const res = await axios.get(
        `${config.PATH}/api/get-hse-critical-observations/${selectedReportData.report_id}`
      );
      setCriticalObservations(res.data.data);
    } catch (error) {
      console.log(error.message);
    }
  };

  const getScoreColor = (percentage) => {
    if (percentage <= 33) {
      return "#FF0000"; // Red
    } else if (percentage > 33 && percentage <= 66) {
      return "#FFA500"; // Orange
    } else {
      return "#006400"; // Dark Green
    }
  };

  const pieOptions = {
    labels: [
      `Obtained Score(${scorePercent}%)`,
      `Remaining Score(${100 - scorePercent}%)`,
    ],
    colors: [getScoreColor(scorePercent), "grey"],
    dataLabels: {
      enabled: true,
    },
    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: "center",
      fontSize: "14px",
      markers: {
        width: 16,
        height: 16,
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

  const areaCounts = data.reduce((counts, entry) => {
    const area = entry.area;
    counts[area] = (counts[area] || 0) + 1;
    return counts;
  }, {});

  const areasForAreaChart = Object.keys(areaCounts);
  const counts = areasForAreaChart.map((area) => {
    const areaScore = data
      .filter((entry) => entry.area === area)
      .reduce((acc, entry) => acc + (entry.score || 0), 0);
    const totalPossibleScore =
      data.filter((entry) => entry.area === area).length * 5;
    const percentage =
      totalPossibleScore > 0
        ? Math.floor((areaScore / totalPossibleScore) * 100)
        : 0;
    return percentage.toFixed(0);
  });

  const barOptions = {
    chart: {
      id: "bar-chart",
    },
    colors: ["#005cdb"],
    xaxis: {
      categories: areasForAreaChart.map((area) => {
        // Truncate the area name if it's too long
        const maxChars = 15; // Adjust the maximum characters as needed
        console.log("area length",area.length)
        return area.length > maxChars
          ? area.substring(0, maxChars) + "..."
          : area;
      }),
      labels: {
        style: {
          fontSize: "10px", // Adjust the font size as needed
        },
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "30%",
        dataLabels: {
          position: "top", // top, center, bottom
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val;
      },
      offsetY: -20,
      style: {
        fontSize: "10px",
        colors: ["#304758"],
      },
    },
    tooltip: {
      y: {
        formatter: function (value, { dataPointIndex }) {
          // Display the full area name on hover
          const area = areasForAreaChart[dataPointIndex];
          return `${area}: ${value}%`; // Show area name along with percentage
        },
      },
    },
  };

  // Group the data by area and severity
  const areaSeverityData = data.reduce((result, entry) => {
    const area = entry.area;
    const severity = entry.criticality;

    if (!result[area]) {
      result[area] = { High: 0, Medium: 0, Low: 0 };
    }

    result[area][severity] += 1;
    return result;
  }, {});

  // Extract areas and severity counts
  const areas = Object.keys(areaSeverityData);
  const severityChartData = Object.keys(areaSeverityData).map((area) => ({
    name: area,
    High: areaSeverityData[area].High,
    Medium: areaSeverityData[area].Medium,
    Low: areaSeverityData[area].Low,
  }));

  // Transpose the data to match the series structure
  const transposedData = {
    High: [],
    Medium: [],
    Low: [],
  };

  severityChartData.forEach((area) => {
    transposedData.High.push(area.High);
    transposedData.Medium.push(area.Medium);
    transposedData.Low.push(area.Low);
  });

  // Prepare series data with specific colors for each severity level
  const seriesData = [
    { name: "High", data: [] },
    { name: "Medium", data: [] },
    { name: "Low", data: [] },
  ];

  areas.forEach((area) => {
    seriesData[0].data.push(areaSeverityData[area]?.High || 0);
    seriesData[1].data.push(areaSeverityData[area]?.Medium || 0);
    seriesData[2].data.push(areaSeverityData[area]?.Low || 0);
  });

  // Severity chart options
  const severityChartOptions = {
    chart: {
      id: "severity-chart",
      stacked: true,
    },
    xaxis: {
      categories: areas.map((area) => {
        // Truncate the area name if it's too long
        const maxChars = 15; // Adjust the maximum characters as needed
        return area.length > maxChars
          ? area.substring(0, maxChars) + "..."
          : area;
      }),
      labels: {
        style: {
          fontSize: "10px", // Adjust the font size as needed
        },
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "30%",
        dataLabels: {
          total: {
            enabled: true,
            style: {
              fontSize: "10px", // Adjust the font size for the total data label
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false, // Hide data labels
    },
    colors: ["#FF0000", "#006400", "#005cdb"],
    tooltip: {
      y: {
        formatter: function (value, { dataPointIndex }) {
          // Display the full area name on hover
          const area = areas[dataPointIndex];
          return `${area}:${value}`;
        },
      },
    },
  };

  const groupedObservations = (selectedReportData?.AllObservations || [])
  .filter(e => e.is_selected === 1)
  .reduce((acc, observation) => {
    if (!acc[observation.table_type]) {
      acc[observation.table_type] = [];
    }
    acc[observation.table_type].push(observation);
    return acc;
  }, {});
// console.log("griupedobs",groupedObservations)
    // Open Dialog Handler
  const handleOpenDialog = useCallback((observation) => {
    setSelectedObservation(observation);
    setOpenDialog(true);
  }, []);

  // Close Dialog Handler
  const handleCloseDialog = useCallback(() => {
    setSelectedObservation(null);
    setOpenDialog(false);
  }, []);

  return (
    <div>
      <ImageViewerModal
        imageUrl={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
      <Modal open={true} onClose={handleClose}>
        <div className="modal-container">
          <div className="modal-header">
            <Typography variant="h5">Report Details</Typography>
            <IconButton
                size="small"
                onClick={handleClose}
                className="close-icon"
                style={{backgroundColor:"#efc71d"}}
              >
                <CloseIcon style={{color:"#307248"}} />
              </IconButton>
          </div>

          <div className="modal-content">
            <div className="modal-body">
              <Typography variant="body1" component="div">
                {" "}
                
                  <div className="sub-headings">BASIC DETAILS</div>
                  <div className="basic-details" >
                    Report ID: {selectedReportData.report_id}
                    <br />
                    Date & Time: {formattedDateTime}
                    <br />
                    Organization: {selectedReportData.organization}
                    <br />
                    Site: {selectedReportData.site}
                    <br />
                    Start Date & End Date: {formattedStartDate} & {formattedEndDate}
                  </div>
                <br />


   <div className="sub-headings">CLASSIFICATION OF AUDIT OBSERVATIONS </div>
                  <div
                    style={{
                      width: "100%",
                      minHeight: "100px", // Ensures a reasonable starting height
                      maxHeight: "200px", // Limits excessive expansion
                      overflowY: "auto", // Enables scrolling when content exceeds the height
                      padding: "8px", // Adds spacing inside the div
                      border: "1px solid #ccc", // Light border for better visibility
                      borderRadius: "5px", // Soft rounded corners
                      fontFamily: "inherit", // Ensures consistency with the rest of the UI
                      fontSize: "15px", // Maintains readability
                      background: "whitesmoke", // Subtle background for better readability
                      // whiteSpace: "pre-wrap", // Keeps line breaks intact
                      lineHeight: "1.6",
                      wordWrap: "break-word",     
                      whiteSpace: "normal", 
                    }}
                    dangerouslySetInnerHTML={{
                      __html:
                        // selectedReportData.background_brief ||
                        // reportHeader.background_brief ||
                        // "Enter your text here",
                      
  (selectedReportData.classification_of_audit_observations  ||
   reportHeader.classification_of_audit_observations  ||
   "Enter your text here"
  )
    .replace(/<br\s*\/?>/gi, "") // remove all <br> tags
    .replace(/<p>\s*<\/p>/gi, "") // remove empty <p> tags (optional)

                    }}
                  >
                    {/* {selectedReportData.background_brief || reportHeader.background_brief || "Enter your text here"} */}
                    {/* {(selectedReportData.background_brief || reportHeader.background_brief || "Enter your text here")
    .replace(/<\/?[^>]+(>|$)/g, "")}  */}

                  </div>
                <br />



              <div className="sub-headings">BACKGROUND BRIEF</div>
                  <div
                    style={{
                      width: "100%",
                      minHeight: "100px", // Ensures a reasonable starting height
                      maxHeight: "200px", // Limits excessive expansion
                      overflowY: "auto", // Enables scrolling when content exceeds the height
                      padding: "8px", // Adds spacing inside the div
                      border: "1px solid #ccc", // Light border for better visibility
                      borderRadius: "5px", // Soft rounded corners
                      fontFamily: "inherit", // Ensures consistency with the rest of the UI
                      fontSize: "15px", // Maintains readability
                      background: "whitesmoke", // Subtle background for better readability
                      // whiteSpace: "pre-wrap", // Keeps line breaks intact
                      lineHeight: "1.6",
                      wordWrap: "break-word",     
                      whiteSpace: "normal", 
                    }}
                    dangerouslySetInnerHTML={{
                      __html:
                        // selectedReportData.background_brief ||
                        // reportHeader.background_brief ||
                        // "Enter your text here",
                      
  (selectedReportData.background_brief ||
   reportHeader.background_brief ||
   "Enter your text here"
  )
    .replace(/<br\s*\/?>/gi, "") // remove all <br> tags
    .replace(/<p>\s*<\/p>/gi, "") // remove empty <p> tags (optional)

                    }}
                  >
                    {/* {selectedReportData.background_brief || reportHeader.background_brief || "Enter your text here"} */}
                    {/* {(selectedReportData.background_brief || reportHeader.background_brief || "Enter your text here")
    .replace(/<\/?[^>]+(>|$)/g, "")}  */}

                  </div>
                <br />
              <div className="sub-headings">
                    UNDERSTANDING OF THE REVIEW REPORT ‐ CONTENTS.
                  </div>

                  <div
                    style={{
                      width: "100%",
                      minHeight: "100px", // Ensures a reasonable starting height
                      maxHeight: "200px", // Limits excessive expansion
                      overflowY: "auto", // Enables scrolling when content exceeds the height
                      padding: "8px", // Adds spacing inside the div
                      border: "1px solid #ccc", // Light border for better visibility
                      borderRadius: "5px", // Soft rounded corners
                      fontFamily: "inherit", // Ensures consistency with the rest of the UI
                      fontSize: "15px", // Maintains readability
                      background: "whitesmoke", // Subtle background for better readability
                      // whiteSpace: "pre-wrap", // Ensures line breaks are maintained
                      lineHeight: "1.6",
                      wordWrap: "break-word",     
                      whiteSpace: "normal",
                    }}
                    dangerouslySetInnerHTML={{
                      __html:
                        (selectedReportData.contents ||
                        reportHeader.contents ||
                        "Enter your text here")
                        .replace(/<br\s*\/?>/gi, "") // remove all <br> tags
                        .replace(/<p>\s*<\/p>/gi, "") // remove empty <p> tags (optional)
                    }}
                  >
                    {/* {selectedReportData.contents || reportHeader.contents || "Enter your text here"} */}
                  </div>
                <br />
                <div className="sub-headings">AUDIT SCORE ANALYSIS</div>
                  <div
                    style={{
                      width: "100%",
                      minHeight: "100px", // Ensures a reasonable starting height
                      maxHeight: "200px", // Limits excessive expansion
                      overflowY: "auto", // Enables scrolling when content exceeds the height
                      padding: "8px", // Adds spacing inside the div
                      border: "1px solid #ccc", // Light border for better visibility
                      borderRadius: "5px", // Soft rounded corners
                      fontFamily: "inherit", // Ensures consistency with the rest of the UI
                      fontSize: "15px", // Maintains readability
                      background: "whitesmoke", // Subtle background for better readability
                      // whiteSpace: "pre-wrap", // Keeps line breaks intact
                      lineHeight: "1.6",
                      wordWrap: "break-word",     
                      whiteSpace: "normal", 
                    }}
                    dangerouslySetInnerHTML={{
                      __html:
                        // selectedReportData.background_brief ||
                        // reportHeader.background_brief ||
                        // "Enter your text here",
                      
  (selectedReportData.audit_score_analysis ||
   reportHeader.audit_score_analysis ||
   "Enter your text here"
  )
    .replace(/<br\s*\/?>/gi, "") // remove all <br> tags
    .replace(/<p>\s*<\/p>/gi, "") // remove empty <p> tags (optional)

                    }}
                  >
                    {/* {selectedReportData.background_brief || reportHeader.background_brief || "Enter your text here"} */}
                    {/* {(selectedReportData.background_brief || reportHeader.background_brief || "Enter your text here")
    .replace(/<\/?[^>]+(>|$)/g, "")}  */}

                  </div>
                <br />
                 <div className="sub-headings">IMPROVEMENT OPPORTUNITY AREAS</div>
                  <div
                    style={{
                      width: "100%",
                      minHeight: "100px", // Ensures a reasonable starting height
                      maxHeight: "200px", // Limits excessive expansion
                      overflowY: "auto", // Enables scrolling when content exceeds the height
                      padding: "8px", // Adds spacing inside the div
                      border: "1px solid #ccc", // Light border for better visibility
                      borderRadius: "5px", // Soft rounded corners
                      fontFamily: "inherit", // Ensures consistency with the rest of the UI
                      fontSize: "15px", // Maintains readability
                      background: "whitesmoke", // Subtle background for better readability
                      // whiteSpace: "pre-wrap", // Keeps line breaks intact
                      lineHeight: "1.6",
                      wordWrap: "break-word",     
                      whiteSpace: "normal", 
                    }}
                    dangerouslySetInnerHTML={{
                      __html:
                        // selectedReportData.background_brief ||
                        // reportHeader.background_brief ||
                        // "Enter your text here",
                      
  (selectedReportData.  improvement_opportunity_areas ||
   reportHeader.improvement_opportunity_areas ||
   "Enter your text here"
  )
    .replace(/<br\s*\/?>/gi, "") // remove all <br> tags
    .replace(/<p>\s*<\/p>/gi, "") // remove empty <p> tags (optional)

                    }}
                  >
                    {/* {selectedReportData.background_brief || reportHeader.background_brief || "Enter your text here"} */}
                    {/* {(selectedReportData.background_brief || reportHeader.background_brief || "Enter your text here")
    .replace(/<\/?[^>]+(>|$)/g, "")}  */}

                  </div>
                <br />
                <div className="sub-headings">Introduction</div>
                 <div
                    style={{
                      width: "100%",
                      minHeight: "100px", // Ensures a reasonable starting height
                      maxHeight: "200px", // Limits excessive expansion
                      overflowY: "auto", // Enables scrolling when content exceeds the height
                      padding: "8px", // Adds spacing inside the div
                      border: "1px solid #ccc", // Light border for better visibility
                      borderRadius: "5px", // Soft rounded corners
                      fontFamily: "inherit", // Ensures consistency with the rest of the UI
                      fontSize: "15px", // Maintains readability
                      background: "whitesmoke", // Subtle background for better readability
                      // whiteSpace: "pre-wrap", // Ensures line breaks are maintained
                      lineHeight: "1.6",
                      wordWrap: "break-word",     
                      whiteSpace: "normal",
                    }}
                    dangerouslySetInnerHTML={{
                      __html:
                       ( selectedReportData.introduction ||
                        reportHeader.introduction)  
                        .replace(/<br\s*\/?>/gi, "") // remove all <br> tags
                        .replace(/<p>\s*<\/p>/gi, "") // remove empty <p> tags (optional)
                    }}
                  >
                    {/* {selectedReportData.contents || reportHeader.contents || "Enter your text here"} */}
                  </div>
                <br />
                <br />
                <div className="sub-headings">EXECUTIVE SUMMARY</div>
               <div
                    style={{
                      width: "100%",
                      minHeight: "100px", // Ensures a reasonable starting height
                      maxHeight: "400px", // Allows expansion before scrolling
                      overflowY: "auto", // Enables scrolling when content exceeds max height
                      padding: "8px", // Adds spacing inside the div
                      border: "1px solid #ccc", // Light border for better visibility
                      borderRadius: "5px", // Soft rounded corners
                      fontFamily: "inherit", // Ensures consistency with the rest of the UI
                      fontSize: "15px", // Maintains readability
                      background: "whitesmoke", // Subtle background for better readability
                      // whiteSpace: "pre-wrap", // Ensures line breaks are maintained
                      lineHeight: "1.6",
                      wordWrap: "break-word",     
                      whiteSpace: "normal",
                    }}
                    dangerouslySetInnerHTML={{
                      __html:
                        // selectedReportData.exe_summary ||
                        // reportHeader.exe_summary ||
                        // "Enter your text here",
                        (selectedReportData.exe_summary ||
                          reportHeader.exe_summary ||
                          "Enter your text here"
                         )
                           .replace(/<br\s*\/?>/gi, "")  
                           .replace(/<p>\s*<\/p>/gi, ""), 
                    }}
                  >
                    {/* {selectedReportData.exe_summary || reportHeader.exe_summary || "Enter your text here"} */}
                  </div>
                <br />
                {/* Academic Info Section */}
<div className="sub-headings">ACADEMIC INFO</div>
<TableContainer component={Paper} className="facility-info-table">
  <Table>
    <TableBody>
      {Object.entries(facilityInfo).map(([key, value], index) => (
        <TableRow key={index}>
          <TableCell style={{ fontWeight: "bold", width: "30%" }}>
            {key}
          </TableCell>
          <TableCell style={{ width: "70%" }}>
            {value}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>

<br/>
<br/>
                <div className="sub-headings">CRITICAL OBSERVATIONS</div>
                  <div
                    style={{
                      fontFamily: "inherit",
                      fontSize: "15px",
                      minHeight: "100px",
                      maxHeight: "150px",
                      overflowY: "auto", // Enables scrolling when needed
                      whiteSpace: "pre-wrap",
                      display: "flex",
                      flexDirection: "column",
                      gap: "5px", // Adds spacing between observations for better readability
                      padding: "8px", // Adds internal spacing
                      border: "1px solid #ccc", // Light border for better visibility
                      borderRadius: "5px", // Soft rounded corners
                      background: "whitesmoke", // Subtle background for better readability
                    }}
                  >
                    {criticalObservation.length === 0 ? (
                      <div style={{ fontStyle: "italic", color: "#555" }}>No critical observations</div>
                    ) : (
                      criticalObservation.map((observation, index) => (
                        <div key={index} style={{ display: "flex", alignItems: "center" }}>
                          <li style={{ listStyleType: "disc" }}>
                            <span>{observation.observation.replace(/\s+/g, ' ').trim()}</span>
                            {/* <span>{observation.observation}</span> */}
                          </li>
                        </div>
                      ))
                    )}

                    {/* Ensures additional details do not break layout */}
                    {selectedReportData.other_details && (
                      <div style={{ marginTop: "8px", fontWeight: "bold" }}>
                        {selectedReportData.other_details}
                      </div>
                    )}
                  </div>
                <br />
                <div className="sub-headings">
                  CRITICAL ELECTRICAL OBSERVATIONS, PHOTOS & RECOMMENDATIONS
                </div>
                
                <div className="table-container">
  {Object.keys(groupedObservations).map((tableType) => (
    <div key={tableType} className="grouped-table">
      <h4>{tableType}</h4>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sr. No.</TableCell>
              <TableCell>Areas</TableCell>
              {/* <TableCell>Categories</TableCell> */}
              <TableCell>Check Point</TableCell>
              <TableCell>Observation</TableCell>
              <TableCell>Criticality</TableCell>
              <TableCell>Recommendation</TableCell>
              <TableCell>IS Reference</TableCell>
              <TableCell>Score</TableCell>
              <TableCell>system_implementation</TableCell>
              <TableCell>compliance_check</TableCell>
              <TableCell>Photo Evidences</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {groupedObservations[tableType].filter(
              (e) => e.is_selected === 1
            ).map((observation, index) => (
              <TableRow
                key={index}
                className={index % 2 === 0 ? "even-row" : "odd-row"}
              >
                <TableCell>{index + 1}</TableCell>
                <TableCell>{observation.area}</TableCell>
                {/* <TableCell>{observation.category}</TableCell> */}
                <TableCell>{observation.check_points}</TableCell>
                <TableCell>{observation.observation}</TableCell>
                <TableCell>{observation.criticality}</TableCell>
                <TableCell>{observation.recommendations}</TableCell>
                <TableCell>{observation.is_reference}</TableCell>
                <TableCell>
                  {observation.score ? observation.score : "N/A"}
                </TableCell>
                 <TableCell>{observation.system_implementation}</TableCell>
                  <TableCell>{observation.compliance_check}</TableCell>
                <TableCell>
                  {/* <div className="image-container">
                    {observation.imageUrls?.length > 0 ? (
                      <div className="image-item">
                        {observation.imageUrls.map(
                          (imageUrl, imgIndex) => (
                            <div
                              style={{ display: "flex" }}
                              key={imgIndex}
                            >
                              <img
                                src={imageUrl}
                                alt={`Image ${imgIndex + 1}`}
                                className="photo-image-saved"
                                onClick={() =>
                                  setSelectedImage(imageUrl)
                                } // Set selected image on click
                                style={{ cursor: "pointer" }}
                              />
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      "N/A"
                    )}
                  </div> */}
                    <div className="image-container">
                                  {observation.imageUrls?.length > 0 ? (
                                    <>
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          padding: "6px 0",
                                          border: "1px solid grey",
                                          borderRadius: "5px",
                                          width: "100px",
                                          cursor: "pointer",
                                        }}
                                        onClick={() => handleOpenDialog(observation, index)}
                                      >
                                        <InsertPhotoOutlinedIcon size={30} />
                                      </div>

                                      {/* Dialog Box for Images */}
                                      <Dialog onClose={handleCloseDialog} open={openDialog} maxWidth="md" 
                                      // BackdropProps={{
                                      //   style: { backgroundColor: "rgba(0, 0, 0, 0.2 )" }  }}
                                      BackdropProps={{
                                        style: { backgroundColor: "rgba(0, 0, 0, 0.1)" }, // Light transparent overlay
                                    }}
                                      >
                                        <DialogTitle>Uploaded Images</DialogTitle>
                                        <DialogContent dividers>
                                          <div
                                            style={{
                                              display: "grid",
                                              gridTemplateColumns: "repeat(4, 1fr)",
                                              gap: "10px",
                                            }}
                                          >
                                            {selectedObservation?.imageUrls?.map((imageUrl, imgIndex) => (
                                              <div
                                                key={imgIndex}
                                                style={{
                                                  display: "flex",
                                                  alignItems: "center",
                                                  flexDirection: "column",
                                                }}
                                              >
                                                <img
                                                  src={imageUrl}
                                                  alt={`Image ${imgIndex + 1}`}
                                                  style={{
                                                    cursor: "pointer",
                                                    width: "200px",
                                                    height: "200px",
                                                    borderRadius: "5px",
                                                  }}
                                                  onClick={() => window.open(imageUrl, "_blank")} // Open image in new tab
                                                />
                                              </div>
                                            ))}
                                          </div>
                                        </DialogContent>
                                        <DialogActions>
                                          <Button onClick={handleCloseDialog}>Close</Button>
                                        </DialogActions>
                                      </Dialog>
                                    </>
                                  ) : (
                                    <Typography variant="body2">N/A</Typography>
                                  )}
                                </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  ))}
</div>

                <br/>
                <br/>
                <div className="sub-headings">GLOBAL BEST PRACTICES</div>
             <div
                    style={{
                      width: "100%",
                      minHeight: "100px", // Ensures a reasonable starting height
                      maxHeight: "200px", // Limits excessive expansion
                      overflowY: "auto", // Enables scrolling when content exceeds the height
                      padding: "8px", // Adds spacing inside the div
                      border: "1px solid #ccc", // Light border for better visibility
                      borderRadius: "5px", // Soft rounded corners
                      fontFamily: "inherit", // Ensures consistency with the rest of the UI
                      fontSize: "15px", // Maintains readability
                      background: "whitesmoke", // Subtle background for better readability
                      // whiteSpace: "pre-wrap", // Ensures line breaks are maintained
                      lineHeight: "1.6",
                      wordWrap: "break-word",     
                      whiteSpace: "normal",
                    }}
                    dangerouslySetInnerHTML={{
                      __html:
                        selectedReportData.best_practice ||
                        reportHeader.best_practice ||
                        "Enter your text here",
                    }}
                  >
                    {/* {selectedReportData.contents || reportHeader.contents || "Enter your text here"} */}
                  </div>
                <br/>
                <div className="sub-headings">CHARTS</div>
                <div
                  id="chart-container-for-report"
                  className="chart-container-for-report"
                >
                  <div className="total-serverity-div-for-report">
                    <div className="severity-item-for-report">
                      Total Observations
                      <br />
                      <span>{data.length}</span>
                      <hr />
                    </div>
                    <div
                      style={{ color: "#FF0000" }}
                      className="severity-item-for-report"
                    >
                      High Severity Observations
                      <br />
                      <span>
                        {data.filter((e) => e.criticality === "High").length}
                      </span>
                      <hr />
                    </div>
                    <div
                      style={{ color: "#006400" }}
                      className="severity-item-for-report"
                    >
                      Medium Severity Observations
                      <br />
                      <span>
                        {data.filter((e) => e.criticality === "Medium").length}
                      </span>
                      <hr />
                    </div>
                    <div
                      style={{ color: "#005cdb" }}
                      className="severity-item-for-report"
                    >
                      Low Severity Observations
                      <br />
                      <span>
                        {data.filter((e) => e.criticality === "Low").length}
                      </span>
                      <hr />
                    </div>
                  </div>
                  <div className="area-chart-for-report">
                    Area Chart
                    <Chart
                      options={barOptions}
                      series={[
                        {
                          name: "",
                          data: counts,
                        },
                      ]}
                      type="bar"
                      height={300}
                    />
                  </div>
                  <div className="severity-chart-for-report">
                    Severity Chart
                    <Chart
                      options={severityChartOptions}
                      series={seriesData}
                      type="bar"
                      height={300}
                    />
                  </div>
                  <div className="pie-chart-for-report">
                    Audit Score
                    <Chart
                      options={pieOptions}
                      series={[scorePercent, 100 - scorePercent]}
                      type="pie"
                      style={{ width: "100%" }}
                      height={250}
                    />
                  </div>
                </div>
                <br />
                <br/>
                <div className="sub-headings">THE WAY FORWARD</div>
               <div
                    className="the-way-forward-content"
                    style={{
                      background: "whitesmoke",
                      width: "100%", // Ensures full width
                      minHeight: "100px", // Ensures a reasonable starting height
                      maxHeight: "200px", // Limits excessive expansion
                      overflowY: "auto", // Enables scrolling when content exceeds the height
                      padding: "8px", // Adds spacing inside the div
                      border: "1px solid #ccc", // Light border for better visibility
                      borderRadius: "5px", // Rounded corners for a cleaner look
                      fontFamily: "inherit", // Ensures consistency with other text areas
                      fontSize: "15px", // Maintains readability
                      whiteSpace: "pre-wrap", // Preserves line breaks and spacing
                      lineHeight: "1",
                  
                    }}
                    dangerouslySetInnerHTML={{
                      __html:
                       
                        (
                          selectedReportData.the_way_forward ||
                          reportHeader.the_way_forward ||
                          '<em style="color: #999;">Enter your text here</em>'
                        ) }}
                        >
               
                  </div>
                <br/>
                <div className="sub-headings">CONCLUSION</div>
                <div
                    className="conclusion-content"
                    style={{
                      background: "whitesmoke",
                      width: "98.8%", // Keeps consistency with previous width
                      minHeight: "100px", // Ensures a reasonable default height
                      maxHeight: "200px", // Prevents excessive expansion
                      overflowY: "auto", // Enables scrolling when content overflows
                      padding: "8px", // Adds spacing inside the div
                      border: "1px solid #ccc", // Light border for better readability
                      borderRadius: "4px", // Rounded corners for a clean look
                      fontFamily: "inherit", // Ensures consistency with other text areas
                      fontSize: "15px", // Maintains readability
                      // whiteSpace: "pre-wrap", // Preserves line breaks and spacing
                      lineHeight: "1.6",
                      wordWrap: "break-word",     
                      whiteSpace: "normal",
                    }}
                    dangerouslySetInnerHTML={{
                      __html:
                        (selectedReportData.conclusion ||
                        reportHeader.conclusion ||
                        '<em style="color: #999;">Enter your text here</em>').replace(/<br\s*\/?>/gi, "") // remove all <br> tags
                        .replace(/<p>\s*<\/p>/gi, "")
                    }}
                  >

                  </div>
              </Typography>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ViewHseReportDetails;
