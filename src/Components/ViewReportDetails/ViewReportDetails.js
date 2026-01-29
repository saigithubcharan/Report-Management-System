import React, { useEffect, useState, useCallback, useMemo } from "react";
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
  TextareaAutosize,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  ResponsiveContainer,
} from "recharts";
import CloseIcon from "@mui/icons-material/Close";
import InsertPhotoOutlinedIcon from "@mui/icons-material/InsertPhotoOutlined";
import axios from "../../APIs/axios";
import ImageViewerModal from "../ImageViewerModal/ImageViewerModal";
import { config } from "../../config";
import "./ViewReportDetails.css";

const ViewReportDetails = ({ selectedReportData, setOpenViewReport, reportHeader }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedObservation, setSelectedObservation] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [criticalObservation, setCriticalObservations] = useState([]);
  const [facilityInfo, setFacilityInfo] = useState({});

  // Ensure component resets when switching reports
  const modalKey = useMemo(() => selectedReportData?.report_id || Math.random(), [selectedReportData]);

  // Formatting date and time
  const formattedDateTime = useMemo(() => {
    if (!selectedReportData?.date_time) return "";
    const [date, time] = selectedReportData.date_time.split("T");
    return date.split("-").reverse().join("-") + " " + time;
  }, [selectedReportData?.date_time]);

  // Formatting start and end date
  const formattedStartDate = useMemo(() =>
    selectedReportData?.start_date ? new Date(selectedReportData.start_date).toLocaleDateString() : "",
    [selectedReportData?.start_date]
  );

  const formattedEndDate = useMemo(() =>
    selectedReportData?.end_date ? new Date(selectedReportData.end_date).toLocaleDateString() : "",
    [selectedReportData?.end_date]
  );
// console.log("scores",selectedReportData.scores)
  // Close Modal Handler
  const handleClose = useCallback(() => {
    setOpenViewReport(false);
    setCriticalObservations([]); // Reset observations
    setSelectedObservation(null);
    setSelectedImage(null);
  }, [setOpenViewReport]);

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

  // Fetch data only if report_id changes
  useEffect(() => {
    let isMounted = true;
    if (selectedReportData?.report_id) {
      axios.get(`${config.PATH}/api/get-electrical-facility-info/${selectedReportData.report_id}`)
        .then(response => { if (isMounted) setFacilityInfo(response.data); })
        .catch(console.error);

      axios.get(`${config.PATH}/api/get-critical-observations/${selectedReportData.report_id}`)
        .then(response => { if (isMounted) setCriticalObservations(response.data.data); })
        .catch(console.error);
    }

    return () => { isMounted = false; };
  }, [selectedReportData?.report_id]);


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

const currentRisk = getRiskLevel((selectedReportData.cumulative / 25) * 100);
let scoresArray = [];

try {
  scoresArray = Array.isArray(selectedReportData?.scores)
    ? selectedReportData.scores
    : JSON.parse(selectedReportData?.scores || "[]"); // safely parse
} catch (e) {
  console.error("Error parsing scores:", e);
  scoresArray = [];
}

const chartData = scoresArray.map(item => ({
  name: item["Electrical Safety"],
  MaximumScore: item["Maximum Score"],
  ScoreObtained: item["Score Obtained"],
}));



  return (
    <div>

      <ImageViewerModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />

      {selectedReportData && (
        <Modal key={modalKey} open={true} onClose={handleClose}>
          <div className="modal-container">
            <div className="modal-header">
              <Typography variant="h5">Report Details</Typography>
              <IconButton size="small" onClick={handleClose} className="close-icon" style={{ backgroundColor: "#efc71d" }}>
                <CloseIcon style={{ color: "#307248" }} />
              </IconButton>
            </div>

            <div className="modal-content">
              <div className="modal-body">
                <Typography variant="body1" component="div">
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
                  <div className="sub-headings">BACKGROUND - PROJECT BRIEF</div>
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
                        selectedReportData.contents ||
                        reportHeader.contents ||
                        "Enter your text here",
                    }}
                  >
                    {/* {selectedReportData.contents || reportHeader.contents || "Enter your text here"} */}
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
                           .replace(/<br\s*\/?>/gi, "")      // Remove all <br> tags
                           .replace(/<p>\s*<\/p>/gi, ""), 
                    }}
                  >
                    {/* {selectedReportData.exe_summary || reportHeader.exe_summary || "Enter your text here"} */}
                  </div>
                  <br />
                  <div className="sub-headings">IMPROVEMENT OPPORTUNITY AREAS (DEDUCTIBLES) </div>

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
                      (selectedReportData.improvement_opportunity_areas ||
                          reportHeader.improvement_opportunity_areas ||
                          "Enter your text here"
                         )
                           .replace(/<br\s*\/?>/gi, "")      // Remove all <br> tags
                           .replace(/<p>\s*<\/p>/gi, ""), 
                    }}
                  >
                    {/* {selectedReportData.exe_summary || reportHeader.exe_summary || "Enter your text here"} */}
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
    <p style={{ margin: 0 }}>{Math.floor((selectedReportData.cumulative / 25) * 100)}%</p>
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




                  
                  <br />
                  {/* <div className="sub-headings">CRITICAL OBSERVATIONS</div> */}

                  {/* <div
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
                           
                          </li>
                        </div>
                      ))
                    )}

                 
                    {selectedReportData.other_details && (
                      <div style={{ marginTop: "8px", fontWeight: "bold" }}>
                        {selectedReportData.other_details}
                      </div>
                    )}
                  </div> */}

                  {/* <br /> */}
                  <div className="sub-headings" style={{ fontWeight: 500 }}>
                    CRITICAL OBSERVATIONS, RECOMMENDATIONS & REASONING - ELECTRICAL REPORT
                  </div>
                  <div style={{
                    maxHeight: "500px",
                    overflowY: "auto",
                    border: "1px solid #ddd",
                    borderRadius: "5px",
                  }}>
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Sr. No.</TableCell>
                            <TableCell>Areas</TableCell>
                            <TableCell>Categories</TableCell>
                            <TableCell>Check Point</TableCell>
                            <TableCell>Observation</TableCell>
                            <TableCell>Criticality</TableCell>
                            <TableCell>Recommendation</TableCell>
                            <TableCell>IS Reference</TableCell>
                            <TableCell>Photo Evidence</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedReportData.AllObservations.filter(
                            (e) => e.is_selected === 1
                          ).map((observation, index) => (
                            <TableRow
                              key={index}
                              className={index % 2 === 0 ? "even-row" : "odd-row"}
                            >
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>{observation.area}</TableCell>
                              <TableCell>{observation.category}</TableCell>
                              <TableCell>{observation.check_points}</TableCell>
                              <TableCell>{observation.observation}</TableCell>
                              <TableCell>{observation.criticality}</TableCell>
                              <TableCell>{observation.recommendations}</TableCell>
                              <TableCell>{observation.is_reference}</TableCell>
                              <TableCell style={{ padding: 0 }}>
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
                  <br />
                  <br />
                  <div className="sub-headings">SCORING TABLE</div>
                  <div className="table-container-for-view ">
                    <Typography variant="body1" component="div">
                      <div>
                        <TableContainer component={Paper}>
                          <Table>
                            <TableHead>
                              <TableRow style={{ background: "#307268" }}>
                                <TableCell style={{color:"#efc71d"}}>Parameter</TableCell>
                                <TableCell style={{color:"#efc71d"}}>Max Score</TableCell>
                                <TableCell style={{color:"#efc71d"}}>Score Obtained</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {JSON.parse(selectedReportData.scores).map(
                                (row, index) => (
                                  <TableRow key={index}>
                                    <TableCell>
                                      {row["Electrical Safety"]}
                                    </TableCell>
                                    <TableCell>{row["Maximum Score"]}</TableCell>
                                    <TableCell>{row["Score Obtained"]}</TableCell>
                                  </TableRow>
                                )
                              )}
                              <TableRow style={{ background: "#efc71d" }}>
                                <TableCell style={{ fontWeight: "bold" }}>Cumulative</TableCell>
                                <TableCell style={{ fontWeight: "bold" }}>
                                  25
                                </TableCell>
                                <TableCell style={{ fontWeight: "bold" }}>
                                  {selectedReportData.cumulative}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>
                        <p style={{ color: "#307268",marginLeft:"50px",fontSize:"25px" }}>Overall Score - <span style={{ color: "#a3a300",fontSize: 25 }}>{((selectedReportData.cumulative / 25) * 100).toFixed(2)}%</span></p>
   
                      </div>
                                 <div className="graphClass"
                  style={{ width: "60%", height: 300, margin: "20px auto" }}>
     <h3 style={{ textAlign: "center"}}>
    Parameterwise Scoring
  </h3>
                      <ResponsiveContainer>
 <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }} barGap={0}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="name" interval={0} tick={(props) => {
        const { x, y, payload } = props;
        const words = payload.value.split(" ");
        return (
          <text x={x} y={y + 10} textAnchor="middle">
            {words.map((word, index) => (
              <tspan
                key={index}
                x={x}
                dy={index === 0 ? 0 :16} // line height
              >
                {word}
              </tspan>
            ))}
          </text>
        );
      }} />
  <YAxis domain={[0, 2]} />
  <Tooltip />
  <Legend />
  <Bar dataKey="MaximumScore" fill="#006400">
    <LabelList dataKey="Maximum Score" position="top" />
  </Bar>
  <Bar dataKey="ScoreObtained" fill="#FFD700">
    <LabelList dataKey="obtained score" position="top" />
  </Bar>
</BarChart>

</ResponsiveContainer>
</div>
                    </Typography>
                  </div>
                  <br />
                  <div className="sub-headings">WAY FORWARD PLAN</div>

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
                        // selectedReportData.the_way_forward ||
                        // reportHeader.the_way_forward ||
                        // '<em style="color: #999;">Enter your text here</em>',
                        (
                          selectedReportData.the_way_forward ||
                          reportHeader.the_way_forward ||
                          '<em style="color: #999;">Enter your text here</em>'
                        )
                          // .replace(/<li>\s*<p>(.*?)<\/p>\s*<\/li>/gi, "<li>$1</li>") // remove <p> inside <li>
                          // .replace(/<br\s*\/?>/gi, "") // remove unnecessary line breaks
                          // .replace(/<p>\s*<\/p>/gi, "") // remove empty paragraphs
                          
                    }}
                  >
                    {/* {selectedReportData.the_way_forward || reportHeader.the_way_forward || (
    <em style={{ color: "#999" }}>Enter your text here</em>
  )} */}
                  </div>
                  <br />

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
                    {/* {selectedReportData.the_way_forward || reportHeader.the_way_forward || (
    <em style={{ color: "#999" }}>Enter your text here</em>
  )} */}

                  </div>
                </Typography>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ViewReportDetails;
