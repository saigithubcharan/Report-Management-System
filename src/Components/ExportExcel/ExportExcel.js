import React from "react";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ExcelJS from "exceljs";
import axios from "axios";
import html2canvas from "html2canvas";

// import HSE_Cover_New from "../../HSE_Report_Cover.png";
import HSE_Cover_New from "../../HSE PNG.png";
// import Electrical_Cover_New from "../../Electrical_Safety_Report_Cover.png";
import Electrical_Cover_New from "../../ElectricalPortrait.png";
const ExportExcel = ({
  selectedOrganization,
  selectedSite,
  selectedDateTime,
  backgroundBrief,
   improvementOpportunityAreas,
 overallAssessmentIndicator,
  contents,
  exeSummary,
introduction,
// gaugeImageWord,
  conclusion,
  criticalObservations,
  selectedObservations,
  isSaved,
  scores,
  cumulativeScore,
  otherDetails,
  reportType,
  ReportUID,
  bestPractice,
  theWayForward,
  startDate,
  endDate,
  name,
  facilityInfo,
   timeFrom,
timeTo,
briefPropertyDescription, 
numOfFloors, 
avgStaffFootfall, 
noObjectionCertificate, 
nationalBuildingCodeCategory, 
coordinationgPersonClientside, 
reportPreparedBy, 
reportReviewedBy, 
classificationOfAuditObservations,
auditScoreAnalysis,
references
}) => {


//  console.log("startdate",startDate);
const generateCoverImage = async (client, location, date, reportType) => {
    const year = new Date().getFullYear();
     let service =
    reportType === "HSE"
      ? "HSE Audit"
      : "Electrical Audit";
    const container = document.createElement("div");
    container.style.width = "1192x"; // A4 width
    container.style.height = "1684px"; // A4 height
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.background = "#fff";
    // container.innerHTML = `
    //   <div style="position:relative; text-align:left; width:100%; height:100%;">
    //     <div style="width:100%; height:100%; position:relative;">
    //       <img src="${reportType === "HSE" ? HSE_Cover_New : Electrical_Cover_New}" 
    //            style="width:100%; height:100%;" />
    //     </div>
    //     <div style="position:absolute; top:40%; width:65%; background-color:#efc71d; 
    //         clip-path: polygon(0% 0%, 100% 0%, 85% 100%, 0% 100%);
    //         padding:10px; box-sizing: border-box;">
    //       <p style="font-size:20px; color:#307268; margin:5px; border-bottom:1px solid #307268;">
    //         Client : ${client}
    //       </p>
    //       <p style="font-size:20px; color:#307268; margin:5px; border-bottom:1px solid #307268;">
    //         Location : ${location}
    //       </p>
    //       <p style="font-size:20px; color:#307268; margin:5px; border-bottom:1px solid #307268;">
    //         Service : ${service}
    //       </p>
    //       <p style="font-size:20px; color:#307268; margin:5px; border-bottom:1px solid #307268;">
    //         Date : ${date}
    //       </p>
    //       <a href="https://www.momentumindia.in" 
    //          style="color:#307268; margin:5px; font-size:13px; text-decoration:none;">
    //         www.momentumindia.in
    //       </a>
    //     </div>
    //     <div style="position:absolute; bottom:15%; left:20%; font-size:45px; font-weight:600; 
    //         font-family:'Montserrat', sans-serif; color:#f9f3d9;">
    //       ${reportType === "HSE" ? "HSE<br/>Report" : "Electrical<br/>Safety<br/>Report"}  
    //       <span style="display: flex; align-items: center; margin-top: 10px; font-size:25px; font-weight:normal">
    //         <span style="flex-grow: 1; height: 1px; background-color: #f9f3d9; margin-right: 10px;"></span>
    //         ${year}
    //       </span>
    //     </div>
    //     <div style="position:absolute; bottom:20px; left:20px; font-size:12px; color:#333;">
    //       Prepared by Momentum India
    //     </div>
    //   </div>
    // `;

    container.innerHTML = `
    <div style="width:100%; height:100%; position:relative;">
      <img src="${reportType === "HSE" ? HSE_Cover_New : Electrical_Cover_New}" 
           style="width:100%; height:100%; object-fit:cover;" />

      <!-- Dynamic text placeholders -->
      <div style="position:absolute; top:882px; left:230px; font-size:28px; font-family:Montserrat; color:#307268;">
        ${client || ""}
      </div>
       <div style="position:absolute; top:950px; left:250px; font-size:28px; font-family:Montserrat; color:#307268;">
        ${location || ""}
      </div>
      <div style="position:absolute; top:1020px; left:240px; font-size:28px; font-family:Montserrat; color:#307268;">
        ${service || ""}
      </div>
     
      <div style="position:absolute; top:1090px; left:190px; font-size:24px; font-family:Montserrat; color:#307268;">
      <!--  ${date || ""}-->
        ${startDate.getTime() === endDate.getTime()
          ? `${startDate.getDate()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}-${startDate.getFullYear()}`
          : `${startDate.getDate()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}-${startDate.getFullYear()} to ${endDate.getDate()}-${(endDate.getMonth() + 1).toString().padStart(2, '0')}-${endDate.getFullYear()}`
       || ""}
      </div>
    </div>
  `;
    document.body.appendChild(container);
    const canvas = await html2canvas(container);
    const base64Image = canvas.toDataURL("image/png");
    document.body.removeChild(container);

    return base64Image;
  };
  
const generateCoverImageForHSE = async (client, location, date, reportType) => {
    const year = new Date().getFullYear();
     let service =
    reportType === "HSE"
      ? "HSE Audit"
      : "Electrical Audit";
    const container = document.createElement("div");
    container.style.width = "850px"; // A4 width
    container.style.height = "1123px"; // A4 height
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.background = "#fff";
    container.innerHTML = `
    <div style="width:100%; height:100%; position:relative;">
      <img src="${reportType === "HSE" ? HSE_Cover_New : Electrical_Cover_New}" 
           style="width:100%; height:100%; object-fit:cover;" />

      <!-- Dynamic text placeholders -->
      <div style="position:absolute; top:500px; left:116px; font-size:22px; font-family:Montserrat; color:#307268;">
        ${client || ""}
      </div>
      <div style="position:absolute; top:582px; left:116px; font-size:22px; font-family:Montserrat; color:#307268;">
        ${service || ""}
      </div>
      <div style="position:absolute; top:667px; left:116px; font-size:22px; font-family:Montserrat; color:#307268;">
        ${location || ""}
      </div>
      <div style="position:absolute; top:755px; left:64px; font-size:16px; font-family:Montserrat; color:#307268;">
      <!--  ${date || ""}-->
        ${startDate.getTime() === endDate.getTime()
          ? `${startDate.getDate()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}-${startDate.getFullYear()}`
          : `${startDate.getDate()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}-${startDate.getFullYear()} to ${endDate.getDate()}-${(endDate.getMonth() + 1).toString().padStart(2, '0')}-${endDate.getFullYear()}`
       || ""}
      </div>
    </div>
  `;
    document.body.appendChild(container);
    const canvas = await html2canvas(container);
    const base64Image = canvas.toDataURL("image/png");
    document.body.removeChild(container);

    return base64Image;
  };




  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    
const base64Image = await generateCoverImage(
      selectedOrganization?.label,
      selectedSite?.label,
     
      selectedDateTime,
      reportType
    );


    const base64ImageforHSE = await generateCoverImageForHSE(
      selectedOrganization?.label,
      selectedSite?.label,
     
      selectedDateTime,
      reportType
    );
    // Create "Cover" sheet
    // cover page for electrical
    if(reportType!="HSE"){
    const coverSheet = workbook.addWorksheet("Cover Page");

    // Add image
    const imageId = workbook.addImage({
      base64: base64Image,
      extension: "png",
    });

    coverSheet.addImage(imageId, {
      tl: { col: 0, row: 0 },
      // ext: { width: 850, height: 1123 }, 
      ext: { width: 1192, height: 1684 }, 
    });

  }

//cover page for HSE
    if(reportType=="HSE"){
    const coverSheet = workbook.addWorksheet("Cover Page");

    // Add image
    const imageId = workbook.addImage({
      base64: base64ImageforHSE,
      extension: "png",
    });

    coverSheet.addImage(imageId, {
      tl: { col: 0, row: 0 },
      // ext: { width: 850, height: 1123 }, 
       ext: { width: 1140, height: 1000 }, 
    });

  }

  const getDaySuffix = (day) => {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
};



 
      const historyWorksheet = workbook.addWorksheet("Document History");
      historyWorksheet.addRow(["PARTICULARS", "DETAILS"]);
      historyWorksheet.getColumn(1).width = 25;
      historyWorksheet.addRow([
        "Date of Visit",
        // startDate.getTime() === endDate.getTime()
        //   ? `${startDate.getDate()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}-${startDate.getFullYear()}`
        //   : `${startDate.getDate()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}-${startDate.getFullYear()} to ${endDate.getDate()}-${(endDate.getMonth() + 1).toString().padStart(2, '0')}-${endDate.getFullYear()}`
     `${startDate.getDate()}${getDaySuffix(startDate.getDate())} ${startDate.toLocaleString("en-US", { month: "short" })} ${startDate.getFullYear()}`

        ]);
      historyWorksheet.addRow(["Document Prepared By", name]);
      historyWorksheet.addRow(["Date of Document Submission", selectedDateTime.split("-").reverse().join("-")]);
      // historyWorksheet.addRow(["Document Version", ""]); // Add document version if available
    

    // Create a worksheet for the main  data
    const reportWorksheet = workbook.addWorksheet("Report");
    const stripHtml = (html) => {
      if (!html) return "";
      const doc = new DOMParser().parseFromString(html, "text/html");
      return doc.body.textContent.replace(/\n\s*\n/g, "\n").trim();
    };
    const htmlToRichText = (html) => {
      const doc = new DOMParser().parseFromString(html, "text/html");
      const rawResult = [];

      const traverse = (node, baseStyle = {}, listContext = null) => {
        if (node.nodeType === Node.TEXT_NODE) {
          if (node.nodeValue.trim() !== "") {
            rawResult.push({ text: node.nodeValue, font: { ...baseStyle } });
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const newStyle = { ...baseStyle };

          if (node.tagName === "B" || node.tagName === "STRONG") newStyle.bold = true;
          if (node.tagName === "I" || node.tagName === "EM") newStyle.italic = true;
          if (node.tagName === "U") newStyle.underline = true;

          if (node.tagName === "UL") {
            for (let child of node.children) {
              traverse(child, newStyle, { type: "ul" });
            }
          } else if (node.tagName === "OL") {
            let index = 1;
            for (let child of node.children) {
              traverse(child, newStyle, { type: "ol", index: index++ });
            }
          } else if (node.tagName === "LI") {
            const prefix =
              listContext?.type === "ul"
                ? "• "
                : listContext?.type === "ol"
                  ? `${listContext.index}. `
                  : "";

            rawResult.push({ text: prefix, font: { ...baseStyle } });

            for (let child of node.childNodes) {
              traverse(child, newStyle);
            }

            rawResult.push({ text: "\n", font: {} }); // line break after list item
          } else if (node.tagName === "BR") {
            rawResult.push({ text: "\n", font: {} });
          } else if (node.tagName === "P") {
            for (let child of node.childNodes) {
              traverse(child, newStyle);
            }
            rawResult.push({ text: "\n", font: {} }); // line break after paragraph
          } else {
            for (let child of node.childNodes) {
              traverse(child, newStyle, listContext);
            }
          }
        }
      };

      for (let child of doc.body.childNodes) {
        traverse(child);
      }

      //  Normalize double newlines into single newlines
      const result = [];
      let prevWasNewline = false;
      for (const part of rawResult) {
        if (part.text === "\n") {
          if (!prevWasNewline) {
            result.push(part);
            prevWasNewline = true;
          }
        } else {
          result.push(part);
          prevWasNewline = false;
        }
      }

      return result;
    };


    const addFormattedRow = (worksheet, label, htmlContent) => {
      const row = worksheet.addRow([label, ""]); // Empty cell, we'll set richText manually
      const richText = htmlToRichText(htmlContent);

      row.getCell(1).alignment = { wrapText: true, vertical: "top" };
      row.getCell(2).value = { richText };
      row.getCell(2).alignment = { wrapText: true, vertical: "top" };
      row.height = 80;
    };
    // for electrical
 if(reportType !="HSE"){
    reportWorksheet.addRow([
      "Client",
      selectedOrganization ? selectedOrganization.label : "",
    ]);
    reportWorksheet.getColumn(1).width = 40;
    reportWorksheet.getColumn(2).width = 120;
    const addWrappedRow = (worksheet, label, content) => {
      const row = worksheet.addRow([label, stripHtml(content)]);
      row.getCell(2).alignment = { wrapText: true, vertical: "top" };
      row.height = 80; // optional: manually set row height for visibility
    };
    // addFormattedRow(reportWorksheet, "Date", selectedDateTime ? selectedDateTime.split("-").reverse().join("-") : "");
    addFormattedRow(reportWorksheet, "Location", selectedSite ? selectedSite.label : "");
    // addFormattedRow(reportWorksheet, "Service", "Electrical Audit");
    if(reportType==="HSE"){
    addFormattedRow(reportWorksheet, "Service", "HSE Audit")
    }
    if(reportType!=="HSE"){
    addFormattedRow(reportWorksheet, "Service", "Electrical Audit")
    }
    addFormattedRow(reportWorksheet, "Date", selectedDateTime ? selectedDateTime.split("-").reverse().join("-") : "");
    // addWrappedRow(reportWorksheet, "Background Brief", backgroundBrief);
    addFormattedRow(reportWorksheet, "Background Brief - Project Brief", backgroundBrief);
    // addWrappedRow(reportWorksheet, "Contents", contents);
    addFormattedRow(reportWorksheet, "Understanding The Report", contents);
    if(reportType==="HSE"){
    addFormattedRow(reportWorksheet,"Introduction",introduction)
    }
    // addWrappedRow(reportWorksheet, "Executive Summary", exeSummary);
    addFormattedRow(reportWorksheet, "Executive Summary", exeSummary);
    addFormattedRow(reportWorksheet, "Improvement Opportunity Areas (Deductibles)", improvementOpportunityAreas);
    addFormattedRow(reportWorksheet, "Overall Risk Assessment Indicator", overallAssessmentIndicator);
    if (reportType === "HSE") {
      addFormattedRow(reportWorksheet, "Global Best Practices", bestPractice);

    }
    // addWrappedRow(reportWorksheet, "The Way Forward", theWayForward);
    addFormattedRow(reportWorksheet, "Way Forward Plan", theWayForward);
    // addWrappedRow(reportWorksheet, "Conclusion", conclusion);
    addFormattedRow(reportWorksheet, "Conclusion", conclusion);

  }

// for hse audit description
if(reportType == "HSE"){
  const auditDescription = workbook.addWorksheet("Audit Description");

// Define column widths for neat alignment
auditDescription.columns = [
  {  width: 40 },
  { width: 50 },
];

// Add rows one by one
auditDescription.addRows([
  ["Client", selectedOrganization?.label || "N/A"],
  ["Location", selectedSite?.label || "N/A"],
  [
    "Date of Site Visit",
    startDate
      ? `${startDate.getDate()}-${startDate.getMonth() + 1}-${startDate.getFullYear()}`
      : "N/A",
  ],
  ["Study", "HSE Audit"],
  [
    "Time of Audit (From & To)",
    timeFrom && timeTo
      ? `${timeFrom} to ${timeTo}`
      : timeFrom
      ? `${timeFrom} to N/A`
      : timeTo
      ? `N/A to ${timeTo}`
      : "N/A",
  ],
  ["Brief Property Description", briefPropertyDescription || "N/A"],
  ["Number of Floors", numOfFloors || "N/A"],
  ["Average Staff Footfall", avgStaffFootfall || "N/A"],
  ["No Objection Certificate", noObjectionCertificate || "N/A"],
  ["National Building Code Category", nationalBuildingCodeCategory || "N/A"],
  ["Coordinating Person – Client Side", coordinationgPersonClientside || "N/A"],
  ["Report Prepared By", reportPreparedBy || "N/A"],
  ["Report Reviewed By", reportReviewedBy || "N/A"],
  [
    "Date of Submission of Report",
    endDate
      ? `${endDate.getDate()}-${endDate.getMonth() + 1}-${endDate.getFullYear()}`
      : "N/A",
  ],
]);

// Optional: Add bold styling for header
auditDescription.getRow(1).font = { bold: true };

// Add borders and alignment for all cells
auditDescription.eachRow((row, rowNumber) => {
  row.eachCell((cell) => {
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
    cell.alignment = { vertical: "middle", wrapText: true };
  });
});

}




// for hse report
if(reportType =="HSE"){
    reportWorksheet.addRow([
      "Client",
      selectedOrganization ? selectedOrganization.label : "",
    ]);
    reportWorksheet.getColumn(1).width = 40;
    reportWorksheet.getColumn(2).width = 120;
    const addWrappedRow = (worksheet, label, content) => {
      const row = worksheet.addRow([label, stripHtml(content)]);
      row.getCell(2).alignment = { wrapText: true, vertical: "top" };
      row.height = 80; // optional: manually set row height for visibility
    };
    // addFormattedRow(reportWorksheet, "Date", selectedDateTime ? selectedDateTime.split("-").reverse().join("-") : "");
    addFormattedRow(reportWorksheet, "Location", selectedSite ? selectedSite.label : "");
    // addFormattedRow(reportWorksheet, "Service", "Electrical Audit");
    if(reportType==="HSE"){
    addFormattedRow(reportWorksheet, "Service", "HSE Audit")
    }
    addFormattedRow(reportWorksheet, "Date", selectedDateTime ? selectedDateTime.split("-").reverse().join("-") : "");
     addFormattedRow(reportWorksheet, "Understanding The Report", contents);
     addFormattedRow(reportWorksheet, "Classification ofAudit Observations", classificationOfAuditObservations);
     addFormattedRow(reportWorksheet, "Audit Objective", backgroundBrief);
    addFormattedRow(reportWorksheet, "Executive Summary", exeSummary);
    addFormattedRow(reportWorksheet, "Audit Score Analysis", auditScoreAnalysis);
    addFormattedRow(reportWorksheet, "Improvement Opportunity Areas", improvementOpportunityAreas);
    addFormattedRow(reportWorksheet, "Overall Risk Assessment Indicator", overallAssessmentIndicator);
    addFormattedRow(reportWorksheet, "Conclusion", conclusion);

  }
    //observations table
    async function fetchImageBuffer(url) {
      const response = await fetch(url);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      return new Uint8Array(arrayBuffer);
    }
    // for HSE obs
if(reportType==="HSE"){
    const ObservationsandRecommendations = workbook.addWorksheet("Observations & Recommendations");
     const photoSheet = workbook.addWorksheet("Photos");
   const headerRow= ObservationsandRecommendations.addRow([
      "Sr. No",
      "Area / Process",
      "Observation",
      "Objective Evidence",
      "Criticality",
      "Legal Reference (if any)",
      // "Score",
      // "System Implementation",
      // "Compliance Check",
      "Recommendation",
    ]);
 headerRow.eachCell((cell) => {
  cell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "307268" }, // background
  };
  cell.font = {
    bold: true,
    color: { argb: "EFC71D" }, // text color
  };
  cell.alignment = {
    vertical: "middle",
    horizontal: "center",
  };
});

    let photoSheetRowPointer = 1;    
   for (let i = 0; i < selectedObservations.length; i++) {
  const obs = selectedObservations[i];
  const imageUrls = obs.imageUrls || [];

  const viewAllLink = imageUrls.length
    ? { text: "[View All]", hyperlink: `#Photos!A${photoSheetRowPointer + 1}` }
    : "NA";

  const row = ObservationsandRecommendations.addRow([
    i + 1,
    obs.area || "N/A",
    obs.observation || "N/A",
    viewAllLink,
    obs.criticality || "N/A",
    obs.is_reference || "N/A",
    // obs.score || "N/A",
    // obs.system_implementation||"N/A",
    // obs.compliance_check||"N/A",
    obs.recommendations || "N/A",
  ]);
  ObservationsandRecommendations.getRow(row.number).height = 90;

  row.eachCell((cell, colNumber) => {
    cell.alignment = {
      wrapText: true,
      vertical: "middle",
      horizontal: "center",
    };
  });

  if (imageUrls.length > 0) {
    const anchorCell = photoSheet.getCell(`A${photoSheetRowPointer}`);
    anchorCell.value = `Observation ${i + 1}`;
    anchorCell.font = { bold: true };
    photoSheetRowPointer++;

    for (let j = 0; j < imageUrls.length; j++) {
      try {
        const imageBuffer = await fetchImageBuffer(imageUrls[j]);
        const imageId = workbook.addImage({
          buffer: imageBuffer,
          extension: "jpeg",
        });

        photoSheet.addImage(imageId, {
          tl: { col: j * 3, row: photoSheetRowPointer - 1 },
          ext: { width: 150, height: 100 },
          editAs: "oneCell",
        });
      } catch (error) {
        console.error(`Image load failed: ${imageUrls[j]}`, error);
      }
    }

    photoSheetRowPointer += 6; // Space before next group
  }
}

    ObservationsandRecommendations.columns.forEach((col, index) => {
      if (index === 0 || index === 4) {
        col.width = 10;
      } else {
        col.width = 25;
      }
    });

  }

  // For electrical
if(reportType !=="HSE"){
    const ObservationsandRecommendations = workbook.addWorksheet("Observations & Recommendations");
     const photoSheet = workbook.addWorksheet("Photos");
   const headerRow= ObservationsandRecommendations.addRow([
      "Sr.No",
      "Area",
      "Observations",
      "Criticality",
      "Photo Evidence",
      "Is Reference",
      "Recommendations",
    ]);
 headerRow.eachCell((cell) => {
  cell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "307268" }, // background
  };
  cell.font = {
    bold: true,
    color: { argb: "EFC71D" }, // text color
  };
  cell.alignment = {
    vertical: "middle",
    horizontal: "center",
  };
});

    let photoSheetRowPointer = 1;    
   for (let i = 0; i < selectedObservations.length; i++) {
  const obs = selectedObservations[i];
  const imageUrls = obs.imageUrls || [];

  const viewAllLink = imageUrls.length
    ? { text: "[View All]", hyperlink: `#Photos!A${photoSheetRowPointer + 1}` }
    : "NA";

  const row = ObservationsandRecommendations.addRow([
    i + 1,
    obs.area || "N/A",
    obs.observation || "N/A",
    obs.criticality || "N/A",
    viewAllLink,
    obs.is_reference || "N/A",
    obs.recommendations || "N/A",
  ]);
  ObservationsandRecommendations.getRow(row.number).height = 90;

  row.eachCell((cell, colNumber) => {
    cell.alignment = {
      wrapText: true,
      vertical: "middle",
      horizontal: "center",
    };
  });

  if (imageUrls.length > 0) {
    const anchorCell = photoSheet.getCell(`A${photoSheetRowPointer}`);
    anchorCell.value = `Observation ${i + 1}`;
    anchorCell.font = { bold: true };
    photoSheetRowPointer++;

    for (let j = 0; j < imageUrls.length; j++) {
      try {
        const imageBuffer = await fetchImageBuffer(imageUrls[j]);
        const imageId = workbook.addImage({
          buffer: imageBuffer,
          extension: "jpeg",
        });

        photoSheet.addImage(imageId, {
          tl: { col: j * 3, row: photoSheetRowPointer - 1 },
          ext: { width: 150, height: 100 },
          editAs: "oneCell",
        });
      } catch (error) {
        console.error(`Image load failed: ${imageUrls[j]}`, error);
      }
    }

    photoSheetRowPointer += 6; // Space before next group
  }
}

    ObservationsandRecommendations.columns.forEach((col, index) => {
      if (index === 0 || index === 3) {
        col.width = 10;
      } else {
        col.width = 25;
      }
    });

  }
    
if (reportType !== "HSE") {
  const scoresWorksheet = workbook.addWorksheet("Scoring Table");

 
  const tableATitle = scoresWorksheet.addRow(["Table A"]);
  tableATitle.getCell(1).font = { bold: true, size: 14 };
  scoresWorksheet.addRow([]); // empty row after Table A title


  const headerRow = scoresWorksheet.addRow([
    "Parameter",
    "Max Score",
    "Score Obtained",
  ]);

  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "307268" }, // green background
    };
    cell.font = {
      color: { argb: "EFC71D" }, // yellow text
      bold: true,
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // Add rows for scores
  scores.forEach((row) => {
    const dataRow = scoresWorksheet.addRow([
      row["Electrical Safety"],
      row["Maximum Score"],
      row["Score Obtained"],
    ]);

    dataRow.eachCell((cell) => {
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  scoresWorksheet.getColumn(1).width = 28;
  scoresWorksheet.getColumn(2).width = 10;
  scoresWorksheet.getColumn(3).width = 15;

  const cumulativeRow = scoresWorksheet.addRow([
    "Cumulative",
    25,
    cumulativeScore,
  ]);

  cumulativeRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "EFC71D" }, 
    };
    cell.font = {
      color: { argb: "000000" }, 
      bold: true,
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  const percentage = Math.floor((cumulativeScore / 25) * 100) + "%";
  scoresWorksheet.addRow([]);
  scoresWorksheet.addRow([]);
 const percentageRow = scoresWorksheet.addRow(["Overall Score", percentage]);

percentageRow.eachCell((cell) => {
  cell.alignment = { vertical: "middle", horizontal: "center" }; 
  cell.font = { bold: true, size: 14 }; 
});
  


  const tableBTitle = scoresWorksheet.getRow(1); 
  tableBTitle.getCell(5).value = "Table B";
  tableBTitle.getCell(5).font = { bold: true, size: 14 };

  const emptyRowForTableB = scoresWorksheet.getRow(2);
  emptyRowForTableB.getCell(5).value = ""; 


  const riskLevels = [
    {
      range: "≥ 85%",
      risk: "Low Risk",
      color: "00A651",
      interpretation: "Electrical systems and controls are well maintained, only minor improvements needed.",
    },
    {
      range: "65% – 84%",
      risk: "Medium Risk",
      color: "FFFF00",
      interpretation: "Controls are adequate but with noticeable weaknesses.",
    },
    {
      range: "25% – 64%",
      risk: "High Risk",
      color: "FFA500",
      interpretation: "High vulnerabilities with major compliance gaps.",
    },
    {
      range: "≤ 25%",
      risk: "Severe Risk",
      color: "FF0000",
      interpretation: "Controls are ineffective, urgent corrective action required.",
    },
  ];


  const legendHeader = scoresWorksheet.getRow(3);
  legendHeader.getCell(5).value = "Score Range";
  legendHeader.getCell(6).value = "Risk Level";
  legendHeader.getCell(7).value = "Interpretation";

  [5, 6, 7].forEach((col) => {
    const cell = legendHeader.getCell(col);
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "307268" }, // dark green
    };
    cell.font = { color: { argb: "EFC71D" }, bold: true };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  riskLevels.forEach((level, index) => {
    const row = scoresWorksheet.getRow(index + 4); // start from row 4

    row.getCell(5).value = level.range;
    row.getCell(5).font = { color: { argb: level.color }, bold: true };
    row.getCell(5).alignment = { horizontal: "center", vertical: "middle" };
    row.getCell(5).border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };

    row.getCell(6).value = level.risk;
    row.getCell(6).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: level.color },
    };
    row.getCell(6).font = { color: { argb: "000000" } }; // black text
    row.getCell(6).alignment = { horizontal: "center", vertical: "middle" };
    row.getCell(6).border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };

    row.getCell(7).value = level.interpretation;
    row.getCell(7).alignment = { wrapText: true };
    row.getCell(7).border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  scoresWorksheet.getColumn(5).width = 12;
  scoresWorksheet.getColumn(6).width = 15;
  scoresWorksheet.getColumn(7).width = 60;



}

//for hse annexure 
if(reportType== "HSE"){
  const annexureTable = workbook.addWorksheet("Annexure Table");

// Define columns
annexureTable.columns = [
  { header: "Reference Type and Document / Standard", key: "document", width: 60 },
  { header: "Relevance to Audit Findings", key: "relevance", width: 60 },
];

// Start with a row counter to track dynamic insertion
let currentRow = 2;

// Add table header styling
annexureTable.getRow(1).font = { bold: true };
annexureTable.getRow(1).alignment = { horizontal: "center", vertical: "middle" };
annexureTable.getRow(1).eachCell((cell) => {
  cell.border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };
  cell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "D9E1F2" }, // Light blue header background
  };
});

// Loop through references data
references.forEach((ref) => {
  if (ref.type === "heading") {
    // Add a merged row for section headings
    annexureTable.mergeCells(`A${currentRow}:B${currentRow}`);
    const cell = annexureTable.getCell(`A${currentRow}`);
    cell.value = ref.section_name || "Section";
    cell.font = { bold: true, size: 12 };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF2CC" }, // Light yellow for section heading
    };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  } else {
    // Regular data rows
    annexureTable.addRow([
      ref.document || "N/A",
      ref.relevance || "N/A",
    ]);
  }
  currentRow++;
});

// Add borders and alignment for all regular rows
annexureTable.eachRow((row, rowNumber) => {
  if (rowNumber === 1) return; // Skip header row (already styled)
  row.eachCell((cell) => {
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
    cell.alignment = { vertical: "middle", wrapText: true };
  });
});

}



    


    // Trigger the download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${ReportUID}.xlsx`;
    a.click();
  };

  return (
    <div>
      <button
        onClick={exportToExcel}
        style={{
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          background: isSaved ? "#efc71d" : "lightgrey",
          borderStyle: "none",
          borderRadius: "5px",
          fontWeight: "bold",
          padding: "11px 18px",
          textTransform: "uppercase",
          color: "white",
          fontSize: "1rem",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.5)",
        }}
        disabled={!isSaved}
      >
        EXPORT TO EXCEL
        <FileDownloadIcon fontSize="small" style={{ marginLeft: "8px" }} />
      </button>
    </div>
  );
};

export default ExportExcel;








