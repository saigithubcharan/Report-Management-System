import React, { useEffect, useState } from "react";
import "./InspectionScreen.css";
import { useParams } from "react-router-dom";
import axios from "../../APIs/axios";
import { config } from "../../config";

const InspectionScreen = () => {
  const { templateId } = useParams();
  const [template, setTemplate] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    if (templateId) {
      fetchTemplate();
    }
  }, [templateId]);

  const fetchTemplate = async () => {
    try {
      const response = await axios.get(
        `${config.PATH}/api/get-template-by-id/${templateId}`
      );
      setTemplate(response.data);
    } catch (error) {
      console.error("Error fetching template:", error);
    }
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => {
      if (prevPage < template.Pages.length - 1) {
        return prevPage + 1;
      } else {
        return prevPage;
      }
    });
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => {
      if (prevPage > 0) {
        return prevPage - 1;
      } else {
        return prevPage;
      }
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="inspection-screen">
      {template && template.Pages && template.Pages.length > 0 && (
        <>
          <div className="inspection-content">
            <h1>{template.title}</h1>
            <p>{template.description}</p>
            <div className="page">
              <h2>{template.Pages[currentPage]?.pageTitle}</h2>
              {template.Pages[currentPage]?.Questions.map((question) => (
                <div key={question.id} className="question">
                  <p>{question.question}</p>
                  {question.type === "mcq" ? (
                    <select
                      name={question.id}
                      value={answers[question.id] || ""}
                      onChange={handleInputChange}
                    >
                      <option value="" disabled>
                        Select an option
                      </option>
                      {question.mcq_options.map((option, index) => (
                        <option key={index} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : question.type === "text" ? (
                    <input
                      type="text"
                      name={question.id}
                      value={answers[question.id] || ""}
                      onChange={handleInputChange}
                    />
                  ) : question.type === "date" ? (
                    <input
                      type="date"
                      name={question.id}
                      value={answers[question.id] || ""}
                      onChange={handleInputChange}
                    />
                  ) : question.type === "checkbox" ? (
                    <input
                      type="checkbox"
                      name={question.id}
                      checked={answers[question.id] || false}
                      onChange={handleInputChange}
                    />
                  ) : null}
                </div>
              ))}
            </div>
          </div>
          <div className="navigation-buttons">
            <button onClick={handlePrevPage} disabled={currentPage === 0}>
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === template.Pages.length - 1}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default InspectionScreen;


