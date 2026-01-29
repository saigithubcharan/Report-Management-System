import React, { useState, useEffect } from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  Link,
  PDFDownloadLink,
  Font,
  StyleSheet
} from "@react-pdf/renderer";
import logo from "../../mi_logo_report.png";
import Electrical_Cover_New from "../../Electrical_Safety_Report_Cover.png";
import HSE_Cover_New from "../../HSE_Report_Cover.png";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import axios from "../../APIs/axios";
import { config } from "../../config";
import { toast } from 'react-toastify';
import HTMLReactParser from 'html-react-parser'
import parse from 'html-react-parser';
import { color, fontStyle, fontWeight, textAlign } from "@mui/system";

Font.register({
  family: 'Montserrat',
  fonts: [
    { src: '/fonts/Montserrat-Regular.ttf', fontWeight: 400 },
    { src: '/fonts/Montserrat-Italic.ttf', fontWeight: 400, fontStyle: 'italic' },
    { src: '/fonts/Montserrat-Bold.ttf', fontWeight: 700 },
    { src: '/fonts/Montserrat-BoldItalic.ttf', fontWeight: 700, fontStyle: 'italic' },
  ]
});
const supportedFonts = ["Montserrat", "Roboto", "Lora", "Courier Prime", "Lato", "Merriweather"];

const fallbackFontMap = {

  "arial": "Montserrat",
  "times new roman": "Lora",
  "georgia": "Lora",
  "verdana": "Montserrat",
  "courier new": "Courier",

  // Unsupported fonts fallback
  "lucida sans unicode": "Montserrat",
  "tahoma": "Montserrat",
  "trebuchet ms": "Montserrat",
  "helvetica": "Montserrat",
  "impact": "Montserrat",
  "merriweather": "Montserrat"
};

const sanitizeFontFamily = (font) => {
  if (!font) return "Montserrat";
  const cleanedFont = font.replace(/['"]/g, "").trim();

  if (supportedFonts.includes(cleanedFont)) {
    return cleanedFont;
  }

  return fallbackFontMap[cleanedFont] || "Montserrat";
};

const renderFormattedText = (html) => {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;

  let listItemCounter = 1;

  const parseNode = (node, key, parentTag = null) => {
    
    if (node.nodeType === 3) {
      return <Text key={key}>{node.textContent}</Text>;
    }

    const tag = node.nodeName.toUpperCase();
    const style = {
      fontFamily: "Montserrat", // Default fallback
    };
    

    if (node.getAttribute) {
      const styleAttr = node.getAttribute("style") || "";

      const fontSizeMatch = styleAttr.match(/font-size:\s*(\d+)px/);
      if (fontSizeMatch) {
        style.fontSize = parseInt(fontSizeMatch[1], 10);
      }

      const fontFamilyMatch = styleAttr.match(/font-family:\s*([^;]+)/);
      if (fontFamilyMatch) {
        const rawFont = fontFamilyMatch[1].split(",")[0];
        style.fontFamily = sanitizeFontFamily(rawFont);
      }
    }

    // Tag-based formatting
    if (tag === "B" || tag === "STRONG") {
      style.fontWeight = 700;
    }
    if (tag === "I" || tag === "EM") {
      style.fontStyle = "italic";
    }
    if (tag === "U") {
      style.textDecoration = "underline";
    }
    if (tag === "BR") {
      return <Text key={key}>{"\n"}</Text>;
    }
   

    const children = Array.from(node.childNodes).map((child, i) =>
      parseNode(child, `${key}-${i}`, tag)
    );
    if (tag === "P" && parentTag === "LI") {
      return <Text key={key} style={style}>{children}</Text>;
    }
    if (tag === "P") {
      return (
        <View key={key} style={{ paddingBottom: 4, marginBottom: 4 }}>
          <Text style={{...style,lineHeight:1.5 }}>{children}</Text>
        </View>
      );
    }

    // List handling
    if (tag === "UL" || tag === "OL") {
      listItemCounter = 1;
      return (
        <View key={key} style={{ paddingBottom: 0,marginBottom:0 }}>
          {children}
        </View>
      );
    }

    if (tag === "LI") {
      const isOrdered = parentTag === "OL";
      const bullet = isOrdered ? `${listItemCounter++}.` : "•";
      const flatChildren = children.flatMap(child => {
        if (child?.type === View && child?.props?.children?.type === Text) {
          return child.props.children;
        }
        return child;
      });
      return (
        // <View key={key} style={{ flexDirection: "row",paddingBottom: 0,marginBottom:0 }}>
        //   <Text style={{ marginRight: 5 , marginBottom: 0}}>{bullet}</Text>
        //   <Text style={{ ...style,lineHeight:1}}>{flatChildren}</Text>
        //   {/* <Text style={style}>{children}</Text> */}
        // </View>
        <View
        key={key}
        style={{
          flexDirection: "row",
          // paddingBottom: 4,
          // marginBottom: 4,
        }}
      >
        <Text style={{ marginRight: 5 }}>{bullet}</Text>
        <Text style={{ ...style, lineHeight: 1.5 }}>{flatChildren}</Text>
      </View>
      );
    }

    return (
      // <Text key={key} style={style}>
      <Text key={key} style={{ ...style, lineHeight: 1.5 }}> 
        {children}
      </Text>
    );
  };

  return Array.from(wrapper.childNodes).map((node, i) =>
    parseNode(node, `node-${i}`)
  );
};





const ExportSavedReportPDF = ({
  selectedOrganization,
  selectedSite,
  backgroundBrief,
  contents,
  exeSummary,
  selectedObservations,
  criticalObservations,
  conclusion,
  selectedDateTime,
  reportType,
  isSaved,
  scores,
  cumulativeScore,
  otherDetails,
  chartImage,
  ReportUID,
  startDate,
  endDate,
  bestPractice,
  theWayForward,
  name,
  facilityInfo,
  introduction
}) => {
  const [pdfData, setPdfData] = useState(null); // State to store PDF data
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [updatedObservations, setUpdatedObservations] = useState([]);
  const [fethcingImages, setFetchingImages] = useState(true);


    useEffect(() => {
      fetchImages(selectedObservations);
    }, []);

    const fetchImages = async (observations) => {
      try {
        const updatedObservations = await Promise.all(
          observations.map(async (observation) => {
            let updatedImageUrls = [];
            if (observation.imageUrls && observation.imageUrls.length > 0) {
              updatedImageUrls = await Promise.all(
                observation.imageUrls.map(async (imageUrl) => {
                  try {
                    const response = await axios.get(
                      `${config.PATH
                      }/api/image-to-base64?imageUrl=${encodeURIComponent(
                        imageUrl
                      )}`
                    );
                    if (response.status === 200) {
                      // Convert response data to base64 directly
                      return response.data;
                    } else {
                      throw new Error("Failed to fetch image");
                    }
                  } catch (error) {
                    console.error("Error fetching image:", error);
                    return null;
                  }
                })
              );
            }
            return { ...observation, imageUrls: updatedImageUrls };
          })
        );

        // Generate PDF after fetching images
        setUpdatedObservations(updatedObservations);
        setFetchingImages(false);
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };
  const stripHtml = (html) => {
    if (!html) return "";
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent.replace(/\n\s*\n/g, "\n").trim();
};
  // Function to generate PDF
  const generatePDF = () => {
    let particularDetail = renderParticularsTable();
 
    toast.warning("Generating PDF please wait...");
    const pdfDocument = (
      <Document>
        

        {/* New page in progress to be added below */}
        <Page size="A4" style={styles.page}>
          <View style={styles.footer}>
            <Text style={styles.leftText}>{`Prepared by Momentum India`}</Text>
            <Text
              style={styles.rightText}
              render={({ pageNumber, totalPages }) =>
                `Page ${pageNumber} of ${totalPages}`
              }
            />
          </View>
          <Image
            src={reportType === "HSE" ? HSE_Cover_New : Electrical_Cover_New}
            style={styles.coverImage}
          />
          <View style={styles.reportDetails}>
            <Text style={styles.reportDetailsText}>
              Client : {selectedOrganization.label}
            </Text>
            <Text style={styles.reportDetailsText}>
              Location : {selectedSite.label}
            </Text>
            <Text style={styles.reportDetailsText}>
              Service : HSE Audit
            </Text>
            <Text style={styles.reportDetailsText}>
              Date : {startDate.getTime() === endDate.getTime()
                ? `${startDate.getDate()}-${startDate.getMonth() + 1
                }-${startDate.getFullYear()}`
                : `${startDate.getDate()}-${startDate.getMonth() + 1
                }-${startDate.getFullYear()} to ${endDate.getDate()}-${endDate.getMonth() + 1
                }-${endDate.getFullYear()}`}
            </Text>
            <Link style={styles.reportDetailsLink} href="https://www.momentumindia.in" >
              www.momentumindia.in
            </Link>
          </View>
          <View style={styles.reportTitleDiv}>
            <Text style={styles.reportTitleText}>
              {reportType === "HSE" ? (
                <>
                  HSE{"\n"}Report
                </>
              ) : (
                <>
                  Electrical{"\n"}Safety{"\n"}Report
                </>
              )}
            </Text>
            <View style={styles.reportYear}>
              <View style={styles.yearLine}></View>
              <Text style={styles.reportTitleText}>{new Date().getFullYear()}</Text>
            </View>
          </View>
        </Page>
        {/* New cover page ends here */}

        <Page size="A4" style={styles.page}>
          <Text
            style={styles.footer}
            render={({ pageNumber, totalPages }) =>
              `    ${selectedDateTime.split("-").reverse().join("-")}                                                  Prepared by Momentum India                                                       ${pageNumber}`
            }
            fixed
          />
          <View style={styles.pageTitle}>
            <Image src={logo} style={styles.logoImage} />
          </View>
          <Text style={[styles.pageContent, styles.heading]}>
            DOCUMENT HISTORY
          </Text>
          {/* was not rendering previously */}
        
          {particularDetail}

          <Text style={[styles.pageContent, styles.heading]}>
            BACKGROUND - PROJECT BRIEF
          </Text>
          <Text>{'\n'}</Text>


          {
          
          // <View style={styles.pageContent}>
          <View style={{...styles.pageContent,lineHeight:0.01}}>
          {renderFormattedText(backgroundBrief)}
        </View>
          }

          <Text>{'\n\n\n'}</Text>
          <Text style={styles.pageContent}>
            <Text style={[styles.pageContent, { fontFamily: "Montserrat", fontSize: 9, fontWeight: 800 }]}>{`Disclaimer: `}</Text>
            <Text style={[styles.pageContent, { fontSize: 9,fontFamily: "Montserrat" }]}>{`This report is based on information provided to us and our own observations during the audit. We have conducted the audit in accordance with generally accepted auditing standards. This report is provided for informational purposes only and should not be relied upon as a complete representation of the Safety of the organization's information systems. By using this information, you agree that Momentum shall be held harmless in any event.`}</Text>
          </Text>
        </Page>

        <Page size="A4" style={styles.page}>
          <Text
            style={styles.footer}
            render={({ pageNumber, totalPages }) =>
              `    ${selectedDateTime.split("-").reverse().join("-")}                                                      Prepared by Momentum India                                                           ${pageNumber}`
            }
            fixed
          />
          <View style={styles.pageTitle}>


            <Image src={logo} style={styles.logoImage} />
          </View>

          <Text style={[styles.pageContent, styles.heading]}>
            UNDERSTANDING OF REVIEW REPORT - CONTENTS
          </Text>
          <Text>{'\n'}</Text> {/* Add a line break */}
          
          {

          <View style={{...styles.pageContent,lineHeight:0.01}}>
          {renderFormattedText(contents)}
        </View>
          }
        </Page>

        {introduction ? <Page size="A4" style={styles.page}>
          <Text
            style={styles.footer}
            render={({ pageNumber, totalPages }) =>
              `    ${selectedDateTime.split("-").reverse().join("-")}                                                      Prepared by Momentum India                                                           ${pageNumber}`
            }
            fixed
          />
          <View style={styles.pageTitle}>


            <Image src={logo} style={styles.logoImage} />
          </View>
          <Text style={[styles.pageContent, styles.heading]}>
            1. Introduction
          </Text>
          <Text>{'\n'}</Text>
          {/* {introduction.split("\n").map((line, index) => (
            <Text key={index} style={styles.pageContent}>
              &nbsp;{line}
            </Text>
          ))} */}
            <View style={{...styles.pageContent,lineHeight:0.01}}>
          {renderFormattedText(introduction)}
        </View>
        </Page> : null}

        <Page size="A4" style={styles.page}>
          <Text
            style={styles.footer}
            render={({ pageNumber, totalPages }) =>
              `    ${selectedDateTime.split("-").reverse().join("-")}                                                      Prepared by Momentum India                                                           ${pageNumber}`
            }
            fixed
          />
          <View style={styles.pageTitle}>


            <Image src={logo} style={styles.logoImage} />
          </View>
          <Text style={[styles.pageContent, styles.heading]}>
            {reportType === "HSE" ? "2. Executive Summary" : "1. Executive Summary"}
          </Text>
          <Text>{'\n'}</Text>
          {/* {exeSummary.split("\n").map((line, index) => ( */}
          {
          // executiveSummaryParagraph.split("\n").map((line, index) => (
          //   <Text key={index} style={styles.pageContent}>
          //     &nbsp;{line}
          //   </Text>
          // ))
          // <View style={styles.pageContent}>
          <View style={{...styles.pageContent,lineHeight:0.01}}>
          {renderFormattedText(exeSummary)}
        </View>
          }
        </Page>

        {reportType === "HSE" ?
          <Page size="A4" style={styles.page}>
            {/* Footer */}
            <Text
              style={styles.footer}
              render={({ pageNumber, totalPages }) =>
                `    ${selectedDateTime.split("-").reverse().join("-")}                                                      Prepared by Momentum India                                                           ${pageNumber}`
              }
              fixed
            />

            {/* Page Title and Logo */}
            <View style={styles.pageTitle}>
              <Image src={logo} style={styles.logoImage} />
            </View>

            {/* Page Heading */}
            <Text style={[styles.pageContent, styles.heading]}>
              {reportType === "HSE" ? "3. Academic Information" : "2. Academic Information"}
            </Text>
            <Text>{'\n'}</Text>

            {/* Render Facility Info Table */}
            {renderFacilityInfoTable(facilityInfo)}
          </Page> : null}

        <Page size="A4" style={styles.page}>
          <Text
            style={styles.footer}
            render={({ pageNumber, totalPages }) =>
              `    ${selectedDateTime.split("-").reverse().join("-")}                                                      Prepared by Momentum India                                                           ${pageNumber}`
            }
            fixed
          />
          <View style={styles.pageTitle}>

            <Image src={logo} style={styles.logoImage} />
          </View>
          <Text style={[styles.pageContent, styles.heading]}>
            {reportType === "HSE" ? "4. Critical Observations" : "2. Critical Observations"}
          </Text>
          <Text>{'\n'}</Text>
          
{criticalObservations.length > 0 ? (
  criticalObservations.map((observation, index) => {
    const lines = observation.observation.split('\n').map(line => line.replace(/\s+/g, ' ').trim());

    return (
      <React.Fragment key={index}>
        {/* First line with bullet */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginLeft: 64,
            marginRight: 32,
            marginBottom: 4,
          }}
        >
          <Text style={{ fontSize: 10, marginTop: 2 }}>{`\u2022`}</Text>
          <Text style={[styles.pageContent, { marginLeft: 8, lineHeight: 1.5 }]}>
            {lines[0]}
          </Text>
        </View>

        {/* Remaining lines, indented to align with text (not bullet) */}
        {lines.slice(1).map((line, i) => (
          <View
            key={i}
            style={{
              marginLeft: 72,
              marginRight: 32,
              marginBottom: 4,
            }}
          >
            <Text style={[styles.pageContent, { fontSize: 10, lineHeight: 1.5 }]}>
              {line}
            </Text>
          </View>
        ))}
      </React.Fragment>
    );
  })
) : (
  <View style={[ styles.pageContent ]}>
    <Text style={[styles.pageContent, { color: 'gray' }]}>
      No critical observations found.
    </Text>
  </View>
)}


          {otherDetails &&
            otherDetails.split("\n").map((line, index) => (
              <Text key={index} style={styles.pageContent}>
                &nbsp;{line}
              </Text>
            ))}
        </Page>

        <Page size="A4" style={styles.page} orientation="landscape">
          <Text
            style={styles.footer}
            render={({ pageNumber, totalPages }) =>
              `    ${selectedDateTime.split("-").reverse().join("-")}                                                                               Prepared by Momentum India                                                                                           ${pageNumber}`
            }
            fixed
          />
          {reportType === "HSE" ? renderHseTable() : renderTable()}
        </Page>

        {reportType === "HSE" ? <Page size="A4" style={styles.page}>
          <Text
            style={styles.footer}
            render={({ pageNumber, totalPages }) =>
              `    ${selectedDateTime.split("-").reverse().join("-")}                                                      Prepared by Momentum India                                                           ${pageNumber}`
            }
            fixed
          />
          <View style={styles.pageTitle}>


            <Image src={logo} style={styles.logoImage} />
          </View>
          <Text style={[styles.pageContent, { fontWeight: "bold" }, styles.heading]}>
            6. Global Best Practices
          </Text>
          <Text>{'\n'}</Text>
          {/* {bestPractice.split("\n").map((line, index) => (
            <Text key={index} style={styles.pageContent}>
              &nbsp;{line}
            </Text>
          ))} */}
            <View style={{...styles.pageContent,lineHeight:0.01}}>
          {renderFormattedText(bestPractice)}
        </View>
        </Page> : null}

        {reportType !== "HSE" ? (
          <Page size="A4" style={styles.page}>
            {/* Page 6: Scores */}
            <Text
              style={styles.footer}
              render={({ pageNumber, totalPages }) =>
                `    ${selectedDateTime.split("-").reverse().join("-")}                                                      Prepared by Momentum India                                                           ${pageNumber}`
              }
              fixed
            />
            {renderScoreTable()}
          </Page>
        ) : (
          <Page size="A4" style={styles.page}>
            <View style={styles.footer}>
              <Text
                style={styles.footer}
                render={({ pageNumber, totalPages }) =>
                  `    ${selectedDateTime.split("-").reverse().join("-")}                                                      Prepared by Momentum India                                                           ${pageNumber}`
                }
                fixed
              />
            </View>
            <View style={styles.pageTitle}>


              <Image src={logo} style={styles.logoImage} />
            </View>
            <Text style={[styles.pageContent, styles.heading]}>
              7. Dashboard
            </Text>
            <Image src={chartImage} />
          </Page>
        )}

        <Page size="A4" style={styles.page}>
          {/* Page 7: Conclusion */}
          <Text
            style={styles.footer}
            render={({ pageNumber, totalPages }) =>
              `    ${selectedDateTime.split("-").reverse().join("-")}                                                      Prepared by Momentum India                                                           ${pageNumber}`
            }
            fixed
          />
          <View style={styles.pageTitle}>


            <Image src={logo} style={styles.logoImage} />
          </View>
          <Text style={[styles.pageContent, styles.heading]}>
            {reportType === "HSE" ? "8. Way Forward Plan" : "5. Way Forward Plan"}
          </Text>
          <Text>{'\n'}</Text> {/* Add a line break */}
          {/* {theWayForward.split("\n").map((line, index) => ( */}
          {
          // theWayForwardParagraph.split("\n").map((line, index) => (
          //   <Text key={index} style={styles.pageContent}>
          //     &nbsp;{line}
          //   </Text>
          // ))
          // <View style={styles.pageContent}>
          <View style={{...styles.pageContent,lineHeight:0.01}}>
          {renderFormattedText(theWayForward)}
        </View>
          }
          <Text>{'\n'}</Text>
          <Text>{'\n'}</Text>
          <Text>{'\n'}</Text>
            <Text style={[styles.pageContent, styles.heading]}>
              {reportType === "HSE" ? "9. Conclusion" : "6. Conclusion"}
            </Text>
            <Text>{'\n'}</Text> {/* Add a line break */}
            
            {
            
            // <View style={styles.pageContent}>
            <View style={{...styles.pageContent,lineHeight: 1.5, marginBottom: 10}}>
            {renderFormattedText(conclusion)}
        </View>
          }
          <Text>{'\n'}</Text>
          <Text>{'\n'}</Text>
          <Text>{'\n'}</Text>
          <Text style={{ textAlign: "center", fontSize: 20, color: "#307268" }}>"Momentum - Empowering Progress"</Text>
        </Page>
      </Document>
    );

    // Simulate PDF generation delay
    setTimeout(() => {
      setPdfData(pdfDocument);
      toast.success("PDF generation complete. Creating download link.");
    }, 5000); // Adjust the timeout based on your actual PDF generation time

  };

  const renderScoreTable = () => {
    const customStyles = {
      table: {
        width: "100%",
        // borderStyle: "solid",
        // borderColor: "black",
        // borderWidth: 1,
        padding: 10,
      },
      tableRow: {
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-between",
        borderBottom: 1,
        paddingBottom: 5,
      },
      tableCol: {
        width: '50%',
        borderStyle: 'solid',
        borderWidth: 1,
        padding: 5,
      },
      tableCellHeader: {
        width: "33.33%",
        backgroundColor: "#307268",
        padding: 5,
        borderStyle: "solid",
        borderColor: "black",
        borderWidth: 1,
        fontSize: 12,
        fontWeight: "bold",
        height: "30px",
        textAlign: "center",
        color: "#efc71d"
      },
      tableCellHeaderForFirstColumn: {
        width: "33.33%",
        backgroundColor: "#307268",
        padding: 5,
        borderStyle: "solid",
        borderColor: "black",
        borderWidth: 1,
        fontSize: 12,
        fontWeight: "bold",
        height: "30px",
        textAlign: "center",
        color: "#efc71d"
      },
      tableCell: {
        width: "33.33%",
        padding: 5,
        borderStyle: "solid",
        borderColor: "black",
        borderWidth: 1,
        fontSize: 12,
        backgroundColor: "whitesmoke",
        height: "30px",
        textAlign: "center"
      },
      tableCellForElectricalSafetyColumn: {
        width: "33.33%",
        padding: 5,
        borderStyle: "solid",
        borderColor: "black",
        borderWidth: 1,
        fontSize: 12,
        backgroundColor: "whitesmoke",
        height: "30px",
        textAlign: "left"
      },
      tableCellCumulative: {
        width: "33.33%",
        padding: 5,
        borderStyle: "solid",
        borderColor: "black",
        borderWidth: 1,
        fontSize: 12,
        backgroundColor: "#efc71d",
        height: "30px",
        textAlign: "center",
      },
    };

    return (
      <View>
        <View style={styles.pageTitle}>

          <Image src={logo} style={styles.logoImage} />
        </View>
        <Text style={[styles.pageContent, styles.heading]}>
          4. Scoring Table
          <Text>{'\n'}</Text> {/* Add a line break */}
          <Text>{'\n'}</Text> {/* Add a line break */}
          <Text style={{ color: "#efc71d" }}>Overall Score - <Text style={{ fontSize: 15 }}>{((cumulativeScore / 10) * 100).toFixed(2)}%</Text></Text>
        </Text>
        <View style={customStyles.table}>
          <View style={customStyles.tableRow}>
            <Text style={customStyles.tableCellHeaderForFirstColumn}>Electrical Safety</Text>
            <Text style={customStyles.tableCellHeader}>Max Score</Text>
            <Text style={customStyles.tableCellHeader}>Score Obtained</Text>
          </View>
          {scores.map((row, index) => (
            <View key={index} style={customStyles.tableRow}>
              <Text style={customStyles.tableCellForElectricalSafetyColumn}>
                {row["Electrical Safety"]}
              </Text>
              <Text style={customStyles.tableCell}>{row["Max Score"]}</Text>
              <Text style={customStyles.tableCell}>
                {row["Score Obtained"]}
              </Text>
            </View>
          ))}
          <View style={customStyles.tableRow}>
            <Text style={customStyles.tableCellCumulative}>Cumulative</Text>
            <Text style={customStyles.tableCellCumulative}>10</Text>
            <Text style={customStyles.tableCellCumulative}>
              {cumulativeScore}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderHseTable = () => {
    // Group observations by table_type
    const groupedObservations = updatedObservations.reduce((acc, observation) => {
      const { table_type } = observation;
      if (!acc[table_type]) {
        acc[table_type] = [];
      }
      acc[table_type].push(observation);
      return acc;
    }, {});

    return (
      <View>
        <View style={styles.pageTitle}>
          <Image src={logo} style={styles.logoImage} />
        </View>
        {/* <Text style={[styles.pageContent, styles.heading]}>
          {reportType === "HSE"
            ? `5. Critical Observations, Recommendations & Reasoning – HSE Safety`
            : `4. Critical Observations, Recommendations & Reasoning – Electrical Safety`}
        </Text> */}

        <Text style={[styles.pageContent, styles.heading]}>
          5. Critical Observations, Recommendations & Reasoning - HSE Safety
        </Text>

        {Object.keys(groupedObservations).map((tableType, index) => (
          <View key={index}>
            {/* Table Type Heading */}
            <Text style={[styles.pageContent, styles.subHeading]}>
              {index + 1}. {tableType}
            </Text>

            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={styles.tableCellHeaderForSrNo}>Sr No.1</Text>
                <Text style={styles.tableCellHeader}>Area</Text>
                <Text style={styles.tableCellHeader}>Observation</Text>
                <Text style={styles.tableCellHeader}>Criticality</Text>
                <Text style={styles.tableCellHeader}>Recommendation</Text>
                <Text style={styles.tableCellHeader}>IS Reference</Text>
                {reportType === "HSE" ? (
                  <Text style={styles.tableCellHeader}>Score</Text>
                ) : null}
                <Text style={styles.tableCellHeader}>Photo Evidence</Text>
              </View>

              {groupedObservations[tableType].map((observation, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.cellForSrNo}>{index + 1}</Text>
                  <Text style={styles.tableCell}>
                    {observation.area ? observation.area : "N/A"}
                  </Text>
                  <Text style={styles.tableCell}>
                    {observation.observation ? observation.observation : "N/A"}
                  </Text>
                  <Text style={[styles.tableCell, { textAlign: 'center' }]}>
                    {observation.criticality ? observation.criticality : "N/A"}
                  </Text>
                  <Text style={styles.tableCell}>
                    {observation.recommendations ? observation.recommendations : "N/A"}
                  </Text>
                  <Text style={styles.tableCell}>
                    {observation.is_reference ? observation.is_reference : "N/A"}
                  </Text>
                  {reportType === "HSE" ? (
                    <Text style={styles.tableCell}>
                      {observation.score ? observation.score : "N/A"}
                    </Text>
                  ) : null}
                  <View style={styles.tableCell}>
                    {observation.imageUrls && observation.imageUrls.length > 0 ? (
                      observation.imageUrls.map((imageUrl, imgIndex) => (
                        <React.Fragment key={imgIndex}>
                          <Text>{""}</Text> {/* Add an empty string before every image */}
                          {imageUrl ? (
                            <Image
                              src={`data:image/jpeg;base64,${imageUrl}`}
                              style={styles.tableCellImage}
                            />
                          ) : (
                            <Text key={`na-${imgIndex}`}>N/A</Text>
                          )}
                        </React.Fragment>
                      ))
                    ) : (
                      <Text>N/A</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderTable = () => {
    return (
      <View>
        <View style={styles.pageTitle}>
          <Image src={logo} style={styles.logoImage} />
        </View>
        <Text style={[styles.pageContent, styles.heading]}>
          3. Critical Observations, Recommendations & Reasoning - Electrical Safety
        </Text>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableCellHeaderForSrNo}>Sr No.</Text>
            <Text style={styles.tableCellHeader}>Area</Text>
            <Text style={styles.tableCellHeader}>Observation</Text>
            <Text style={styles.tableCellHeader}>Criticality</Text>
            <Text style={styles.tableCellHeader}>Recommendation</Text>
            <Text style={styles.tableCellHeader}>IS Reference</Text>
            {reportType === "HSE" ? (
              <Text style={styles.tableCellHeader}>Score</Text>
            ) : null}
            <Text style={styles.tableCellHeader}>Photo Evidence</Text>
          </View>
          {updatedObservations.map((observation, index) => (
            <View key={index} style={styles.tableRow}>
              {/* <Text style={styles.cellForSrNo}>{index + 1}</Text> */}
              <View style={[styles.cellForSrNo, {
  display: 'flex',
  alignItems: 'center',      // horizontal center
  justifyContent: 'center',  // vertical center
}]}>
  <Text style={{textAlign: 'center' }}>
    {index + 1}
  </Text>
</View>

              {/* <Text style={[styles.tableCell, { textAlign: 'center' }]}>
                {observation.area ? observation.area : "N/A"}
              </Text> */}
              <View style={[styles.tableCell, {
  display: 'flex',
  alignItems: 'center',         // horizontal center
  justifyContent: 'center',     // vertical center
}]}>
  <Text style={{ textAlign: 'center' }}>
    {observation.area ? observation.area : "N/A"}
  </Text>
</View>
              {/* <Text style={[styles.tableCell, { textAlign: 'center' }]}>
                {observation.observation ? observation.observation : "N/A"}
              </Text> */}
              <View style={[styles.tableCell, {
  display: 'flex',
  alignItems: 'center',         // horizontal center
  justifyContent: 'center',     // vertical center
}]}>
  <Text style={{ textAlign: 'center' }}>
    {/* {observation.observation? observation.observation : "N/A"} */}
    {observation.observation 
  ? observation.observation.replace(/\s+/g, ' ').trim() 
  : "N/A"
}

  </Text>
</View>
              {/* <Text style={[styles.tableCell, { textAlign: 'center' }]}>
                {observation.criticality ? observation.criticality : "N/A"}
              </Text> */}
              <View style={[styles.tableCell, {
  display: 'flex',
  alignItems: 'center',         // horizontal center
  justifyContent: 'center',     // vertical center
}]}>
  <Text style={{ textAlign: 'center' }}>
    {observation.criticality ? observation.criticality : "N/A"}
  </Text>
</View>
              {/* <Text style={[styles.tableCell, { textAlign: 'center' }]}>
                {observation.recommendations ? observation.recommendations : "N/A"}
              </Text> */}
              <View style={[styles.tableCell, {
  display: 'flex',
  alignItems: 'center',         // horizontal center
  justifyContent: 'center',     // vertical center
}]}>
  <Text style={{ textAlign: 'center' }}>
    {observation.recommendations ? observation.recommendations : "N/A"}
  </Text>
</View>
              {/* <Text style={[styles.tableCell, { textAlign: 'center' }]}>
                {observation.is_reference ? observation.is_reference : "N/A"}
              </Text> */}
              <View style={[styles.tableCell, {
  display: 'flex',
  alignItems: 'center',         // horizontal center
  justifyContent: 'center',     // vertical center
}]}>
  <Text style={{ textAlign: 'center' }}>
    {observation.is_reference ? observation.is_reference : "N/A"}
  </Text>
</View>
              {reportType === "HSE" ? (
                // <Text style={styles.tableCell}>
                //   {observation.score ? observation.score : "N/A"}
                // </Text>
                 <View style={[styles.tableCell, {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }]}>
    <Text style={{ textAlign: 'center' }}>
      {observation.score ? observation.score : "N/A"}
    </Text>
  </View>
              ) : null}
              <View style={styles.tableCell}>
                {observation.imageUrls && observation.imageUrls.length > 0 ? (
                  observation.imageUrls.map((imageUrl, imgIndex) => (
                    <React.Fragment key={imgIndex}>
                      <Text>{""}</Text> {/* Add an empty string before every image */}
                      {imageUrl ? (
                        <Image
                          src={`data:image/jpeg;base64,${imageUrl}`}
                          style={styles.tableCellImage}
                        />
                      ) : (
                        <Text key={`na-${imgIndex}`}>N/A</Text>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  // <Text style={{textAlign:"center"}}>N/A</Text>
       <View
  style={{
    flex: 1,                      
    width: '100%',                  
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',           
    justifyContent: 'center',      
  }}
>
  <Text style={{ textAlign: 'center' }}>N/A</Text>
</View>

                )}
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderParticularsTable = () => {
    return (
      <View>
        <View style={styles.tableForHistory}>
          {/* Row for 'Date of Visit' */}
          <View style={styles.tableRow}>
            <Text style={styles.tableCellHeaderForHistory}>PARTICULARS</Text>
            <Text style={styles.tableCellHeaderForHistory}>DETAILS</Text>
          </View>

          {/* Row for 'Date of Visit' */}
          <View style={styles.tableRow}>
            <Text style={styles.tableCellForHistory}>Date of Visit</Text>
            <Text style={styles.tableCellForHistory}>
              {startDate.getTime() === endDate.getTime()
                ? `${startDate.getDate()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}-${startDate.getFullYear()}`
                : `${startDate.getDate()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}-${startDate.getFullYear()} to ${endDate.getDate()}-${(endDate.getMonth() + 1).toString().padStart(2, '0')}-${endDate.getFullYear()}`}
            </Text>

          </View>



          <View style={styles.tableRow}>
            <Text style={styles.tableCellForHistory}>Document Prepared By</Text>
            <Text style={styles.tableCellForHistory}>{name}</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.tableCellForHistory}>Date of Document Submission</Text>
            <Text style={styles.tableCellForHistory}>{selectedDateTime.split("-").reverse().join("-")}</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.tableCellForHistory}>Document Version</Text>
            <Text style={styles.tableCellForHistory}></Text>
          </View>
        </View>
      </View>
    );
  };

  const renderFacilityInfoTable = (facilityInfo) => {
    return (
      <View>
        <View style={styles.tableForHistory}>
          {/* Row for headers */}
          <View style={styles.tableRow}>
            <Text style={styles.tableCellHeaderForHistory}>FACILITY INFORMATION</Text>
            <Text style={styles.tableCellHeaderForHistory}>COMMENTS & NOTES</Text>
          </View>

          {/* Rows for each item in facilityInfo */}
          {Object.entries(facilityInfo).map(([key, value], index) => (
            <View style={styles.tableRow} key={index}>
              <Text style={styles.tableCellForHistory}>{key}</Text>
              <Text style={styles.tableCellForHistory}>{value}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <div>
      {/* Export PDF button */}
      {!pdfData && (
        <button
          onClick={generatePDF} // Call the generatePDF function on button click
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
          // className="button-styles"
          disabled={!isSaved || fethcingImages}
        >
          {generatingPDF || fethcingImages ? "Please Wait..." : "Generate PDF"}
          {pdfData ? null : (
            <FileDownloadIcon fontSize="small" style={{ marginLeft: "8px" }} />
          )}
        </button>
      )}

      {/* PDF download link */}
      {pdfData && (
        <PDFDownloadLink document={pdfData} fileName={ReportUID} style={{textDecoration:"none"}}>
          {({ blob, url, loading, error }) => (
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
              disabled={!isSaved}
            >
              {loading ? "PLEASE WAIT..." : "EXPORT PDF"}
              {loading ? null : (
                <FileDownloadIcon
                  fontSize="small"
                  style={{ marginLeft: "8px" }}
                />
              )}
            </button>
          )}
        </PDFDownloadLink>
      )}
    </div>
  );
};

const styles = {
  body:{
    fontFamily: 'Montserrat',
  },
  coverImage: {
    width: "100%",
    height: 778,
    position: "relative",
  },
  rect: {
    position: "absolute",
    bottom: 282,
    left: 100,
    width: "90%",
    textAlign: "left",
  },
  rectForHse: {
    position: "absolute",
    bottom: 320,
    left: 98,
    width: "90%",
    textAlign: "left",
  },
  rectNew: {
    position: "absolute",
    bottom: 282,
    width: "90%",
    textAlign: "left",
    backgroundColor: "#efc71d",
    clipPath: "polygon(0% 0%, 100% 0%, 85% 100%, 0% 100%)",
    WebkitClipPath: "polygon(0% 0%, 100% 0%, 85% 100%, 0% 100%)",
  },
  valueTextNew: {
    fontSize: 13,
    color: "#307268",
    margin: 5,
    padding: 3,
    borderBottom: "1px solid #307268",
  },
  reportName: {
    fontSize: 25,
    color: "#f9f3d9",
    bottom: 50,
    left: 70
  },
  organizationName: {
    fontSize: 13,
    color: "white",
    margin: 5,
    padding: 3,
  },
  labelText: {
    fontSize: 13,
    color: "#efc71d",
    margin: 5,
    padding: 3,
  },
  valueText: {
    fontSize: 13,
    color: "white",
    margin: 5,
    padding: 3,
  },
  dateTimeText: {
    fontSize: 13,
    color: "white",
    margin: 5,
    padding: 3,
  },
  link: {
    fontSize: 13,
    color: "#007bff",
    margin: 8,
    padding: 3,
  },
  pageTitle: {
    fontSize: 12,
    // backgroundColor: "#02075d",
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end", // Align items to the end
    color: "white",
    alignItems: "center",
    padding: 5,
    margin: "5px",
    flexWrap: "wrap", // Allow text to wrap
    minHeight: "50px", // Adjust minimum height as needed
    boxSizing: "border-box"
  },
  pageContent: { fontSize: 12, marginLeft: 50, marginRight: 50, fontFamily: 'Montserrat', },
  table: {
    display: "table",
    width: "100%",
    borderStyle: "solid",
    borderColor: "black",
    borderWidth: 1,
    padding: 10,
  },
  tableForHistory: {
    display: "table",
    width: "80%",
    // borderWidth: 1,
    padding: 10,
    left: 40
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCellHeaderForSrNo: {
    width: "10%",
    backgroundColor: "#307268",
    padding: 5,
    borderStyle: "solid",
    borderColor: "black",
    borderWidth: 1,
    fontSize: 12,
    fontWeight: "bold",
    color: "#efc71d",
    textAlign: "center"
  },
  tableCellHeader: {
    width: "20%",
    backgroundColor: "#307268",
    padding: 5,
    borderStyle: "solid",
    borderColor: "black",
    borderWidth: 1,
    fontSize: 12,
    fontWeight: "bold",
    color: "#efc71d",
    textAlign: "center"
  },
  cellForSrNo: {
    width: "10%",
    padding: 5,
    borderStyle: "solid",
    borderColor: "black",
    borderWidth: 1,
    fontSize: 12,
    backgroundColor: "whitesmoke",
    textAlign: "center"
  },
  tableCell: {
    width: "20%",
    padding: 5,
    borderStyle: "solid",
    borderColor: "black",
    borderWidth: 1,
    fontSize: 12,
    backgroundColor: "whitesmoke",
  },
  tableCellHeaderForHistory: {
    width: "50%",
    backgroundColor: "#efc71d",
    padding: 5,
    borderStyle: "solid",
    borderColor: "black",
    borderWidth: 1,
    fontSize: 12,
    fontWeight: "bold",
  },
  tableCellForHistory: {
    width: "50%",
    padding: 5,
    borderStyle: "solid",
    borderColor: "black",
    borderWidth: 1,
    fontSize: 12,
    backgroundColor: "whitesmoke",
  },
  tableCellImage: { width: "100%", height: 80 },
  page: {
    fontFamily: 'Montserrat',
    flexDirection: "column",
    borderBottom: 1,
    paddingBottom: 30,
  },
  footer: {
    position: "absolute",
    top: "100%",
    left: 15,
    right: 10,
    // borderTop: 1, 
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 2,
    backgroundColor: "white",
    fontSize: "12px",
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: "grey",
    color: "grey",
    textAlign: "center"
  },
  leftText: {
    fontSize: 10,
  },
  rightText: {
    fontSize: 10,
  },
  logoImage: {
    width: 100,
    height: 30,
  },
  heading: {
    fontFamily: "Montserrat",
    fontSize: 13,
    color: "#307268",
    fontWeight: 800,
    marginTop: 0,
  },
  reportTitle: {
    width: "80%",
    flexWrap: "wrap",
  },
  subHeading: {
    fontSize: 13,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'left',
    color: '#307268',

  },
  // new cover page design css
  reportDetailsLink: {
    color: '#307268',
    padding: '3px',
    margin: '5px',
    fontSize: '13px',
    textDecoration: 'none',
  },
  reportDetails: {
    position: 'absolute',
    top: '40%',
    left: '0',
    width: '65%',
    backgroundColor: '#efc71d',
    padding: '10px',
    boxSizing: 'border-box',
  },
  reportDetailsText: {
    fontSize: '15px',
    color: '#307268',
    margin: '5px',
    padding: '3px',
    borderBottom: '1px solid #307268',
  },
  reportTitleText: {
    fontSize: '45px',
    color: '#f9f3d9',
    fontWeight: 'bold',
    lineHeight: 1,
  },
  reportTitleDiv: {
    position: 'absolute',
    bottom: '15%',
    left: '20%',
    fontSize: '45px',
    fontWeight: '600',
    // fontFamily: 'Montserrat',
    color: '#f9f3d9',
  },
  reportYear: {
    display: 'flex',
    flexDirection:'row',
    alignItems: 'center',
  },

  yearLine: {
    flexGrow: 1,
    height: 1,
    width:'70px',
    backgroundColor: '#f9f3d9',
    marginRight: 10,
  }
};


export default ExportSavedReportPDF;
