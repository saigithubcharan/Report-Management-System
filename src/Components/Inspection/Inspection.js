import React from "react";
import "./Inspection.css";
import Select from "react-select";
import { Link } from "react-router-dom";
import inspector from "../../Assets/inspector.png";
import { ArrowBack } from "@mui/icons-material";

const Inspection = () => {
  // Dummy data for the table
  // const dummyData = [
  //   {
  //     id: 1,
  //     inspection: "Inspection 1",
  //     docNumber: "DOC001",
  //     score: 85,
  //     conducted: "2024-04-20",
  //     completed: "2024-04-21"
  //   },
  //   {
  //     id: 2,
  //     inspection: "Inspection 2",
  //     docNumber: "DOC002",
  //     score: 90,
  //     conducted: "2024-04-22",
  //     completed: "2024-04-23"
  //   },
  //   {
  //     id: 3,
  //     inspection: "Inspection 3",
  //     docNumber: "DOC003",
  //     score: 80,
  //     conducted: "2024-04-24",
  //     completed: "2024-04-25"
  //   },
  //   {
  //     id: 4,
  //     inspection: "Inspection 4",
  //     docNumber: "DOC004",
  //     score: 0,
  //     conducted: "2024-04-24",
  //     completed: "2024-04-25"
  //   },

  // ];

  const dummyData = [];

  return (
    <div className="new-report">
      <div className="heading" style={{display:"flex"}}>
        <div className="back-button"><Link to="/home"><ArrowBack/></Link></div>
        <div>Inspection</div>
      </div>
      <div className="search-container">
        <Select />
      </div>
      <div className="inspection-table-container">
        <table className="inspection-table">
          <thead>
            <tr>
              <th>Inspection</th>
              <th>Actions</th>
              <th>Doc Number</th>
              <th>Score</th>
              <th>Conducted</th>
              <th>Completed</th>
            </tr>
          </thead>
          <tbody>
            {dummyData.length > 0 ? (
              dummyData.map((item) => (
                <tr key={item.id}>
                  <td>{item.inspection}</td>
                  <td>{/* Add action buttons here */}</td>
                  <td>{item.docNumber}</td>
                  <td>{item.score}</td>
                  <td>{item.conducted}</td>
                  <td>{item.completed}</td>
                </tr>
              ))
            ) : (
              // <tr>
              //   <td colSpan="6" className="no-inspections-message">
              //     No inspections yet. Start an inspection or create a template.
              //   </td>
              // </tr>
              <tr>
                <td colSpan="6" className="no-inspections-message">
                  <img
                    src={inspector}
                    alt="No inspections"
                    className="inspector-image"
                  />
                 <p>
                    No inspections yet. <Link to="/templates">Start an inspection</Link> or
                     create a template.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inspection;