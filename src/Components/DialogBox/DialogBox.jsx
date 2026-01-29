import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from "@mui/material";

const DialogBox = ({ dialog, handleDialogBox }) => {
    return (
        <>
            <Dialog
                open={dialog.open} // Access open from dialog state
                onClose={() => handleDialogBox(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                BackdropProps={{
                    style: { backgroundColor: "rgba(0, 0, 0, 0.1)" }, // Light transparent overlay
                }}
                PaperProps={{
                    style: {
                        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)", // Soft shadow effect
                        borderRadius: "10px", // Rounded corners
                    },
                }}
            >
                <DialogTitle id="alert-dialog-title">{dialog.title}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {dialog.message}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleDialogBox(false)} color="error">{dialog.reject}</Button>
                    <Button onClick={() => handleDialogBox(true)} autoFocus sx={{ color: "rgb(239, 199, 29)" }}>
                        {dialog.accept}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default DialogBox;
