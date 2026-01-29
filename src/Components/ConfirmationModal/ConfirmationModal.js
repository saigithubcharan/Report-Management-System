import React from "react";
import "./ConfirmationModal.css";
import { Modal, Typography, Button } from "@mui/material";

const ConfirmationModal = ({
  setShowConfirmationModal,
  handleCloseWithoutSaving,
}) => {
  const hideConfirmation = () => {
    setShowConfirmationModal(false);
  };
  console.log("here");
  return (
    <Modal open={true} onClose={hideConfirmation}>
      <div className="confirmation-modal-container">
        <div className="confirmation-modal-content">
          <Typography variant="h5">Confirmation</Typography>
          <div className="confirmation-modal-body">
            <Typography variant="body1">Have you saved the report?</Typography>
          </div>
          <div className="confirmation-modal-footer">
            <Button variant="contained" onClick={handleCloseWithoutSaving}>
              Yes, Saved Already
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={hideConfirmation}
            >
              No, Go back & save
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
