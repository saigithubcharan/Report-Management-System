import React from "react";
import { CircularProgress } from "@material-ui/core";
import "./Loader.css"; // CSS file for styling

const Loader = () => {
  return (
    <div className="loader-container">
      <div className="loader-overlay"></div>
      <div className="loader-spinner">
        <CircularProgress color="primary" size={50} />
      </div>
    </div>
  );
};

export default Loader;
