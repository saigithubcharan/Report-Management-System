import React, { useEffect, useState } from "react";
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";
// import HSE_Cover_New from "../../HSE_Report_Cover.png";
import HSE_Cover_New from "../../HSE PNG.png";
// import Electrical_Cover_New from "../../Electrical PNG.png";
import Electrical_Cover_New from "../../ElectricalPortrait.png";
// import Electrical_Cover_New from "../../Electrical_Safety_Report_Cover.png";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  LevelFormat,
  ImageRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  ExternalHyperlink,
  Footer,
  PageNumber,
  NumberFormat,
  BorderStyle,
  PageOrientation,
  VerticalAlign,
  SectionType,
  ShadingType,
  TableLayoutType
} from "docx";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import axios from "../../APIs/axios";
import { config } from "../../config";
import logo from "../../mi_logo_report.png";
import HTMLReactParser from 'html-react-parser';
import htmlDocx from "html-docx-js/dist/html-docx"; 
import { margin } from "@mui/system";

const imageToBase64 = async (url) => {

  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.log("Error:", error.message)
  }
};
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

const getDaySuffix = (day) => {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
};
const createBreaks = (num) => {
  const breaks = [];
  for (let i = 0; i < num; i++) {
    breaks.push(new Paragraph({ break: 1 }));
  }
  return breaks;
};
// Convert rgb(...) to hex

const sanitizeHtml = (html) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Remove Jodit selection marker spans
  doc.querySelectorAll('span[data-jodit-selection_marker]').forEach((el) => el.remove());

  return doc.body.innerHTML;
};


const convertNodeToRuns = (node, inheritedStyles = {}) => {
  let runs = [];

  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent;
    if (text) {
      runs.push(
        new TextRun({
          text,
          bold: inheritedStyles.bold,
          italics: inheritedStyles.italics,
          underline: inheritedStyles.underline ? {} : undefined,
          font: inheritedStyles.font || "Montserrat",
          // size: inheritedStyles.size,
          size: inheritedStyles.size || 22,
        })
      );
    }
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    const tag = node.tagName.toLowerCase();
    const newStyles = { ...inheritedStyles };
    if (
      tag === "span" &&
      node.getAttribute("data-jodit-selection_marker") &&
      node.getAttribute("data-jodit-temp") === "true"
    ) {
      runs.push(new TextRun({ break: 1 }));
      return runs;
    }

    if (tag === "b" || tag === "strong") newStyles.bold = true;
    if (tag === "i" || tag === "em") newStyles.italics = true;
    if (tag === "u") newStyles.underline = true;
    if (tag === "br") {
      runs.push(new TextRun({ break: 1  }));
      return runs;
    }

    if (tag === "span") {
      const style = node.getAttribute("style") || "";
      const fontSizeMatch = style.match(/font-size:\s*(\d+)px/);
      const fontFamilyMatch = style.match(/font-family:\s*([^;]+)/i);

      if (fontSizeMatch) {
        const px = parseInt(fontSizeMatch[1], 10);
        newStyles.size = px * 2; // DOCX size is half-points
      }

      if (fontFamilyMatch) {
        newStyles.font = fontFamilyMatch[1].trim().replace(/['"]/g, "");
      }
    }

    for (const child of node.childNodes) {
      runs = runs.concat(convertNodeToRuns(child, newStyles));
    }
  }

  return runs;
};


const convertHtmlToParagraphs = (htmlString) => {
  const cleanHtml = sanitizeHtml(htmlString);
  const parser = new DOMParser();
  const doc = parser.parseFromString(cleanHtml, "text/html");

  const paragraphs = [];

  doc.body.childNodes.forEach((node) => {
    const tag = node.nodeType === 1 ? node.tagName.toLowerCase() : "";

    if (tag === "ul" || tag === "ol") {
      const isOrdered = tag === "ol"; // Check if it's an ordered list (ol)
      const listItems = node.querySelectorAll("li");

      listItems.forEach((li, index) => {
        const runs = [];

        // Manually add numbering/bullet
        runs.push(
          new TextRun({
            text: isOrdered ? `${index + 1}.  ` : "• ",  // Numbering for ordered, bullet for unordered
            bold: !isOrdered,  // Optional: Make it bold for visibility
            size:22,
            font: "Montserrat",
          })
        );

        // Convert each child node of the list item
        li.childNodes.forEach((child) => {
          runs.push(...convertNodeToRuns(child));  // Recursive conversion of child nodes
        });

        // Add the list item as a new paragraph
        // paragraphs.push(new Paragraph({ children: runs }));
        paragraphs.push(
          new Paragraph({
            children: runs,
            spacing: {
              after: 160, // 8pt = 160 twips
              line: 276,  // 1.08 lines = 276 twips
              lineRule: "auto",
            },
            indent: {
              left: 0,
              right: 0,
              firstLine: 0,
            },
          })
        );
        
      });
    } else {
      const runs = [];
      node.childNodes.forEach((child) => {
        runs.push(...convertNodeToRuns(child));  // Convert non-list elements to runs
      });

      if (runs.length > 0) {
        // paragraphs.push(new Paragraph({ children: runs }));
        paragraphs.push(
          new Paragraph({
            children: runs,
            spacing: {
              after: 160, // 8pt = 160 twips
              line: 276,  // 1.08 lines = 276 twips
              lineRule: "auto",
            },
            indent: {
              left: 0,
              right: 0,
              firstLine: 0,
            },
          })
        );
        
      }
    }
  });

  return paragraphs;
};
const convertHtmlToParagraphsForImprovementOpportunityAreas = (htmlString) => {
  const cleanHtml = sanitizeHtml(htmlString);
  const parser = new DOMParser();
  const doc = parser.parseFromString(cleanHtml, "text/html");

  const paragraphs = [];

  doc.body.childNodes.forEach((node) => {
    const tag = node.nodeType === 1 ? node.tagName.toLowerCase() : "";

    if (tag === "ul" || tag === "ol") {
      const isOrdered = tag === "ol"; // Check if it's an ordered list (ol)
      const listItems = node.querySelectorAll("li");

      listItems.forEach((li, index) => {
        const runs = [];

  
        runs.push(
          new TextRun({
            text: isOrdered ? `${index + 1}. ` : "• ",
            bold: isOrdered, 
            size: 22,
            font: "Montserrat",
          })
        );

        // Convert each child node of the list item
        li.childNodes.forEach((child) => {
          runs.push(...convertNodeToRuns(child)); // Recursive conversion of child nodes
        });

        // Add paragraph
        paragraphs.push(
          new Paragraph({
            children: runs,
            spacing: {
              after: 160, // 8pt = 160 twips
              line: 276,  // 1.08 lines = 276 twips
              lineRule: "auto",
            },
            indent: {
              left: 0,
              right: 0,
              firstLine: 0,
            },
          })
        );
      });
    } else {
      const runs = [];
      node.childNodes.forEach((child) => {
        runs.push(...convertNodeToRuns(child)); // Convert non-list elements to runs
      });

      if (runs.length > 0) {
        paragraphs.push(
          new Paragraph({
            children: runs,
            spacing: {
              after: 160,
              line: 276,
              lineRule: "auto",
            },
            indent: {
              left: 0,
              right: 0,
              firstLine: 0,
            },
          })
        );
      }
    }
  });

  return paragraphs;
};

const ExportWordDoc = ({
  backgroundBrief,
  improvementOpportunityAreas,
  overallAssessmentIndicator,
  contents,
  isSaved,
  exeSummary,
  criticalObservations,
  selectedObservations,
  scores,
  cumulativeScore,
  conclusion,
  // imageUrlsByRow,
  selectedDateTime,
  selectedOrganization,
  selectedSite,
  otherDetails,
  reportType,
  chartImageElectrical,
  chartImage,
  ReportUID,
  bestPractice,
  theWayForward,
  startDate,
  endDate,
  name,
  facilityInfo,
  introduction,
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
  // gaugeImageWord,

}) => {
  // console.log("image",gaugeImageWord)
//   console.log("guage",gaugeImageWord)
// console.log("chart",chartImageElectrical)
  const [coverImage, setCoverImage] = useState(null);
    const [coverImageHSE,setCoverImageHSE]=useState(null);
  const [base64logo, setBase64Logo] = useState(null)
  const [selectedObsCopy, setSelectedObsCopy] = useState([
    ...selectedObservations,
  ]);
  const [loading, setLoading] = useState(false);

  const groupedObservations = selectedObsCopy.reduce((acc, observation) => {
    const { table_type } = observation;
   if(reportType=="HSE"){
    // Ensure table_type is defined and not null or an empty string
    if (table_type) {
      if (!acc[table_type]) {
        acc[table_type] = [];
      }
      acc[table_type].push(observation);
    } else {
      console.warn("Observation without a valid table_type:", observation);
    }
  }
    return acc;
  }, {});
// let boxColor = "#FFD700"; // default yellow
// if (cumulativeScore >= 8.5) {
//   boxColor = "#00A651"; // Low Risk
// } else if (cumulativeScore >= 6.5) {
//   boxColor = "#FFFF00"; // Medium Risk
// } else if (cumulativeScore >= 2.5) {
//   boxColor = "#FFA500"; // High Risk
// } else {
//   boxColor = "#FF0000"; // Severe Risk
// }

const maxScorePerRow = 5;
const totalPossibleScore = scores?.length * maxScorePerRow;
const percentageCumulative=cumulativeScore;

const percentage =
  totalPossibleScore > 0
    ? (percentageCumulative / totalPossibleScore) * 100
    : 0;

// Determine box color based on percentage
let boxColor = "#FFD700"; // default (yellow)

if (percentage >= 85) {
  boxColor = "#00A651"; // Low Risk
} else if (percentage >= 65) {
  boxColor = "#FFFF00"; // Medium Risk
} else if (percentage >= 25) {
  boxColor = "#FFA500"; // High Risk
} else {
  boxColor = "#FF0000"; // Severe Risk
}
  let date = startDate.getTime() === endDate.getTime()
    ? `${startDate.getDate()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}-${startDate.getFullYear()}`
    : `${startDate.getDate()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}-${startDate.getFullYear()} to ${endDate.getDate()}-${(endDate.getMonth() + 1).toString().padStart(2, '0')}-${endDate.getFullYear()}`

  let year = startDate.getTime() === endDate.getTime()
    ? startDate.getFullYear()
    : `${startDate.getFullYear()} to ${endDate.getFullYear()}`;

  let service = reportType === "HSE" ? "HSE Audit" : "Electrical Audit"
  

const GenerateCoverpage = async (setCoverImage, client, service, location, date, reportType) => {
  const container = document.createElement("div");
 container.style.width = "850px"; // A4 width in pixels
    container.style.height = "1123px"; // A4 height in pixels
  container.style.position = "absolute";
  container.style.background = "#fff";

  // Insert cover + text overlays
  container.innerHTML = `
    <div style="width:100%; height:100%; position:relative;">
      <img src="${reportType === "HSE" ? HSE_Cover_New : Electrical_Cover_New}" 
           style="width:100%; height:100%; object-fit:cover;" />

      <!-- Dynamic text placeholders -->
      <div style="position:absolute; top:585px; left:140px; font-size:22px; font-family:Montserrat; color:#307268;">
        ${client || ""}
      </div>
      <div style="position:absolute; top:630px; left:170px; font-size:22px; font-family:Montserrat; color:#307268;">
      ${location || ""}
      </div>
      <div style="position:absolute; top:676px; left:150px; font-size:22px; font-family:Montserrat; color:#307268;">
      ${service || ""}
      </div>
      <div style="position:absolute; top:725px; left:122px; font-size:18px; font-family:Montserrat; color:#307268;">
        ${date || ""}
      </div>
    </div>
  `;

  document.body.appendChild(container);

  // Convert to canvas
  const canvas = await html2canvas(container);
  const base64Image = canvas.toDataURL("image/png");

  document.body.removeChild(container); // cleanup

  setCoverImage(base64Image);
};

const GenerateCoverpageForHSE = async (setCoverImageHSE, client, service, location, date, reportType) => {
  const container = document.createElement("div");
  container.style.width = "1754px";   // A4 width in pixels
  container.style.height = "1240px"; // A4 height in pixels
  container.style.position = "absolute";
  container.style.background = "#fff";

  // Insert cover + text overlays
  container.innerHTML = `
    <div style="width:100%; height:100%; position:relative;">
      <img src="${reportType === "HSE" ? HSE_Cover_New : Electrical_Cover_New}" 
           style="width:100%; height:100%; object-fit:cover;" />

      <!-- Dynamic text placeholders -->
      <div style="position:absolute; top:550px; left:210px; font-size:30px; font-family:Montserrat; color:#307268;">
        ${client || ""}
      </div>
      <div style="position:absolute; top:642px; left:210px; font-size:30px; font-family:Montserrat; color:#307268;">
        ${service || ""}
      </div>
      <div style="position:absolute; top:733px; left:210px; font-size:30px; font-family:Montserrat; color:#307268;">
        ${location || ""}
      </div>
      <div style="position:absolute; top:825px; left:176px; font-size:30px; font-family:Montserrat; color:#307268;">
        ${date || ""}
      </div>
    </div>
  `;

  document.body.appendChild(container);

  // Convert to canvas
  const canvas = await html2canvas(container);
  const base64Image = canvas.toDataURL("image/png");

  document.body.removeChild(container); // cleanup

  setCoverImageHSE(base64Image);
};


  useEffect(() => {
    fetchImage();
    fetchBase64Images();
    GenerateCoverpage(setCoverImage, selectedOrganization.label, service, selectedSite.label, date, reportType, year)
    GenerateCoverpageForHSE(setCoverImageHSE, selectedOrganization.label, service, selectedSite.label, date, reportType, year)

    // GenerateCoverpage(setCoverImage, reportType);
  }, []);

  const fetchImage = async () => {
    // const base64Image = await imageToBase64(reportType==="HSE"?HSE_Cover:Electrical_Cover);
    // setCoverImage(base64Image);
    const base64logo = await imageToBase64(logo)
    setBase64Logo(base64logo)
  };

  const fetchBase64Images = async () => {
    try {
      setLoading(true);
      const selectedObsCopyWithImages = await Promise.all(selectedObservations.map(async observation => {
        let images = [];
        if (observation.imageUrls && observation.imageUrls.length > 0) {
          images = await Promise.all(observation.imageUrls.map(async imageUrl => {
            try {
              const response = await axios.get(`${config.PATH}/api/image-to-base64?imageUrl=${encodeURIComponent(imageUrl)}`);
              return response.data; // Assuming the backend returns base64-encoded images
            } catch (error) {
              console.error(`Error fetching image from ${imageUrl}:`, error.message);
              return null;
            }
          }));
        }
        return { ...observation, imageUrls: images };
      }));
      setSelectedObsCopy(selectedObsCopyWithImages);
    } catch (error) {
      console.error("Error fetching base64 images:", error.message);
    } finally {
      setLoading(false);
    }
  };

  function convertCmToTwip(cm) {
    return cm * 38.00;
  }

  const   createWordDocument = () => {
    try {

   //Working paragraph of backgroundbrief
    const backgroundBriefParagraph3=convertHtmlToParagraphs(backgroundBrief);
    const contentParagraph3=convertHtmlToParagraphs(contents);
    const executiveSummaryParagraph3=convertHtmlToParagraphs(exeSummary);
    const theWayForwardParagraph3=convertHtmlToParagraphs(theWayForward);
    const conclusionParagraph3=convertHtmlToParagraphs(conclusion);
    const introductionParagraph3= convertHtmlToParagraphs(introduction);
    const bestPracticeParagraph3=convertHtmlToParagraphs(bestPractice);
    const improvementOpportunityParagraph3=convertHtmlToParagraphsForImprovementOpportunityAreas(improvementOpportunityAreas);
    const overallAssessmentParagraph3=convertHtmlToParagraphs(overallAssessmentIndicator);
    const classificationOfAuditObservationsParagraph3=convertHtmlToParagraphs(classificationOfAuditObservations)
    const auditScoreAnalysisParagraph3=convertHtmlToParagraphs(auditScoreAnalysis)
    // console.log("data before",overallAssessmentEditor)
    // console.log("odata",overallAssessmentParagraph3)

      
      const otherDetailsParagraphs = otherDetails && otherDetails
        .split("\n")
        .map((text) => new Paragraph({ children: [new TextRun(text)] }));
//       const disclaimer = `This report is based on information provided to us and our own observations during the audit. We have conducted
// the audit in accordance with generally accepted auditing standards. This report is provided for informational purposes only and
// should not be relied upon as a complete representation of the Safety of the organization's information systems. By using this
// information, you agree that Momentum shall be held harmless in any event.`
      const disclaimer = `This report is based on information provided and observations made during the audit. It is for informational purposes only and does not guarantee complete compliance or absolute safety. The organization is responsible for implementing corrective measures suggested in the audit report. By using this information, you agree that Momentum shall not be held responsible for any untoward events.`
      const doc = new Document({
         styles: {
    default: {
      document: {
        run: {
          font: "Montserrat",
        },
      },
    },
  },
        sections: [
        // for electrical coverpage
...(reportType!="HSE" ?[
    {
            properties: {
              page: {
                  orientation: PageOrientation.PORTRAIT,
    // size: {
    //   width: 16838,   // A4 Landscape width (29.7 cm)
    //   height: 11906,  // A4 Landscape height (21 cm)
    // },
                pageNumbers: {
                  start: 0
                },
                margin:{
                  top:0,right:0,left:0,bottom:0
                }
              },
            },

            children: [
              coverImage &&
              new Paragraph({
                children: [
                  new ImageRun({
                    data: coverImage,
                    transformation: {
                      width: convertCmToTwip(21),  // A4 width in cm
                      height: convertCmToTwip(29.7), 
                    },
                    floating: {
                      horizontalPosition: {
                        relative: "page",
                        offset: 0,
                      },
                      verticalPosition: {
                        relative: "page",
                        offset: 0,
                      },
                      // behindDocument: true, // Image behind text
                    },
                  }),
                ],
              }),
            ],
          },

]:[]

),


//for hse coverpage
...(reportType==="HSE" ?[
  {
            properties: {
              page: {
                  orientation: PageOrientation.PORTRAIT,
    size: {
      width: 16838,   // A4 Landscape width (29.7 cm)
      height: 11906,  // A4 Landscape height (21 cm)
    },
                pageNumbers: {
                  start: 0
                },
                margin:{
                  top:0,right:0,left:0,bottom:0
                }
              },
            },

            children: [
              coverImageHSE &&
              new Paragraph({
                children: [
                  new ImageRun({
                    data: coverImageHSE,
                    transformation: {
                      width: convertCmToTwip(29.7),  // A4 width in cm
                      height: convertCmToTwip(21), // A4 height in cm
                    },
                    floating: {
                      horizontalPosition: {
                        relative: "page",
                        offset: 0,
                      },
                      verticalPosition: {
                        relative: "page",
                        offset: 0,
                      },
                      // behindDocument: true, // Image behind text
                    },
                  }),
                ],
              }),
            ],
          },
] :[]

),

          // backgroundBrief for electrical report
       ...(reportType !== "HSE"
  ? [
          {
            properties: {
              page: {
                orientation: PageOrientation.PORTRAIT,
      // size: {
      //   width: 16838,   // 29.7 cm
      //   height: 11906,  // 21 cm
      // },
                margin: {
                  top: 500,
                  left: 500,
                  right: 500
                },
                pageNumbers: {
                  start: 1,
                  formatType: NumberFormat.DECIMAL,
              },
              }
            },


            children: [
              new Table({
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        width: {
                          size: 100,
                          type: WidthType.PERCENTAGE,
                        },
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: ``,
                                size: 30,
                                font: "Montserrat",
                                color: "#ffffff", // Adjust text color for visibility
                              }),
                            ],
                          }),
                        ],
                        verticalAlign: "center",
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new ImageRun({
                                data: base64logo,
                                transformation: {
                                  width: 120,
                                  height: 40,
                                },
                              }),
                            ],
                          }),
                        ],
                        verticalAlign: "center",
                      }),
                    ],
                    tableHeader: true,

                  }),
                ],
                width: {
                  size: 100,
                  type: WidthType.PERCENTAGE,
                },
                borders: {
                  top: { style: BorderStyle.NONE },
                  bottom: { style: BorderStyle.NONE },
                  left: { style: BorderStyle.NONE },
                  right: { style: BorderStyle.NONE },
                  insideHorizontal: { style: BorderStyle.NONE },
                  insideVertical: { style: BorderStyle.NONE },
                },
              }),
              new Paragraph({
                children: [new TextRun("")],
                break: 1,
              }),
              new Table({
  rows: [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 100, type: WidthType.PERCENTAGE },
          margins: {
            left: 800,   // ~1 inch left gap
            right: 800,  // ~1 inch right gap
          },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          children: [
            // Heading
            new Paragraph({
              children: [
                new TextRun({
                  text: "DOCUMENT HISTORY",
                  font: "Montserrat",
                  color: "#307268",
                  size: 25,
                  bold: true,
                }),
              ],
              break: 1,
            }),

            new Paragraph({ break: 1 }), // line break after heading

            // Table inside the same margin box
            new Table({
              width: { size: "100%", type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                         shading: { fill: "#efc71d" },
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [
                            new TextRun({
                              font: "Montserrat",
                              text: "PARTICULARS",
                              bold: true,
                            }),
                          ],
                          // shading: { fill: "#efc71d" },
                        }),
                      ],
                      borders: {
                        top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                        bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                        left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                        right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                      },
                    }),
                    new TableCell({
                         shading: { fill: "#efc71d" },
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [
                            new TextRun({
                              font: "Montserrat",
                              text: "DETAILS",
                              bold: true,
                            }),
                          ],
                          // shading: { fill: "#efc71d" },
                        }),
                      ],
                      borders: {
                        top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                        bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                        left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                        right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                      },
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              font: "Montserrat",
                              text: "Date of Visit",
                            }),
                          ],
                        }),
                      ],
                      borders: {
                        top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                        bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                        left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                        right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                      },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              font: "Montserrat",
                              // text:
                              //   startDate.getTime() === endDate.getTime()
                              //     ? `${startDate.getDate()}-${(startDate.getMonth() + 1)
                              //         .toString()
                              //         .padStart(2, "0")}-${startDate.getFullYear()}`
                              //     : `${startDate.getDate()}-${(startDate.getMonth() + 1)
                              //         .toString()
                              //         .padStart(2, "0")}-${startDate.getFullYear()} to ${endDate.getDate()}-${(
                              //         endDate.getMonth() + 1
                              //       )
                              //         .toString()
                              //         .padStart(2, "0")}-${endDate.getFullYear()}`,
                              text: `${startDate.getDate()}${getDaySuffix(startDate.getDate())} ${startDate.toLocaleString("en-US", { month: "short" })} ${startDate.getFullYear()}`,

                            }),
                          ],
                        }),
                      ],
                      borders: {
                        top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                        bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                        left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                        right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                      },
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              font: "Montserrat",
                              text: "Document Prepared By",
                            }),
                          ],
                        }),
                      ],
                      borders: {
                        top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                        bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                        left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                        right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                      },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              font: "Montserrat",
                              text: name,
                            }),
                          ],
                        }),
                      ],
                      borders: {
                        top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                        bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                        left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                        right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                      },
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              font: "Montserrat",
                              text: "Date of Document Submission",
                            }),
                          ],
                        }),
                      ],
                      borders: {
                        top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                        bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                        left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                        right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                      },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              font: "Montserrat",
                              text: selectedDateTime.split("-").reverse().join("-"),
                            }),
                          ],
                        }),
                      ],
                      borders: {
                        top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                        bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                        left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                        right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                      },
                    }),
                  ],
                }),
              ],
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
                insideHorizontal: { style: BorderStyle.NONE },
                insideVertical: { style: BorderStyle.NONE },
              },
            }),
          ],
        }),
      ],
    }),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: {
    top: { style: BorderStyle.NONE },
    bottom: { style: BorderStyle.NONE },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
    insideHorizontal: { style: BorderStyle.NONE },
    insideVertical: { style: BorderStyle.NONE },
  },
}),

              new Paragraph({
                children: [new TextRun("")],
                break: 1,
              }),
              new Paragraph({
                children: [new TextRun("")],
                break: 1,
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: "BACKGROUND - PROJECT BRIEF",
                    font: "Montserrat",
                    color: "#307268",
                    size: 25,
                    bold: true
                  }),
                ],
                break: 1,
                indent:{
                  left:1000,
                  right:1000
                }
              }),
               new Paragraph({ break: 1 }),
             new Table({
  rows: [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 100, type: WidthType.PERCENTAGE },
          margins: {
            left: 800,  // 1 inch left gap
            right: 800, // 1 inch right gap
          },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          children: [
            // Inner table with yellow background
            new Table({
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      shading: {
                        type: "clear",
                        color: "auto",
                        fill: "fff8dc", // Light cream-yellow background
                      },
                      margins: {
                        top: 200,    // padding inside yellow box
                        bottom: 200,
                        left: 200,
                        right: 200,
                      },
                      borders: {
                        top: { style: BorderStyle.NONE },
                        bottom: { style: BorderStyle.NONE },
                        left: { style: BorderStyle.NONE },
                        right: { style: BorderStyle.NONE },
                      },
                      children: [
                        ...backgroundBriefParagraph3, 
                      ],
                    }),
                  ],
                }),
              ],
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
                insideHorizontal: { style: BorderStyle.NONE },
                insideVertical: { style: BorderStyle.NONE },
              },
            }),
          ],
        }),
      ],
    }),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: {
    top: { style: BorderStyle.NONE },
    bottom: { style: BorderStyle.NONE },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
    insideHorizontal: { style: BorderStyle.NONE },
    insideVertical: { style: BorderStyle.NONE },
  },
}),
              new Paragraph({ break: 1 }), // Optional, you can customize the space
         

new Table({
  rows: [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 100, type: WidthType.PERCENTAGE },
          margins: {
            left: 800,   // 1 inch left gap
            right: 800,  // 1 inch right gap
          },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Disclaimer:",
                  font: "Montserrat",
                  color: "#307268",
                  bold: true,
                  size: 18,
                  italics: true,
                }),
              ],
              break: 1,
            }), 
            new Paragraph({
              children: [
                new TextRun({
                  text: disclaimer, // your dynamic disclaimer text
                  font: "Montserrat",
                  size: 18,
                  italics: true,
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: {
    top: { style: BorderStyle.NONE },
    bottom: { style: BorderStyle.NONE },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
    insideHorizontal: { style: BorderStyle.NONE },
    insideVertical: { style: BorderStyle.NONE },
  },
}),


            ],
          },
 ]
  : []),
  // unserstanding reports for HSE
...(reportType== "HSE" ? [
   {
            properties: {
              page: {
                orientation: PageOrientation.PORTRAIT,
      // size: {
      //   width: 16838,   // 29.7 cm
      //   height: 11906,  // 21 cm
      // },
                margin: {
                  top: 500,
                  left: 500,
                  right: 500
                }
              }
            },
            children: [
              new Table({
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        width: {
                          size: 100, // Adjust width as needed
                          type: WidthType.PERCENTAGE,
                        },
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: ``,
                                size: 30,
                                font: "Montserrat",
                                color: "#ffffff", // Adjust text color for visibility
                              }),
                            ],
                          }),
                        ],
                        // shading: {
                        //   fill: "#02075d",
                        // },
                        verticalAlign: "center",
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new ImageRun({
                                data: base64logo,
                                transformation: {
                                  width: 120,
                                  height: 40,
                                },
                              }),
                            ],
                          }),
                        ],
                        verticalAlign: "center",
                      }),
                    ],
                    tableHeader: true,
                  }),
                ],
                width: {
                  size: 100,
                  type: WidthType.PERCENTAGE,
                },
                borders: {
                  top: { style: BorderStyle.NONE },
                  bottom: { style: BorderStyle.NONE },
                  left: { style: BorderStyle.NONE },
                  right: { style: BorderStyle.NONE },
                  insideHorizontal: { style: BorderStyle.NONE },
                  insideVertical: { style: BorderStyle.NONE },
                },
              }),
              new Paragraph({
                children: [new TextRun("")],
                break: 1
              }),
              new Table({
  rows: [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 100, type: WidthType.PERCENTAGE },
          margins: {
            left: 800,   // 1 inch left gap
            right: 800,  // 1 inch right gap
          },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "UNDERSTANDING THE REVIEW REPORT",
                  font: "Montserrat",
                  color: "#307268",
                  size: 25,
                  bold: true,
                }),
              ],
              break: 1,
            }),
            new Paragraph({ break: 1 }), // line break
            ...contentParagraph3,        // your content with same left/right spacing
          ],
        }),
      ],
    }),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: {
    top: { style: BorderStyle.NONE },
    bottom: { style: BorderStyle.NONE },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
    insideHorizontal: { style: BorderStyle.NONE },
    insideVertical: { style: BorderStyle.NONE },
  },
}),

new Table({
  rows: [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 100, type: WidthType.PERCENTAGE },
          margins: {
            left: 800,   // 1 inch left gap
            right: 800,  // 1 inch right gap
          },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Disclaimer:",
                  font: "Montserrat",
                  color: "#307268",
                  bold: true,
                  size: 18,
                  italics: true,
                }),
              ],
              break: 1,
            }), 
            new Paragraph({
              children: [
                new TextRun({
                  text: disclaimer, // your dynamic disclaimer text
                  font: "Montserrat",
                  size: 18,
                  italics: true,
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: {
    top: { style: BorderStyle.NONE },
    bottom: { style: BorderStyle.NONE },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
    insideHorizontal: { style: BorderStyle.NONE },
    insideVertical: { style: BorderStyle.NONE },
  },
}),

            ],
          },]:[]),
   

  // audit description for HSE
// ...(reportType === "HSE"
//   ? [
//       {
//         properties: {
//           page: {
//             orientation: PageOrientation.PORTRAIT,
//             // size: {
//             //   width: 16838, // A4 landscape (29.7cm)
//             //   height: 11906, // 21cm
//             // },
//             margin: {
//               top: 500,
//               left: 500,
//               right: 500,
//             },
//           },
//         },
//         children: [
//           // ===== HEADER ROW (LOGO) =====
//           new Table({
//             rows: [
//               new TableRow({
//                 children: [
//                   new TableCell({
//                     width: { size: 100, type: WidthType.PERCENTAGE },
//                     borders: {
//                       top: { style: BorderStyle.NONE },
//                       bottom: { style: BorderStyle.NONE },
//                       left: { style: BorderStyle.NONE },
//                       right: { style: BorderStyle.NONE },
//                     },
//                     children: [new Paragraph({ children: [new TextRun("")] })],
//                   }),
//                   new TableCell({
//                     borders: {
//                       top: { style: BorderStyle.NONE },
//                       bottom: { style: BorderStyle.NONE },
//                       left: { style: BorderStyle.NONE },
//                       right: { style: BorderStyle.NONE },
//                     },
//                     children: [
//                       new Paragraph({
//                         children: [
//                           new ImageRun({
//                             data: base64logo,
//                             transformation: { width: 120, height: 40 },
//                           }),
//                         ],
//                       }),
//                     ],
//                     verticalAlign: "center",
//                   }),
//                 ],
//               }),
//             ],
//             width: { size: 100, type: WidthType.PERCENTAGE },
//             borders: {
//               top: { style: BorderStyle.NONE },
//               bottom: { style: BorderStyle.NONE },
//               left: { style: BorderStyle.NONE },
//               right: { style: BorderStyle.NONE },
//               insideHorizontal: { style: BorderStyle.NONE },
//               insideVertical: { style: BorderStyle.NONE },
//             },
//           }),

//           new Paragraph({ children: [new TextRun("")], break: 1 }),

//           // ===== OUTER WRAPPER TABLE FOR LEFT SPACING =====
//           new Table({
//             rows: [
//               new TableRow({
//                 children: [
//                   new TableCell({
//                     width: { size: 100, type: WidthType.PERCENTAGE },
//                     margins: { left: 800,    right: 800 },
//                     borders: {
//                       top: { style: BorderStyle.NONE },
//                       bottom: { style: BorderStyle.NONE },
//                       left: { style: BorderStyle.NONE },
//                       right: { style: BorderStyle.NONE },
//                     },
//                     children: [
//                       // ===== HEADING =====
//                       new Paragraph({
//                         children: [
//                           new TextRun({
//                             text: "Audit Description ",
//                             bold: true,
//                             font: "Montserrat",
//                             color: "#307268",
//                             size: 26,
//                           }),
//                           new TextRun({
//                             text: "(It changes based on the audit)",
//                             font: "Montserrat",
//                             color: "#555555",
//                             size: 22,
//                           }),
//                         ],
//                         spacing: { after: 200 },
//                       }),

//                       // ===== INNER TABLE (YELLOW LEFT COLUMN) =====
//                       new Table({
//                         width: { size: 100, type: WidthType.PERCENTAGE },
//                         borders: {
//                           top: { style: BorderStyle.SINGLE, size: 1 },
//                           bottom: { style: BorderStyle.SINGLE, size: 1 },
//                           left: { style: BorderStyle.SINGLE, size: 1 },
//                           right: { style: BorderStyle.SINGLE, size: 1 },
//                           insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
//                           insideVertical: { style: BorderStyle.SINGLE, size: 1 },
//                         },
//                         rows: [
//                           ["Client", selectedOrganization?.label || "N/A"],
//                           ["Location", selectedSite?.label || "N/A"],
//                           [
//                             "Date of Site Visit",
//                             startDate
//                               ? new Date(startDate).toLocaleDateString("en-GB")
//                               : "N/A",
//                           ],
//                           ["Study", "HSE Audit Report"],
//                           [
//                             "Time of Audit (From & To)",
//                             timeFrom && timeTo
//                               ? `${timeFrom.slice(0, 5)} to ${timeTo.slice(
//                                   0,
//                                   5
//                                 )} (Date wise breakup)`
//                               : "N/A",
//                           ],
//                           [
//                             "Brief Property Description",
//                             briefPropertyDescription || "N/A",
//                           ],
//                           ["Number of floors", numOfFloors || "N/A"],
//                           [
//                             "Average Staff Footfall",
//                             avgStaffFootfall || "N/A",
//                           ],
//                           [
//                             "No Objection Certificate:",
//                             noObjectionCertificate || "N/A",
//                           ],
//                           [
//                             "National Building Code Category",
//                             nationalBuildingCodeCategory || "N/A",
//                           ],
//                           [
//                             "Coordinating Person – Client Side",
//                             coordinationgPersonClientside || "N/A",
//                           ],
//                           ["Report Prepared By", reportPreparedBy || "N/A"],
//                           ["Report Reviewed By", reportReviewedBy || "N/A"],
//                           [
//                             "Date of Submission of Report",
//                             endDate
//                               ? new Date(endDate).toLocaleDateString("en-GB")
//                               : "N/A",
//                           ],
//                         ].map(
//                           ([label, value]) =>
//                             new TableRow({
//                               children: [
//                                 new TableCell({
//                                   width: {
//                                     size: 40,
//                                     type: WidthType.PERCENTAGE,
//                                   },
//                                   shading: { fill: "FFF7D7" }, // light yellow
//                                   margins: {
//                                     top: 100,
//                                     bottom: 100,
//                                     left: 150,
//                                     right: 150,
//                                   },
//                                   children: [
//                                     new Paragraph({
//                                       children: [
//                                         new TextRun({
//                                           text: label,
//                                           bold: true,
//                                           font: "Montserrat",
//                                           size: 22,
//                                         }),
//                                       ],
//                                     }),
//                                   ],
//                                 }),
//                                 new TableCell({
//                                   width: {
//                                     size: 60,
//                                     type: WidthType.PERCENTAGE,
//                                   },
//                                   margins: {
//                                     top: 100,
//                                     bottom: 100,
//                                     left: 150,
//                                     right: 150,
//                                   },
//                                   children: [
//                                     new Paragraph({
//                                       children: [
//                                         new TextRun({
//                                           text: value,
//                                           font: "Montserrat",
//                                           size: 22,
//                                         }),
//                                       ],
//                                     }),
//                                   ],
//                                 }),
//                               ],
//                             })
//                         ),
//                       }),
//                     ],
//                   }),
//                 ],
//               }),
//             ],
//             width: { size: 100, type: WidthType.PERCENTAGE },
//             borders: {
//               top: { style: BorderStyle.NONE },
//               bottom: { style: BorderStyle.NONE },
//               left: { style: BorderStyle.NONE },
//               right: { style: BorderStyle.NONE },
//               insideHorizontal: { style: BorderStyle.NONE },
//               insideVertical: { style: BorderStyle.NONE },
//             },
//           }),
//         ],
//       },
//     ]
//   : []),
...(reportType === "HSE"
  ? [
      {
        properties: {
          page: {
            orientation: PageOrientation.PORTRAIT,
            // size: {
            //   width: 16838, // A4 landscape (29.7cm)
            //   height: 11906, // 21cm
            // },
            margin: {
              top: 500,
              left: 500,
              right: 500,
            },
          },
        },
        children: [
          // ===== HEADER ROW (LOGO) =====
          new Table({
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                    children: [new Paragraph({ children: [new TextRun("")] })],
                  }),
                  new TableCell({
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new ImageRun({
                            data: base64logo,
                            transformation: { width: 120, height: 40 },
                          }),
                        ],
                      }),
                    ],
                    verticalAlign: "center",
                  }),
                ],
              }),
            ],
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE },
              insideVertical: { style: BorderStyle.NONE },
            },
          }),

          new Paragraph({ children: [new TextRun("")], break: 1 }),

          // ===== OUTER WRAPPER TABLE FOR LEFT SPACING =====
// ===== OUTER WRAPPER WITH HEADING ABOVE TABLE (Portrait A4 Safe) =====
new Table({
  layout: TableLayoutType.FIXED, // keep everything absolute, not relative
  width: { size: 10900, type: WidthType.DXA }, // fits within portrait page after margins
  borders: {
    top: { style: BorderStyle.NONE },
    bottom: { style: BorderStyle.NONE },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
    insideHorizontal: { style: BorderStyle.NONE },
    insideVertical: { style: BorderStyle.NONE },
  },
  rows: [
    // ===== HEADING ROW =====
    new TableRow({
      children: [
        new TableCell({
          width: { size: 10900, type: WidthType.DXA },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          children: [
            new Paragraph({
              alignment: AlignmentType.LEFT,
              spacing: { after: 200 },
              children: [
                new TextRun({
                  text: "Audit Description ",
                  bold: true,
                  font: "Montserrat",
                  color: "#307268",
                  size: 28,
                }),
                new TextRun({
                  text: "(It changes based on the audit)",
                  font: "Montserrat",
                  color: "#555555",
                  size: 22,
                }),
              ],
            }),
          ],
        }),
      ],
    }),

    // ===== TABLE ROW CONTAINING THE INNER FIXED TWO-COLUMN TABLE =====
    new TableRow({
      children: [
        new TableCell({
          width: { size: 10900, type: WidthType.DXA },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          children: [
            // ===== INNER FIXED TWO-COLUMN TABLE =====
            new Table({
              layout: TableLayoutType.FIXED, // disables Word auto-fit
              width: { size: 10900, type: WidthType.DXA }, // fits inside portrait printable width
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1 },
                bottom: { style: BorderStyle.SINGLE, size: 1 },
                left: { style: BorderStyle.SINGLE, size: 1 },
                right: { style: BorderStyle.SINGLE, size: 1 },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
                insideVertical: { style: BorderStyle.SINGLE, size: 1 },
              },
              rows: [
                // === Optional Header Row ===
                // new TableRow({
                //   children: [
                //     new TableCell({
                //       shading: { fill: "#307268" },
                //       width: { size: 3500, type: WidthType.DXA },
                //       verticalAlign: VerticalAlign.CENTER,
                //       children: [
                //         new Paragraph({
                //           alignment: AlignmentType.CENTER,
                //           children: [
                //             new TextRun({
                //               text: "Description",
                //               bold: true,
                //               color: "#FFFFFF",
                //               size: 20,
                //               font: "Montserrat",
                //             }),
                //           ],
                //         }),
                //       ],
                //     }),
                //     new TableCell({
                //       shading: { fill: "#307268" },
                //       width: { size: 7400, type: WidthType.DXA },
                //       verticalAlign: VerticalAlign.CENTER,
                //       children: [
                //         new Paragraph({
                //           alignment: AlignmentType.CENTER,
                //           children: [
                //             new TextRun({
                //               text: "Details",
                //               bold: true,
                //               color: "#FFFFFF",
                //               size: 20,
                //               font: "Montserrat",
                //             }),
                //           ],
                //         }),
                //       ],
                //     }),
                //   ],
                // }),

                // === Body Rows ===
                ...[
                  ["Client", selectedOrganization?.label || "N/A"],
                  ["Location", selectedSite?.label || "N/A"],
                  [
                    "Date of Site Visit",
                    startDate ? new Date(startDate).toLocaleDateString("en-GB") : "N/A",
                  ],
                  ["Study", "HSE Audit Report"],
                  [
                    "Time of Audit (From & To)",
                    timeFrom && timeTo
                      ? `${timeFrom.slice(0, 5)} to ${timeTo.slice(0, 5)} (Date wise breakup)`
                      : "N/A",
                  ],
                  ["Brief Property Description", briefPropertyDescription || "N/A"],
                  ["Number of floors", numOfFloors || "N/A"],
                  ["Average Staff Footfall", avgStaffFootfall || "N/A"],
                  ["No Objection Certificate", noObjectionCertificate || "N/A"],
                  ["National Building Code Category", nationalBuildingCodeCategory || "N/A"],
                  ["Coordinating Person – Client Side", coordinationgPersonClientside || "N/A"],
                  ["Report Prepared By", reportPreparedBy || "N/A"],
                  ["Report Reviewed By", reportReviewedBy || "N/A"],
                  [
                    "Date of Submission of Report",
                    endDate ? new Date(endDate).toLocaleDateString("en-GB") : "N/A",
                  ],
                ].map(
                  ([label, value]) =>
                    new TableRow({
                      children: [
                        // LEFT COLUMN (Label)
                        new TableCell({
                          width: { size: 3500, type: WidthType.DXA }, // fixed width
                          shading: { fill: "#FFF7D7" },
                          verticalAlign: VerticalAlign.CENTER,
                          borders: {
                            top: { style: BorderStyle.SINGLE },
                            bottom: { style: BorderStyle.SINGLE },
                            left: { style: BorderStyle.SINGLE },
                            right: { style: BorderStyle.SINGLE },
                          },
                          children: [
                            new Paragraph({
                              alignment: AlignmentType.LEFT,
                              indent: { left: 100 },
                              children: [
                                new TextRun({
                                  text: label,
                                  bold: true,
                                  font: "Montserrat",
                                  size: 22,
                                }),
                              ],
                            }),
                          ],
                        }),
                        // RIGHT COLUMN (Value)
                        new TableCell({
                          width: { size: 7400, type: WidthType.DXA },
                          verticalAlign: VerticalAlign.CENTER,
                          borders: {
                            top: { style: BorderStyle.SINGLE },
                            bottom: { style: BorderStyle.SINGLE },
                            left: { style: BorderStyle.SINGLE },
                            right: { style: BorderStyle.SINGLE },
                          },
                          children: [
                            new Paragraph({
                              alignment: AlignmentType.LEFT,
                              spacing: { line: 276 },
                              indent: { left: 100 },
                              children: [
                                new TextRun({
                                  text: value,
                                  font: "Montserrat",
                                  size: 22,
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    })
                ),
              ],
            }),
          ],
        }),
      ],
    }),
  ],
}),
        ],
      },
    ]
  : []),
     
     
  
  // classification of audit observations of HSE
   ...(reportType==="HSE" ?[
          {
            
            properties: {
              page: {
                orientation: PageOrientation.PORTRAIT,
      // size: {
      //   width: 16838,   // 29.7 cm
      //   height: 11906,  // 21 cm
      // },
                margin: {
                  top: 500,
                  left: 500,
                  right: 500
                }
              }
            },
            children: [
              new Table({
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        width: {
                          size: 100, // Adjust width as needed
                          type: WidthType.PERCENTAGE,
                        },
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: ``,
                                size: 30,
                                font: "Montserrat",
                                color: "#ffffff", // Adjust text color for visibility
                              }),
                            ],
                          }),
                        ],
                        verticalAlign: "center",
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new ImageRun({
                                data: base64logo,
                                transformation: {
                                  width: 120,
                                  height: 40,
                                },
                              }),
                            ],
                          }),
                        ],
                        verticalAlign: "center",
                      }),
                    ],
                    tableHeader: true,
                  }),
                ],
                width: {
                  size: 100,
                  type: WidthType.PERCENTAGE,
                },
                borders: {
                  top: { style: BorderStyle.NONE },
                  bottom: { style: BorderStyle.NONE },
                  left: { style: BorderStyle.NONE },
                  right: { style: BorderStyle.NONE },
                  insideHorizontal: { style: BorderStyle.NONE },
                  insideVertical: { style: BorderStyle.NONE },
                },
              }),
              new Paragraph({
                children: [new TextRun("")],
                break: 1
              }),
new Table({
  rows: [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 100, type: WidthType.PERCENTAGE },
           shading: {
            type: "clear",
            color: "auto",
          },
          margins: {
            left: 800,     // 1 inch left gap
            right: 800,  // 1 inch right gap
          },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Classification of Audit Observations",
                  font: "Montserrat",
                  color: "#307268",
                  size: 25,
                  bold: true,
                }),
              ],
              break: 1,
            }),
            new Paragraph({ break: 1 }), // line break  
          ],
        }),
      ],
    }),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: {
    top: { style: BorderStyle.NONE },
    bottom: { style: BorderStyle.NONE },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
    insideHorizontal: { style: BorderStyle.NONE },
    insideVertical: { style: BorderStyle.NONE },
  },
}), 

// Outer table for left/right spacing
new Table({
  rows: [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 100, type: WidthType.PERCENTAGE },
          margins: {
            left: 800,  // 1 inch left gap
            right: 800, // 1 inch right gap
          },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          children: [
            // Inner table with yellow background
            new Table({
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      shading: {
                        type: "clear",
                        color: "auto",
                        fill: "fff8dc", // Light cream-yellow background
                      },
                      margins: {
                        top: 200,    // padding inside yellow box
                        bottom: 200,
                        left: 200,
                        right: 200,
                      },
                      borders: {
                        top: { style: BorderStyle.NONE },
                        bottom: { style: BorderStyle.NONE },
                        left: { style: BorderStyle.NONE },
                        right: { style: BorderStyle.NONE },
                      },
                      children: [
                        ...classificationOfAuditObservationsParagraph3, 
                      ],
                    }),
                  ],
                }),
              ],
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
                insideHorizontal: { style: BorderStyle.NONE },
                insideVertical: { style: BorderStyle.NONE },
              },
            }),
          ],
        }),
      ],
    }),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: {
    top: { style: BorderStyle.NONE },
    bottom: { style: BorderStyle.NONE },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
    insideHorizontal: { style: BorderStyle.NONE },
    insideVertical: { style: BorderStyle.NONE },
  },
}),


            ],
          },
]:[]),


// Audit Objective of HSE
   ...(reportType==="HSE" ?[
          {
            
            properties: {
              page: {
                orientation: PageOrientation.PORTRAIT,
      // size: {
      //   width: 16838,   // 29.7 cm
      //   height: 11906,  // 21 cm
      // },
                margin: {
                  top: 500,
                  left: 500,
                  right: 500
                }
              }
            },
            children: [
              new Table({
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        width: {
                          size: 100, // Adjust width as needed
                          type: WidthType.PERCENTAGE,
                        },
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: ``,
                                size: 30,
                                font: "Montserrat",
                                color: "#ffffff", // Adjust text color for visibility
                              }),
                            ],
                          }),
                        ],
                        verticalAlign: "center",
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new ImageRun({
                                data: base64logo,
                                transformation: {
                                  width: 120,
                                  height: 40,
                                },
                              }),
                            ],
                          }),
                        ],
                        verticalAlign: "center",
                      }),
                    ],
                    tableHeader: true,
                  }),
                ],
                width: {
                  size: 100,
                  type: WidthType.PERCENTAGE,
                },
                borders: {
                  top: { style: BorderStyle.NONE },
                  bottom: { style: BorderStyle.NONE },
                  left: { style: BorderStyle.NONE },
                  right: { style: BorderStyle.NONE },
                  insideHorizontal: { style: BorderStyle.NONE },
                  insideVertical: { style: BorderStyle.NONE },
                },
              }),
              new Paragraph({
                children: [new TextRun("")],
                break: 1
              }),
new Table({
  rows: [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 100, type: WidthType.PERCENTAGE },
           shading: {
            type: "clear",
            color: "auto",
          },
          margins: {
            left: 800,   // 1 inch left gap
            right: 800,  // 1 inch right gap
          },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Audit Objective",
                  font: "Montserrat",
                  color: "#307268",
                  size: 25,
                  bold: true,
                }),
              ],
              break: 1,
            }),
            new Paragraph({ break: 1 }), // line break  
          ],
        }),
      ],
    }),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: {
    top: { style: BorderStyle.NONE },
    bottom: { style: BorderStyle.NONE },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
    insideHorizontal: { style: BorderStyle.NONE },
    insideVertical: { style: BorderStyle.NONE },
  },
}), 

// Outer table for left/right spacing
new Table({
  rows: [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 100, type: WidthType.PERCENTAGE },
          margins: {
            left: 800,  // 1 inch left gap
            right: 800, // 1 inch right gap
          },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          children: [
            // Inner table with yellow background
            new Table({
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      shading: {
                        type: "clear",
                        color: "auto",
                        fill: "fff8dc", // Light cream-yellow background
                      },
                      margins: {
                        top: 200,    // padding inside yellow box
                        bottom: 200,
                        left: 200,
                        right: 200,
                      },
                      borders: {
                        top: { style: BorderStyle.NONE },
                        bottom: { style: BorderStyle.NONE },
                        left: { style: BorderStyle.NONE },
                        right: { style: BorderStyle.NONE },
                      },
                      children: [
                        ...backgroundBriefParagraph3, 
                      ],
                    }),
                  ],
                }),
              ],
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
                insideHorizontal: { style: BorderStyle.NONE },
                insideVertical: { style: BorderStyle.NONE },
              },
            }),
          ],
        }),
      ],
    }),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: {
    top: { style: BorderStyle.NONE },
    bottom: { style: BorderStyle.NONE },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
    insideHorizontal: { style: BorderStyle.NONE },
    insideVertical: { style: BorderStyle.NONE },
  },
}),


            ],
          },
]:[]),

   // executive summary for HSE
   ...(reportType==="HSE" ?[
          {
            
            properties: {
              page: {
                orientation: PageOrientation.PORTRAIT,
      // size: {
      //   width: 16838,   // 29.7 cm
      //   height: 11906,  // 21 cm
      // },
                margin: {
                  top: 500,
                  left: 500,
                  right: 500
                }
              }
            },
            children: [
              new Table({
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        width: {
                          size: 100, // Adjust width as needed
                          type: WidthType.PERCENTAGE,
                        },
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: ``,
                                size: 30,
                                font: "Montserrat",
                                color: "#ffffff", // Adjust text color for visibility
                              }),
                            ],
                          }),
                        ],
                        verticalAlign: "center",
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new ImageRun({
                                data: base64logo,
                                transformation: {
                                  width: 120,
                                  height: 40,
                                },
                              }),
                            ],
                          }),
                        ],
                        verticalAlign: "center",
                      }),
                    ],
                    tableHeader: true,
                  }),
                ],
                width: {
                  size: 100,
                  type: WidthType.PERCENTAGE,
                },
                borders: {
                  top: { style: BorderStyle.NONE },
                  bottom: { style: BorderStyle.NONE },
                  left: { style: BorderStyle.NONE },
                  right: { style: BorderStyle.NONE },
                  insideHorizontal: { style: BorderStyle.NONE },
                  insideVertical: { style: BorderStyle.NONE },
                },
              }),
              new Paragraph({
                children: [new TextRun("")],
                break: 1
              }),
new Table({
  rows: [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 100, type: WidthType.PERCENTAGE },
           shading: {
            type: "clear",
            color: "auto",
          },
          margins: {
            left: 800,   // 1 inch left gap
            right: 800,  // 1 inch right gap
          },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Executive Summary",
                  font: "Montserrat",
                  color: "#307268",
                  size: 25,
                  bold: true,
                }),
              ],
              break: 1,
            }),
            new Paragraph({ break: 1 }), // line break  
          ],
        }),
      ],
    }),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: {
    top: { style: BorderStyle.NONE },
    bottom: { style: BorderStyle.NONE },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
    insideHorizontal: { style: BorderStyle.NONE },
    insideVertical: { style: BorderStyle.NONE },
  },
}), 

// Outer table for left/right spacing
new Table({
  rows: [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 100, type: WidthType.PERCENTAGE },
          margins: {
            left: 800,  // 1 inch left gap
            right: 800, // 1 inch right gap
          },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          children: [
            // Inner table with yellow background
            new Table({
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      shading: {
                        type: "clear",
                        color: "auto",
                        fill: "fff8dc", // Light cream-yellow background
                      },
                      margins: {
                        top: 200,    // padding inside yellow box
                        bottom: 200,
                        left: 200,
                        right: 200,
                      },
                      borders: {
                        top: { style: BorderStyle.NONE },
                        bottom: { style: BorderStyle.NONE },
                        left: { style: BorderStyle.NONE },
                        right: { style: BorderStyle.NONE },
                      },
                      children: [
                        ...executiveSummaryParagraph3, 
                      ],
                    }),
                  ],
                }),
              ],
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
                insideHorizontal: { style: BorderStyle.NONE },
                insideVertical: { style: BorderStyle.NONE },
              },
            }),
          ],
        }),
      ],
    }),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: {
    top: { style: BorderStyle.NONE },
    bottom: { style: BorderStyle.NONE },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
    insideHorizontal: { style: BorderStyle.NONE },
    insideVertical: { style: BorderStyle.NONE },
  },
}),


            ],
          },
]:[]),
//Audit score analysis of HSE
   ...(reportType==="HSE" ?[
          {
            
            properties: {
              page: {
                orientation: PageOrientation.PORTRAIT,
      // size: {
      //   width: 16838,   // 29.7 cm
      //   height: 11906,  // 21 cm
      // },
                margin: {
                  top: 500,
                  left: 500,
                  right: 500
                }
              }
            },
            children: [
              new Table({
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        width: {
                          size: 100, // Adjust width as needed
                          type: WidthType.PERCENTAGE,
                        },
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: ``,
                                size: 30,
                                font: "Montserrat",
                                color: "#ffffff", // Adjust text color for visibility
                              }),
                            ],
                          }),
                        ],
                        verticalAlign: "center",
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new ImageRun({
                                data: base64logo,
                                transformation: {
                                  width: 120,
                                  height: 40,
                                },
                              }),
                            ],
                          }),
                        ],
                        verticalAlign: "center",
                      }),
                    ],
                    tableHeader: true,
                  }),
                ],
                width: {
                  size: 100,
                  type: WidthType.PERCENTAGE,
                },
                borders: {
                  top: { style: BorderStyle.NONE },
                  bottom: { style: BorderStyle.NONE },
                  left: { style: BorderStyle.NONE },
                  right: { style: BorderStyle.NONE },
                  insideHorizontal: { style: BorderStyle.NONE },
                  insideVertical: { style: BorderStyle.NONE },
                },
              }),
              new Paragraph({
                children: [new TextRun("")],
                break: 1
              }),
new Table({
  rows: [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 100, type: WidthType.PERCENTAGE },
           shading: {
            type: "clear",
            color: "auto",
          },
          margins: {
            left: 800,   // 1 inch left gap
            right: 800,  // 1 inch right gap
          },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text:"Audit Score Analysis",
                  font: "Montserrat",
                  color: "#307268",
                  size: 25,
                  bold: true,
                }),
              ],
              break: 1,
            }),
            new Paragraph({ break: 1 }), // line break  
          ],
        }),
      ],
    }),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: {
    top: { style: BorderStyle.NONE },
    bottom: { style: BorderStyle.NONE },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
    insideHorizontal: { style: BorderStyle.NONE },
    insideVertical: { style: BorderStyle.NONE },
  },
}), 

// Outer table for left/right spacing
new Table({
  rows: [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 100, type: WidthType.PERCENTAGE },
          margins: {
            left: 800,  // 1 inch left gap
            right: 800, // 1 inch right gap
          },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          children: [
            // Inner table with yellow background
            new Table({
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      shading: {
                        type: "clear",
                        color: "auto",
                        fill: "fff8dc", // Light cream-yellow background
                      },
                      margins: {
                        top: 200,    // padding inside yellow box
                        bottom: 200,
                        left: 200,
                        right: 200,
                      },
                      borders: {
                        top: { style: BorderStyle.NONE },
                        bottom: { style: BorderStyle.NONE },
                        left: { style: BorderStyle.NONE },
                        right: { style: BorderStyle.NONE },
                      },
                      children: [
                        ...auditScoreAnalysisParagraph3, 
                      ],
                    }),
                  ],
                }),
              ],
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
                insideHorizontal: { style: BorderStyle.NONE },
                insideVertical: { style: BorderStyle.NONE },
              },
            }),
          ],
        }),
      ],
    }),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: {
    top: { style: BorderStyle.NONE },
    bottom: { style: BorderStyle.NONE },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
    insideHorizontal: { style: BorderStyle.NONE },
    insideVertical: { style: BorderStyle.NONE },
  },
}),


            ],
          },
]:[]),

   // improvement opportunity areas for HSE
       ...(reportType == "HSE"
  ? [
          {
            
            properties: {
              // type: SectionType.CONTINUOUS,
              page: {
                orientation: PageOrientation.PORTRAIT,
      // size: {
      //   width: 16838,   // 29.7 cm
      //   height: 11906,  // 21 cm
      // },
                margin: {
                  top: 500,
                  left: 500,
                  right: 500,
                  bottom: 500,
                }
              }
            },
            children: [
              new Table({
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        width: {
                          size: 100, // Adjust width as needed
                          type: WidthType.PERCENTAGE,
                        },
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: ``,
                                size: 30,
                                font: "Montserrat",
                                color: "#ffffff", // Adjust text color for visibility
                              }),
                            ],
                          }),
                        ],
                        verticalAlign: "center",
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new ImageRun({
                                data: base64logo,
                                transformation: {
                                  width: 120,
                                  height: 40,
                                },
                              }),
                            ],
                          }),
                        ],
                        verticalAlign: "center",
                      }),
                    ],
                    tableHeader: true,
                  }),
                ],
                width: {
                  size: 100,
                  type: WidthType.PERCENTAGE,
                },
                borders: {
                  top: { style: BorderStyle.NONE },
                  bottom: { style: BorderStyle.NONE },
                  left: { style: BorderStyle.NONE },
                  right: { style: BorderStyle.NONE },
                  insideHorizontal: { style: BorderStyle.NONE },
                  insideVertical: { style: BorderStyle.NONE },
                },
              }),
              new Paragraph({
                children: [new TextRun("")],
                break: 1
              }),
// Heading
new Table({
  rows: [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 100, type: WidthType.PERCENTAGE },
          shading: {
            type: "clear",
            color: "auto",
          },
          margins: {
            left: 800,  // 1 inch left gap
            right: 800, // 1 inch right gap
          },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Improvement Opportunity Areas",
                  font: "Montserrat",
                  color: "#307268",
                  size: 25,
                  bold: true,
                }),
              ],
            
            }),
            new Paragraph({ break: 1 }), // line break
          ],
        }),
      ],
    }),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: {
    top: { style: BorderStyle.NONE },
    bottom: { style: BorderStyle.NONE },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
    insideHorizontal: { style: BorderStyle.NONE },
    insideVertical: { style: BorderStyle.NONE },
  },
}),

// Yellow Box with content
new Table({
  rows: [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 100, type: WidthType.PERCENTAGE },
          margins: {
            left: 800,  // spacing outside yellow
            right: 800,
          },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          children: [
            new Table({
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      shading: {
                        type: "clear",
                        color: "auto",
                        fill: "fff8dc", // Light cream-yellow
                      },
                      margins: {
                        top: 200,    // padding inside yellow
                        bottom: 200,
                        left: 200,
                        right: 200,
                      },
                      borders: {
                        top: { style: BorderStyle.NONE },
                        bottom: { style: BorderStyle.NONE },
                        left: { style: BorderStyle.NONE },
                        right: { style: BorderStyle.NONE },
                      },
                      children: [
                        ...improvementOpportunityParagraph3,
                      ],
                    }),
                  ],
                }),
              ],
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
                insideHorizontal: { style: BorderStyle.NONE },
                insideVertical: { style: BorderStyle.NONE },
              },
            }),
          ],
        }),
      ],
    }),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: {
    top: { style: BorderStyle.NONE },
    bottom: { style: BorderStyle.NONE },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
    insideHorizontal: { style: BorderStyle.NONE },
    insideVertical: { style: BorderStyle.NONE },
  },
}),


            ],
          },
        ]
  : []),
    // overall risk indicator for HSE
       ...(reportType == "HSE"
  ? [
           {
            properties: {
      //  type: SectionType.CONTINUOUS,
              page: {
                orientation: PageOrientation.PORTRAIT,
      // size: {
      //   width: 16838,   // 29.7 cm
      //   height: 11906,  // 21 cm
      // },
                margin: {
                  top: 500,
                  left: 500,
                  right: 500,
                  bottom:500
                }
              }
            },
            children: [
              new Table({
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        width: {
                          size: 100, // Adjust width as needed
                          type: WidthType.PERCENTAGE,
                        },
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: ``,
                                size: 30,
                                font: "Montserrat",
                                color: "#ffffff", // Adjust text color for visibility
                              }),
                            ],
                          }),
                        ],
                        verticalAlign: "center",
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new ImageRun({
                                data: base64logo,
                                transformation: {
                                  width: 120,
                                  height: 40,
                                },
                              }),
                            ],
                          }),
                        ],
                        verticalAlign: "center",
                      }),
                    ],
                    tableHeader: true,
                  }),
                ],
                width: {
                  size: 100,
                  type: WidthType.PERCENTAGE,
                },
                borders: {
                  top: { style: BorderStyle.NONE },
                  bottom: { style: BorderStyle.NONE },
                  left: { style: BorderStyle.NONE },
                  right: { style: BorderStyle.NONE },
                  insideHorizontal: { style: BorderStyle.NONE },
                  insideVertical: { style: BorderStyle.NONE },
                },
              }),
              new Paragraph({
                children: [new TextRun("")],
                break: 1
              }),
             // Heading
new Paragraph({
  children: [
    new TextRun({
      text: "Overall Risk Assessment Indicator",
      font: "Montserrat",
      color: "#307268",
      size: 25,
      bold: true,
    }),
  ],
  spacing: {
    after: 200, // space after paragraph
  },
  indent: {
    left: 800,   // left indentation (~0.7 inch)

  },
}),


new Table({
  rows: [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 100, type: WidthType.PERCENTAGE },
          margins: { left: 800, right: 800 }, // spacing from page edges
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          children: [
            // Inner table → Left-right percentage layout
            new Table({
              rows: [
                new TableRow({
                  children: [
                    // LEFT CELL → Fixed width yellow box
                    new TableCell({
                      width: { size: 20, type: WidthType.PERCENTAGE },
                      // shading: { fill: "FFD700" },
                      shading: { fill: boxColor },
                      verticalAlign: VerticalAlign.CENTER,
                      borders: {
                        top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                        bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                        left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                        right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                      },
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [
                            new TextRun({
                              //  text: `${((cumulativeScore / 10) * 100).toFixed(2)}%`,
                                text: `30%`,
                                bold: true, size: 48
                               }),
                          ],
                        }),
                      ],
                    }),

                    // RIGHT CELL → Dynamic content
                    new TableCell({
                      width: { size: 80, type: WidthType.PERCENTAGE },
                      margins: { top: 200, bottom: 200, left: 300, right: 300 },
                      borders: {
                        top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                        bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                        left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                        right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                      },
                      children: [
                        ...overallAssessmentParagraph3, // your content here
                      ],
                    }),
                  ],
                }),
              ],
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
                insideHorizontal: { style: BorderStyle.NONE },
                insideVertical: { style: BorderStyle.NONE },
              },
            }),
          ],
        }),
      ],
    }),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: {
    top: { style: BorderStyle.NONE },
    bottom: { style: BorderStyle.NONE },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
    insideHorizontal: { style: BorderStyle.NONE },
    insideVertical: { style: BorderStyle.NONE },
  },
}),




// new Paragraph({ break: 1 }),
//   new Paragraph({
//                 children: [new TextRun("The below image is for display purpose only.")],
//                 break: 1,
//                 indent:{
//                    left:1200,
//                 }
//               }),
//               new Paragraph({ break: 1 }),
// new Table({
//   rows: [
//     new TableRow({
//       children: [
//         new TableCell({
//           children: [
//             new Paragraph({
//               alignment: AlignmentType.CENTER,
//               children: [
//                 new ImageRun({
//                   data: gaugeImageWord,
//                   transformation: {
//                     width: 800,
//                     height: 300,
//                   },
//                 }),
//               ],
//             }),
//           ],
//           // No borders property → no border lines
//           margins: { top: 0, bottom: 0, left: 0, right: 0 }, // optional: remove padding
//         }),
//       ],
//     }),
//   ],
//   width: {
//     size: 5000,
//     type: WidthType.DXA,
//   },
//   indent: {
//     size: 1000, // shifts table from left
//     type: WidthType.DXA,
//   },
//   borders: {
//     top: { style: BorderStyle.NONE },
//     bottom: { style: BorderStyle.NONE },
//     left: { style: BorderStyle.NONE },
//     right: { style: BorderStyle.NONE },
//     insideHorizontal: { style: BorderStyle.NONE },
//     insideVertical: { style: BorderStyle.NONE },
//   },
// }),

new Paragraph({ break: 1 }),
new Paragraph({ break: 1 }),
new Paragraph({
  children: [
    new TextRun({
      text: "Risk Legend",
      font: "Montserrat",
      color: "#307268",
      size: 25,
      bold: true,
    }),
  ],
  spacing: {
    after: 200, // space after paragraph
  },
  indent: {
    left: 800,   // left indentation (~0.7 inch)

  },
}),
new Paragraph({
  children: [
    new TextRun({
      // text: "The above image is for display purposes only",
      font: "Montserrat",
  
      size: 22,
      bold: false,
    }),
  ],
  spacing: {
    after: 200, // space after paragraph
  },
  indent: {
    left: 800,   // left indentation (~0.7 inch)

  },
}),
new Paragraph({ break: 1 }),
  // --- New Table: Risk Levels ---
 new Table({
  rows: [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 100, type: WidthType.PERCENTAGE },
          margins: { left: 800, right: 800 }, // spacing from page edges
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          children: [
            // Inner table → your actual risk levels table
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE }, // full width inside the cell
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              },
              rows: [
                // Header Row
                new TableRow({
                  children: ["Score Range", "Risk Level", "Interpretation"].map((text) =>
                    new TableCell({
                      shading: { fill: "#307260" },
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [
                            new TextRun({
                              text,
                              bold: true,
                              color: "#efc71d",
                              size: 24,
                            }),
                          ],
                        }),
                      ],
                    })
                  ),
                }),
                // Data Rows
               ...riskLevels.map((level) =>
  new TableRow({
    children: [
      // Score Range → colored
      new TableCell({
        margins: { top: 100, bottom: 100, left: 200, right: 200 },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: level.range,
                color: level.color, // use respective color
                size: 20, // decrease by 1 from 25
                bold:true

              }),
            ],
          }),
        ],
      }),
  
      new TableCell({
        shading: { fill: level.color },
        margins: { top: 100, bottom: 100, left: 200, right: 200 },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: level.risk,
                bold: false, // remove bold
                size: 20, // decrease by 1
                color: "#000000", // optional: black text on colored background
              }),
            ],
          }),
        ],
      }),
      // Interpretation → normal text, smaller size
      new TableCell({
        margins: { top: 100, bottom: 100, left: 200, right: 200 },
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: level.interpretation,
                size: 20, // decrease by 1
              }),
            ],
          }),
        ],
      }),
    ],
  })
),

              ],
            }),
          ],
        }),
      ],
    }),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: {
    top: { style: BorderStyle.NONE },
    bottom: { style: BorderStyle.NONE },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
    insideHorizontal: { style: BorderStyle.NONE },
    insideVertical: { style: BorderStyle.NONE },
  },
}),




            ],
            
            
          },
        ]
  : []),

  //Annexure details for HSE
...(reportType === "HSE"
  ? [
      {
        properties: {
          page: {
            orientation: PageOrientation.PORTRAIT,
            // size: {
            //   width: 16838, // A4 landscape (29.7cm)
            //   height: 11906, // 21cm
            // },
            margin: {
              top: 500,
              left: 500,
              right: 500,
            },
          },
        },
        children: [
   
          new Table({
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                     children: [
                      // new Paragraph({ children: [new TextRun("")] })
                    ],
                  }),
                  new TableCell({
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new ImageRun({
                            data: base64logo,
                            transformation: { width: 120, height: 40 },
                          }),
                        ],
                      }),
                    ],
                    verticalAlign: "center",
                  }),
                ],
              }),
            ],
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE },
              insideVertical: { style: BorderStyle.NONE },
            },
          }),

        //   new Paragraph({ children: [new TextRun("")], break: 1 }
        // ),

        
          new Paragraph({
            children: [
              new TextRun({
                text: "ANNEXURE – REFERENCES & STANDARDS",
                bold: true,
                font: "Montserrat",
                color: "#307268",
                size: 26,
              }),
            ],
            indent: {
    left: 800,   // left indentation (~0.7 inch)

  },
            spacing: { after: 300 },
          }),

       
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    margins: { left: 800, right: 1000 },
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                    children: [
                      // ===== MAIN TABLE =====
                      new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        borders: {
                          top: { style: BorderStyle.SINGLE, size: 1 },
                          bottom: { style: BorderStyle.SINGLE, size: 1 },
                          left: { style: BorderStyle.SINGLE, size: 1 },
                          right: { style: BorderStyle.SINGLE, size: 1 },
                          insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
                          insideVertical: { style: BorderStyle.SINGLE, size: 1 },
                        },
                        rows: [
                          // ===== HEADER ROW =====
                          new TableRow({
                            height: { value: 500 }, // taller header
                            children: [
                              new TableCell({
                                shading: { fill: "1E6255" }, // dark green
                                verticalAlign: VerticalAlign.CENTER,
                                children: [
                                  new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    children: [
                                      new TextRun({
                                        text: "Reference Type and Document / Standard",
                                        font: "Montserrat",
                                        color: "FFFFFF",
                                        size: 24,
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                              new TableCell({
                                shading: { fill: "1E6255" },
                                verticalAlign: VerticalAlign.CENTER,
                                children: [
                                  new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    children: [
                                      new TextRun({
                                        text: "Relevance to Audit Findings",
                                        font: "Montserrat",
                                        color: "FFFFFF",
                                        size: 24,
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),

                          // ===== DYNAMIC ROWS =====
                          // ...references.map((ref) =>
                          //   ref.type === "heading"
                          //     ? new TableRow({
                          //         children: [
                          //           new TableCell({
                          //             columnSpan: 2,
                          //             shading: { fill: "FFF7D7" }, // light yellow
                          //             children: [
                          //               new Paragraph({
                          //                 children: [
                          //                   new TextRun({
                          //                     text: ref.section_name || "",
                          //                     bold: true,
                          //                     font: "Montserrat",
                          //                     size: 20,
                          //                   }),
                          //                 ],
                          //               }),
                          //             ],
                          //           }),
                          //         ],
                          //       })
                          //     : new TableRow({
                          //         children: [
                          //           new TableCell({
                          //             children: [
                          //               new Paragraph({
                          //                 children: [
                          //                   new TextRun({
                          //                     text: ref.document || "",
                          //                     font: "Montserrat",
                          //                     size: 20,
                          //                   }),
                          //                 ],
                          //               }),
                          //             ],
                          //           }),
                          //           new TableCell({
                          //             children: [
                          //               new Paragraph({
                          //                 children: [
                          //                   new TextRun({
                          //                     text: ref.relevance || "",
                          //                     font: "Montserrat",
                          //                     size: 20,
                          //                   }),
                          //                 ],
                          //               }),
                          //             ],
                          //           }),
                          //         ],
                          //       })
                          // ),
                          ...references.map((ref) =>
  ref.type === "heading"
    ? new TableRow({
        height: { value: 250 }, // slightly taller heading row
        children: [
          new TableCell({
            columnSpan: 2,
            shading: { fill: "FFF7D7" }, // light yellow
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT, // headings left aligned
                children: [
                  new TextRun({
                    text: ref.section_name || "",
                    bold: true,
                    font: "Montserrat",
                    size: 19,
                  }),
                ],
              }),
            ],
          }),
        ],
      })
    : new TableRow({
        height: { value: 350 }, // increase data row height
        children: [
          new TableCell({
            verticalAlign: VerticalAlign.CENTER, // vertical center
            children: [
              new Paragraph({
         
                children: [
                  new TextRun({
                    text: ref.document || "",
                    font: "Montserrat",
                    size: 18,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            verticalAlign: VerticalAlign.CENTER, // vertical center
            children: [
              new Paragraph({
               
                children: [
                  new TextRun({
                    text: ref.relevance || "",
                    font: "Montserrat",
                    size: 18,
                  }),
                ],
              }),
            ],
          }),
        ],
      })
)

                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ]
  : []),












 //understanding reports for Electrical
 ...(reportType !=="HSE" ? [         
          {
            properties: {
              page: {
                orientation: PageOrientation.PORTRAIT,
      // size: {
      //   width: 16838,   // 29.7 cm
      //   height: 11906,  // 21 cm
      // },
                margin: {
                  top: 500,
                  left: 500,
                  right: 500
                }
              }
            },
            children: [
              new Table({
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        width: {
                          size: 100, // Adjust width as needed
                          type: WidthType.PERCENTAGE,
                        },
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: ``,
                                size: 30,
                                font: "Montserrat",
                                color: "#ffffff", // Adjust text color for visibility
                              }),
                            ],
                          }),
                        ],
                        // shading: {
                        //   fill: "#02075d",
                        // },
                        verticalAlign: "center",
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new ImageRun({
                                data: base64logo,
                                transformation: {
                                  width: 120,
                                  height: 40,
                                },
                              }),
                            ],
                          }),
                        ],
                        verticalAlign: "center",
                      }),
                    ],
                    tableHeader: true,
                  }),
                ],
                width: {
                  size: 100,
                  type: WidthType.PERCENTAGE,
                },
                borders: {
                  top: { style: BorderStyle.NONE },
                  bottom: { style: BorderStyle.NONE },
                  left: { style: BorderStyle.NONE },
                  right: { style: BorderStyle.NONE },
                  insideHorizontal: { style: BorderStyle.NONE },
                  insideVertical: { style: BorderStyle.NONE },
                },
              }),
              new Paragraph({
                children: [new TextRun("")],
                break: 1
              }),
              new Table({
  rows: [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 100, type: WidthType.PERCENTAGE },
          margins: {
            left: 800,   // 1 inch left gap
            right: 800,  // 1 inch right gap
          },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "UNDERSTANDING THE REVIEW REPORT",
                  font: "Montserrat",
                  color: "#307268",
                  size: 25,
                  bold: true,
                }),
              ],
              break: 1,
            }),
            new Paragraph({ break: 1 }), // line break
            ...contentParagraph3,        // your content with same left/right spacing
          ],
        }),
      ],
    }),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: {
    top: { style: BorderStyle.NONE },
    bottom: { style: BorderStyle.NONE },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
    insideHorizontal: { style: BorderStyle.NONE },
    insideVertical: { style: BorderStyle.NONE },
  },
}),

            ],
          },]:[]),

//executive summary for electrical
...(reportType !== "HSE"?[{
            
            properties: {
              page: {
                orientation: PageOrientation.PORTRAIT,
      // size: {
      //   width: 16838,   // 29.7 cm
      //   height: 11906,  // 21 cm
      // },
                margin: {
                  top: 500,
                  left: 500,
                  right: 500
                }
              }
            },
            children: [
              new Table({
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        width: {
                          size: 100, // Adjust width as needed
                          type: WidthType.PERCENTAGE,
                        },
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: ``,
                                size: 30,
                                font: "Montserrat",
                                color: "#ffffff", // Adjust text color for visibility
                              }),
                            ],
                          }),
                        ],
                        verticalAlign: "center",
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new ImageRun({
                                data: base64logo,
                                transformation: {
                                  width: 120,
                                  height: 40,
                                },
                              }),
                            ],
                          }),
                        ],
                        verticalAlign: "center",
                      }),
                    ],
                    tableHeader: true,
                  }),
                ],
                width: {
                  size: 100,
                  type: WidthType.PERCENTAGE,
                },
                borders: {
                  top: { style: BorderStyle.NONE },
                  bottom: { style: BorderStyle.NONE },
                  left: { style: BorderStyle.NONE },
                  right: { style: BorderStyle.NONE },
                  insideHorizontal: { style: BorderStyle.NONE },
                  insideVertical: { style: BorderStyle.NONE },
                },
              }),
              new Paragraph({
                children: [new TextRun("")],
                break: 1
              }),
new Table({
  rows: [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 100, type: WidthType.PERCENTAGE },
           shading: {
            type: "clear",
            color: "auto",
          },
          margins: {
            left: 800,   // 1 inch left gap
            right: 800,  // 1 inch right gap
          },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "1. Executive Summary",
                  font: "Montserrat",
                  color: "#307268",
                  size: 25,
                  bold: true,
                }),
              ],
              break: 1,
            }),
            new Paragraph({ break: 1 }), // line break  
          ],
        }),
      ],
    }),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: {
    top: { style: BorderStyle.NONE },
    bottom: { style: BorderStyle.NONE },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
    insideHorizontal: { style: BorderStyle.NONE },
    insideVertical: { style: BorderStyle.NONE },
  },
}), 

// Outer table for left/right spacing
new Table({
  rows: [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 100, type: WidthType.PERCENTAGE },
          margins: {
            left: 800,  // 1 inch left gap
            right: 800, // 1 inch right gap
          },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          children: [
            // Inner table with yellow background
            new Table({
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      shading: {
                        type: "clear",
                        color: "auto",
                        fill: "fff8dc", // Light cream-yellow background
                      },
                      margins: {
                        top: 200,    // padding inside yellow box
                        bottom: 200,
                        left: 200,
                        right: 200,
                      },
                      borders: {
                        top: { style: BorderStyle.NONE },
                        bottom: { style: BorderStyle.NONE },
                        left: { style: BorderStyle.NONE },
                        right: { style: BorderStyle.NONE },
                      },
                      children: [
                        ...executiveSummaryParagraph3, 
                      ],
                    }),
                  ],
                }),
              ],
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
                insideHorizontal: { style: BorderStyle.NONE },
                insideVertical: { style: BorderStyle.NONE },
              },
            }),
          ],
        }),
      ],
    }),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: {
    top: { style: BorderStyle.NONE },
    bottom: { style: BorderStyle.NONE },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
    insideHorizontal: { style: BorderStyle.NONE },
    insideVertical: { style: BorderStyle.NONE },
  },
}),


            ],
          },]:[]),  
          
          



   // improvement opportunity areas for electrical
       ...(reportType !== "HSE"
  ? [
          {
            
            properties: {
              // type: SectionType.CONTINUOUS,
              page: {
                orientation: PageOrientation.PORTRAIT,
      // size: {
      //   width: 16838,   // 29.7 cm
      //   height: 11906,  // 21 cm
      // },
                margin: {
                  top: 500,
                  left: 500,
                  right: 500,
                  bottom: 500,
                }
              }
            },
            children: [
              new Table({
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        width: {
                          size: 100, // Adjust width as needed
                          type: WidthType.PERCENTAGE,
                        },
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: ``,
                                size: 30,
                                font: "Montserrat",
                                color: "#ffffff", // Adjust text color for visibility
                              }),
                            ],
                          }),
                        ],
                        verticalAlign: "center",
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new ImageRun({
                                data: base64logo,
                                transformation: {
                                  width: 120,
                                  height: 40,
                                },
                              }),
                            ],
                          }),
                        ],
                        verticalAlign: "center",
                      }),
                    ],
                    tableHeader: true,
                  }),
                ],
                width: {
                  size: 100,
                  type: WidthType.PERCENTAGE,
                },
                borders: {
                  top: { style: BorderStyle.NONE },
                  bottom: { style: BorderStyle.NONE },
                  left: { style: BorderStyle.NONE },
                  right: { style: BorderStyle.NONE },
                  insideHorizontal: { style: BorderStyle.NONE },
                  insideVertical: { style: BorderStyle.NONE },
                },
              }),
              new Paragraph({
                children: [new TextRun("")],
                break: 1
              }),
// Heading
new Table({
  rows: [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 100, type: WidthType.PERCENTAGE },
          shading: {
            type: "clear",
            color: "auto",
          },
          margins: {
            left: 800,  // 1 inch left gap
            right: 800, // 1 inch right gap
          },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "2. Improvement Opportunity Areas (Deductibles)",
                  font: "Montserrat",
                  color: "#307268",
                  size: 25,
                  bold: true,
                }),
              ],
            
            }),
            new Paragraph({ break: 1 }), // line break
          ],
        }),
      ],
    }),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: {
    top: { style: BorderStyle.NONE },
    bottom: { style: BorderStyle.NONE },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
    insideHorizontal: { style: BorderStyle.NONE },
    insideVertical: { style: BorderStyle.NONE },
  },
}),

// Yellow Box with content
new Table({
  rows: [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 100, type: WidthType.PERCENTAGE },
          margins: {
            left: 800,  // spacing outside yellow
            right: 800,
          },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          children: [
            new Table({
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      shading: {
                        type: "clear",
                        color: "auto",
                        fill: "fff8dc", // Light cream-yellow
                      },
                      margins: {
                        top: 200,    // padding inside yellow
                        bottom: 200,
                        left: 200,
                        right: 200,
                      },
                      borders: {
                        top: { style: BorderStyle.NONE },
                        bottom: { style: BorderStyle.NONE },
                        left: { style: BorderStyle.NONE },
                        right: { style: BorderStyle.NONE },
                      },
                      children: [
                        ...improvementOpportunityParagraph3,
                      ],
                    }),
                  ],
                }),
              ],
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
                insideHorizontal: { style: BorderStyle.NONE },
                insideVertical: { style: BorderStyle.NONE },
              },
            }),
          ],
        }),
      ],
    }),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: {
    top: { style: BorderStyle.NONE },
    bottom: { style: BorderStyle.NONE },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
    insideHorizontal: { style: BorderStyle.NONE },
    insideVertical: { style: BorderStyle.NONE },
  },
}),


            ],
          },
        ]
  : []),
    // overall risk indicator for electrical
       ...(reportType !== "HSE"
  ? [
           {
            properties: {
      //  type: SectionType.CONTINUOUS,
              page: {
                orientation: PageOrientation.PORTRAIT,
      // size: {
      //   width: 16838,   // 29.7 cm
      //   height: 11906,  // 21 cm
      // },
                margin: {
                  top: 500,
                  left: 500,
                  right: 500,
                  bottom:500
                }
              }
            },
            children: [
              new Table({
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        width: {
                          size: 100, // Adjust width as needed
                          type: WidthType.PERCENTAGE,
                        },
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: ``,
                                size: 30,
                                font: "Montserrat",
                                color: "#ffffff", // Adjust text color for visibility
                              }),
                            ],
                          }),
                        ],
                        verticalAlign: "center",
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new ImageRun({
                                data: base64logo,
                                transformation: {
                                  width: 120,
                                  height: 40,
                                },
                              }),
                            ],
                          }),
                        ],
                        verticalAlign: "center",
                      }),
                    ],
                    tableHeader: true,
                  }),
                ],
                width: {
                  size: 100,
                  type: WidthType.PERCENTAGE,
                },
                borders: {
                  top: { style: BorderStyle.NONE },
                  bottom: { style: BorderStyle.NONE },
                  left: { style: BorderStyle.NONE },
                  right: { style: BorderStyle.NONE },
                  insideHorizontal: { style: BorderStyle.NONE },
                  insideVertical: { style: BorderStyle.NONE },
                },
              }),
              new Paragraph({
                children: [new TextRun("")],
                break: 1
              }),
             // Heading
new Paragraph({
  children: [
    new TextRun({
      text: "3. Overall Risk Assessment Indicator",
      font: "Montserrat",
      color: "#307268",
      size: 25,
      bold: true,
    }),
  ],
  spacing: {
    after: 200, // space after paragraph
  },
  indent: {
    left: 800,   // left indentation (~0.7 inch)

  },
}),


new Table({
  rows: [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 100, type: WidthType.PERCENTAGE },
          margins: { left: 800, right: 800 }, // spacing from page edges
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          children: [
            // Inner table → Left-right percentage layout
            new Table({
              rows: [
                new TableRow({
                  children: [
                    // LEFT CELL → Fixed width yellow box
                    new TableCell({
                      width: { size: 20, type: WidthType.PERCENTAGE },
                      // shading: { fill: "FFD700" },
                      shading: { fill: boxColor },
                      verticalAlign: VerticalAlign.CENTER,
                      borders: {
                        top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                        bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                        left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                        right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                      },
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [
                            new TextRun({
                              //  text: `${((cumulativeScore / 10) * 100).toFixed(2)}%`,
                                text: `${Math.floor((cumulativeScore / 25) * 100)}%`,
                                bold: true, size: 48
                               }),
                          ],
                        }),
                      ],
                    }),

                    // RIGHT CELL → Dynamic content
                    new TableCell({
                      width: { size: 80, type: WidthType.PERCENTAGE },
                      margins: { top: 200, bottom: 200, left: 300, right: 300 },
                      borders: {
                        top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                        bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                        left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                        right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                      },
                      children: [
                        ...overallAssessmentParagraph3, // your content here
                      ],
                    }),
                  ],
                }),
              ],
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
                insideHorizontal: { style: BorderStyle.NONE },
                insideVertical: { style: BorderStyle.NONE },
              },
            }),
          ],
        }),
      ],
    }),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: {
    top: { style: BorderStyle.NONE },
    bottom: { style: BorderStyle.NONE },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
    insideHorizontal: { style: BorderStyle.NONE },
    insideVertical: { style: BorderStyle.NONE },
  },
}),




// new Paragraph({ break: 1 }),
//   new Paragraph({
//                 children: [new TextRun("The below image is for display purpose only.")],
//                 break: 1,
//                 indent:{
//                    left:1200,
//                 }
//               }),
//               new Paragraph({ break: 1 }),
// new Table({
//   rows: [
//     new TableRow({
//       children: [
//         new TableCell({
//           children: [
//             new Paragraph({
//               alignment: AlignmentType.CENTER,
//               children: [
//                 new ImageRun({
//                   data: gaugeImageWord,
//                   transformation: {
//                     width: 800,
//                     height: 300,
//                   },
//                 }),
//               ],
//             }),
//           ],
//           // No borders property → no border lines
//           margins: { top: 0, bottom: 0, left: 0, right: 0 }, // optional: remove padding
//         }),
//       ],
//     }),
//   ],
//   width: {
//     size: 5000,
//     type: WidthType.DXA,
//   },
//   indent: {
//     size: 1000, // shifts table from left
//     type: WidthType.DXA,
//   },
//   borders: {
//     top: { style: BorderStyle.NONE },
//     bottom: { style: BorderStyle.NONE },
//     left: { style: BorderStyle.NONE },
//     right: { style: BorderStyle.NONE },
//     insideHorizontal: { style: BorderStyle.NONE },
//     insideVertical: { style: BorderStyle.NONE },
//   },
// }),

new Paragraph({ break: 1 }),
new Paragraph({ break: 1 }),
new Paragraph({
  children: [
    new TextRun({
      text: "Risk Legend",
      font: "Montserrat",
      color: "#307268",
      size: 25,
      bold: true,
    }),
  ],
  spacing: {
    after: 200, // space after paragraph
  },
  indent: {
    left: 800,   // left indentation (~0.7 inch)

  },
}),
new Paragraph({
  children: [
    new TextRun({
      // text: "The above image is for display purposes only",
      font: "Montserrat",
  
      size: 22,
      bold: false,
    }),
  ],
  spacing: {
    after: 200, // space after paragraph
  },
  indent: {
    left: 800,   // left indentation (~0.7 inch)

  },
}),
new Paragraph({ break: 1 }),
  // --- New Table: Risk Levels ---
 new Table({
  rows: [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 100, type: WidthType.PERCENTAGE },
          margins: { left: 800, right: 800 }, // spacing from page edges
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          children: [
            // Inner table → your actual risk levels table
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE }, // full width inside the cell
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              },
              rows: [
                // Header Row
                new TableRow({
                  children: ["Score Range", "Risk Level", "Interpretation"].map((text) =>
                    new TableCell({
                      shading: { fill: "#307260" },
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [
                            new TextRun({
                              text,
                              bold: true,
                              color: "#efc71d",
                              size: 24,
                            }),
                          ],
                        }),
                      ],
                    })
                  ),
                }),
                // Data Rows
               ...riskLevels.map((level) =>
  new TableRow({
    children: [
      // Score Range → colored
      new TableCell({
        margins: { top: 100, bottom: 100, left: 200, right: 200 },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: level.range,
                color: level.color, // use respective color
                size: 20, // decrease by 1 from 25
              }),
            ],
          }),
        ],
      }),
  
      new TableCell({
        shading: { fill: level.color },
        margins: { top: 100, bottom: 100, left: 200, right: 200 },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: level.risk,
                bold: false, // remove bold
                size: 20, // decrease by 1
                color: "#000000", // optional: black text on colored background
              }),
            ],
          }),
        ],
      }),
      // Interpretation → normal text, smaller size
      new TableCell({
        margins: { top: 100, bottom: 100, left: 200, right: 200 },
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: level.interpretation,
                size: 20, // decrease by 1
              }),
            ],
          }),
        ],
      }),
    ],
  })
),

              ],
            }),
          ],
        }),
      ],
    }),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: {
    top: { style: BorderStyle.NONE },
    bottom: { style: BorderStyle.NONE },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
    insideHorizontal: { style: BorderStyle.NONE },
    insideVertical: { style: BorderStyle.NONE },
  },
}),




            ],
            
            
          },
        ]
  : []),




          reportType === "HSE" ? 
            {
              properties: {
                
                page: {
                  orientation: PageOrientation.LANDSCAPE,
      size: {
        width: 16838,   // 29.7 cm
        height: 11906,  // 21 cm
      },
                  margin: {
                    top: 500,
                    left: 500,
                    right: 500,
                  },
                  size: {
                    orientation: PageOrientation.LANDSCAPE
                  }
                },
              },
              children: [
                new Table({
                  rows: [
                    new TableRow({
                      children: [
                        new TableCell({
                          width: {
                            size: 100,
                            type: WidthType.PERCENTAGE,
                          },
                          children: [
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text: ``,
                                  size: 30,
                                  font: "Montserrat",
                                  color: "#ffffff",
                                }),
                              ],
                            }),
                          ],
                          verticalAlign: VerticalAlign.CENTER,
                          shading: {
                            fill: "#ffffff",
                          },
                        }),
                        new TableCell({
                          children: [
                            new Paragraph({
                              children: [
                                new ImageRun({
                                  data: base64logo,
                                  transformation: {
                                    width: 120,
                                    height: 40,
                                  },
                                }),
                              ],
                            }),
                          ],
                          verticalAlign: VerticalAlign.CENTER,
                          shading: {
                            fill: "#ffffff",
                          },
                        }),
                      ],
                      tableHeader: true,
                    }),
                  ],
                  width: {
                    size: 100,
                    type: WidthType.PERCENTAGE,
                  },
                  borders: {
                    top: { style: BorderStyle.NONE },
                    bottom: { style: BorderStyle.NONE },
                    left: { style: BorderStyle.NONE },
                    right: { style: BorderStyle.NONE },
                    insideHorizontal: { style: BorderStyle.NONE },
                    insideVertical: { style: BorderStyle.NONE },
                  },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: reportType === "HSE" ? "Critical Observations, Recommendations & Reasoning - HSE Report" : "4. Critical Observations, Recommendations & Reasoning - Electrical Report",
                      font: "Montserrat",
                      color: "#307268",
                      size: 25,
                      bold: true,
                    }),
                  ],
                  indent:{
                  left:1000,
                  },
                  break: 1,
                }),
             
                ...(groupedObservations && typeof groupedObservations === 'object' ? Object.keys(groupedObservations).flatMap((tableType, index) => {
                  const observations = groupedObservations[tableType];
                   if (!observations ||observations.length === 0) {
        return [
          new Paragraph({
            children: [
              new TextRun({
                text: `${index + 1}. ${tableType} - No observations selected`,
                font: "Arial",
                size: 24,
                bold: true,
                color: "#ff0000", 
              }),
            ],
            indent: { left: 800 },
            spacing: { before: 200 },
          }),
        ];
      }

                  return [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `${index + 1}. ${tableType}`,
                          font: "Arial",
                          size: 25,
                          bold: true,
                          color: "#307268",
                        }),
                      ],
                      indent:{left:1000},
                      spacing: { before: 200 },
                    }),
                    new Table({
                      alignment: AlignmentType.CENTER, // Centers the table
  width: {
    size: 13838,
    type: WidthType.DXA, 
  },
                      rows: [
                        new TableRow({
                          children: [
                            new TableCell({
                              
                              children: [
                                new Paragraph({
                                  alignment: AlignmentType.CENTER,
                                  children: [
                                    new TextRun({
                                      text: "Sr. No",
                                      bold: true,
                                      size:18,
                                      color: "#FFFFFF",
                                    }),
                                  ],
                                }),
                              ],
                              shading: { fill: "#307268" },
                              width: { size: 0.5 * 1440, type: WidthType.DXA },
                              borders: {
                                top: { style: BorderStyle.SINGLE },
                                bottom: { style: BorderStyle.SINGLE },
                                left: { style: BorderStyle.SINGLE },
                                right: { style: BorderStyle.SINGLE },
                              },
                              verticalAlign: VerticalAlign.CENTER,
                            }),
                            new TableCell({
                              children: [
                                new Paragraph({
                                  alignment: AlignmentType.CENTER,
                                  children: [
                                    new TextRun({
                                      text: "Area / Process",
                                      bold: true,
                                      size:18,
                                      color: "#FFFFFF",
                                    }),
                                  ],
                                }),
                              ],
                              shading: { fill: "#307268" },
                              width: { size: 3 * 1440, type: WidthType.DXA },
                              borders: {
                                top: { style: BorderStyle.SINGLE },
                                bottom: { style: BorderStyle.SINGLE },
                                left: { style: BorderStyle.SINGLE },
                                right: { style: BorderStyle.SINGLE },
                              },
                              verticalAlign: VerticalAlign.CENTER,
                            }),
                            new TableCell({
                              children: [
                                new Paragraph({
                                  alignment: AlignmentType.CENTER,
                                  children: [
                                    new TextRun({
                                      text: "Observation",
                                      bold: true,
                                      size:18,
                                      color: "#FFFFFF",
                                    }),
                                  ],
                                }),
                              ],
                              shading: { fill: "#307268" },
                              width: { size: 6.25 * 1440, type: WidthType.DXA },
                              borders: {
                                top: { style: BorderStyle.SINGLE },
                                bottom: { style: BorderStyle.SINGLE },
                                left: { style: BorderStyle.SINGLE },
                                right: { style: BorderStyle.SINGLE },
                              },
                              verticalAlign: VerticalAlign.CENTER,
                            }),

// new TableCell({
//                               children: [
//                                 new Paragraph({
//                                   alignment: AlignmentType.CENTER,
//                                   children: [
//                                     new TextRun({
//                                       text: "Photo Evidence",
//                                       bold: true,
//                                       size:18,
//                                       color: "#efc71d",
//                                     }),
//                                   ],
//                                 }),
//                               ],
//                               shading: { fill: "#307268" },
//                               width: { size: 4 * 1440, type: WidthType.DXA },
//                               borders: {
//                                 top: { style: BorderStyle.SINGLE },
//                                 bottom: { style: BorderStyle.SINGLE },
//                                 left: { style: BorderStyle.SINGLE },
//                                 right: { style: BorderStyle.SINGLE },
//                               },
//                               verticalAlign: VerticalAlign.CENTER,
//                             }),
//                           ],
                          
//                         }),
new TableCell({
                              children: [
                                new Paragraph({
                                  alignment: AlignmentType.CENTER,
                                  children: [
                                    new TextRun({
                                      text: "Objective Evidence",
                                      bold: true,
                                      size:18,
                                      color: "#FFFFFF",
                                    }),
                                  ],
                                }),
                              ],
                              shading: { fill: "#307268" },
                              width: { size: 4 * 1440, type: WidthType.DXA },
                              borders: {
                                top: { style: BorderStyle.SINGLE },
                                bottom: { style: BorderStyle.SINGLE },
                                left: { style: BorderStyle.SINGLE },
                                right: { style: BorderStyle.SINGLE },
                              },
                              verticalAlign: VerticalAlign.CENTER,
                            }),
                            
                            new TableCell({
                              children: [
                                new Paragraph({
                                  alignment: AlignmentType.CENTER,
                                  children: [
                                    new TextRun({
                                      text: "Criticality",
                                      bold: true,
                                      size:18,
                                      color: "#FFFFFF",
                                    }),
                                  ],
                                }),
                              ],
                              shading: { fill: "#307268" },
                              width: { size: 2.5 * 1440, type: WidthType.DXA },
                              borders: {
                                top: { style: BorderStyle.SINGLE },
                                bottom: { style: BorderStyle.SINGLE },
                                left: { style: BorderStyle.SINGLE },
                                right: { style: BorderStyle.SINGLE },
                              },
                              verticalAlign: VerticalAlign.CENTER,
                            }),
                          
                            new TableCell({
                              children: [
                                new Paragraph({
                                  alignment: AlignmentType.CENTER,
                                  children: [
                                    new TextRun({
                                      text: "Legal Reference (if any)",
                                      bold: true,
                                      size:18,
                                      color: "#FFFFFF",
                                    }),
                                  ],
                                }),
                              ],
                              shading: { fill: "#307268" },
                              width: { size: 2.5 * 1440, type: WidthType.DXA },
                              borders: {
                                top: { style: BorderStyle.SINGLE },
                                bottom: { style: BorderStyle.SINGLE },
                                left: { style: BorderStyle.SINGLE },
                                right: { style: BorderStyle.SINGLE },
                              },
                              verticalAlign: VerticalAlign.CENTER,
                            }),
                            // ...(reportType === "HSE"
                            //   ? [
                            //     new TableCell({
                            //       children: [
                            //         new Paragraph({
                            //           alignment: AlignmentType.CENTER,
                            //           children: [
                            //             new TextRun({
                            //               text: "Score",
                            //               bold: true,
                            //               size:18,
                            //               color: "#efc71d",
                            //             }),
                            //           ],
                            //         }),
                            //       ],
                            //       shading: { fill: "#307268" },
                            //       width: { size: 2.5 * 1440, type: WidthType.DXA },
                            //       borders: {
                            //         top: { style: BorderStyle.SINGLE },
                            //         bottom: { style: BorderStyle.SINGLE },
                            //         left: { style: BorderStyle.SINGLE },
                            //         right: { style: BorderStyle.SINGLE },
                            //       },
                            //       verticalAlign: VerticalAlign.CENTER,
                            //     }),
                            //   ]
                            //   : []),
                            //   new TableCell({
                            //   children: [
                            //     new Paragraph({
                            //       alignment: AlignmentType.CENTER,
                            //       children: [
                            //         new TextRun({
                            //           text: "system implementation",
                            //           bold: true,
                            //           size:18,
                            //           color: "#efc71d",
                            //         }),
                            //       ],
                            //     }),
                            //   ],
                            //   shading: { fill: "#307268" },
                            //   width: { size: 7 * 1440, type: WidthType.DXA },
                            //   borders: {
                            //     top: { style: BorderStyle.SINGLE },
                            //     bottom: { style: BorderStyle.SINGLE },
                            //     left: { style: BorderStyle.SINGLE },
                            //     right: { style: BorderStyle.SINGLE },
                            //   },
                            //   verticalAlign: VerticalAlign.CENTER,
                            // }),
                            // new TableCell({
                            //   children: [
                            //     new Paragraph({
                            //       alignment: AlignmentType.CENTER,
                            //       children: [
                            //         new TextRun({
                            //           text: "compliance check",
                            //           bold: true,
                            //           size:18,
                            //           color: "#efc71d",
                            //         }),
                            //       ],
                            //     }),
                            //   ],
                            //   shading: { fill: "#307268" },
                            //   width: { size: 7 * 1440, type: WidthType.DXA },
                            //   borders: {
                            //     top: { style: BorderStyle.SINGLE },
                            //     bottom: { style: BorderStyle.SINGLE },
                            //     left: { style: BorderStyle.SINGLE },
                            //     right: { style: BorderStyle.SINGLE },
                            //   },
                            //   verticalAlign: VerticalAlign.CENTER,
                            // }),
                            
                             new TableCell({
                              children: [
                                new Paragraph({
                                  alignment: AlignmentType.CENTER,
                                  children: [
                                    new TextRun({
                                      text: "Recommendation",
                                      bold: true,
                                      size:18,
                                      color: "#FFFFFF",
                                    }),
                                  ],
                                }),
                              ],
                              shading: { fill: "#307268" },
                              width: { size: 7 * 1440, type: WidthType.DXA },
                              borders: {
                                top: { style: BorderStyle.SINGLE },
                                bottom: { style: BorderStyle.SINGLE },
                                left: { style: BorderStyle.SINGLE },
                                right: { style: BorderStyle.SINGLE },
                              },
                              verticalAlign: VerticalAlign.CENTER,
                            }),
                            
                            
                            // new TableCell({
                            //   children: [
                            //     new Paragraph({
                            //       alignment: AlignmentType.CENTER,
                            //       children: [
                            //         new TextRun({
                            //           text: "Photo Evidence",
                            //           bold: true,
                            //           size:18,
                            //           color: "#efc71d",
                            //         }),
                            //       ],
                            //     }),
                            //   ],
                            //   shading: { fill: "#307268" },
                            //   width: { size: 4 * 1440, type: WidthType.DXA },
                            //   borders: {
                            //     top: { style: BorderStyle.SINGLE },
                            //     bottom: { style: BorderStyle.SINGLE },
                            //     left: { style: BorderStyle.SINGLE },
                            //     right: { style: BorderStyle.SINGLE },
                            //   },
                            //   verticalAlign: VerticalAlign.CENTER,
                            // }),
                          ],
                          
                        }),
                        ...observations.map((obs, index) => new TableRow({
                          children: [
                            new TableCell({
                              children: [new Paragraph({ text: `${index + 1}`, alignment: AlignmentType.CENTER,})],
                              width: { size: 0.5 * 1440, type: WidthType.DXA },
                              verticalAlign: VerticalAlign.CENTER,
                              borders: {
                                top: { style: BorderStyle.SINGLE }, 
                                bottom: { style: BorderStyle.SINGLE },
                                left: { style: BorderStyle.SINGLE },
                                right: { style: BorderStyle.SINGLE },
                              },
                              // verticalAlign: VerticalAlign.CENTER,
                            }),
                            new TableCell({
                              // children: [new Paragraph(obs.area)],
                              children: [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: obs.area,
          size: 18,
        }),
      ],
    }),
  ],
                              width: { size: 3 * 1440, type: WidthType.DXA },
                              borders: {
                                top: { style: BorderStyle.SINGLE },
                                bottom: { style: BorderStyle.SINGLE },
                                left: { style: BorderStyle.SINGLE },
                                right: { style: BorderStyle.SINGLE },
                              },
                              verticalAlign: VerticalAlign.CENTER,
                            }),
                            new TableCell({
                              // children: [new Paragraph({text:obs.observation,alignment: AlignmentType.CENTER})],
                              children: [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: obs.observation,
          size:18,
        }),
      ],
    }),
  ],
                              width: { size: 6.25 * 1440, type: WidthType.DXA },
                              borders: {
                                top: { style: BorderStyle.SINGLE },
                                bottom: { style: BorderStyle.SINGLE },
                                left: { style: BorderStyle.SINGLE },
                                right: { style: BorderStyle.SINGLE },
                              },
                              verticalAlign: VerticalAlign.CENTER,
                            }),

 new TableCell({
                              children: [
                                new Paragraph({
                                  alignment: AlignmentType.CENTER,
                                  spacing: {
                                  before: 100, // top padding (~0.1in)
                                   after: 100,  // bottom padding (~0.1in)
                                      },
                                  children: Array.isArray(obs.imageUrls) && obs.imageUrls.length > 0
                                    ? obs.imageUrls.map(image => new ImageRun({
                                      data: image,
                                      transformation: { width: 100, height: 70 },
                                    }))
                                    : [new TextRun("N/A")],
                                }),
                              ],
                              width: { size: 4 * 1440, type: WidthType.DXA },
                              verticalAlign: VerticalAlign.CENTER,
                              borders: {
                                top: { style: BorderStyle.SINGLE },
                                bottom: { style: BorderStyle.SINGLE },
                                left: { style: BorderStyle.SINGLE },
                                right: { style: BorderStyle.SINGLE },
                              },
                            }),


                            new TableCell({
                              // children: [new Paragraph({ text: obs.criticality || "N/A", alignment: AlignmentType.CENTER })],
                              children: [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: obs.criticality,
          size:18,
        }),
      ],
    }),
  ],
                              width: { size: 2.5 * 1440, type: WidthType.DXA },
                              borders: {
                                top: { style: BorderStyle.SINGLE },
                                bottom: { style: BorderStyle.SINGLE },
                                left: { style: BorderStyle.SINGLE },
                                right: { style: BorderStyle.SINGLE },
                              },
                              verticalAlign: VerticalAlign.CENTER,
                            }),
                            new TableCell({
                              // children: [new Paragraph(obs.is_reference || "N/A")],
                              children: [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: obs.is_reference,
          size:18,
        }),
      ],
    }),
  ],
                              width: { size: 2.5 * 1440, type: WidthType.DXA },
                              borders: {
                                top: { style: BorderStyle.SINGLE },
                                bottom: { style: BorderStyle.SINGLE },
                                left: { style: BorderStyle.SINGLE },
                                right: { style: BorderStyle.SINGLE },
                              },
                              verticalAlign: VerticalAlign.CENTER,
                            }),
                            new TableCell({
                              // children: [new Paragraph(obs.recommendations || "N/A")],
                              children: [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: obs.recommendations,
          size:18,
        }),
      ],
    }),
  ],
                              width: { size: 7 * 1440, type: WidthType.DXA },
                              borders: {
                                top: { style: BorderStyle.SINGLE },
                                bottom: { style: BorderStyle.SINGLE },
                                left: { style: BorderStyle.SINGLE },
                                right: { style: BorderStyle.SINGLE },
                              },
                              verticalAlign: VerticalAlign.CENTER,
                            }),
                            
//                             ...(reportType === "HSE"
//                               ? [
//                                 new TableCell({
//                                   // children: [
//                                   //   new Paragraph({ text: obs.score ? obs.score.toString() : "N/A", alignment: AlignmentType.CENTER }),
//                                   // ],
//                                   children: [
//   new Paragraph({
//     alignment: AlignmentType.CENTER,
//     children: [
//       new TextRun({
//         text: obs.score ? obs.score.toString() : "N/A",
//         size:18, // 12pt font size
//       }),
//     ],
//   }),
// ],

//                                   width: { size: 2.5 * 1440, type: WidthType.DXA },
//                                   borders: {
//                                     top: { style: BorderStyle.SINGLE },
//                                     bottom: { style: BorderStyle.SINGLE },
//                                     left: { style: BorderStyle.SINGLE },
//                                     right: { style: BorderStyle.SINGLE },
//                                   },
//                                   verticalAlign: VerticalAlign.CENTER,
//                                 }),
//                               ]
//                               : []),
  //                                new TableCell({
  //                             // children: [new Paragraph(obs.system_implementation || "N/A")],
  //                              children: [
  //   new Paragraph({
  //     alignment: AlignmentType.CENTER,
  //     children: [
  //       new TextRun({
  //         text: obs.system_implementation,
  //         size:18,
  //       }),
  //     ],
  //   }),
  // ],
  //                             width: { size: 7 * 1440, type: WidthType.DXA },
  //                             borders: {
  //                               top: { style: BorderStyle.SINGLE },
  //                               bottom: { style: BorderStyle.SINGLE },
  //                               left: { style: BorderStyle.SINGLE },
  //                               right: { style: BorderStyle.SINGLE },
  //                             },
  //                              verticalAlign: VerticalAlign.CENTER,
  //                           }),
  //                              new TableCell({
  //                             // children: [new Paragraph(obs.compliance_check || "N/A")],
  //                              children: [
  //   new Paragraph({
  //     alignment: AlignmentType.CENTER,
  //     children: [
  //       new TextRun({
  //         text: obs.compliance_check,
  //         size:18,
  //       }),
  //     ],
  //   }),
  // ],
  //                             width: { size: 7 * 1440, type: WidthType.DXA },
  //                             borders: {
  //                               top: { style: BorderStyle.SINGLE },
  //                               bottom: { style: BorderStyle.SINGLE },
  //                               left: { style: BorderStyle.SINGLE },
  //                               right: { style: BorderStyle.SINGLE },
  //                             },
  //                           }),
                            // new TableCell({
                            //   children: [
                            //     new Paragraph({
                            //       alignment: AlignmentType.CENTER,
                            //       spacing: {
                            //       before: 100, // top padding (~0.1in)
                            //        after: 100,  // bottom padding (~0.1in)
                            //           },
                            //       children: Array.isArray(obs.imageUrls) && obs.imageUrls.length > 0
                            //         ? obs.imageUrls.map(image => new ImageRun({
                            //           data: image,
                            //           transformation: { width: 100, height: 70 },
                            //         }))
                            //         : [new TextRun("N/A")],
                            //     }),
                            //   ],
                            //   width: { size: 4 * 1440, type: WidthType.DXA },
                            //   verticalAlign: VerticalAlign.CENTER,
                            //   borders: {
                            //     top: { style: BorderStyle.SINGLE },
                            //     bottom: { style: BorderStyle.SINGLE },
                            //     left: { style: BorderStyle.SINGLE },
                            //     right: { style: BorderStyle.SINGLE },
                            //   },
                            // }),
                          ],
                        })),
                      ],
                      // width: { size: 100, type: WidthType.PERCENTAGE },
                      borders: {
                        top: { style: BorderStyle.SINGLE },
                        bottom: { style: BorderStyle.SINGLE },
                        left: { style: BorderStyle.SINGLE },
                        right: { style: BorderStyle.SINGLE },
                        insideHorizontal: { style: BorderStyle.SINGLE },
                        insideVertical: { style: BorderStyle.SINGLE },
                      },
                    }),
                  ];
                }) : []),
              ],
            } : {
              properties: {
                page: {
                  orientation: PageOrientation.LANDSCAPE,
      // size: {
      //   width: 16838,   // 29.7 cm
      //   height: 11906,  // 21 cm
      // },
                  margin: {
                    top: 500,
                    left: 500,
                    right: 500
                  },
                  size: {
                    orientation: PageOrientation.LANDSCAPE
                  }
                }
              },
              children: [
                new Table({
                  rows: [
                    new TableRow({
                      children: [
                        new TableCell({
                          //  alignment: AlignmentType.CENTER,
                          width: {
                            size: 100,
                            type: WidthType.PERCENTAGE,
   
                          },
                          children: [
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text: ``,
                                  size: 30,
                                  font: "Montserrat",
                                  color: "#ffffff",
                                }),
                              ],
                            }),
                          ],

                          verticalAlign: "center",

                        }),
                        new TableCell({
                          children: [
                            new Paragraph({
                              children: [
                                new ImageRun({
                                  data: base64logo,
                                  transformation: {
                                    width: 120,
                                    height: 40,
                                  },
                                }),
                              ],
                            }),
                          ],

                          verticalAlign: "center",

                        }),
                      ],
                      tableHeader: true,

                    }),
                  ],
                  width: {
                    size: 100,
                    type: WidthType.PERCENTAGE,
                  },
                  borders: {
                    top: { style: BorderStyle.NONE },
                    bottom: { style: BorderStyle.NONE },
                    left: { style: BorderStyle.NONE },
                    right: { style: BorderStyle.NONE },
                    insideHorizontal: { style: BorderStyle.NONE },
                    insideVertical: { style: BorderStyle.NONE },
                  },
                }),
                new Paragraph({
                  children: [new TextRun("")],
                  break: 1
                }),
                new Paragraph({
                  children: [new TextRun({
                    text: reportType === "HSE" ? "5. Critical Observations, Recommendations & Reasoning - HSE Report" : "4. Critical Observations, Recommendations & Reasoning - Electrical Report",
                    font: "Montserrat",
                    color: "#307268",
                    size: 25,
                    bold: true,
                  })],
                  break: 1,
                         indent:{
                  left:1000,}
                }),
                new Paragraph({ break: 1 }),
                new Table({
alignment: AlignmentType.CENTER, // Centers the table
  width: {
    size: 13838,
    type: WidthType.DXA, 
  },
                  rows: [
                    new TableRow({
                      children: [
                        new TableCell({ 
                          children: [
                            new Paragraph({
                              alignment: AlignmentType.CENTER,
                              children: [
                                new TextRun({
                                  text: "Sr. No",
                                  bold: true,
                                  size: 22,
                                  color: "#efc71d",
                                }),
                              ],
                            }),
                          ],
                          shading: {
                            fill: "#307268",
                          },
                          width: {
                            size: 0.8 * 1440,
                            type: WidthType.DXA,
                          },
                          verticalAlign: VerticalAlign.CENTER,
                        }),
                        new TableCell({
                          children: [
                            new Paragraph({
                              alignment: AlignmentType.CENTER,
                              children: [
                                new TextRun({
                                  text: "Area",
                                  bold: true,
                                  size: 22,
                                  color: "#efc71d",
                                }),
                              ],
                            }),
                          ],
                          shading: {
                            fill: "#307268",
                          },
                          width: {
                            size: 3 * 1440,
                            type: WidthType.DXA,
                          },
                          verticalAlign: VerticalAlign.CENTER,
                        }),
                        new TableCell({
                          children: [
                            new Paragraph({
                              alignment: AlignmentType.CENTER,
                              children: [
                                new TextRun({
                                  text: "Observation",
                                  bold: true,
                                  size: 22,
                                  color: "#efc71d",
                                }),
                              ],
                            }),
                          ],
                          shading: {
                            fill: "#307268",
                          },
                          width: {
                            size: 6.25 * 1440,
                            type: WidthType.DXA,
                          },
                          verticalAlign: VerticalAlign.CENTER,
                        }),
                        new TableCell({
                          children: [
                            new Paragraph({
                              alignment: AlignmentType.CENTER,
                              children: [
                                new TextRun({
                                  text: "Criticality",
                                  bold: true,
                                  color: "#efc71d",
                                  size: 22,
                                }),
                              ],
                            }),
                          ],
                          shading: {
                            fill: "#307268",
                          },
                          width: {
                            size: 2.5 * 1440,
                            type: WidthType.DXA,
                          },
                          verticalAlign: VerticalAlign.CENTER,
                        }),
                        new TableCell({
                          children: [
                            new Paragraph({
                              alignment: AlignmentType.CENTER,
                              children: [
                                new TextRun({
                                  text: "Recommendations",
                                  bold: true,
                                  color: "#efc71d",
                                  size: 22,
                                }),
                              ],
                            }),
                          ],
                          shading: {
                            fill: "#307268",
                          },
                          width: {
                            size: 7 * 1440,
                            type: WidthType.DXA,
                          },
                          verticalAlign: VerticalAlign.CENTER,
                        }),
                        new TableCell({
                          children: [
                            new Paragraph({
                              alignment: AlignmentType.CENTER,
                              children: [
                                new TextRun({
                                  text: "Is Reference",
                                  bold: true,
                                  size: 22,
                                  color: "#efc71d",
                                }),
                              ],
                            }),
                          ],
                          shading: {
                            fill: "#307268",
                          },
                          width: {
                            size: 2.5 * 1440,
                            type: WidthType.DXA,
                          },
                          verticalAlign: VerticalAlign.CENTER,
                        }),
                        ...(reportType === "HSE"
                          ? [
                            new TableCell({
                              children: [
                                new Paragraph({
                                  alignment: AlignmentType.CENTER,
                                  children: [
                                    new TextRun({
                                      text: "Score",
                                      bold: true,
                                      size: 22,
                                      color: "#efc71d",
                                    }),
                                  ],
                                }),
                              ],
                              shading: {
                                fill: "#307268",
                              },
                              width: {
                                size: 2.5 * 1440,
                                type: WidthType.DXA,
                              },
                              verticalAlign: VerticalAlign.CENTER,
                            }),
                          ]
                          : []),
                        new TableCell({
                          children: [
                            new Paragraph({
                              alignment: AlignmentType.CENTER,
                              children: [
                                new TextRun({
                                  text: "Photo Evidence",
                                  bold: true,
                                  size: 22,
                                  color: "#efc71d",
                                }),
                              ],
                            }),
                          ],
                          shading: {
                            fill: "#307268",
                          },
                          width: {
                            size: 6 * 1440,
                            type: WidthType.DXA,
                          },
                          verticalAlign: VerticalAlign.CENTER,
                        }),
                      ],
                    }),
                    ...selectedObsCopy.map((observation, index) => {
                      const rowBase64Images = observation.imageUrls || [];
                      return new TableRow({
                        children: [
                          new TableCell({
                            children: [
                              new Paragraph({
                                text: `${index + 1}`,
                                alignment: AlignmentType.CENTER
                              })
                            ],
                            width: {
                              size: 0.5 * 1440,
                              type: WidthType.DXA,
                            },
                            verticalAlign: VerticalAlign.CENTER,
                          }),
                          // new TableCell({
                          //   children: [new Paragraph(observation.area)],
                          //   width: {
                          //     size: 3 * 1440,
                          //     type: WidthType.DXA,
                          //   },
                          // }),
                          new TableCell({
                            children: [
                              new Paragraph({
                                text: observation.area,
                                alignment: AlignmentType.CENTER, // Horizontal center
                              }),
                            ],
                            verticalAlign: VerticalAlign.CENTER,   // Vertical center
                            width: {
                              size: 3 * 1440,
                              type: WidthType.DXA,
                            },
                          }),
                          new TableCell({
                            // children: [new Paragraph({text:observation.observation,alignment:AlignmentType.CENTER,})],
                            children: [
  new Paragraph({
    text: observation.observation ? observation.observation.replace(/\s+/g, ' ').trim() : "N/A",
    alignment: AlignmentType.CENTER,
  }),
],

                            verticalAlign: VerticalAlign.CENTER,
                            width: {
                              size: 6.25 * 1440,
                              type: WidthType.DXA,
                            },
                          }),
                          new TableCell({
                            children: [
                              new Paragraph({
                                text: observation.criticality || "N/A",
                                alignment: AlignmentType.CENTER
                              })
                            ],
                            width: {
                              size: 2.5 * 1440,
                              type: WidthType.DXA,
                            },
                            verticalAlign: VerticalAlign.CENTER,
                          }),
                          new TableCell({
                            children: [new Paragraph({text:observation.recommendations ? observation.recommendations : "N/A",alignment:AlignmentType.CENTER})],
                            verticalAlign: VerticalAlign.CENTER,
                            width: {
                              size: 7 * 1440,
                              type: WidthType.DXA,
                            },
                          }),
                          new TableCell({
                            children: [new Paragraph({text:observation.is_reference ? observation.is_reference : "N/A",alignment:AlignmentType.CENTER})],
                            verticalAlign: VerticalAlign.CENTER,
                            width: {
                              size: 2.5 * 1440,
                              type: WidthType.DXA,
                            },
                          }),
                          ...(reportType === "HSE"
                            ? [
                              new TableCell({
                                children: [
                                  new Paragraph(
                                    observation.score ? observation.score.toString() : "N/A"
                                  ),
                                ],
                                width: {
                                  size: 2.5 * 1440,
                                  type: WidthType.DXA,
                                },
                              }),
                            ]
                            : []),
                          new TableCell({
                            children: [
                              new Paragraph({
                                alignment: AlignmentType.CENTER,
                                 spacing: {
        before: 80, // top padding (~0.1in)
        after: 80,  // bottom padding (~0.1in)
      },
                                children: Array.isArray(observation.imageUrls) && observation.imageUrls.length > 0
                                  ? observation.imageUrls.map((image, i) => {
                                    return new ImageRun({
                                      data: image,
                                      transformation: {
                                        width: 100,
                                        height: 70,
                                      },
                                    });
                                  })
                                  : [new TextRun("N/A")],
                              }),
                            ],
                            width: {
                              size: 4 * 1440,
                              type: WidthType.DXA,
                            },
                            verticalAlign: VerticalAlign.CENTER,
                          }),
                        ],
                      });
                    }),
                  ],
                })
              ],
              
            },

          {
            properties: {
              page: {
                orientation: PageOrientation.PORTRAIT,
      // size: {
      //   width: 16838,   // 29.7 cm
      //   height: 11906,  // 21 cm
      // },
                margin: {
                  top: 500,
                  left: 500,
                  right: 500
                }
              }
            },
            children:
              reportType !== "HSE"
                ? [
               
                  new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: {
    top: { style: BorderStyle.NONE },
    bottom: { style: BorderStyle.NONE },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
    insideHorizontal: { style: BorderStyle.NONE },
    insideVertical: { style: BorderStyle.NONE },
  },
  rows: [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 70, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ text: "" })],
          shading: { fill: "#ffffff" },
        }),
        new TableCell({
          width: { size: 30, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new ImageRun({
                  data: base64logo,
                  transformation: { width: 120, height: 40 },
                }),
              ],
            }),
          ],
          shading: { fill: "#ffffff" },
        }),
      ],
    }),
  ],
}),
                 new Paragraph({
  children: [
    new TextRun({
      text: "5. Scoring Table",
      font: "Montserrat",
      color: "#307268",
      size: 25,
      bold: true,
    }),
  ],
  indent: { left: 800 },
  spacing: { after: 200 }, // add gap instead of break
  keepNext: true,          // keep with next content
}),

new Table({
   width: { size: 100, type: WidthType.PERCENTAGE },
  borders: {
    top: { style: BorderStyle.NONE },
    bottom: { style: BorderStyle.NONE },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
    insideHorizontal: { style: BorderStyle.NONE },
    insideVertical: { style: BorderStyle.NONE },
  },
  rows: [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 100, type: WidthType.PERCENTAGE },
          margins: {
            left: 800,
            right: 1000,
          },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          children: [
            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              },
              rows: [
                // Header row
                new TableRow({
                  
                  children: [
                    new TableCell({
                       shading: { fill: "#307260" },
                       margins:{
                       left:200,
                       },
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.LEFT,
                          children: [
                            new TextRun({
                              text: "Parameter",
                              bold: true,
                              color: "#efc71d",
                              size: 22,
                            }),
                          ],
                          // shading: { fill: "#307260" },
                        }),
                      ],
                    }),
                    new TableCell({
                       shading: { fill: "#307260" },
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [
                            new TextRun({
                              text: "Max Score",
                              bold: true,
                              color: "#efc71d",
                              size: 22,
                            }),
                          ],
                          // shading: { fill: "#307260" },
                        }),
                      ],
                    }),
                    new TableCell({
                       shading: { fill: "#307260" },
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [
                            new TextRun({
                              text: "Score Obtained",
                              bold: true,
                              color: "#efc71d",
                              size: 22,
                            }),
                          ],
                         
                        }),
                      ],
                    }),
                  ],
                }),

                // Data rows
                ...scores.map(
                  (score) =>
                    new TableRow({
                      children: [
                        new TableCell({
                          children: [
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text: score["Electrical Safety"],
                                  bold: true,
                                }),
                              ],
                            }),
                          ],
                          margins: { top: 100, bottom: 100, left: 100, right: 100 },
                        }),
                        new TableCell({
                          children: [
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text: score["Maximum Score"].toString(),
                                  bold: true,
                                }),
                              ],
                              alignment: AlignmentType.CENTER,
                            }),
                          ],
                          margins: { top: 100, bottom: 100, left: 100, right: 100 },
                        }),
                        new TableCell({
                          children: [
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text: score["Score Obtained"].toString(),
                                  bold: true,
                                }),
                              ],
                              alignment: AlignmentType.CENTER,
                            }),
                          ],
                          margins: { top: 100, bottom: 100, left: 100, right: 100 },
                        }),
                      ],
                    })
                ),

                // Cumulative row
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: "Cumulative", bold: true })],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      shading: { fill: "#efc71d" },
                      margins: { top: 100, bottom: 100, left: 100, right: 100 },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: "25", bold: true })],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      shading: { fill: "#efc71d" },
                      margins: { top: 100, bottom: 100, left: 100, right: 100 },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: cumulativeScore.toString(), bold: true })],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      shading: { fill: "#efc71d" },
                      margins: { top: 100, bottom: 100, left: 100, right: 100 },
                    }),
                  ],
                }),
              ],
              width: { size: 100, type: WidthType.PERCENTAGE },
            }),
          ],
        }),
      ],
    }),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
}),

            
                  //     new Paragraph({
                  //   children: [
                  //     new TextRun({
                  //       text: `Overall Score - ${((cumulativeScore / 10) * 100).toFixed(2)}%`,
                  //       font: "Montserrat",
                  //       color: "#efc71d",
                  //       size: 25,
                  //       bold: true,
                  //     }),
                  //   ],
                  //   break: 1,
                  //   indent:{
                  //     left:1000,
                  //     right:1000,
                  //   }
                  // }),
                  // new Paragraph({ break: 1 }),

new Paragraph({
  children: [
    new TextRun({
      text: "Overall Score - ",
      font: "Montserrat",
      color: "#307268",  // green text
      size: 25,
      bold: true,
    }),
    new TextRun({
      text: `${((cumulativeScore / 25) * 100).toFixed(2)}%`,
      font: "Montserrat",
      color: "#a3a300",  // yellow percentage
      size: 25,
      bold: true,
    }),
  ],
  break: 1,
  indent: {
    left: 800,
    right: 1000,
  },
  spacing: { after: 200,before:200 },
}),
 


// chartImageElectrical &&
//   new Table({
//     rows: [
//       new TableRow({
//         children: [
//           new TableCell({
//             children: [
//               new Paragraph({
//                 alignment: AlignmentType.CENTER,
//                 children: [
//                   new ImageRun({
//                     data: chartImageElectrical,
//                     transformation: {
//                       width: 500,
//                       height: 300,
//                     },
//                   }),
//                 ],
//               }),
//             ],
//             borders: {
//               top: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
//               bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
//               left: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
//               right: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
//             },
//           }),
//         ],
//       }),
//     ],
//     width: {
//       size: 5000,
//       type: WidthType.DXA,
//     },
//     indent: {
//       size: 1000, // shifts the whole table 1000 twips (~0.7 inch) from left
//       type: WidthType.DXA,
//     },
//   }),
chartImageElectrical &&
  new Paragraph({
    indent: {
    left: 800,
  },
    children: [

      new ImageRun({
        data: chartImageElectrical,
        transformation: { width: 620, height: 300 },
      }),
    ],
  }),




                ]
                : [
                  new Table({
                    rows: [
                      new TableRow({
                        children: [
                          new TableCell({
                            width: {
                              size: 100, // Adjust width as needed
                              type: WidthType.PERCENTAGE,
                            },
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: ``,
                                    size: 30,
                                    font: "Montserrat",
                                    color: "#ffffff",
                                  }),
                                ],
                              }),
                            ],

                            verticalAlign: "center",

                          }),
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: [
                                  new ImageRun({
                                    data: base64logo,
                                    transformation: {
                                      width: 120,
                                      height: 40,
                                    },
                                  }),
                                ],
                              }),
                            ],

                            verticalAlign: "center",

                          }),
                        ],
                        tableHeader: true,
                      }),
                    ],
                    width: {
                      size: 100,
                      type: WidthType.PERCENTAGE,
                    },
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                      insideHorizontal: { style: BorderStyle.NONE },
                      insideVertical: { style: BorderStyle.NONE },
                    },
                  }),
               
                  new Paragraph({
                    children: [new TextRun({
                      text: "Dashboard",
                      font: "Montserrat",
                      color: "#307268",
                      size: 25,
                      bold: true
                    })],
                    break: 1,
                      indent:{
                  left:1000,
                  right:1000
                }
                  }),
                  chartImage &&
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new ImageRun({
                        data: chartImage,
                        transformation: {
                          width: 590,
                          height: 550,
                        },
                      }),
                    ],
                  }),
                ],
          },

//  way forward for electrical
...(reportType!=="HSE" ?[       
          {
            properties: {
              page: {
                orientation: PageOrientation.PORTRAIT,
      // size: {
      //   width: 16838,   // 29.7 cm
      //   height: 11906,  // 21 cm
      // },
                margin: {
                  top: 500,
                  left: 500,
                  right: 500
                }
              }
            },
            children: [
              new Table({
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        width: {
                          size: 100, // Adjust width as needed
                          type: WidthType.PERCENTAGE,
                        },
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: ``,
                                size: 30,
                                font: "Montserrat",
                                color: "#ffffff", // Adjust text color for visibility
                              }),
                            ],
                          }),
                        ],

                        verticalAlign: "center",

                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new ImageRun({
                                data: base64logo,
                                transformation: {
                                  width: 120,
                                  height: 40,
                                },
                              }),
                            ],
                          }),
                        ],
                        verticalAlign: "center",
                      }),
                    ],
                    tableHeader: true,

                  }),
                ],
                width: {
                  size: 100,
                  type: WidthType.PERCENTAGE,
                },
                borders: {
                  top: { style: BorderStyle.NONE },
                  bottom: { style: BorderStyle.NONE },
                  left: { style: BorderStyle.NONE },
                  right: { style: BorderStyle.NONE },
                  insideHorizontal: { style: BorderStyle.NONE },
                  insideVertical: { style: BorderStyle.NONE },
                },
              }),
              new Paragraph({
                children: [new TextRun("")],
                break: 1
              }),
              new Paragraph({
                children: [new TextRun({
                  text: "6. Way Forward Plan",
                  font: "Montserrat",
                  color: "#307268",
                  size: 25,
                  bold: true
                })],
                break: 1,
                 indent: {
    left: 800,   // 720 = 0.5 inch left margin
    right: 800,  // 720 = 0.5 inch right margin
  },
              }),
              new Paragraph({ break: 1 }), // Line break after the heading
              // ...theWayForwardParagraph3,
              // Header (outside the block)


new Table({
  rows: [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 100, type: WidthType.PERCENTAGE },
          margins: {
            left: 800,  // 1 inch left gap
            right: 800, // 1 inch right gap
          },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          children: [
            // Inner table with yellow background
            new Table({
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      shading: {
                        type: "clear",
                        color: "auto",
                        fill: "fff8dc", // Light cream-yellow background
                      },
                      margins: {
                        top: 200,    // padding inside yellow box
                        bottom: 200,
                        left: 200,
                        right: 200,
                      },
                      borders: {
                        top: { style: BorderStyle.NONE },
                        bottom: { style: BorderStyle.NONE },
                        left: { style: BorderStyle.NONE },
                        right: { style: BorderStyle.NONE },
                      },
                      children: [
                        ...theWayForwardParagraph3, 
                      ],
                    }),
                  ],
                }),
              ],
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
                insideHorizontal: { style: BorderStyle.NONE },
                insideVertical: { style: BorderStyle.NONE },
              },
            }),
          ],
        }),
      ],
    }),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: {
    top: { style: BorderStyle.NONE },
    bottom: { style: BorderStyle.NONE },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
    insideHorizontal: { style: BorderStyle.NONE },
    insideVertical: { style: BorderStyle.NONE },
  },
}),
new Paragraph({ break: 1 }), 
new Paragraph({ break: 1 }), 
              new Paragraph({
                children: [new TextRun({
                  text: reportType === "HSE" ? "9. Conclusion" : "7. Conclusion",
                  font: "Montserrat",
                  color: "#307260",
                  size: 25,
                  bold: true,
                })],
                break: 1.,
                indent:{
                  left:1000,
                  right:1000
                }
              }),
              new Paragraph({ break: 1 }), // Line break after the heading


new Table({
  rows: [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 100, type: WidthType.PERCENTAGE },
          margins: {
            left: 800,  // 1 inch left gap
            right: 800, // 1 inch right gap
          },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          children: [
            // Inner table with yellow background
            new Table({
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      shading: {
                        type: "clear",
                        color: "auto",
                        fill: "fff8dc", // Light cream-yellow background
                      },
                      margins: {
                        top: 200,    // padding inside yellow box
                        bottom: 200,
                        left: 200,
                        right: 200,
                      },
                      borders: {
                        top: { style: BorderStyle.NONE },
                        bottom: { style: BorderStyle.NONE },
                        left: { style: BorderStyle.NONE },
                        right: { style: BorderStyle.NONE },
                      },
                      children: [
                        ...conclusionParagraph3, 
                      ],
                    }),
                  ],
                }),
              ],
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
                insideHorizontal: { style: BorderStyle.NONE },
                insideVertical: { style: BorderStyle.NONE },
              },
            }),
          ],
        }),
      ],
    }),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: {
    top: { style: BorderStyle.NONE },
    bottom: { style: BorderStyle.NONE },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
    insideHorizontal: { style: BorderStyle.NONE },
    insideVertical: { style: BorderStyle.NONE },
  },
  
}),
new Paragraph({ break: 1 }), 
new Paragraph({ break: 1 }), 
   new Paragraph({ break: 1 }), 
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({
                  text: `"Momentum - Empowering Progress"`,
                  font: "Montserrat",
                  color: "#307260",
                  size: 40,
                  bold: true,
                })],
                break: 1
              }),
            ],
            
          },
        ]:[]),

          //conlusion for HSE 
             ...(reportType==="HSE" ?[
          {
            
            properties: {
              page: {
                orientation: PageOrientation.PORTRAIT,
      // size: {
      //   width: 16838,   // 29.7 cm
      //   height: 11906,  // 21 cm
      // },
                margin: {
                  top: 500,
                  left: 500,
                  right: 500
                }
              }
            },
            children: [
              new Table({
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        width: {
                          size: 100, // Adjust width as needed
                          type: WidthType.PERCENTAGE,
                        },
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: ``,
                                size: 30,
                                font: "Montserrat",
                                color: "#ffffff", // Adjust text color for visibility
                              }),
                            ],
                          }),
                        ],
                        verticalAlign: "center",
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new ImageRun({
                                data: base64logo,
                                transformation: {
                                  width: 120,
                                  height: 40,
                                },
                              }),
                            ],
                          }),
                        ],
                        verticalAlign: "center",
                      }),
                    ],
                    tableHeader: true,
                  }),
                ],
                width: {
                  size: 100,
                  type: WidthType.PERCENTAGE,
                },
                borders: {
                  top: { style: BorderStyle.NONE },
                  bottom: { style: BorderStyle.NONE },
                  left: { style: BorderStyle.NONE },
                  right: { style: BorderStyle.NONE },
                  insideHorizontal: { style: BorderStyle.NONE },
                  insideVertical: { style: BorderStyle.NONE },
                },
              }),
              new Paragraph({
                children: [new TextRun("")],
                break: 1
              }),
new Table({
  rows: [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 100, type: WidthType.PERCENTAGE },
           shading: {
            type: "clear",
            color: "auto",
          },
          margins: {
            left: 800,   // 1 inch left gap
            right: 800,  // 1 inch right gap
          },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Conclusion",
                  font: "Montserrat",
                  color: "#307268",
                  size: 25,
                  bold: true,
                }),
              ],
              break: 1,
            }),
           
          ],
        }),
      ],
    }),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: {
    top: { style: BorderStyle.NONE },
    bottom: { style: BorderStyle.NONE },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
    insideHorizontal: { style: BorderStyle.NONE },
    insideVertical: { style: BorderStyle.NONE },
  },
}), 
new Paragraph({ break: 1 }), 
// Outer table for left/right spacing
new Table({
  rows: [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 100, type: WidthType.PERCENTAGE },
          margins: {
            left: 800,  // 1 inch left gap
            right: 800, // 1 inch right gap
          },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          children: [
            // Inner table with yellow background
            new Table({
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      shading: {
                        type: "clear",
                        color: "auto",
                        fill: "fff8dc", // Light cream-yellow background
                      },
                      margins: {
                        top: 200,    // padding inside yellow box
                        bottom: 200,
                        left: 200,
                        right: 200,
                      },
                      borders: {
                        top: { style: BorderStyle.NONE },
                        bottom: { style: BorderStyle.NONE },
                        left: { style: BorderStyle.NONE },
                        right: { style: BorderStyle.NONE },
                      },
                      children: [
                        ...conclusionParagraph3, 
                      ],
                    }),
                  ],
                }),
              ],
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
                insideHorizontal: { style: BorderStyle.NONE },
                insideVertical: { style: BorderStyle.NONE },
              },
            }),
          ],
        }),
      ],
    }),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: {
    top: { style: BorderStyle.NONE },
    bottom: { style: BorderStyle.NONE },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
    insideHorizontal: { style: BorderStyle.NONE },
    insideVertical: { style: BorderStyle.NONE },
  },
}),
new Paragraph({ break: 1 }), 
new Paragraph({ break: 1 }), 
   new Paragraph({ break: 1 }), 
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({
                  text: `"Momentum - Empowering Progress"`,
                  font: "Montserrat",
                  color: "#307260",
                  size: 40,
                  bold: true,
                })],
                break: 1
              }),


            ],
          },
]:[]),

//           {
//             properties: {
//               page: {
//                 orientation: PageOrientation.PORTRAIT,
//       size: {
//         width: 16838,   // 29.7 cm
//         height: 11906,  // 21 cm
//       },
//                 margin: {
//                   top: 500,
//                   left: 500,
//                   right: 500
//                 }
//               }
//             },
//             children: [
//               new Table({
//                 rows: [
//                   new TableRow({
//                     children: [
//                       new TableCell({
//                         width: {
//                           size: 100, // Adjust width as needed
//                           type: WidthType.PERCENTAGE,
//                         },
//                         children: [
//                           new Paragraph({
//                             children: [
//                               new TextRun({
//                                 text: ``,
//                                 size: 30,
//                                 font: "Montserrat",
//                                 color: "#ffffff",
//                               }),
//                             ],
//                           }),
//                         ],
//                         verticalAlign: "center",
//                       }),
//                       new TableCell({
//                         children: [
//                           new Paragraph({
//                             children: [
//                               new ImageRun({
//                                 data: base64logo,
//                                 transformation: {
//                                   width: 120,
//                                   height: 40,
//                                 },
//                               }),
//                             ],
//                           }),
//                         ],
//                         verticalAlign: "center",
//                       }),
//                     ],
//                     tableHeader: true,
//                   }),
//                 ],
//                 width: {
//                   size: 100,
//                   type: WidthType.PERCENTAGE,
//                 },
//                 borders: {
//                   top: { style: BorderStyle.NONE },
//                   bottom: { style: BorderStyle.NONE },
//                   left: { style: BorderStyle.NONE },
//                   right: { style: BorderStyle.NONE },
//                   insideHorizontal: { style: BorderStyle.NONE },
//                   insideVertical: { style: BorderStyle.NONE },
//                 },
//               }),
//               new Paragraph({
//                 children: [new TextRun("")],
//                 break: 1
//               }),
//               new Paragraph({
//                 children: [new TextRun({
//                   text: reportType === "HSE" ? "9. Conclusion" : "7. Conclusion",
//                   font: "Montserrat",
//                   color: "#307260",
//                   size: 25,
//                   bold: true,
//                 })],
//                 break: 1.,
//                 indent:{
//                   left:1000,
//                   right:1000
//                 }
//               }),
//               new Paragraph({ break: 1 }), // Line break after the heading


// new Table({
//   rows: [
//     new TableRow({
//       children: [
//         new TableCell({
//           width: { size: 100, type: WidthType.PERCENTAGE },
//           margins: {
//             left: 800,  // 1 inch left gap
//             right: 800, // 1 inch right gap
//           },
//           borders: {
//             top: { style: BorderStyle.NONE },
//             bottom: { style: BorderStyle.NONE },
//             left: { style: BorderStyle.NONE },
//             right: { style: BorderStyle.NONE },
//           },
//           children: [
//             // Inner table with yellow background
//             new Table({
//               rows: [
//                 new TableRow({
//                   children: [
//                     new TableCell({
//                       shading: {
//                         type: "clear",
//                         color: "auto",
//                         fill: "fff8dc", // Light cream-yellow background
//                       },
//                       margins: {
//                         top: 200,    // padding inside yellow box
//                         bottom: 200,
//                         left: 200,
//                         right: 200,
//                       },
//                       borders: {
//                         top: { style: BorderStyle.NONE },
//                         bottom: { style: BorderStyle.NONE },
//                         left: { style: BorderStyle.NONE },
//                         right: { style: BorderStyle.NONE },
//                       },
//                       children: [
//                         ...conclusionParagraph3, 
//                       ],
//                     }),
//                   ],
//                 }),
//               ],
//               width: { size: 100, type: WidthType.PERCENTAGE },
//               borders: {
//                 top: { style: BorderStyle.NONE },
//                 bottom: { style: BorderStyle.NONE },
//                 left: { style: BorderStyle.NONE },
//                 right: { style: BorderStyle.NONE },
//                 insideHorizontal: { style: BorderStyle.NONE },
//                 insideVertical: { style: BorderStyle.NONE },
//               },
//             }),
//           ],
//         }),
//       ],
//     }),
//   ],
//   width: { size: 100, type: WidthType.PERCENTAGE },
//   borders: {
//     top: { style: BorderStyle.NONE },
//     bottom: { style: BorderStyle.NONE },
//     left: { style: BorderStyle.NONE },
//     right: { style: BorderStyle.NONE },
//     insideHorizontal: { style: BorderStyle.NONE },
//     insideVertical: { style: BorderStyle.NONE },
//   },
// }),

//               new Paragraph({
//                 children: [new TextRun("")],
//                 break: 5
//               }),
//               new Paragraph({
//                 children: [new TextRun("")],
//                 break: 5
//               }),
//               new Paragraph({
//                 children: [new TextRun("")],
//                 break: 5
//               }),
//               new Paragraph({
//                 children: [new TextRun("")],
//                 break: 5
//               }),
//               new Paragraph({
//                 children: [new TextRun("")],
//                 break: 5
//               }),
//               new Paragraph({
//                 alignment: AlignmentType.CENTER,
//                 children: [new TextRun({
//                   text: `"Momentum - Empowering Progress"`,
//                   font: "Montserrat",
//                   color: "#307260",
//                   size: 40,
//                   bold: true,
//                 })],
//                 break: 1
//               }),
//             ],
//           },
        ],
        numbering: {
          config: [
            {
              reference: "my-cool-numbering",
              levels: [
                {
                  level: 0,
                  format: "decimal", // <--- This is key for 1), 2), etc.
                  text: "%1)",
                  alignment: AlignmentType.LEFT,
                  style: {
                    paragraph: {
                      indent: {
                        left: 300,   // shift list slightly from left
                        hanging: 200, // text wraps nicely after the number
                      },
                    },
                  },
                },
              ],
            },
          ],
        },
      });

      return doc;
    } catch (error) {
      console.error("Error creating Word document:", error);
      return null;
    }
  };
// Function to create breaks (empty lines)
const createBreaks = (num) => {
  return Array(num).fill().map(() => new Paragraph({ children: [new TextRun("\n")] }));
};
  const exportToWord = async () => {
    setLoading(true);
    // await fetchBase64Images();
    const doc = createWordDocument();

    if (doc) {
      try {
        doc.creator = "Your Name";
        doc.title = "Your Document Title";
        doc.description = "Your Document Description";
        doc.keywords = "Keyword1, Keyword2";

        const blob = await Packer.toBlob(doc);
        saveAs(
          blob,
          `${ReportUID}`
        );
      } catch (error) {
        console.error("Error exporting to Word:", error);
      } finally {
        setLoading(false);
      }
    } else {
      console.error("Document is null. Export canceled.");
    }
  };

  return (
    <div>
      <button
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
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.5)"
        }}
        disabled={!isSaved || loading}
        onClick={exportToWord}
      >
        {loading ? 'Please wait...' : 'EXPORT TO WORD'} &nbsp;
        <FileDownloadIcon fontSize="small" />
      </button>
    </div>
  );
};

export default ExportWordDoc;