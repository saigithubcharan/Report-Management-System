// UserProfileModal.js
import React, { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Typography,
  TextField,
  IconButton,
  Box,
  Divider,
  Avatar,
  TextareaAutosize,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import PersonIcon from "@material-ui/icons/Person";
import "./UserProfileModal.css";
import { config } from "../../config";
import axios from "../../APIs/axios";
import logo from "../../../src/default_photo.webp";
import { Link, useNavigate } from "react-router-dom";
import { clearAccountDetails } from "../Services/localStorage";

import { ToastContainer, toast } from "react-toastify";
import { yellow } from "@material-ui/core/colors";

const UserProfileModal = ({ userDetails, onClose, getUserDetails }) => {
  console.log(userDetails, "Details");

  // State variables for user profile
  const [name, setName] = useState(userDetails.name);
  const [email, setEmail] = useState(userDetails.email);
  const [mobile, setMobile] = useState(userDetails.mobile);
  const [profilePicture, setProfilePicture] = useState(
    userDetails.profile_picture
  );
  const [deletionRemarks, setDeletionRemarks] = useState("");
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const navigate = useNavigate();
  const deleteConfirmationTextareaRef = useRef(null);

  // Function to open the delete confirmation box
  const handleOpenDeleteConfirmation = () => {
    setShowDeleteConfirmation(true);
  };

  // Function to close the delete confirmation box
  const handleCloseDeleteConfirmation = () => {
    setShowDeleteConfirmation(false);
    setDeletionRemarks(""); // Clear deletion remarks when closing the box
  };

  // Function to handle user deletion
  const handleUserDeletion = async () => {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this user? This action cannot be undone."
    );

    if (!shouldDelete) {
      // User canceled the deletion
      return;
    }
    const payload = {
      deletion_remarks: deletionRemarks,
    };
    try {
      // Send a DELETE request to delete the user
      await axios.put(
        `${config.PATH}/api/user/delete/${userDetails.id}`,
        payload
      );

      // Display a success toast message
      toast.success("User deleted successfully");

      // Close the delete confirmation box
      handleCloseDeleteConfirmation();

      // Close the user profile modal
      onClose();
      clearAccountDetails();
      sessionStorage.clear();
      navigate("/");
    } catch (error) {
      // Handle any errors that may occur during the API call
      console.error("Error:", error);

      // Display an error toast message
      toast.error(error.response.data.message);
    }
  };

  // State variables for password update
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Function to handle user profile update
  const handleProfileUpdate = async () => {
    try {
      const payload = {
        name: name,
        mobile: mobile,
        profile_picture: profilePicture,
      };

      // Send a PUT request to update the user profile
      await axios.put(
        `${config.PATH}/api/update/${userDetails.id}/profile`,
        payload
      );

      // Display a success toast message
      toast.success("Profile updated successfully");
      getUserDetails();
    } catch (error) {
      // Handle any errors that may occur during the API call
      console.error("Error:", error);

      // Display an error toast message
      toast.error(error.response.data.message);
      console.log(error.response.data.message);
    }
  };

  // Function to handle password update
  const handlePasswordUpdate = async () => {
    try {
      if (newPassword !== confirmPassword) {
        toast.warn("Passwords do not match");
        return;
      }
      const payload = {
        oldPassword: oldPassword,
        newPassword: newPassword,
      };
      await axios.put(
        `${config.PATH}/api/update/${userDetails.id}/password`,
        payload
      );
      toast.success("Password updated successfully");
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  //   const handlePictureUpload = (e) => {
  //     const file = e.target.files[0];

  //     if (file) {
  //       // Read the selected file and set it in the state
  //       const reader = new FileReader();
  //       reader.onload = (event) => {
  //         setProfilePicture(event.target.result);
  //       };
  //       reader.readAsDataURL(file);
  //     }
  //   };

  const handlePictureUpload = (e) => {
    const file = e.target.files[0];

    if (file) {
      // Create a FormData object to send the file to the server
      const formData = new FormData();
      formData.append("image", file);

      // Make an HTTP POST request to the uploadImage API
      axios
        .post(`${config.PATH}/api/upload/image`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          // Handle the successful response from the API
          if (response.data.imageUrl) {
            // Set the uploaded image URL in the state
            setProfilePicture(response.data.imageUrl);
          } else {
            toast.error("Failed to upload image");
          }
        })
        .catch((error) => {
          // Handle any errors that may occur during the API call
          console.error("Error uploading image:", error);
          toast.error("Error uploading image");
        });
    }
  };

  useEffect(() => {
    // Scroll to the bottom when the delete confirmation box is opened
    if (showDeleteConfirmation && deleteConfirmationTextareaRef.current) {
      deleteConfirmationTextareaRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [showDeleteConfirmation]);

  return (
    <>
      <ToastContainer autoClose={2000} />
      <Dialog open={true} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle style={{background:"#307268", color:"#efc71d"}}>
          User Profile
          <IconButton
            aria-label="close"
            style={{ position: "absolute", top: "10px", right: "10px", backgroundColor:"#efc71d" }}
            onClick={onClose}
            size="small"
          >
            <CloseIcon  style={{color:"#307248"}}/>
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box className="user-profile-fields">
            <label
              className="profile-picture-label"
              htmlFor="profile-picture-upload"
            >
              <Avatar
                alt="Profile Picture"
                src={profilePicture || logo} // Display default image or selected image
                className="profile-picture"
                style={{
                  width: "100px",
                  height: "100px",
                  borderStyle: "solid",
                  borderWidth: "0.05mm",
                }}
              />
            </label>
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handlePictureUpload}
              id="profile-picture-upload"
            />
            <TextField
              label="Name"
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              margin="normal"
              size="small"
            />
            <TextField
              label="Email"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              disabled
              size="small"
            />
            <TextField
              label="Mobile"
              variant="outlined"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              margin="normal"
              size="small"
            />
            <Button
              variant="contained"
              color="black"
              onClick={handleProfileUpdate}
              className="custom-primary-button"
              size="small"
              style={{ background: "#efc71d" }}
            >
              Save
            </Button>
          </Box>
          <br />
          <Divider />
          <Box className="password-fields">
            <TextField
              label="Old Password"
              variant="outlined"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              margin="normal"
              size="small"
            />
            <TextField
              label="New Password"
              variant="outlined"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              margin="normal"
              size="small"
            />
            <TextField
              label="Confirm Password"
              variant="outlined"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              margin="normal"
              size="small"
            />
            <Button
              variant="contained"
              color="black"
              onClick={handlePasswordUpdate}
              className="custom-primary-button"
              style={{ background: "#efc71d" }}
            >
              Update Password
            </Button>
          </Box>
          {/* Password Update Success Message */}
          {/* {passwordUpdated && (
          <Typography variant="body1" className="custom-password-success">
            Password updated successfully.
          </Typography>
        )} */}
          <Box className="delete-user-section">
            {!showDeleteConfirmation ? (
              <div style={{ textAlign: "center" }}>
                <Button
                  variant="contained"
                  color="black"
                  onClick={handleOpenDeleteConfirmation}
                  className="custom-primary-button"
                  style={{ background: "#ff4d4d" }} // Red color for delete button
                  size="small"
                >
                  Delete User
                </Button>
              </div>
            ) : null}

            {/* Delete Confirmation Box */}
            {showDeleteConfirmation && (
              <div className="delete-confirmation-box">
                <TextareaAutosize
                  label="Deletion Remarks"
                  variant="outlined"
                  value={deletionRemarks}
                  onChange={(e) => setDeletionRemarks(e.target.value)}
                  margin="normal"
                  className="custom-text-field"
                  style={{ height: "100px", overflow:"auto" }}
                  placeholder="Enter deletion remarks..."
                />
                <div className="delete-confirmation-buttons">
                  <Button
                    ref={deleteConfirmationTextareaRef}
                    variant="contained"
                    color="black"
                    onClick={handleUserDeletion}
                    className="custom-primary-button"
                    style={{ background: "#ff4d4d" }} // Red color for delete button
                    size="small"
                  >
                    Delete
                  </Button>
                  <Button
                    variant="contained"
                    color="black"
                    onClick={handleCloseDeleteConfirmation}
                    className="custom-primary-button"
                    style={{ background: "#efc71d" }}
                    size="small"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserProfileModal;
