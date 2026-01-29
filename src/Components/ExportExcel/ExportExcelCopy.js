import React from "react";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ExcelJS from "exceljs";
import axios from "axios";

const ExportExcel = ({
  selectedOrganization,
  selectedSite,
  selectedDateTime,
  backgroundBrief,
  contents,
  exeSummary,
introduction,
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
  facilityInfo
}) => {
  // console.log(facilityInfo)
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    

    if (reportType !== "HSE") {
      const historyWorksheet = workbook.addWorksheet("Document History");
      historyWorksheet.addRow(["PARTICULARS", "DETAILS"]);
      historyWorksheet.getColumn(1).width = 25;
      historyWorksheet.addRow([
        "Date of Visit",
        startDate.getTime() === endDate.getTime()
          ? `${startDate.getDate()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}-${startDate.getFullYear()}`
          : `${startDate.getDate()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}-${startDate.getFullYear()} to ${endDate.getDate()}-${(endDate.getMonth() + 1).toString().padStart(2, '0')}-${endDate.getFullYear()}`
      ]);
      historyWorksheet.addRow(["Document Prepared By", name]);
      historyWorksheet.addRow(["Date of Document Submission", selectedDateTime.split("-").reverse().join("-")]);
      historyWorksheet.addRow(["Document Version", ""]); // Add document version if available
    }

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
    addFormattedRow(reportWorksheet, "Service", "Electrical Audit");
    addFormattedRow(reportWorksheet, "Date", selectedDateTime ? selectedDateTime.split("-").reverse().join("-") : "");
    // addWrappedRow(reportWorksheet, "Background Brief", backgroundBrief);
    addFormattedRow(reportWorksheet, "Background Brief", backgroundBrief);
    // addWrappedRow(reportWorksheet, "Contents", contents);
    addFormattedRow(reportWorksheet, "Understanding Of Review Reports - Contents", contents);
    if(reportType==="HSE"){
    addFormattedRow(reportWorksheet,"Introduction",introduction)
    }
    // addWrappedRow(reportWorksheet, "Executive Summary", exeSummary);
    addFormattedRow(reportWorksheet, "Executive Summary", exeSummary);
    if (reportType === "HSE") {
      addFormattedRow(reportWorksheet, "Global Best Practices", bestPractice);

    }
    // addWrappedRow(reportWorksheet, "The Way Forward", theWayForward);
    addFormattedRow(reportWorksheet, "Way Forward Plan", theWayForward);
    // addWrappedRow(reportWorksheet, "Conclusion", conclusion);
    addFormattedRow(reportWorksheet, "Conclusion", conclusion);


    const criticalObservationsWorksheet = workbook.addWorksheet(
      "Critical Observations"
    );
    criticalObservationsWorksheet.addRow(["Sr No.", "Observation"]);
    criticalObservationsWorksheet.getColumn(1).alignment = {
      horizontal: "left",
      vertical: "middle",
    };
    if (criticalObservations.length === 0) {
      // If no critical observations, add a placeholder row
      criticalObservationsWorksheet.addRow(["-", "No critical observations"]);
    } else {
      // Add rows for critical observations
      for (let i = 0; i < criticalObservations.length; i++) {
        const observation = criticalObservations[i].observation || "";

        criticalObservationsWorksheet.addRow([i + 1, observation]);

      }
    }

    // Add an empty row as a separator between critical observations and other details
    criticalObservationsWorksheet.addRow([]);



    //observations table
    async function fetchImageBuffer(url) {
      const response = await fetch(url);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      return new Uint8Array(arrayBuffer);
    }

    const ObservationsandRecommendations = workbook.addWorksheet("Observations & Recommendations");
    const photoSheet = workbook.addWorksheet("Photos");

    ObservationsandRecommendations.addRow([
      "Sr No.",
      "Area",
      "Observation",
      "Criticality",
      "Recommendations",
      "Is Reference",
      "Photo Evidence",
      reportType === "HSE" ? "Score" : null,
    ]);

    let photoSheetRowPointer = 1;

    for (let i = 0; i < selectedObservations.length; i++) {
      const obs = selectedObservations[i];
      const imageUrls = obs.imageUrls || [];

      const viewAllLink = imageUrls.length
        ? { text: "[View All]", hyperlink: `#Photos!A${photoSheetRowPointer + 1}` }
        : "N/A";

      const row = ObservationsandRecommendations.addRow([
        i + 1,
        obs.area || "N/A",
        obs.observation || "N/A",
        obs.criticality || "N/A",
        obs.recommendations || "N/A",
        obs.is_reference || "N/A",
        viewAllLink,
        reportType === "HSE" ? obs.score || "N/A" : null,
      ]);

      ObservationsandRecommendations.getRow(row.number).height = 45;

      // Add to Photos sheet if there are images
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

    // Set column widths
    ObservationsandRecommendations.columns.forEach((col, index) => {
      if (index === 0 || index === 3 || index === 6) {
        col.width = 10;
      } else {
        col.width = 25;
      }
    });

    ObservationsandRecommendations.getColumn(1).alignment = {
      horizontal: "left",
      vertical: "bottom",
    };



    // Create a worksheet for "Scores"
    if (reportType !== "HSE") {
      const scoresWorksheet = workbook.addWorksheet("Scoring Table");
      scoresWorksheet.addRow([
        "Electrical Safety",
        "Max Score",
        "Score Obtained",
      ]);

      // Add rows for scores
      scores.forEach((row, index) => {
        scoresWorksheet.addRow([
          row["Electrical Safety"],
          row["Max Score"],
          row["Score Obtained"],
        ]);
      });
      scoresWorksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell, colNumber) => {
          if (colNumber === 2 || colNumber === 3) {
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
          }
        });
      });

      scoresWorksheet.getColumn(1).width = 28;
      scoresWorksheet.getColumn(2).width = 10;
      scoresWorksheet.getColumn(3).width = 15;
      // Add a row for "Cumulative" in the "Scores" worksheet
      const cumulativeRow = ["Cumulative", 10, cumulativeScore];
      scoresWorksheet.addRow(cumulativeRow).eachCell((cell, colNumber) => {
        if (colNumber === 2 || colNumber === 3) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        }
      });

      const percentage = ((cumulativeScore / 10) * 100).toFixed(2) + "%";
      scoresWorksheet.addRow(["Overall Score", percentage]);
    }
    if (reportType === "HSE") {
      const academicInforWorksheet = workbook.addWorksheet(
        "Academic Information"
      );
      academicInforWorksheet.addRow([
        "Facility Information",
        "Comments & Notes"
      ]);
     academicInforWorksheet.getColumn(1).width=30;
      Object.entries(facilityInfo).forEach(([key, value]) => {
        academicInforWorksheet.addRow([key, value || ""]);
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








