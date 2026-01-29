import React, { useEffect, useState } from "react";
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";
import HSE_Cover_New from "../../HSE_Report_Cover.png";
import Electrical_Cover_New from "../../Electrical_Safety_Report_Cover.png";
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
  VerticalAlign
} from "docx";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import axios from "../../APIs/axios";
import { config } from "../../config";
import logo from "../../mi_logo_report.png";
import HTMLReactParser from 'html-react-parser';
import htmlDocx from "html-docx-js/dist/html-docx"; 

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

const createBreaks = (num) => {
  const breaks = [];
  for (let i = 0; i < num; i++) {
    breaks.push(new Paragraph({ break: 1 }));
  }
  return breaks;
};
// Convert rgb(...) to hex
const rgbToHex = (rgbString) => {
  const rgbMatch = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!rgbMatch) return null;
  const [_, r, g, b] = rgbMatch;
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = parseInt(x).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
};
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


const ExportWordDoc = ({
  backgroundBrief,
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
  chartImage,
  ReportUID,
  bestPractice,
  theWayForward,
  startDate,
  endDate,
  name,
  facilityInfo,
  introduction,
}) => {
  const [coverImage, setCoverImage] = useState(null);
  const [base64logo, setBase64Logo] = useState(null)
  const [selectedObsCopy, setSelectedObsCopy] = useState([
    ...selectedObservations,
  ]);
  const [loading, setLoading] = useState(false);

  const groupedObservations = selectedObsCopy.reduce((acc, observation) => {
    const { table_type } = observation;

    // Ensure table_type is defined and not null or an empty string
    if (table_type) {
      if (!acc[table_type]) {
        acc[table_type] = [];
      }
      acc[table_type].push(observation);
    } else {
      console.warn("Observation without a valid table_type:", observation);
    }

    return acc;
  }, {});

  let date = startDate.getTime() === endDate.getTime()
    ? `${startDate.getDate()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}-${startDate.getFullYear()}`
    : `${startDate.getDate()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}-${startDate.getFullYear()} to ${endDate.getDate()}-${(endDate.getMonth() + 1).toString().padStart(2, '0')}-${endDate.getFullYear()}`

  let year = startDate.getTime() === endDate.getTime()
    ? startDate.getFullYear()
    : `${startDate.getFullYear()} to ${endDate.getFullYear()}`;

  let service = reportType === "HSE" ? "Health, Safety & Environment Audit" : "Electrical Audit"

  const GenerateCoverpage = async (setCoverImage, client, service, location, date, reportType) => {
    const container = document.createElement("div");
    container.style.width = "850px"; // A4 width in pixels
    container.style.height = "1123px"; // A4 height in pixels
    container.style.position = "absolute";
    container.style.background = "#fff";
    container.style.fontFamily = "Arial, sans-serif";
    container.style.color = "#000";
    const year = new Date().getFullYear();


    // Populate HTML content
    container.innerHTML = `
    <div style="position:relative; text-align:left;">
      <div style="width:100%; height:100%; position:relative;">
        <img src="${reportType === "HSE" ? HSE_Cover_New : Electrical_Cover_New}" style="width:100%; height:100%;" />
      </div>
      <div style="position:absolute; top:40%; width:65%; background-color:#efc71d; clip-path: polygon(0% 0%, 100% 0%, 85% 100%, 0% 100%) !important;
        webkit-clip-path: polygon(0% 0%, 100% 0%, 85% 100%, 0% 100%); padding:10px; box-sizing: border-box;">
        <p style="font-size:20px; color:#307268; margin:5px; padding:3px; border-bottom:1px solid #307268;">
          Client : ${client}
        </p>
        <p style="font-size:20px; color:#307268; margin:5px; padding:3px; border-bottom:1px solid #307268;">
          Location : ${location}
        </p>
        <p style="font-size:20px; color:#307268; margin:5px; padding:3px; border-bottom:1px solid #307268;">
          Service : ${service}
        </p>
        <p style="font-size:20px; color:#307268; margin:5px; padding:3px; border-bottom:1px solid #307268;">
          Date : ${date}
        </p>
        <a href="https://www.momentumindia.in" style="color:#307268; padding:3px; margin:5px; font-size:13px; text-decoration:none;">
          www.momentumindia.in
        </a>
      </div>
      <div style="position:absolute; bottom:15%; left:20%; font-size:45px; font-weight:600; 'Montserrat', sans-serif; color:#f9f3d9;">
        ${reportType === "HSE" ? "HSE<br/>Report" : "Electrical<br/>Safety<br/>Report"}  
        <span style="display: flex; align-items: center; margin-top: 10px; font-size:25px; font-weight:normal">
          <span style="flex-grow: 1; height: 1px; background-color: #f9f3d9; margin-right: 10px;"></span>
          ${year}
        </span>
      </div>

      <div style="position:absolute; bottom:20px; left:20px; font-size:12px; color:#333;">
        Prepared by Momentum India
      </div>
    </div>
  `;

    document.body.appendChild(container);

    // Convert to canvas and generate base64 image
    const canvas = await html2canvas(container);
    const base64Image = canvas.toDataURL("image/png");

    document.body.removeChild(container); // Cleanup

    // Pass base64 image to parent component
    setCoverImage(base64Image);
  };

  useEffect(() => {
    fetchImage();
    fetchBase64Images();
    GenerateCoverpage(setCoverImage, selectedOrganization.label, service, selectedSite.label, date, reportType, year)
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

const cleanHtmlContent = (html) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const paragraphs = [];

  const cleanColor = (color) => color.replace(/[^\w\s]/gi, ''); // Function to clean color strings

  const addParagraph = (text, isBold = false, color = '000000', backgroundColor = 'FFFFFF') => {
    paragraphs.push(new Paragraph({
      children: [
        new TextRun({
          text: text,
          bold: isBold,
          color: cleanColor(color),
          shading: { fill: cleanColor(backgroundColor) },
        }),
      ],
    }));
  };

  Array.from(doc.body.childNodes).forEach((node) => {
    switch (node.nodeName) {
      case "P":
        let paragraphText = (node.textContent || '').replace(/\s+/g, ' ').trim(); // Normalize spaces
        const pColor = node.style.color || '000000'; 
        const pBackgroundColor = node.style.backgroundColor || 'FFFFFF'; 
        addParagraph(paragraphText, false, pColor, pBackgroundColor);
        break;

      case "OL":
        Array.from(node.children).forEach((li, index) => {
          addParagraph(`${index + 1}. ${li.textContent || ''}`);
        });
        break;

      case "STRONG":
        addParagraph(node.textContent || '', true, node.style.color, node.style.backgroundColor);
        break;

      case "BR":
        paragraphs.push(new Paragraph({ children: [new TextRun("\n")] }));
        break;

      default:
        if (node.nodeName === "P" && node.textContent.trim() === "") {
          paragraphs.push(new Paragraph({ children: [new TextRun("\n")] }));
        }
        break;
    }
  });

  return paragraphs;
};


const cleanHtmlContent2 = (html) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const paragraphs = [];

  Array.from(doc.body.childNodes).forEach((node) => {
    if (node.nodeName === "P") {
      const text = node.textContent.trim();
      if (text) {
        paragraphs.push(
          new Paragraph({
            children: [new TextRun(text)],
          })
        );
      }
    } else if (node.nodeName === "OL" || node.nodeName === "UL") {
      Array.from(node.children).forEach((li, index) => {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun(
                node.nodeName === "OL"
                  ? `${index + 1}. ${li.textContent}`
                  : `• ${li.textContent}`
              ),
            ],
          })
        );
      });
    }
  });

  return paragraphs;
};
  const   createWordDocument = () => {
    try {
       // Step 1: Clean and process the backgroundBrief content
    const cleanedContent = cleanHtmlContent(backgroundBrief);
    const contentParagraph=cleanHtmlContent(contents);
    const introductionParagraph=cleanHtmlContent(introduction);
    const executiveSummaryParagraph=cleanHtmlContent(exeSummary);
    const conclusionParagraph=cleanHtmlContent(conclusion);
    const theWayForwardParagraph=cleanHtmlContent(theWayForward);
    const backgroundBriefParagraph2 = cleanHtmlContent2(backgroundBrief);

   //Working paragraph of backgroundbrief
    const backgroundBriefParagraph3=convertHtmlToParagraphs(backgroundBrief);
    const contentParagraph3=convertHtmlToParagraphs(contents);
    const executiveSummaryParagraph3=convertHtmlToParagraphs(exeSummary);
    const theWayForwardParagraph3=convertHtmlToParagraphs(theWayForward);
    const conclusionParagraph3=convertHtmlToParagraphs(conclusion);
    const introductionParagraph3= convertHtmlToParagraphs(introduction);
    const bestPracticeParagraph3=convertHtmlToParagraphs(bestPractice);

      const backgroundBriefParagraphs = backgroundBrief
        .split("\n")
        .map((text) => new Paragraph({ children: [new TextRun(text)] }));
      
       const contentsParagraphs = contents
        .split("\n")
        .map((text) => new Paragraph({ children: [new TextRun(text)] }));
      const introductionParagraphs = introduction
        ? introduction
          .split("\n")
          .map((text) => new Paragraph({ children: [new TextRun(text)] }))
        : [];
      const exeSummaryParagraphs = exeSummary
        .split("\n")
        .map((text) => new Paragraph({ children: [new TextRun(text)] }));

      const parsedExeSummaryParagraphs = HTMLReactParser(exeSummary)

      const conclusionParagraphs = conclusion
        .split("\n")
        .map((text) => new Paragraph({ children: [new TextRun(text)] }));
      const bestPracticeParagraph = bestPractice
        .split("\n")
        .map((text) => new Paragraph({ children: [new TextRun(text)] }));
      const theWaForwardParagraph = theWayForward
        .split("\n")
        .map((text) => new Paragraph({ children: [new TextRun(text)] }));

      const otherDetailsParagraphs = otherDetails && otherDetails
        .split("\n")
        .map((text) => new Paragraph({ children: [new TextRun(text)] }));
      const disclaimer = `This report is based on information provided to us and our own observations during the audit. We have conducted
the audit in accordance with generally accepted auditing standards. This report is provided for informational purposes only and
should not be relied upon as a complete representation of the Safety of the organization's information systems. By using this
information, you agree that Momentum shall be held harmless in any event.`
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
          {
            properties: {
              page: {
                pageNumbers: {
                  start: 0
                },
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
                      height: convertCmToTwip(29.7), // A4 height in cm
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
                      behindDocument: true, // Image behind text
                    },
                  }),
                ],
              }),
            ],
          },

          {
            properties: {
              page: {
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

            footers: {
              default: new Footer({
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({
                        children: [
                          selectedDateTime.split("-").reverse().join("-"),
                          '                                                        Prepared by Momentum India                                                       ',
                          PageNumber.CURRENT,
                        ],
                      }),
                    ],
                  }),
                ],
              }),
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
                                font: "inherit",
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
              // New Table for Particulars Details
              new Paragraph({
                children: [
                  new TextRun({
                    text: "DOCUMENT HISTORY",
                    font: "inherit",
                    color: "#307268",
                    size: 25,
                    bold: true
                  }),
                ],
                break: 1,
              }),
              new Paragraph({
                children: [new TextRun("")],
                break: 1,
              }),
              new Table({
                width: { size: "100%", type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                              new TextRun({
                                font: "Montserrat",
                                text: "PARTICULARS",
                                bold: true,
                                // color: "#efc71d",
                              }),
                            ],
                            shading: {
                              fill: "#efc71d",
                            },
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
                            alignment: AlignmentType.CENTER,
                            children: [
                              new TextRun({
                                font: "Montserrat",
                                text: "DETAILS",
                                bold: true,
                                // color: "#efc71d",
                              }),
                            ],
                            shading: {
                              fill: "#efc71d",
                            },
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
                                text: startDate.getTime() === endDate.getTime()
                                  ? `${startDate.getDate()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}-${startDate.getFullYear()}`
                                  : `${startDate.getDate()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}-${startDate.getFullYear()} to ${endDate.getDate()}-${(endDate.getMonth() + 1).toString().padStart(2, '0')}-${endDate.getFullYear()}`,
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
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                font: "Montserrat",
                                text: "Document Version",
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
                                text: `Enter Document Version Here`,
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
              new Paragraph({
                children: [new TextRun("")],
                break: 1,
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: "BACKGROUND - PROJECT BRIEF",
                    font: "inherit",
                    color: "#307268",
                    size: 25,
                    bold: true
                  }),
                ],
                break: 1,
              }),
              // new Paragraph({ break: 1 }),
              // ...backgroundBriefParagraphs,
              // ...createBreaks(5),
              new Paragraph({ break: 1 }), // Optional, you can customize the space
              // ...backgroundBriefParagraphs,
              ...backgroundBriefParagraph3,
              // ...backgroundBriefParagraph2,
              // ...cleanedContent,
              ...createBreaks(5), // Optional, to add line breaks
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Disclaimer: ",
                    font: "Montserrat",
                    bold: true,
                    size: 18,
                    italics: true
                  }),
                  new TextRun({
                    text: disclaimer,
                    font: "Montserrat",
                    size: 18,
                    italics: true
                  }),
                ],
                break: 1,
              }),
            ],
          },

          {
            properties: {
              page: {
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
                                font: "inherit",
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
              new Paragraph({
                children: [new TextRun({
                  text: "UNDERSTANDING OF REVIEW REPORT - CONTENTS",
                  font: "inherit",
                  color: "#307268",
                  size: 25,
                  bold: true,
                })],
                break: 1
              }),
              new Paragraph({ break: 1 }), // Line break after the heading
              // ...contentsParagraphs,
              // ...contentParagraph
              ...contentParagraph3
            ],
          },

          ...(introduction ? [{
            properties: {
              page: {
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
                                font: "inherit",
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
              new Paragraph({
                children: [
                  new TextRun({
                    text: "1. Introduction",
                    font: "inherit",
                    color: "#307268",
                    size: 25,
                    bold: true,
                  }),
                ],
                break: 1,
              }),
              new Paragraph({ break: 1 }), // Line break after the heading
              // ...introductionParagraphs,
              ...introductionParagraph3,
            ],
          }] : []),

          {
            properties: {
              page: {
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
                                font: "inherit",
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
                  text: reportType === "HSE" ? "2. Executive Summary" : "1. Executive Summary",
                  font: "inherit",
                  color: "#307268",
                  size: 25,
                  bold: true,
                })],
                break: 1
              }),
              new Paragraph({ break: 1 }), // Line break after the heading
              // ...exeSummaryParagraphs,
              // ...executiveSummaryParagraph,
              ...executiveSummaryParagraph3,
            ],
          },

          ...(reportType === "HSE" ? [{
            properties: {
              page: {
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
                                font: "inherit",
                                color: "#ffffff",
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
              new Paragraph({
                children: [
                  new TextRun({
                    // text: reportType === "HSE" ? "3. Academic Information" : "2. Academic Information",
                    text: "3. Academic Information",
                    font: "inherit",
                    color: "#307268",
                    size: 25,
                    bold: true,
                  }),
                ],
                break: 1,
              }),
              new Paragraph({
                children: [new TextRun("")],
                break: 1,
              }),
              new Table({
                width: { size: "100%", type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        width: {
                          size: 40, // Set fixed width for the "FACILITY INFORMATION" column
                          type: WidthType.PERCENTAGE,
                        },
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                              new TextRun({
                                text: "FACILITY INFORMATION",
                                bold: true,
                                color: "#ffffff",
                              }),
                            ],
                            shading: {
                              fill: "#307268",
                            },
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
                            alignment: AlignmentType.CENTER,
                            children: [
                              new TextRun({
                                text: "COMMENTS & NOTES",
                                bold: true,
                                color: "#ffffff",
                              }),
                            ],
                            shading: {
                              fill: "#307268",
                            },
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

                  // Dynamic rows based on the provided object
                  ...Object.entries(facilityInfo).map(([key, value]) =>
                    new TableRow({
                      children: [
                        new TableCell({
                          children: [
                            new Paragraph({
                              children: [new TextRun({ text: key })],
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
                              children: [new TextRun({ text: value })],
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
                    })
                  ),
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
          }] : []),

          {
            properties: {
              page: {
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
                                font: "inherit",
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
                  text: reportType === "HSE" ? "4. Critical Observations" : "2. Critical Observations",
                  font: "inherit",
                  color: "#307268",
                  size: 25,
                  bold: true,
                })],
                break: 1
              }),
              new Paragraph({ break: 1 }), // Line break after the heading
             
              // ...criticalObservations.map(({ observation }) => (
              //   new Paragraph({
              //     text: observation,
              //     bullet: {
              //       level: 0,
              //     },
              //     style: "Normal",
              //     spacing: {
              //       after: 170,
              //     },
              //     font: "Montserrat",
              //   })
              // )),
              ...(criticalObservations.length > 0
  ? criticalObservations.map(({ observation }) =>
      new Paragraph({
        text: observation?.replace(/\s+/g, ' ').trim(),
        bullet: {
          level: 0,
        },
        style: "Normal",
        spacing: {
          after: 170,
        },
        font: "Montserrat",
      })
    )
  : [
      new Paragraph({
        children: [
          new TextRun({
            text: "No critical observations found.",
            color: "808080", 
            size: 22,
          })
        ],
        spacing: {
          after: 170,
        }
      })
    ]),
              
              new Paragraph({ break: 1 }),
              ...otherDetailsParagraphs,
            ],
          },

          reportType === "HSE" ?
            {
              properties: {
                page: {
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
                                  font: "inherit",
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
                  children: [new TextRun("")],
                  break: 1,
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: reportType === "HSE" ? "5. Critical Observations, Recommendations & Reasoning - HSE Report" : "3. Critical Observations, Recommendations & Reasoning - Electrical Report",
                      font: "inherit",
                      color: "#307268",
                      size: 25,
                      bold: true,
                    }),
                  ],
                  break: 1,
                }),
                new Paragraph({ break: 1 }),
                ...(groupedObservations && typeof groupedObservations === 'object' ? Object.keys(groupedObservations).flatMap((tableType, index) => {
                  const observations = groupedObservations[tableType];
                  return [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `${index + 1}. ${tableType}`,
                          font: "Arial",
                          size: 20,
                          bold: true,
                          color: "#307268",
                        }),
                      ],
                      spacing: { after: 200 },
                    }),
                    new Table({
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
                                      size: 25,
                                      color: "#efc71d",
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
                                      text: "Area",
                                      bold: true,
                                      size: 25,
                                      color: "#efc71d",
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
                                      size: 25,
                                      color: "#efc71d",
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
                            new TableCell({
                              children: [
                                new Paragraph({
                                  alignment: AlignmentType.CENTER,
                                  children: [
                                    new TextRun({
                                      text: "Criticality",
                                      bold: true,
                                      size: 25,
                                      color: "#efc71d",
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
                                      text: "Recommendations",
                                      bold: true,
                                      size: 25,
                                      color: "#efc71d",
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
                            new TableCell({
                              children: [
                                new Paragraph({
                                  alignment: AlignmentType.CENTER,
                                  children: [
                                    new TextRun({
                                      text: "Is Reference",
                                      bold: true,
                                      size: 25,
                                      color: "#efc71d",
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
                                          size: 25,
                                          color: "#efc71d",
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
                                      size: 25,
                                      color: "#efc71d",
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
                              children: [new Paragraph(obs.area)],
                              width: { size: 3 * 1440, type: WidthType.DXA },
                              borders: {
                                top: { style: BorderStyle.SINGLE },
                                bottom: { style: BorderStyle.SINGLE },
                                left: { style: BorderStyle.SINGLE },
                                right: { style: BorderStyle.SINGLE },
                              },
                            }),
                            new TableCell({
                              children: [new Paragraph({text:obs.observation,alignment: AlignmentType.CENTER})],
                              width: { size: 6.25 * 1440, type: WidthType.DXA },
                              borders: {
                                top: { style: BorderStyle.SINGLE },
                                bottom: { style: BorderStyle.SINGLE },
                                left: { style: BorderStyle.SINGLE },
                                right: { style: BorderStyle.SINGLE },
                              },
                            }),
                            new TableCell({
                              children: [new Paragraph({ text: obs.criticality || "N/A", alignment: AlignmentType.CENTER })],
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
                              children: [new Paragraph(obs.recommendations || "N/A")],
                              width: { size: 7 * 1440, type: WidthType.DXA },
                              borders: {
                                top: { style: BorderStyle.SINGLE },
                                bottom: { style: BorderStyle.SINGLE },
                                left: { style: BorderStyle.SINGLE },
                                right: { style: BorderStyle.SINGLE },
                              },
                            }),
                            new TableCell({
                              children: [new Paragraph(obs.is_reference || "N/A")],
                              width: { size: 2.5 * 1440, type: WidthType.DXA },
                              borders: {
                                top: { style: BorderStyle.SINGLE },
                                bottom: { style: BorderStyle.SINGLE },
                                left: { style: BorderStyle.SINGLE },
                                right: { style: BorderStyle.SINGLE },
                              },
                            }),
                            ...(reportType === "HSE"
                              ? [
                                new TableCell({
                                  children: [
                                    new Paragraph({ text: obs.score ? obs.score.toString() : "N/A", alignment: AlignmentType.CENTER }),
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
                              ]
                              : []),
                            new TableCell({
                              children: [
                                new Paragraph({
                                  alignment: AlignmentType.CENTER,
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
                          ],
                        })),
                      ],
                      width: { size: 100, type: WidthType.PERCENTAGE },
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
                                  font: "inherit",
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
                    text: reportType === "HSE" ? "5. Critical Observations, Recommendations & Reasoning - HSE Report" : "3. Critical Observations, Recommendations & Reasoning - Electrical Report",
                    font: "inherit",
                    color: "#307268",
                    size: 25,
                    bold: true,
                  })],
                  break: 1
                }),
                new Paragraph({ break: 1 }),
                new Table({
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
                                  size: 25,
                                  color: "#efc71d",
                                }),
                              ],
                            }),
                          ],
                          shading: {
                            fill: "#307268",
                          },
                          width: {
                            size: 0.5 * 1440,
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
                                  size: 25,
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
                                  size: 25,
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
                                  size: 25,
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
                                  size: 25,
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
                                  size: 25,
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
                                      size: 25,
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
                                  size: 25,
                                  color: "#efc71d",
                                }),
                              ],
                            }),
                          ],
                          shading: {
                            fill: "#307268",
                          },
                          width: {
                            size: 4 * 1440,
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

          ...(reportType === "HSE" && bestPractice ? [{
            properties: {
              page: {
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
                                font: "inherit",
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
                break: 1,
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: "6. Global Best Practices",
                    font: "inherit",
                    color: "#307268",
                    size: 25,
                    bold: true,
                  }),
                ],
                break: 1,
              }),
              new Paragraph({ break: 1 }),
              // ...bestPracticeParagraph,
              ...bestPracticeParagraph3,
            ],
          }] : []),

          {
            properties: {
              page: {
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
                                    font: "inherit",
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
                    children: [new TextRun("")],
                    break: 1
                  }),
                  new Paragraph({
                    children: [new TextRun({
                      text: "4.Scoring Table",
                      font: "inherit",
                      color: "#307268",
                      size: 25,
                      bold: true,
                    })],
                    break: 1
                  }),
                  new Paragraph({ break: 1 }),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `Overall Score - ${((cumulativeScore / 10) * 100).toFixed(2)}%`,
                        font: "inherit",
                        color: "#efc71d",
                        size: 25,
                        bold: true,
                      }),
                    ],
                    break: 1,
                  }),

                  new Table({
                    width: { size: "100%", type: WidthType.PERCENTAGE },
                    rows: [
                      new TableRow({
                        children: [
                          new TableCell({
                            children: [
                              new Paragraph({
                                alignment: AlignmentType.LEFT,
                                children: [
                                  new TextRun({
                                    text: "Electrical Safety",
                                    bold: true,
                                    color: "#efc71d",
                                    size: 25,
                                  }),
                                ],
                                shading: {
                                  fill: "#307260",
                                },
                              }),
                            ],

                          }),
                          new TableCell({
                            children: [
                              new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [
                                  new TextRun({
                                    text: "Max Score",
                                    bold: true,
                                    color: "#efc71d",
                                    size: 25,
                                  }),
                                ],
                                shading: {
                                  fill: "#307260",
                                },
                              }),
                            ],

                          }),
                          new TableCell({
                            children: [
                              new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [
                                  new TextRun({
                                    text: "Obtained Score",
                                    bold: true,
                                    color: "#efc71d",
                                    size: 25,
                                  }),
                                ],
                                shading: {
                                  fill: "#307260",
                                },
                              }),
                            ],

                            shading: {
                              fill: "#307260",
                            },
                          }),
                        ],
                      }),
                      ...scores.map(
                        (score, index) =>
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
                                margins: {
                                  top: 100,
                                  bottom: 100,
                                  left: 100,
                                  right: 100,
                                },

                              }),
                              new TableCell({
                                children: [
                                  new Paragraph({
                                    children: [
                                      new TextRun({
                                        text: score["Max Score"].toString(),
                                        bold: true,
                                      }),
                                    ],
                                    alignment: AlignmentType.CENTER,
                                  }),
                                ],
                                margins: {
                                  top: 100,
                                  bottom: 100,
                                  left: 100,
                                  right: 100,
                                },

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
                                margins: {
                                  top: 100,
                                  bottom: 100,
                                  left: 100,
                                  right: 100,
                                },

                              }),
                            ],
                          }),
                      ),
                      new TableRow({
                        children: [
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: "Cumulative",
                                    bold: true,
                                  }),
                                ],
                                alignment: AlignmentType.CENTER,
                              }),
                            ],
                            margins: {
                              top: 100,
                              bottom: 100,
                              left: 100,
                              right: 100,
                            },

                            shading: {
                              fill: "#efc71d",
                            },
                          }),
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: "10",
                                    bold: true,
                                  }),
                                ],
                                alignment: AlignmentType.CENTER,
                              }),
                            ],
                            margins: {
                              top: 100,
                              bottom: 100,
                              left: 100,
                              right: 100,
                            },

                            shading: {
                              fill: "#efc71d",
                            },
                          }),
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: cumulativeScore.toString(),
                                    bold: true,
                                  }),
                                ],
                                alignment: AlignmentType.CENTER,
                              }),
                            ],
                            margins: {
                              top: 100,
                              bottom: 100,
                              left: 100,
                              right: 100,
                            },

                            shading: {
                              fill: "#efc71d", // Yellow color code
                            },
                          }),
                        ],
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
                                    font: "inherit",
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
                      text: "7. Dashboard",
                      font: "inherit",
                      color: "#307268",
                      size: 25,
                      bold: true
                    })],
                    break: 1
                  }),
                  new Paragraph({ break: 1 }),
                  chartImage &&
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new ImageRun({
                        data: chartImage,
                        transformation: {
                          width: 590,
                          height: 600,
                        },
                      }),
                    ],
                  }),
                ],
          },

          {
            properties: {
              page: {
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
                                font: "inherit",
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
                  text: reportType === "HSE" ? "8. Way Forward Plan" : "5. Way Forward Plan",
                  font: "inherit",
                  color: "#307268",
                  size: 25,
                  bold: true
                })],
                break: 1
              }),
              new Paragraph({ break: 1 }), // Line break after the heading
              // ...theWaForwardParagraph,
              // ...theWayForwardParagraph,
              ...theWayForwardParagraph3,
            ],
          },

          {
            properties: {
              page: {
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
                                font: "inherit",
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
                  text: reportType === "HSE" ? "9. Conclusion" : "6. Conclusion",
                  font: "inherit",
                  color: "#307260",
                  size: 25,
                  bold: true,
                })],
                break: 1
              }),
              new Paragraph({ break: 1 }), // Line break after the heading
              // ...conclusionParagraphs,
              //  ...conclusionParagraph,
              ...conclusionParagraph3,
              new Paragraph({
                children: [new TextRun("")],
                break: 5
              }),
              new Paragraph({
                children: [new TextRun("")],
                break: 5
              }),
              new Paragraph({
                children: [new TextRun("")],
                break: 5
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({
                  text: `"Momentum - Empowering Progress"`,
                  font: "inherit",
                  color: "#307260",
                  size: 25,
                  bold: true,
                })],
                break: 1
              }),
            ],
          },
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