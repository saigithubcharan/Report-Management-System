import React from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import logo from "../../mi_watermark.png";
import styled from "@emotion/styled";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import Report_Cover from "../../Report_Cover.png";

const ExportPDF = ({
  selectedOrganization,
  selectedSite,
  backgroundBrief,
  contents,
  exeSummary,
  selectedObservations,
  selectedArea,
  selectedCategory,
  recommendations,
  criticalObservations,
  conclusion,
  selectedDateTime,
  reportType
}) => {
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const pageMargin = 10;
    const startY = pageMargin;

    const coverImageHeight = 180;
    doc.addImage(
      Report_Cover,
      "JPEG",
      pageMargin,
      startY,
      pageWidth - 2 * pageMargin,
      coverImageHeight
    );

    const rectX = pageMargin;
    const rectY = startY + coverImageHeight + 10;
    const rectWidth = pageWidth - 2 * pageMargin;
    const rectHeight = 70;
    doc.setDrawColor(0);
    doc.rect(rectX, rectY, rectWidth, rectHeight, "S");

    doc.setFontSize(12);
    doc.setTextColor(0);
    // doc.setFont("helvetica", "bold");
    const organizationText = reportType === "HSE"?`HSE AUDIT REPORT FOR`:`ELECTRICAL AUDIT REPORT FOR`;
    const organizationName = selectedOrganization.label;
    const dateTimeText = `Date: ${selectedDateTime.split("T")[0]}`;
    const organizationTextWidth = doc.getTextWidth(organizationText);
    const dateTimeTextWidth = doc.getTextWidth(dateTimeText);
    const maxWidth = Math.max(organizationTextWidth, dateTimeTextWidth);
    const textX = rectX + (rectWidth - maxWidth) / 2;

    doc.text(organizationText, textX, rectY + 20);
    doc.text(organizationName, textX + 28, rectY + 25);
    doc.text(dateTimeText, textX + 18, rectY + 45);

    const linkText = "www.momentumindia.in";
    const linkX = rectX + (rectWidth - doc.getTextWidth(linkText)) / 2;
    const linkY = rectY + 50;

    doc.setTextColor("#007bff");
    doc.textWithLink(linkText, linkX, linkY + 10, {
      url: "https://www.momentumindia.in/",
    });

    doc.addPage(); // Move to the next page
    const formatPage = (pageTitle, pageContent, pageNum) => {

      const watermarkImageUrl = logo; // Replace with your watermark image Data URL
      const watermarkImageWidth = 100; // Set the desired width for the watermark image
      const watermarkImageHeight = 100; // Set the desired height for the watermark image
      const watermarkX = pageWidth / 2 - watermarkImageWidth / 2;
      const watermarkY = pageHeight / 2 - watermarkImageHeight / 2;
      doc.addImage(
        watermarkImageUrl,
        "PNG",
        watermarkX,
        watermarkY,
        watermarkImageWidth,
        watermarkImageHeight
      );

      doc.setFillColor("#000066");
      doc.rect(0, 0, pageWidth, 25, "F");
      doc.setTextColor("white");
      doc.setFontSize(15);
      doc.text(
        `Electrical Safety Audit Report - ${selectedOrganization.label}(${selectedSite.label})`,
        pageMargin + 30,
        20
      );
      doc.setTextColor("black");
      doc.setFontSize(12);
      const gap = 5;
      const subheadingY = startY + 25 + gap;
      doc.setFillColor("#efc71d");
      doc.rect(pageMargin, subheadingY, pageWidth - 2 * pageMargin, 10, "F");
      doc.setTextColor("black");
      doc.text(pageTitle, pageMargin + 5, subheadingY + 5);
      doc.setTextColor("black");
      doc.setDrawColor(0);
      doc.rect(
        pageMargin,
        startY + 20 + gap + 15,
        pageWidth - 2 * pageMargin,
        pageHeight - 2 * pageMargin - 25 - gap - 15
      );
      doc.text(pageContent, pageMargin + 5, subheadingY + 20, {
        maxWidth: pageWidth - 3 * pageMargin,
      });

      const pageNumberText = `Page ${pageNum}`;
      const pageNumberX =
        pageWidth - pageMargin - doc.getTextWidth(pageNumberText);
      doc.text(pageNumberText, pageNumberX, pageHeight - pageMargin);

      const PreparedByText = "Prepared by Momentum india";
      const PreparedByTextX = pageMargin;
      const PreparedByTextY = pageHeight - pageMargin;
      doc.text(PreparedByText, PreparedByTextX, PreparedByTextY, {
        baseline: "bottom",
      });
    };

    // const drawImageInCell = (images, cellX, cellY, cellWidth, cellHeight) => {
    //   console.log("images:", images);
    //   if (Array.isArray(images) && images.length > 0) {
    //     const maxImagesPerCell = images.length;
    //     const imageHeight = cellHeight / maxImagesPerCell;
    
    //     images.forEach((imageObj, index) => {
    //       const imageUrl = typeof imageObj === "string" ? imageObj : imageObj.url;
    //       console.log("imageUrl:", imageUrl);
    
    //       const imageX = cellX + 2;
    //       const imageY = cellY + 2 + index * imageHeight;
    //       const imageWidth = cellWidth - 4;
    //       const imageActualHeight = cellHeight / (maxImagesPerCell+0.5); // Adjust this value if needed
    //       doc.addImage(
    //         imageUrl,
    //         "JPEG",
    //         imageX,
    //         imageY,
    //         imageWidth,
    //         imageActualHeight
    //       );
    //     });
    
    //     // Adjust the cell height to fit all images
    //     const totalImageHeight = maxImagesPerCell * imageHeight;
    //     const remainingCellHeight = cellHeight - totalImageHeight;
    
    //     if (remainingCellHeight > 0) {
    //       // Add extra padding at the bottom if there is space
    //       doc.rect(cellX, cellY + totalImageHeight, cellWidth, remainingCellHeight, "F");
    //     }
    //   }
    // };

    const drawImageInCell = (images, cellX, cellY, cellWidth, cellHeight) => {
      if (Array.isArray(images) && images.length > 0) {
        const maxImagesPerCell = images.length;
        const imageHeight = cellHeight / maxImagesPerCell;
    
        let startY = cellY;
        images.forEach((imageObj) => {
          const imageUrl = typeof imageObj === "string" ? imageObj : imageObj.url;
          const imageWidth = cellWidth - 4;
          const imageActualHeight = imageHeight;
    
          if (startY + imageActualHeight <= cellY + cellHeight) {
            doc.addImage(
              imageUrl,
              "JPEG",
              cellX + 2,
              startY,
              imageWidth,
              imageActualHeight
            );
            startY += imageActualHeight;
          } else {
            doc.addPage();
            startY = cellY;
          }
        });
    
        const remainingCellHeight = cellY + cellHeight - startY;
        if (remainingCellHeight > 0) {
          doc.rect(cellX, startY, cellWidth, remainingCellHeight, "F");
        }
      }
    };
    
    
    

    // Page 1: Background - Project Brief
    formatPage("Background - Project Brief:", backgroundBrief, 2);

    // Move to the next page
    doc.addPage();
    // Page 2: Understanding of the Review Report - Contents
    formatPage("Understanding of the Review Report - Contents:", contents, 3);

    // Move to the next page
    doc.addPage();
    // Page 3: Executive Summary
    formatPage("Executive Summary:", exeSummary, 4);

    //PAGE 4 critical observation list
    doc.addPage();
    formatPage(
      "CRITICAL OBSERVATIONS",
      criticalObservations
        .map((observation, index) => `${index + 1}. ${observation.observation}`)
        .join("\n\n"),
      5
    );

    // Move to the next page
    doc.addPage();
    // Page 5: Critical Observations tAble
    formatPage(
      "CRITICAL ELECTRICAL OBSERVATIONS, PHOTOS & RECOMMENDATIONS",
      "Critical Observations content goes here...",
      6
    );

    // Generate table for critical observations using autoTable
    const tableData = selectedObservations.map((observation, index) => {
      const row = [
        index + 1,
        // selectedArea.join(","),
        // selectedCategory.join(","),
        observation.check_points,
        observation.observation,
        observation.criticality,
        observation.recommendations,
        // recommendations[index].is_reference,
      ];

      // Add photo evidence URLs if available
      if (observation.photoEvidence && observation.photoEvidence.length > 0) {
        const photoUrls = observation.photoEvidence.map((photo) =>
          URL.createObjectURL(photo)
        );
        row.push(photoUrls);
      } else {
        row.push("N/A");
      }

      return row;
    });

    doc.autoTable({
      head: [
        [
          "Sr. No.",
          // "Areas",
          // "Categories",
          "Observation",
          "Description",
          "Criticality",
          "Recommendation",
          // "IS Reference",
          "Photo Evidence",
        ],
      ],
      body: tableData,
      startY: startY + 45,
      didDrawCell: (data) => {
        // Draw cell borders
        doc.rect(
          data.cell.x,
          data.cell.y,
          data.cell.width,
          data.cell.height,
          "S"
        );

        // Draw images in the last column
        if (data.column.index === 5) {
          // The index of the "Photo Evidence" column
          drawImageInCell(
            data.row.raw[5],
            data.cell.x,
            data.cell.y,
            data.cell.width,
            data.cell.height
          );
        }
      },
      columnStyles: { 5: { cellWidth: 40 } },
    });

    doc.addPage();
    // Page 6: Conclucison
    formatPage("Conclucison:", conclusion, 7);

    // Save the PDF
    const fileName = `${selectedOrganization.label}_${selectedSite.label}_${selectedDateTime}.pdf`
    doc.save(fileName);
  };

  return (
    <button
      style={{
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        background: "#efc71d",
        borderStyle: "none",
        borderRadius: "5px",
        fontWeight: "bold",
        padding: "8px 16px",
      }}
      onClick={handleExportPDF}
    >
      EXPORT PDF
      <FileDownloadIcon fontSize="small" style={{ marginLeft: "8px" }} />
    </button>
  );
};

export default ExportPDF;
