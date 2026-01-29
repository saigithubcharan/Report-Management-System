import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
} from "@material-ui/core";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import PersonIcon from "@material-ui/icons/Person";
import "./NavBar.css";
import logo from "../../mi_logo.png";
import { clearAccountDetails } from "../Services/localStorage";
import { useNavigate } from "react-router-dom";
import UserProfileModal from "../UserProfileModal/UserProfileModal";

const NavBar = ({ userDetails, getUserDetails }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    clearAccountDetails();
    sessionStorage.clear()
    // navigate("/");
    window.location.reload()
  };

  const handleProfileClick = () => {
    setAnchorEl(null); // Close the menu
    setProfileModalOpen(true); // Open the profile modal
  };

  return (
    <div>
      <AppBar position="static">
        <Toolbar className="navbar">
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <img className="image"
              onClick={() => window.location.reload()}
              style={{ height:"20%", width:"20%", marginTop:"1%",marginLeft:"2%", cursor: "pointer" }}
              src={logo}
              alt="mi logo"
            />
          </Typography>
          <AccountCircleIcon
            fontSize="large"
            onClick={handleClick}
            style={{ cursor: "pointer" }}
          />
        </Toolbar>
      </AppBar>

      <Menu 
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        getContentAnchorEl={null}
        >
        <MenuItem  style={{backgroundColor:"transparent", borderBottom:"1px solid lightGrey", padding:"10px"}}>{`👋 Hey ${userDetails.name}`}</MenuItem>
        <MenuItem onClick={handleProfileClick} style={{padding:"10px"}}>
          <ListItemIcon>
            <PersonIcon />
          </ListItemIcon>
          My Profile
        </MenuItem>
        <MenuItem onClick={handleLogout} style={{padding:"10px"}}>
          <ListItemIcon>
            <ExitToAppIcon />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {profileModalOpen && (
        <UserProfileModal
          userDetails={userDetails}
          onClose={() => setProfileModalOpen(false)} // Close the profile modal
          getUserDetails={getUserDetails}
        />
      )}

    </div>
  );
};

export default NavBar;