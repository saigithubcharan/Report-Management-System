import React, { useEffect, useState } from "react";
import Select from "react-select";
import { Link, useNavigate } from "react-router-dom";
import template from "../../Assets/template.png";
import { ArrowBack, Delete } from "@mui/icons-material"; // Import Delete icon
import axios from "../../APIs/axios";
import { config } from "../../config";
import "./Templates.css";
import { Button, IconButton } from "@mui/material"; // Import IconButton
import Sidebar from "../Sidebar/Sidebar";
import { formatDistanceToNow } from 'date-fns'; // Import formatDistanceToNow
import InspectionScreen from "../InspectionScreen/InspectionScreen";

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const navigate = useNavigate()

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get(`${config.PATH}/api/get-templates`);
      setTemplates(response.data);
      setFilteredTemplates(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = templates.filter((template) =>
      template.title.toLowerCase().includes(searchInput.toLowerCase())
    );
    setFilteredTemplates(filtered);
  }, [searchInput, templates]);

  const handleTemplateClick = async (templateId) => {
    try {
      const response = await axios.get(
        `${config.PATH}/api/get-template-by-id/${templateId}`
      );
      console.log(response.data); // Log template details to console
      setSelectedTemplate(response.data);
      setSidebarOpen(true);
    } catch (err) {
      console.error("Error fetching template details:", err.message);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    try {
      await axios.delete(
        `${config.PATH}/api/delete-template/${templateId}`
      );
      fetchTemplates();
    } catch(err) {
      console.log(err);
    }
  };

  const startInspection = (templateId) => {
    navigate(`/start-inspection/${templateId}`)
  }

  return (
    <div className="new-report">
      <div className="heading" style={{ display: "flex" }}>
        <div className="back-button">
          <Link to="/inspection">
            <ArrowBack />
          </Link>
        </div>
        <div>Templates</div>
      </div>
      <div className="search-container">
        <Select
          value={{ label: searchInput, value: searchInput }}
          onChange={(selectedOption) =>
            setSearchInput(selectedOption ? selectedOption.value : "")
          }
          options={templates.map((template) => ({
            label: template.title,
            value: template.title,
          }))}
          isClearable
          placeholder="Search Templates"
          styles={{
            control: (provided) => ({
              ...provided,
              minWidth: "200px", // Set a minimum width for the control
            }),
          }}
        />
        <Button variant="contained">
          <Link
            to="/create-template"
            style={{ color: "inherit", textDecoration: "none" }}
          >
            + Create
          </Link>
        </Button>
      </div>
      <br />
      <div className="inspection-table-container">
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : (
          <table className="inspection-table">
            <thead>
              <tr>
                <th>Template</th>
                <th>Last Publish</th>
                <th>Access</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTemplates.length > 0 ? (
                filteredTemplates.map((template) => (
                  <tr key={template.uuid}>
                    <td
                      onClick={() => handleTemplateClick(template.uuid)}
                      style={{ cursor: "pointer", color: "blue" }}
                    >
                      {template.title}
                    </td>
                    <td>{formatDistanceToNow(new Date(template.updated_at), { addSuffix: true })}</td> {/* Display time ago */}
                    <td>{template.access ? template.access : "All Users"}</td>
                    <td>
                      <Button onClick={()=>startInspection(template.uuid)} variant="outlined">Start Inspection</Button>{"    "}
                      <IconButton
                        onClick={() => handleDeleteTemplate(template.uuid)}
                        color="secondary"
                      >
                        <Delete />
                      </IconButton>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-inspections-message">
                    <img
                      src={template}
                      alt="No inspections"
                      className="inspector-image"
                    />
                    <p>
                      No templates found. Find a template or{" "}
                      <Link to="/create-template">Create Your Own</Link>
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      <Sidebar
        template={selectedTemplate}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
    </div>
  );
};

export default Templates;


