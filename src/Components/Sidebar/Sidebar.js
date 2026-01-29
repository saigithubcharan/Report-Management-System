import React from "react";
import { useNavigate } from "react-router-dom";
import { Drawer, List, ListItem, ListItemText } from "@mui/material";
import "./Sidebar.css";
import { Button } from "@material-ui/core";
import { Link } from "react-router-dom";

const Sidebar = ({ template, open, onClose }) => {
  const navigate = useNavigate();

  const handleStartInspection = () => {
    navigate(`/start-inspection/${template?template.uuid:null}`)
  };

  const handleEditTemplate = () => {
    navigate(`/update-template/${template?template.uuid:null}`)
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <div className="sidebar-content">
        <h2>{template?.title}</h2>
        <List style={{display:"flex", gap:"5px"}}>
          <ListItem style={{color:"white", background:"purple", borderRadius:"5px"}} button onClick={handleStartInspection}>
            <ListItemText primary="Start Inspection" />
          </ListItem>
          {/* <Button component={Link} to={`/update-template/${template?template.uuid:null}`} variant="outlined">Edit Template</Button> */}
          <ListItem style={{color:"white", background:"purple", borderRadius:"5px"}} button onClick={handleEditTemplate}>
            <ListItemText primary="Edit Template" />
          </ListItem>
        </List>
      </div>
    </Drawer>
  );
};

export default Sidebar;
