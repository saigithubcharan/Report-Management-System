// import React from "react";
// import { saveAs } from "file-saver";
// import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, PageOrientation } from "docx";
// import { parseDocument } from "htmlparser2";

// // Function to convert rgb(x, y, z) to hex (#RRGGBB)
// const rgbToHex = (rgb) => {
//     const match = rgb.match(/\d+/g);
//     if (!match || match.length !== 3) return null;
//     return `#${((1 << 24) + (parseInt(match[0]) << 16) + (parseInt(match[1]) << 8) + parseInt(match[2])).toString(16).slice(1)}`;
// };

// // Function to parse HTML and convert it to DOCX elements
// const convertHtmlToDocx = (html) => {
//     const root = parseDocument(html);
//     const elements = [];

//     const traverseNodes = (node) => {
//         if (!node || !node.type) return;

//         if (node.type === "text") {
//             elements.push(new Paragraph({ children: [new TextRun(node.data)] }));
//         } else if (node.type === "tag") {
//             const style = node.attribs?.style || "";
//             let color = "";
//             let bgColor = "";
//             let bold = false;
//             let italic = false;
//             let underline = false;

//             // Extract inline styles
//             if (style.includes("color:")) {
//                 const match = style.match(/color:\s*(rgb\([\d,\s]+\)|#[0-9a-fA-F]+)/);
//                 if (match) color = match[1].includes("rgb") ? rgbToHex(match[1]) : match[1];
//             }
//             if (style.includes("background-color:")) {
//                 const match = style.match(/background-color:\s*(rgb\([\d,\s]+\)|#[0-9a-fA-F]+)/);
//                 if (match) bgColor = match[1].includes("rgb") ? rgbToHex(match[1]) : match[1];
//             }

//             // Apply tag-based styles
//             if (node.name === "strong" || node.name === "b") bold = true;
//             if (node.name === "em" || node.name === "i") italic = true;
//             if (node.name === "u") underline = true;

//             const textRuns = [];
//             node.children.forEach((child) => {
//                 if (child.type === "text") {
//                     textRuns.push(
//                         new TextRun({
//                             text: child.data.trim(),
//                             bold,
//                             italics: italic,
//                             underline: underline ? { type: "single" } : undefined,
//                             color: color || undefined,
//                             bgColor: bgColor
//                         })
//                     );
//                 } else {
//                     traverseNodes(child);
//                 }
//             });

//             if (textRuns.length > 0) {
//                 elements.push(new Paragraph({ children: textRuns }));
//             }
//         }
//     };

//     root.children.forEach(traverseNodes);
//     return elements;
// };

// const generateWordDocument = async () => {
//     // Sample HTML Content (Replace with your actual rich text)
//     const htmlContent = `
//         <p>
//     The Electrical Safety Overview was carried out at <strong>Netflix (Mumbai)</strong> on <u>6-3-2025</u> till <u>6-3-2025</u> and 
//     <strong>spanned ____________</strong>.
// </p>

// <p>
//     The audit focused on current electrical safety conditions to form the basis for future up-gradation measures, 
//     immediate safety measures, and understanding in terms of basic and advanced training (safety, security, and 
//     emergency response) and allied requirements of equipment and tools.
// </p>

// <h2>Audit Scope</h2>
// <ul>
//     <li>Discussion with plant representatives and some Technicians associated with electrical maintenance about 
//         their understanding of electrical safety practices, hazards, and challenges found at the plant.</li>
//     <li>Review of electrical safety culture and safety programs.</li>
//     <li>Inspection of critical electrical installations and its maintenance requirement.</li>
// </ul>

// <h2>Identified Challenges</h2>
// <ul>
//     <li><span style="background-color: rgb(255, 255, 0);">
//         Ensuring smooth running and safety of the overall electrical infrastructure, including critical installations.</span></li>
//     <li><span style="background-color: rgb(255, 255, 0);">
//         Avoiding accidents and dealing with different levels of awareness of people of various age groups on a daily basis.</span></li>
//     <li><span style="background-color: rgb(255, 255, 0);">
//         As this is a huge area that comprises a dynamic set of people where supervision is not always possible, 
//         the level of awareness in terms of dealing with emergencies, particularly electrical problems & related issues, 
//         is not up to date for the team.</span></li>
// </ul>

// <h2>Key Observations</h2>
// <ol>
//     <li><span style="color: rgb(255, 0, 0);">
//         Critical signage such as Voltage Rating, Shock hazard labels, and Warning signs missing on HT transformer yard</span>: 
//         Electrical panels are required to have voltage ratings and/or shock hazard information on them, 
//         e.g., <strong>DANGER - HIGH VOLTAGE - KEEP OUT.</strong> Labelled equipment and enclosures provide 
//         critical safety information to both technicians who work on the energized equipment and also warn and keep 
//         unauthorized persons away. This is also an IE requirement.
//     </li>
// </ol>
// <span style="background-color: rgb(255, 255, 0);">Ensure smooth electrical infrastructure operation</span></li>
//         </ol>
//     `;

//     // Convert HTML to DOCX elements
//     const formattedContent = convertHtmlToDocx(htmlContent);

//     // Create the DOCX Document
//     const doc = new Document({
//         sections: [
//             {
//                 properties: { page: { size: { orientation: PageOrientation.PORTRAIT } } },
//                 children: formattedContent, // Insert formatted content here
//             },
//         ],
//     });

//     // Generate DOCX and Save
//     const blob = await Packer.toBlob(doc);
//     saveAs(blob, "Netflix_Safety_Report.docx");
// };

// const DocGenerateTest = () => {
//     return (
//         <button onClick={generateWordDocument} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
//             Download Report
//         </button>
//     );
// };

// export default DocGenerateTest;
