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
// import Electrical_Cover_New from "../../Electrical_Safety_Report_Cover.png";
// import Electrical_Cover_New from "../../Electrical PNG.png"; 
import Electrical_Cover_New from "../../ElectricalPortrait.png";
// import HSE_Cover_New from "../../HSE_Report_Cover.png";
import HSE_Cover_New from "../../HSE PNG.png";
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
  improvementOpportunityAreas,
  overallAssessmentIndicator,
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
  introduction,
  chartImageElectrical,
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
  // gaugeImageWord
}) => {
  const [pdfData, setPdfData] = useState(null); // State to store PDF data
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [updatedObservations, setUpdatedObservations] = useState([]);
  const [fethcingImages, setFetchingImages] = useState(true);
// console.log("guage",gaugeImageWord)
// console.log("chart",chartImageElectrical)
// console.log("reportType",reportType)


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
const getDaySuffix = (day) => {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
};

<Text style={styles.tableCellForHistory}>
  {`${startDate.getDate()}${getDaySuffix(startDate.getDate())} ${startDate.toLocaleString("en-US", { month: "short" })} ${startDate.getFullYear()}`}
</Text>
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
  // Function to generate PDF
  const generatePDF = () => {
    let particularDetail = renderParticularsTable();
    let riskTableData=renderRiskLevelTable();
    let auditDescriptionTable = renderAuditDescriptionTable();
  
    let referencesTable = renderReferencesTable();
    
    toast.warning("Generating PDF please wait...");
    const pdfDocument = (
      <Document>
        

    
        {/* for electrical */}
        {reportType !== "HSE"?
        <Page size="A4"  orientation="portrait"
        // style={styles.page}
        >
          {/* <View style={styles.footer}>
            <Text style={styles.leftText}>{`Prepared by Momentum`}</Text>
            <Text
              style={styles.rightText}
              render={({ pageNumber, totalPages }) =>
                `Page ${pageNumber} of ${totalPages}`
              }
            />
          </View> */}
          <Image
            src={reportType === "HSE" ? HSE_Cover_New : Electrical_Cover_New}
            style={styles.coverImage}
          />
          {/* <View style={styles.reportDetails}>
            <Text style={styles.reportDetailsText}>
              Client : {selectedOrganization.label}
            </Text>
            <Text style={styles.reportDetailsText}>
              Location : {selectedSite.label}
            </Text>
            <Text style={styles.reportDetailsText}>
              Service : Electrical Audit
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
          </View> */}
            <Text style={{ position: "absolute", top: 442, left: 120, fontSize: 14, color: "#307268" }}>
    {selectedOrganization.label}
  </Text>
  <Text style={{ position: "absolute", top: 474, left: 120, fontSize: 14, color: "#307268" }}>
    {selectedSite.label}
  </Text>
            <Text style={{ position: "absolute", top: 510, left: 115, fontSize: 14, color: "#307268" }}>
    {reportType === "HSE" ? "HSE Audit" : "Electrical Audit"}
  </Text>
  
  <Text style={{ position: "absolute", top: 543, left: 90, fontSize: 14, color: "#307268" }}>
    {startDate.getTime() === endDate.getTime()
                ? `${startDate.getDate()}-${startDate.getMonth() + 1
                }-${startDate.getFullYear()}`
                : `${startDate.getDate()}-${startDate.getMonth() + 1
                }-${startDate.getFullYear()} to ${endDate.getDate()}-${endDate.getMonth() + 1
                }-${endDate.getFullYear()}`}
  </Text>
        </Page>
        :null}


        {/* for HSE */}
        {reportType==="HSE"?
          <Page size="A4"  orientation="landscape"
        // style={styles.page}
        >
          <Image
            src={reportType === "HSE" ? HSE_Cover_New : Electrical_Cover_New}
            style={styles.coverImageHSE}
          />
         
            <Text style={{ position: "absolute", top: 263, left: 100, fontSize: 14, color: "#307268" }}>
    {selectedOrganization.label}
  </Text>
            <Text style={{ position: "absolute", top: 307, left: 100, fontSize: 14, color: "#307268" }}>
    {reportType === "HSE" ? "HSE Audit" : "Electrical Audit"}
  </Text>
  <Text style={{ position: "absolute", top: 354, left: 100, fontSize: 14, color: "#307268" }}>
    {selectedSite.label}
  </Text>
  <Text style={{ position: "absolute", top: 398, left: 80, fontSize: 14, color: "#307268" }}>
    {startDate.getTime() === endDate.getTime()
                ? `${startDate.getDate()}-${startDate.getMonth() + 1
                }-${startDate.getFullYear()}`
                : `${startDate.getDate()}-${startDate.getMonth() + 1
                }-${startDate.getFullYear()} to ${endDate.getDate()}-${endDate.getMonth() + 1
                }-${endDate.getFullYear()}`}
  </Text>
        </Page>
        :null}


        {/* New cover page ends here */}
       {/* background brief for electrical  */}
       {reportType != "HSE" ?
        <Page size="A4" style={styles.page} orientation="portrait">
          {/* <Text
            style={styles.footer}
            render={({ pageNumber, totalPages }) =>
              `    ${selectedDateTime.split("-").reverse().join("-")}                                                  Prepared by Momentum                                                       ${pageNumber}`
            }
            fixed
          /> */}
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
          <View style={{...styles.pageContent,lineHeight:0.01,backgroundColor:"#fff8dc",padding:"15px"}}>
          {renderFormattedText(backgroundBrief)}
        </View>
          }

          <Text>{'\n\n\n'}</Text>
          <Text style={styles.pageContent}>
            <Text style={[styles.pageContent, { fontFamily: "Montserrat", fontSize: 9, fontWeight: 800,color: "#307268" }]}>{`Disclaimer: `}</Text>
            <Text>{'\n'}</Text> 
            {/* <Text style={[styles.pageContent, { fontSize: 9,fontFamily: "Montserrat" }]}>{`This report is based on information provided to us and our own observations during the audit. We have conducted the audit in accordance with generally accepted auditing standards. This report is provided for informational purposes only and should not be relied upon as a complete representation of the Safety of the organization's information systems. By using this information, you agree that Momentum shall be held harmless in any event.`}</Text> */}
          <Text style={[styles.pageContent, { fontStyle: "italic",fontSize: 10,fontFamily: "Montserrat" }]}>{`This report is based on information provided and observations made during the audit. It is for informational purposes only and does not guarantee complete compliance or absolute safety. The organization is responsible for implementing corrective measures suggested in the audit report. By using this information, you agree that Momentum shall not be held responsible for any untoward events`}</Text>
      
          </Text>
        </Page>: null}
         {/* Understanding report electrical */}
         {reportType != "HSE" ?
        <Page size="A4" style={styles.page} orientation="portrait">
          {/* <Text
            style={styles.footer}
            render={({ pageNumber, totalPages }) =>
              `    ${selectedDateTime.split("-").reverse().join("-")}                                                      Prepared by Momentum                                                           ${pageNumber}`
            }
            fixed
          /> */}
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
        </Page> :null}

      
        {/* executuve summary for electrical */}
        {reportType != "HSE" ?
        <Page size="A4" style={styles.page} orientation="portrait">
          {/* <Text
            style={styles.footer}
            render={({ pageNumber, totalPages }) =>
              `    ${selectedDateTime.split("-").reverse().join("-")}                                                      Prepared by Momentum                                                           ${pageNumber}`
            }
            fixed
          /> */}
          <View style={styles.pageTitle}>


            <Image src={logo} style={styles.logoImage} />
          </View>
          <Text style={[styles.pageContent, styles.heading]}>
            {reportType === "HSE" ? "2. Executive Summary" : "1. Executive Summary"}
          </Text>
          <Text>{'\n'}</Text>
          {
        
          <View style={{...styles.pageContent,lineHeight:0.01,backgroundColor:"#fff8dc",padding:"15px"}}>
          {renderFormattedText(exeSummary)}
        </View>
          }
        </Page>:null}

        {/* improvement opportunity areas for electrical */}
          {reportType != "HSE" ?
        <Page size="A4" style={styles.page} orientation="portrait">
          {/* <Text
            style={styles.footer}
            render={({ pageNumber, totalPages }) =>
              `    ${selectedDateTime.split("-").reverse().join("-")}                                                      Prepared by Momentum                                                           ${pageNumber}`
            }
            fixed
          /> */}
          <View style={styles.pageTitle}>


            <Image src={logo} style={styles.logoImage} />
          </View>
          <Text style={[styles.pageContent, styles.heading]}>
           2. Improvement Opportunity Areas (Deductibles)
          </Text>
          <Text>{'\n'}</Text>
          {
        
          <View style={{...styles.pageContent,lineHeight:0.01,backgroundColor:"#fff8dc",padding:"15px"}}>
          {renderFormattedText(improvementOpportunityAreas)}
        </View>
          }
    </Page>: null}
        {/* overall risk indicator  */}
   {reportType !== "HSE" ?
        // <Page size="A4" style={styles.page} orientation="portrait">
        //   {/* <Text
        //     style={styles.footer}
        //     render={({ pageNumber, totalPages }) =>
        //       `    ${selectedDateTime.split("-").reverse().join("-")}                                                      Prepared by Momentum                                                           ${pageNumber}`
        //     }
        //     fixed
        //   /> */}
        //   <View style={styles.pageTitle}>


        //     <Image src={logo} style={styles.logoImage} />
        //   </View>
        //   <Text style={[styles.pageContent, styles.heading]}>
        //     3. Overall Assessment Indicator
        //   </Text>
        //   <Text>{'\n'}</Text>
        //   {
        
        //   <View style={{...styles.pageContent,lineHeight:0.01}}>
        //   {renderFormattedText(overallAssessmentIndicator)}
        //   <Text>{'\n'}</Text>
        //   <Text style={{...styles.pageContent,lineHeight:0.01}}>Below image is for diaply purpose only </Text>
        //   {/* <Image src={gaugeImageWord}  /> */}
        // </View>
        
        //   }
        // </Page>
<Page size="A4" style={styles.page} orientation="portrait">
  <View style={styles.pageTitle}>
    <Image src={logo} style={styles.logoImage} />
  </View>

  <Text style={[styles.pageContent, styles.heading]}>
    3. Overall Risk Assessment Indicator
  </Text>
  <Text>{'\n'}</Text>

  {/* Table-like container */}
<View>
      {/* Overall Assessment Indicator */}
      <View style={{ flexDirection: "row", marginHorizontal: 40 }}>
        {/* Left box */}
        <View
          style={{
            flex: 2,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: boxColor,
            border: "1pt solid black",
            padding: 10,
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: "bold" }}>
            {`${Math.floor((cumulativeScore / 25) * 100)}%`}
          </Text>
        </View>

        {/* Right box */}
        <View
          style={{
            flex: 8,
            borderTop: "1pt solid black",
            borderRight: "1pt solid black",
            borderBottom: "1pt solid black",
            padding: 4,
            fontSize: 12,
            backgroundColor: "#ffffff",
          }}
        >
          {renderFormattedText(overallAssessmentIndicator)}
        </View>
      </View>

      {/* Risk Legend Heading */}
      <Text
        style={[
          styles.pageContent,
          styles.heading,
          { marginTop: 20, marginLeft: 40 },
        ]}
      >
        Risk Legend
      </Text>
      <view>
      {/* <Text   style={[
          styles.pageContent,
          { marginTop: 20, marginLeft: 40 },
        ]}> The above image is for display purposes only.</Text> */}
</view>
      {/* Risk Legend Table */}
     <View>
  {renderRiskLevelTable()}
</View>

    </View>
</Page>

         : null}

          {/* obervations table */}

          {reportType != "HSE" ?
        <Page size="A4" style={styles.page} orientation="landscape">
          {/* <Text
            style={styles.footer}
            render={({ pageNumber, totalPages }) =>
              `    ${selectedDateTime.split("-").reverse().join("-")}                                                                               Prepared by Momentum                                                                                           ${pageNumber}`
            }
            fixed
          /> */}
            <View style={styles.pageTitle}>
          <Image src={logo} style={styles.logoImage} />
        </View>
        <Text style={[styles.pageContent, styles.heading]}>
          4. Critical Observations, Recommendations & Reasoning - Electrical Safety
        </Text>
        <Text>{'\n'}</Text>
          <view style={{marginHorizontal: 40}}>
          {reportType === "HSE" ? renderHseTable() : renderTable()}</view>
        </Page>:null}


        {/* scoring Table */}

        {reportType!="HSE"? <Page size="A4" style={styles.page} orientation="portrait">
            {/* Page 6: Scores */}
            {/* <Text
              style={styles.footer}
              render={({ pageNumber, totalPages }) =>
                `    ${selectedDateTime.split("-").reverse().join("-")}                                                      Prepared by Momentum                                                           ${pageNumber}`
              }
              fixed
            /> */}
              <View style={styles.pageTitle}>

          <Image src={logo} style={styles.logoImage} />
        </View>
        <Text style={[styles.pageContent, styles.heading]}>
          5. Scoring Table
   </Text>    
        <Text>{'\n'}</Text>
          <view style={{marginHorizontal: 40}}>
            {renderScoreTable()} </view>
          </Page> :null}

           {/* way forward electrical  */}
           {reportType != "HSE" ?
        <Page size="A4" style={styles.page} orientation="portrait">
          {/* Page 7: Conclusion */}
          {/* <Text
            style={styles.footer}
            render={({ pageNumber, totalPages }) =>
              `    ${selectedDateTime.split("-").reverse().join("-")}                                                      Prepared by Momentum                                                           ${pageNumber}`
            }
            fixed
          /> */}
          <View style={styles.pageTitle}>


            <Image src={logo} style={styles.logoImage} />
          </View>
          <Text style={[styles.pageContent, styles.heading]}>
            {reportType === "HSE" ? "8. Way Forward Plan" : "6. Way Forward Plan"}
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
          <View style={{...styles.pageContent,lineHeight:0.01,backgroundColor:"#fff8dc",padding:"15px"}}>
          {renderFormattedText(theWayForward)}
        </View>
          }
          <Text>{'\n'}</Text>
          <Text>{'\n'}</Text>
          <Text>{'\n'}</Text>
            <Text style={[styles.pageContent, styles.heading]}>
              {reportType === "HSE" ? "9. Conclusion" : "7. Conclusion"}
            </Text>
            <Text>{'\n'}</Text> {/* Add a line break */}
            
            {
            
            // <View style={styles.pageContent}>
            <View style={{...styles.pageContent,lineHeight: 1.5, marginBottom: 10,backgroundColor:"#fff8dc",padding:"15px"}}>
            {renderFormattedText(conclusion)}
        </View>
          }
          <Text>{'\n'}</Text>
          <Text>{'\n'}</Text>
          <Text style={{ textAlign: "center", fontSize: 20, color: "#307268" }}>"Momentum - Empowering Progress"</Text>
        </Page>:null}


{/* understanding report hse */}
{reportType === "HSE" ?
 <Page size="A4" style={styles.page} orientation="portrait">
          {/* <Text
            style={styles.footer}
            render={({ pageNumber, totalPages }) =>
              `    ${selectedDateTime.split("-").reverse().join("-")}                                                      Prepared by Momentum                                                           ${pageNumber}`
            }
            fixed
          /> */}
          <View style={styles.pageTitle}>


            <Image src={logo} style={styles.logoImage} />
          </View>

          <Text style={[styles.pageContent, styles.heading]}>
            UNDERSTANDING THE REPORT
          </Text>
          <Text>{'\n'}</Text> {/* Add a line break */}
          
          {

          <View style={{...styles.pageContent,lineHeight:0.01}}>
          {renderFormattedText(contents)}
        </View>
        
          }
           <Text>{'\n'}</Text>
          <Text style={styles.pageContent}>
            <Text style={[styles.pageContent, { fontFamily: "Montserrat", fontSize: 9, fontWeight: 800,color: "#307268" }]}>{`Disclaimer: `}</Text>
            <Text>{'\n'}</Text> 
            <Text style={[styles.pageContent, { fontSize: 9,fontFamily: "Montserrat" }]}>{`This report is based on information provided to us and our own observations during the audit. We have conducted the audit in accordance with generally accepted auditing standards. This report is provided for informational purposes only and should not be relied upon as a complete representation of the Safety of the organization's information systems. By using this information, you agree that Momentum shall be held harmless in any event.`}</Text>
          </Text>
        </Page> :null}

{/* Audit Description hse */}
  {reportType === "HSE" ?
          <Page size="A4" style={styles.page} orientation="portrait">

            {/* Page Title and Logo */}
            <View style={styles.pageTitle}>
              <Image src={logo} style={styles.logoImage} />
            </View>

            {/* Page Heading */}
            <Text style={[styles.pageContent, styles.heading]}>
              Audit Description
            </Text>
            <Text>{'\n'}</Text>
<view> {auditDescriptionTable}</view>
          </Page> : null}

{/* Classification of Auidt Observations hse*/}
   {reportType == "HSE" ?
        <Page size="A4" style={styles.page} orientation="portrait">
          <View style={styles.pageTitle}>


            <Image src={logo} style={styles.logoImage} />
          </View>
        
          <Text style={[styles.pageContent, styles.heading]}>
            Classification of Audit Observations
          </Text>
          <Text>{'\n'}</Text>
          {
        
          <View style={{...styles.pageContent,lineHeight:0.01,backgroundColor:"#fff8dc",padding:"15px"}}>
          {renderFormattedText(classificationOfAuditObservations)}
        </View>
          }
        </Page>:null}

{/* Audit Objective of HSE */}
{reportType == "HSE" ?
        <Page size="A4" style={styles.page} orientation="portrait">
          <View style={styles.pageTitle}>


            <Image src={logo} style={styles.logoImage} />
          </View>
        
          <Text style={[styles.pageContent, styles.heading]}>
            Audit Objective
          </Text>
          <Text>{'\n'}</Text>
          {
        
          <View style={{...styles.pageContent,lineHeight:0.01,backgroundColor:"#fff8dc",padding:"15px"}}>
          {renderFormattedText(backgroundBrief)}
        </View>
          }
        </Page>:null}

{/* Exe summary hse */}
{reportType == "HSE" ?
        <Page size="A4" style={styles.page} orientation="portrait">
          <View style={styles.pageTitle}>


            <Image src={logo} style={styles.logoImage} />
          </View>
        
          <Text style={[styles.pageContent, styles.heading]}>
            Executive Summary
          </Text>
          <Text>{'\n'}</Text>
          {
        
          <View style={{...styles.pageContent,lineHeight:0.01,backgroundColor:"#fff8dc",padding:"15px"}}>
          {renderFormattedText(exeSummary)}
        </View>
          }
        </Page>:null}

{/* Audit scroe analysis  */}
{reportType == "HSE" ?
        <Page size="A4" style={styles.page} orientation="portrait">
          <View style={styles.pageTitle}>


            <Image src={logo} style={styles.logoImage} />
          </View>
        
          <Text style={[styles.pageContent, styles.heading]}>
            Audit Score Analysis
          </Text>
          <Text>{'\n'}</Text>
          {
        
          <View style={{...styles.pageContent,lineHeight:0.01,backgroundColor:"#fff8dc",padding:"15px"}}>
          {renderFormattedText(auditScoreAnalysis)}
        </View>
          }
        </Page>:null}


{/* improvement opportunity areas for hse */}
          {reportType == "HSE" ?
        <Page size="A4" style={styles.page} orientation="portrait">
          {/* <Text
            style={styles.footer}
            render={({ pageNumber, totalPages }) =>
              `    ${selectedDateTime.split("-").reverse().join("-")}                                                      Prepared by Momentum                                                           ${pageNumber}`
            }
            fixed
          /> */}
          <View style={styles.pageTitle}>


            <Image src={logo} style={styles.logoImage} />
          </View>
          <Text style={[styles.pageContent, styles.heading]}>
           Improvement Opportunity Areas (Deductibles)
          </Text>
          <Text>{'\n'}</Text>
          {
        
          <View style={{...styles.pageContent,lineHeight:0.01,backgroundColor:"#fff8dc",padding:"15px"}}>
          {renderFormattedText(improvementOpportunityAreas)}
        </View>
          }
        </Page>: null}
        {/* overall risk indicator hse  */}
  {reportType == "HSE" ?
<Page size="A4" style={styles.page} orientation="portrait">
  <View style={styles.pageTitle}>
    <Image src={logo} style={styles.logoImage} />
  </View>

  <Text style={[styles.pageContent, styles.heading]}>
    Overall Risk Assessment Indicator
  </Text>
  <Text>{'\n'}</Text>

  {/* Table-like container */}
<View>
      {/* Overall Assessment Indicator */}
      <View style={{ flexDirection: "row", marginHorizontal: 40 }}>
        {/* Left box */}
        <View
          style={{
            flex: 2,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: boxColor,
            border: "1pt solid black",
            padding: 10,
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: "bold" }}>
            30%
          </Text>
        </View>

        {/* Right box */}
        <View
          style={{
            flex: 8,
            borderTop: "1pt solid black",
            borderRight: "1pt solid black",
            borderBottom: "1pt solid black",
            padding: 4,
            fontSize: 12,
            backgroundColor: "#ffffff",
          }}
        >
          {renderFormattedText(overallAssessmentIndicator)}
        </View>
      </View>

      {/* Risk Legend Heading */}
      <Text
        style={[
          styles.pageContent,
          styles.heading,
          { marginTop: 20, marginLeft: 40 },
        ]}
      >
        Risk Legend
      </Text>
      <view>
      {/* <Text   style={[
          styles.pageContent,
          { marginTop: 20, marginLeft: 40 },
        ]}> The above image is for display purposes only.
        </Text> */}
</view>
      {/* Risk Legend Table */}
     <View>
  {renderRiskLevelTable()}
</View>

    </View>
</Page>
         : null}

         {/* annexure hse */}
 {reportType === "HSE" ?
          <Page size="A4" style={styles.page} orientation="portrait">

            {/* Page Title and Logo */}
            <View style={styles.pageTitle}>
              <Image src={logo} style={styles.logoImage} />
            </View>

            {/* Page Heading */}
            <Text style={[styles.pageContent, styles.heading]}>
              Annexure-References & Standards
            </Text>
            <Text>{'\n'}</Text>
<view> {referencesTable}</view>
          </Page> : null}


   {/* obervations table hse */}

          {reportType == "HSE" ?
        <Page size="A4" style={styles.page} orientation="landscape">
            <View style={styles.pageTitle}>
          <Image src={logo} style={styles.logoImage} />
        </View>
        <Text style={[styles.pageContent, styles.heading]}>
          Critical Observations, Recommendations & Reasoning - HSE Report
        </Text>
        <Text>{'\n'}</Text>
          <view style={{marginHorizontal: 40}}>
          {renderHseTable()}</view>
        </Page>:null}



        
    {/* {Dashboard} */}
            {reportType !== "HSE" ? (
         ""
        
      
      ) : (
          <Page size="A4" style={styles.page} orientation="portrait">
            {/* <View style={styles.footer}>
              <Text
                style={styles.footer}
                render={({ pageNumber, totalPages }) =>
                  `    ${selectedDateTime.split("-").reverse().join("-")}                                                      Prepared by Momentum                                                           ${pageNumber}`
                }
                fixed
              />
            </View> */}
            <View style={styles.pageTitle}>


              <Image src={logo} style={styles.logoImage} />
            </View>
            <Text style={[styles.pageContent, styles.heading]}>
               Dashboard
            </Text>
            <Image src={chartImage} />
          </Page>
        )}
{/* conclusion */}
{reportType == "HSE" ?
        <Page size="A4" style={styles.page} orientation="portrait">
          <View style={styles.pageTitle}>


            <Image src={logo} style={styles.logoImage} />
          </View>
        
          <Text style={[styles.pageContent, styles.heading]}>
            CONCLUSION
          </Text>
          <Text>{'\n'}</Text>
          {
        
          <View style={{...styles.pageContent,lineHeight:0.01,backgroundColor:"#fff8dc",padding:"15px"}}>
          {renderFormattedText(conclusion)}
          <Text>{'\n'}</Text>
          <Text>{'\n'}</Text>
        
        </View>
          }
           <Text>{'\n'}</Text>
          <Text>{'\n'}</Text>
          <Text style={{ textAlign: "center", fontSize: 20, color: "#307268" }}>"Momentum - Empowering Progress"</Text>
        </Page>:null}

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
              <Text style={customStyles.tableCell}>{row["Maximum Score"]}</Text>
              <Text style={customStyles.tableCell}>
                {row["Score Obtained"]}
              </Text>
            </View>
          ))}
          <View style={customStyles.tableRow}>
            <Text style={customStyles.tableCellCumulative}>Cumulative</Text>
            <Text style={customStyles.tableCellCumulative}>25</Text>
            <Text style={customStyles.tableCellCumulative}>
              {cumulativeScore}
            </Text>
          </View>
        </View>
                              <Text style={{ color: "#307268",marginLeft:"50px",marginTop:"2px",
                    marginBottom:"50px"
                   }}>Overall Score - <Text style={{ color: "#a3a300",fontSize: 15 }}>{((cumulativeScore / 25) * 100).toFixed(2)}%</Text></Text>
     <Image src={chartImageElectrical} style={{ width: 400, height: 230, 
      // marginLeft:"100px",
      marginTop:"5px"
      }} />
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
  {Object.keys(groupedObservations).length === 0 ||
  Object.values(groupedObservations).every(
    (obsArray) => !obsArray || obsArray.length === 0
  ) ? (
    <Text
      style={{
        fontSize: 15,
        textAlign: "center",
        marginVertical: 10,
        fontStyle: "italic",
      }}
    >
      No observations are selected
    </Text>
  ) : (
    Object.keys(groupedObservations).map((tableType, index) => (
      <View key={index}>
        {/* Table Type Heading */}
        <Text style={[styles.pageContent, styles.subHeading]}>
          {index + 1}. {tableType}
        </Text>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableCellHeaderForSrNo}>Sr No.</Text>
            <Text style={styles.tableCellHeader}>Area / Process</Text>
            <Text style={styles.tableCellHeader}>Observation</Text>
            <Text style={styles.tableCellHeader}>Criticality</Text>
            <Text style={styles.tableCellHeader}>Objective Evidence</Text>
            <Text style={styles.tableCellHeader}>Legal Reference (if any)</Text>
            <Text style={styles.tableCellHeader}>Recommendation</Text>
          </View>

          {groupedObservations[tableType].map((observation, obsIndex) => (
            <View key={obsIndex} style={styles.tableRow}>
              <Text style={styles.cellForSrNo}>{obsIndex + 1}</Text>
              <Text style={styles.tableCell}>
                {observation.area || "N/A"}
              </Text>
              <Text style={styles.tableCell}>
                {observation.observation || "N/A"}
              </Text>
              <Text style={[styles.tableCell, { textAlign: "center" }]}>
                {observation.criticality || "N/A"}
              </Text>

              <View style={styles.tableCell}>
                {observation.imageUrls?.length > 0 ? (
                  observation.imageUrls.map((imageUrl, imgIndex) => (
                    <React.Fragment key={imgIndex}>
                      {imageUrl ? (
                        <Image
                          src={`data:image/jpeg;base64,${imageUrl}`}
                          style={styles.tableCellImage}
                        />
                      ) : (
                        <Text>N/A</Text>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <Text>N/A</Text>
                )}
              </View>

              <Text style={styles.tableCell}>
                {observation.is_reference || "N/A"}
              </Text>
              <Text style={styles.tableCell}>
                {observation.recommendations || "N/A"}
              </Text>
            </View>
          ))}
        </View>
      </View>
    ))
  )}
</View>

    );
  };

  const renderTable = () => {
    return (
      <View>
      

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
          {/* <View style={styles.tableRow}>
            <Text style={styles.tableCellHeaderForHistory}>PARTICULARS</Text>
            <Text style={styles.tableCellHeaderForHistory}>DETAILS</Text>
          </View> */}

          <View style={{ flexDirection: "row" }}>
  <Text
    style={{
      width: "50%",
      backgroundColor: "#efc71d",
      padding: 5,
      borderStyle: "solid",
      borderColor: "black",
      borderWidth: 1,
      fontSize: 12,
      fontWeight: "bold",
      textAlign: "center",      // Center text horizontally
      justifyContent: "center", // Center content (React Native PDF support)
      alignItems: "center",     // Center content vertically
    }}
  >
    PARTICULARS
  </Text>

  <Text
    style={{
      width: "50%",
      backgroundColor: "#efc71d",
      padding: 5,
      borderStyle: "solid",
      borderColor: "black",
      borderWidth: 1,
      fontSize: 12,
      fontWeight: "bold",
      textAlign: "center",      // Center text horizontally
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    DETAILS
  </Text>
</View>

          {/* Row for 'Date of Visit' */}
          <View style={styles.tableRow}>
            <Text style={styles.tableCellForHistory}>Date of Visit</Text>
            {/* <Text style={styles.tableCellForHistory}>
              {startDate.getTime() === endDate.getTime()
                ? `${startDate.getDate()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}-${startDate.getFullYear()}`
                : `${startDate.getDate()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}-${startDate.getFullYear()} to ${endDate.getDate()}-${(endDate.getMonth() + 1).toString().padStart(2, '0')}-${endDate.getFullYear()}`}
            </Text> */}
<Text style={styles.tableCellForHistory}>
  {`${startDate.getDate()}${getDaySuffix(startDate.getDate())} ${startDate.toLocaleString("en-US", { month: "short" })} ${startDate.getFullYear()}`}
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

          {/* <View style={styles.tableRow}>
            <Text style={styles.tableCellForHistory}>Document Version</Text>
            <Text style={styles.tableCellForHistory}></Text>
          </View> */}
        </View>
      </View>
    );
  };
const renderRiskLevelTable = () => {
  return (
    <View style={styles.riskTable}>
      {/* Header Row */}
      <View style={styles.riskTableRow}>
        <Text style={[styles.riskTableHeaderCell, { flex: 2 }]}>Score Range</Text>
        <Text style={[styles.riskTableHeaderCell, { flex: 2 }]}>Risk Level</Text>
        <Text style={[styles.riskTableHeaderCell, { flex: 6 }]}>Interpretation</Text>
      </View>

      {/* Data Rows */}
      {riskLevels.map((level, idx) => (
        <View key={idx} style={styles.riskTableRow}>
          <Text style={[styles.riskTableCell, { flex: 2, color: level.color }]}>
            {level.range}
          </Text>
          <Text
            style={[
              styles.riskTableCell,
              { flex: 2, backgroundColor: level.color, color: "#000" },
            ]}
          >
            {level.risk}
          </Text>
          <Text style={[styles.riskTableCell, { flex: 6 }]}>
            {level.interpretation}
          </Text>
        </View>
      ))}
    </View>
  );
};
const renderAuditDescriptionTable = () => {
  return (
    <View style={styles.tableForHistory}>
      {/* Header Row */}
      {/* <View style={styles.tableRow}>
        <Text style={styles.tableCellHeaderForHistory}>DESCRIPTION</Text>
        <Text style={styles.tableCellHeaderForHistory}>DETAILS</Text>
      </View> */}

      {/* Table rows */}
      <View style={styles.tableRow}>
        <Text style={styles.tableCellForHistory}>Client</Text>
        <Text style={styles.tableCellForHistory}>{selectedOrganization?.label || "N/A"}</Text>
      </View>

      <View style={styles.tableRow}>
        <Text style={styles.tableCellForHistory}>Location</Text>
        <Text style={styles.tableCellForHistory}>{selectedSite?.label || "N/A"}</Text>
      </View>

      <View style={styles.tableRow}>
        <Text style={styles.tableCellForHistory}>Date of Site Visit</Text>
        <Text style={styles.tableCellForHistory}>
          {`${startDate.getDate()}-${(startDate.getMonth() + 1).toString().padStart(2, "0")}-${startDate.getFullYear()}`}
        </Text>
      </View>

      <View style={styles.tableRow}>
        <Text style={styles.tableCellForHistory}>Study</Text>
        <Text style={styles.tableCellForHistory}>HSE Audit Report</Text>
      </View>

      <View style={styles.tableRow}>
        <Text style={styles.tableCellForHistory}>Time of Audit (From & To)</Text>
        <Text style={styles.tableCellForHistory}>
          {timeFrom && timeTo
            ? `${timeFrom} to ${timeTo}`
            : timeFrom
            ? `${timeFrom} to N/A`
            : timeTo
            ? `N/A to ${timeTo}`
            : "N/A"}
        </Text>
      </View>

      <View style={styles.tableRow}>
        <Text style={styles.tableCellForHistory}>Brief Property Description</Text>
        <Text style={styles.tableCellForHistory}>{briefPropertyDescription || "N/A"}</Text>
      </View>

      <View style={styles.tableRow}>
        <Text style={styles.tableCellForHistory}>Number of floors</Text>
        <Text style={styles.tableCellForHistory}>{numOfFloors || "N/A"}</Text>
      </View>

      <View style={styles.tableRow}>
        <Text style={styles.tableCellForHistory}>Average Staff Footfall</Text>
        <Text style={styles.tableCellForHistory}>{avgStaffFootfall || "N/A"}</Text>
      </View>

      <View style={styles.tableRow}>
        <Text style={styles.tableCellForHistory}>No Objection Certificate</Text>
        <Text style={styles.tableCellForHistory}>{noObjectionCertificate || "N/A"}</Text>
      </View>

      <View style={styles.tableRow}>
        <Text style={styles.tableCellForHistory}>National Building Code Category</Text>
        <Text style={styles.tableCellForHistory}>{nationalBuildingCodeCategory || "N/A"}</Text>
      </View>

      <View style={styles.tableRow}>
        <Text style={styles.tableCellForHistory}>Coordinating Person – Client Side</Text>
        <Text style={styles.tableCellForHistory}>{coordinationgPersonClientside || "N/A"}</Text>
      </View>

      <View style={styles.tableRow}>
        <Text style={styles.tableCellForHistory}>Report Prepared By</Text>
        <Text style={styles.tableCellForHistory}>{reportPreparedBy || "N/A"}</Text>
      </View>

      <View style={styles.tableRow}>
        <Text style={styles.tableCellForHistory}>Report Reviewed By</Text>
        <Text style={styles.tableCellForHistory}>{reportReviewedBy || "N/A"}</Text>
      </View>

      <View style={styles.tableRow}>
        <Text style={styles.tableCellForHistory}>Date of Submission of Report</Text>
        <Text style={styles.tableCellForHistory}>
          {`${endDate.getDate()}-${(endDate.getMonth() + 1).toString().padStart(2, "0")}-${endDate.getFullYear()}`}
        </Text>
      </View>
    </View>
  );
};
const renderReferencesTable = () => {
  return (
    <View style={styles.tableForHistory}>
      {/* Table Header */}
      <View style={styles.tableRow}>
        {/* <Text style={styles.tableCellHeaderForHistory}> */}
        <Text style={[styles.tableCellHeaderForHistory, { flex: 1.2 }]}>
          Reference Type and Document / Standard
        </Text>
        {/* <Text style={styles.tableCellHeaderForHistory}> */}
         <Text style={[styles.tableCellHeaderForHistory, { flex: 1.8 }]}>
          Relevance to Audit Findings
        </Text>
      </View>

      {/* Table Body */}
      {references?.map((ref) => {
        if (ref.type === "heading") {
          return (
            <View key={ref.id} style={styles.sectionHeadingRow}>
              <Text style={styles.sectionHeadingText}>{ref.section_name}</Text>
            </View>
          );
        } else {
          return (
            <View key={ref.id} style={styles.tableRow}>
              {/* <Text style={styles.tableCellForHistory}> */}
               <Text style={[styles.tableCellForHistory, { flex: 1.2 }]}>
                {ref.document || "N/A"}</Text>
              {/* <Text style={styles.tableCellForHistory}> */}
               <Text style={[styles.tableCellForHistory, { flex: 1.8 }]}>
                {ref.relevance || "N/A"}</Text>
            </View>
          );
        }
      })}
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
  tableForHistory: {
    display: "table",
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    marginTop: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#000",
  },
  tableCellHeaderForHistory: {
    flex: 1,
    fontWeight: "bold",
    fontSize: 10,
    padding: 5,
    backgroundColor: "#f0f0f0",
    borderRightWidth: 1,
    borderColor: "#000",
  },
  tableCellForHistory: {
    flex: 1,
    fontSize: 10,
    padding: 5,
    borderRightWidth: 1,
    borderColor: "#000",
  },
  sectionHeadingRow: {
    backgroundColor: "#e0e0e0",
    borderBottomWidth: 1,
    borderColor: "#000",
    padding: 5,
  },
  sectionHeadingText: {
    fontWeight: "bold",
    fontSize: 10,
  },

  // coverImage: {
  //   width: "100%",
  //   height: 778,
  //   position: "relative",
  // },
 coverImage: {
  width: "100%",   // stretch across page
  height: 840,     // match A4 portrait height (≈595 pt in React-PDF)
  position: "relative",
  objectFit: "cover", // ensures no white gaps, maintains ratio
},
  coverImageHSE: {
  width: "100%",   // stretch across page
  height: 595,     
  position: "relative",
  objectFit: "cover", // ensures no white gaps, maintains ratio
},
  rect: {
    position: "absolute",
    bottom: 282,
    left: 100,
    width: "90%",
    textAlign: "left",
  },
  riskTable: {
    marginHorizontal: 40,
    marginTop: 20,
    border: "1pt solid black",
  },
  riskTableRow: {
    flexDirection: "row",
    borderTop: "1pt solid black",
  },
  riskTableHeaderCell: {

    textAlign: "center",
    backgroundColor: "#307260",
    color: "#efc71d",
    fontSize: 12,
    fontWeight: "bold",
    padding: 6,
    borderRight: "1pt solid black",
  },
  riskTableCell: {
    textAlign: "center",
    fontSize: 12,
    padding: 4,
    borderRight: "1pt solid black",
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
    fontSize: 10,
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
    fontSize: 10,
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
    fontSize: 10,
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
