import React, { useState, useEffect,useCallback } from "react";
import { FaTrash, FaCheck, FaPlus, FaHeading } from "react-icons/fa";
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
  const [selectedOrganization, setSelectedOrganization] = useState({
    label: selectedReportData.organization,
    value: selectedReportData.org_id,
  });
  // console.log("brief",selectedReportData)
  const [selectedSite, setSelectedSite] = useState({
    label: selectedReportData.site,
    value: selectedReportData.site,
  });
    const [startDate, setStartDate] = useState(selectedReportData.start_date);
    const [endDate, setEndDate] = useState(selectedReportData.end_date);
      const [timeFrom, setTimeFrom] = useState(selectedReportData.time_of_audit_from);
      const [timeTo, setTimeTo] = useState(selectedReportData.time_of_audit_to);
      const [briefPropertyDescription, setBriefPropertyDescription] = useState(selectedReportData.brief_property_description);
      const [numOfFloors, setNumOfFloors] = useState(selectedReportData.num_of_floors);
      const [avgStaffFootfall, setAvgStaffFootfall] = useState(selectedReportData.average_staff_footfall);
      const [noObjectionCertificate, setNoObjectionCertificate] = useState(selectedReportData.no_objection_certificate);
      const [nationalBuildingCodeCategory, setNationalBuildingCodeCategory] = useState(selectedReportData.national_building_code_category);
      const [coordinationgPersonClientside, setCoordinationgPersonClientside] = useState(selectedReportData.coordinating_person_clientSide);
      const [reportPreparedBy, setReportPreparedBy] = useState(selectedReportData.report_prepared_by);
      const [reportReviewedBy, setReportReviewedBy] = useState(selectedReportData.report_reviewed_by);
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
//  console.log("datatatata",selectedReportData.AllObservations.score)
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
    const riskLevels = [
  {
    range: "≥ 85%",
    risk: "Low Risk",
    color: "#00A651",
    interpretation: "Electrical systems and controls are well maintained, only minor improvements needed.",
  },
  {
    range: "65% – 84%",
    risk: "Medium Risk",
    color: "#FFFF00",
    interpretation: "Controls are adequate but with noticeable weaknesses.",
  },
  {
    range: "25% – 64%",
    risk: "High Risk",
    color: "#FFA500",
    interpretation: "High vulnerabilities with major compliance gaps.",
  },
  {
    range: "≤ 25%",
    risk: "Severe Risk",
    color: "#FF0000",
    interpretation: "Controls are ineffective, urgent corrective action required.",
  },
];
const getRiskLevel = (score) => {
  if (score >= 85) return riskLevels[0];
  if (score >= 65) return riskLevels[1];
  if (score >= 25) return riskLevels[2];
  return riskLevels[3];
};

// const currentRisk = getRiskLevel((selectedReportData.cumulative / 10) * 100);
const currentRisk = getRiskLevel(30);

const [references, setReferences] = useState([]);
  
    useEffect(() => {
      fetchReferences();
    }, []);
  
    const fetchReferences = async () => {
      try {
        // const res = await axios.get("http://localhost:5000/api/references");
        const res = await axios.get(
            `${config.PATH}/api/get-all-annexure-details`
          );;
      
        setReferences(res.data);
      } catch (err) {
        console.error("Error fetching references:", err);
      }
    };
  
  
  return (
    <div >
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
                
                  {/* <div className="sub-headings">BASIC DETAILS</div>
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
                <br /> */}
 <div className="sub-headings">
                    UNDERSTANDING THE REPORT.
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

  <div>
     <Typography variant="body1" component="div">
                      <div className="sub-headings">
                          AUDIT DESCRIPTION
                        </div>
                      <div className="review-table-wrapper" style={{ borderRadius: "5px" }}>
                        <table style={{ width: "100%", fontFamily: "montserrat", borderCollapse: "collapse", borderRadius: "5px" }}>
                          <tbody>
                            <tr>
                              <td>Client</td>
                              <td>{selectedOrganization.label}</td>
                            </tr>
                            <tr>
                              <td>Location</td>
                              <td>{selectedSite.label}</td>
                            </tr>
                            <tr>
                              <td>Date of Site Visit</td>
                              <td>{new Date(startDate).getDate()}-{new Date(startDate).getMonth() + 1
                              }-{new Date(startDate).getFullYear()}</td>
                            </tr>
                            <tr>
                              <td>Study</td>
                              <td>Electrical Audit</td>
                            </tr>
                            <tr>
                              <td>Time of Audit (From & To)</td>
                              {/* <td>{timeFrom.slice(0, 5)} to {timeTo.slice(0, 5)}</td> */}
                              <td>
                                {timeFrom && timeTo
                                  ? `${timeFrom.slice(0, 5)} to ${timeTo.slice(0, 5)}`
                                  : timeFrom
                                    ? `${timeFrom.slice(0, 5)} to N/A`
                                    : timeTo
                                      ? `N/A to ${timeTo.slice(0, 5)}`
                                      : "N/A"}
                              </td>
    
                            </tr>
                            <tr>
                              <td>Brief Property Description</td>
                              <td>{briefPropertyDescription}</td>
                            </tr>
                            <tr>
                              <td>Number of floors</td>
                              <td>{numOfFloors}</td>
                            </tr>
                            <tr>
                              <td>Average Staff Footfall</td>
                              <td>{avgStaffFootfall}</td>
                            </tr>
                            <tr>
                              <td>No Objection Certificate</td>
                              <td>{noObjectionCertificate}</td>
                            </tr>
                            <tr>
                              <td>National Building Code Category</td>
                              <td>{nationalBuildingCodeCategory}</td>
                            </tr>
                            <tr>
                              <td>Coordinating Person – Client Side</td>
                              <td>{coordinationgPersonClientside}</td>
                            </tr>
                            <tr>
                              <td>Report Prepared By</td>
                              <td>{reportPreparedBy}</td>
                            </tr>
                            <tr>
                              <td>Report Reviewed By</td>
                              <td>{reportReviewedBy}</td>
                            </tr>
                            <tr>
                              <td>Date of Submission of Report</td>
                              <td>{new Date(endDate).getDate()}-{new Date(endDate).getMonth() + 1
                              }-{new Date(endDate).getFullYear()}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </Typography>
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



              <div className="sub-headings">AUDIT OBJECTIVE</div>
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
               
                  <div className="sub-headings">OVERALL RISK ASSESSMENT INDICATOR</div>

                {/* Wrapper with flexbox: left (score box) + right (report view) */}
<div style={{ display: "flex", gap: "20px", alignItems: "stretch", marginBottom: "5px" }}>
  {/* Left Risk Box */}
  <div
    style={{
      width: "200px",
      padding: "10px",
      borderRadius: "4px",
      backgroundColor: currentRisk.color,
      color: "#000",
      flexShrink: 0,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "Montserrat",
      fontSize: "20px",
      fontWeight: "bold",
    }}
  >
    {/* <p style={{ margin: 0 }}>{Math.floor((selectedReportData.cumulative / 10) * 100)}%</p> */}
    <p style={{ margin: 0 }}>30%</p>
  </div>

  {/* Right Report Content */}
  <div
    style={{
      flexGrow: 1,
      minHeight: "100px",
      maxHeight: "400px",
      overflowY: "auto",
      padding: "8px",
      border: "1px solid #ccc",
      borderRadius: "5px",
      fontFamily: "inherit",
      fontSize: "15px",
      background: "whitesmoke",
      lineHeight: "1.6",
      wordWrap: "break-word",
      whiteSpace: "normal",
    }}
    dangerouslySetInnerHTML={{
      __html:
        (selectedReportData.overall_assessment_indicator ||
          reportHeader.overall_assessment_indicator ||
          "Enter your text here")
          .replace(/<br\s*\/?>/gi, "")
          .replace(/<p>\s*<\/p>/gi, ""),
    }}
  />
</div>

{/* Risk Legend Table */}
<div style={{ marginBottom: "20px", overflowX: "auto" }}>
  <h3 style={{ color: "#307260", fontFamily: "Montserrat" }}>Risk Legend</h3>
  {/* <p style={{fontFamily: "Montserrat"}}>The above image is per display purpose only</p> */}
  <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Montserrat" }}>
    <thead>
      <tr style={{ backgroundColor: "#307260", color: "#efc71d" }}>
        <th style={{ padding: "8px", border: "1px solid #000", fontSize: "14px" }}>Score Range</th>
        <th style={{ padding: "8px", border: "1px solid #000", fontSize: "14px" }}>Risk Level</th>
        <th style={{ padding: "8px", border: "1px solid #000", fontSize: "14px" }}>Interpretation</th>
      </tr>
    </thead>
    <tbody>
      {riskLevels.map((level, index) => (
        <tr key={index}>
          <td
            style={{
              textAlign: "center",
              color: level.color,
              border: "1px solid #000",
              padding: "8px",
              fontSize: "13px",
            }}
          >
            {level.range}
          </td>
          <td
            style={{
              textAlign: "center",
              backgroundColor: level.color,
              color: "#000",
              border: "1px solid #000",
              padding: "8px",
              fontSize: "13px",
            }}
          >
            {level.risk}
          </td>
          <td style={{ border: "1px solid #000", padding: "8px", fontSize: "13px" }}>
            {level.interpretation}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
<br/>
 <div className="sub-headings">ANNEXURE-REFERENCES & STANDARDS</div>
               <div className="table-containerr">
       <table className="styled-tablee">
         <thead>
           <tr>
             <th>Reference Type and Document / Standard</th>
             <th>Relevance to Audit Findings</th>
           </tr>
         </thead>
 
         <tbody>
          {references.map((ref) =>
   ref.type === "heading" ? (
     <tr key={ref.id} className="section-headingg">
       <td colSpan="2">{ref.section_name}</td>
     </tr>
   ) : (
     <tr key={ref.id}>
       <td>{ref.document}</td>
       <td>{ref.relevance}</td>
     </tr>
   )
 )}

         </tbody>
       </table>
     </div>
                <div className="sub-headings">
                  CRITICAL ELECTRICAL OBSERVATIONS, PHOTOS & RECOMMENDATIONS - HSE Report
                </div>
                
<div className="table-container">
  {Object.keys(groupedObservations).length === 0 ? (
    " No observations"
   
  ) : (
    Object.keys(groupedObservations).map((tableType) => {
      const selectedObservations = groupedObservations[tableType].filter(
        (e) => e.is_selected === 1
      );

      return (
        <div key={tableType} className="grouped-table">
          <h4>{tableType}</h4>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Sr. No.</TableCell>
                  <TableCell>Area / Process</TableCell>
                  {/* <TableCell>Categories</TableCell> */}
                  <TableCell>Check Point</TableCell>
                  <TableCell>Observation</TableCell>
                  <TableCell>Criticality</TableCell>
                  <TableCell>Recommendation</TableCell>
                  <TableCell>Legal Reference (if any)</TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell>System Implementation</TableCell>
                  <TableCell>Compliance Check</TableCell>
                  <TableCell>Objective Evidence</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {selectedObservations.length > 0 ? (
                  selectedObservations.map((observation, index) => (
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
                      <TableCell>{observation.score}</TableCell>
                      <TableCell>{observation.system_implementation}</TableCell>
                      <TableCell>{observation.compliance_check}</TableCell>
                      <TableCell>
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

                              <Dialog
                                onClose={handleCloseDialog}
                                open={openDialog}
                                maxWidth="md"
                                BackdropProps={{
                                  style: { backgroundColor: "rgba(0, 0, 0, 0.1)" },
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
                                    {selectedObservation?.imageUrls?.map(
                                      (imageUrl, imgIndex) => (
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
                                            onClick={() => window.open(imageUrl, "_blank")}
                                          />
                                        </div>
                                      )
                                    )}
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
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={11}
                      align="center"
                      style={{ color: "gray", fontStyle: "italic" }}
                    >
                      No observations
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      );
    })
  )}
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
