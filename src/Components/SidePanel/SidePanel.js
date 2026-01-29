import React from "react";
import { Dashboard, NoteAdd, SaveAlt, FormatListBulleted, SmartToy, TipsAndUpdates, Checklist, PlaylistAddCheck } from "@mui/icons-material";
import { motion } from "framer-motion";
import "./SidePanel.css";
import { useRef,useState,useEffect } from "react";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import logo from "../../mi_logo.png";

const SidePanel = ({ selection, setSelection }) => {
    const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const handleSelect = (selectedOption) => {
    setSelection(selectedOption);
     if (window.innerWidth <= 900) setOpen(false); 
  };

    useEffect(() => {
    const handleClickOutside = (e) => {
      if (open && panelRef.current && !panelRef.current.contains(e.target)&&!e.target.closest(".menu-toggle-btn")) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);
  const itemVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
  };

  return (
<>
    {/* <div className="sidepanel"> */}
  <button className="menu-toggle-btn" onClick={() => setOpen(!open)}>
    {/* <i class="fa-solid fa-ellipsis"></i> */}
     <MoreHorizIcon ></MoreHorizIcon>
      {/* &#x22EE; */}
    </button>
   
    <div className={`sidepanel ${open ? "open" : ""}`} ref={panelRef}>
      <motion.div
        initial="initial"
        animate="animate"
        whileHover={{ scale: 1.05 }}
        className="sidepanel-item"
        style={{ background: selection === "dashboard" ? "#efc71d" : "white" }}
        onClick={() => handleSelect("dashboard")}
      >
        <motion.div variants={itemVariants}>
          <Dashboard className="panel-icons" />
        </motion.div>
        <span>Dashboard</span>
      </motion.div>

      <motion.div
        initial="initial"
        animate="animate"
        whileHover={{ scale: 1.05 }}
        className="sidepanel-item"
        style={{ background: selection === "new report" ? "#efc71d" : "white" }}
        onClick={() => handleSelect("new report")}
      >
        <motion.div variants={itemVariants}>
          <NoteAdd className="panel-icons" />
        </motion.div>
        <span>New Report</span>
      </motion.div>

      <motion.div
        initial="initial"
        animate="animate"
        whileHover={{ scale: 1.05 }}
        className="sidepanel-item"
        style={{
          background: selection === "saved report" ? "#efc71d" : "white",
        }}
        onClick={() => handleSelect("saved report")}
      >
        <motion.div variants={itemVariants}>
          <SaveAlt className="panel-icons" />
        </motion.div>
        <span>Saved Reports</span>
      </motion.div>

      <motion.div
        initial="initial"
        animate="animate"
        whileHover={{ scale: 1.05 }}
        className="sidepanel-item"
        style={{ background: selection === "notes" ? "#efc71d" : "white" }}
        onClick={() => handleSelect("notes")}
      >
        <motion.div variants={itemVariants}>
          <FormatListBulleted className="panel-icons" />
        </motion.div>
        <span>Notes</span>
      </motion.div>

      <motion.div
        initial="initial"
        animate="animate"
        whileHover={{ scale: 1.05 }}
        className="sidepanel-item"
        style={{ background: selection === "gpt" ? "#efc71d" : "white" }}
        onClick={() => handleSelect("gpt")}
      >
        <motion.div variants={itemVariants}>
          <SmartToy className="panel-icons" />
        </motion.div>
        <span>HSE GPT</span>
      </motion.div>

      <motion.div
        initial="initial"
        animate="animate"
        whileHover={{ scale: 1.05 }}
        className="sidepanel-item"
        style={{ background: selection === "electrical-gpt" ? "#efc71d" : "white" }}
        onClick={() => handleSelect("electrical-gpt")}
      >
        <motion.div variants={itemVariants}>
          <TipsAndUpdates className="panel-icons" />
        </motion.div>
        <span>Electrical GPT</span>
      </motion.div>
{/* 
      <motion.div
        initial="initial"
        animate="animate"
        whileHover={{ scale: 1.05 }}
        className="sidepanel-item"
        style={{ background: selection === "cmv" ? "#efc71d" : "white" }}
        onClick={() => handleSelect("cmv")}
      >
        <motion.div variants={itemVariants}>
          <PlaylistAddCheck className="panel-icons" />
        </motion.div>
        <span>CMV</span>
      </motion.div> */}

      <motion.div
        initial="initial"
        animate="animate"
        whileHover={{ scale: 1.05 }}
        className="sidepanel-item"
        style={{ background: selection === "inspection" ? "#efc71d" : "white" }}
        onClick={() => handleSelect("inspection")}
      >
        <motion.div variants={itemVariants}>
          <Checklist className="panel-icons" />
        </motion.div>
        <span>Inspection</span>
      </motion.div>
         <img className="imageLogo"
                      onClick={() => window.location.reload()}
                      
                      src={logo}
                      alt="mi logo"
                    />
      <motion.div variants={itemVariants}></motion.div>
      <motion.div variants={itemVariants}></motion.div>
      <motion.div variants={itemVariants}></motion.div>
      <motion.div variants={itemVariants}></motion.div>
      <motion.div variants={itemVariants}></motion.div>
    
     
    </div>
    </>
  );
};

export default SidePanel;
