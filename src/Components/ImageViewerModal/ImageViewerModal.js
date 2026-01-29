// ImageViewerModal.js
import React from "react";
import { Modal, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import "./ImageViewerModal.css";

const ImageViewerModal = ({ imageUrl, onClose }) => {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "downloaded_image";
    link.click();
    onClose(); // Close the modal after triggering download
  };

  return (
    <Modal open={!!imageUrl} onClose={onClose}>
      <div className="image-viewer-modal">
        <div className="header">
          <CloseIcon className="close-button" onClick={onClose}/>
          <CloudDownloadIcon className="download-button" onClick={handleDownload}/>
        </div>
        <img src={imageUrl} alt="Selected Image" />
      </div>
    </Modal>
  );
};

export default ImageViewerModal;
