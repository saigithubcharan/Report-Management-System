import React, { useState, useEffect } from "react";
import axios from "../../APIs/axios";
import { getAccountDetails } from "../Services/localStorage";
import { config } from "../../config";
import "./HseGpt.css";
import { LinearProgress } from "@mui/material";
import stringSimilarity from "string-similarity";
import ThumbUpIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbDownIcon from "@mui/icons-material/ThumbDownAlt";
import { toast } from "react-toastify";
import SendIcon from "@mui/icons-material/Send";

const HseGpt = () => {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [threadId, setThreadId] = useState("");
  const userId = getAccountDetails().userId;
  const [randomSuggestions, setRandomSuggestions] = useState([]);
  const [tokenUsage, setTokenUsage] = useState("");

  const questionSuggestions = [
    "What is Fire Safety?",
    "What is Fire Alarm Signal?",
    "What is Line Detector?",
    "Explain the concept of 'Fire Rating.'",
    "Define 'Heat Detector.'",
    "What is the principle behind 'Ionization Smoke Detection'?",
    "Describe the term 'Line Detector.'",
    "What does 'Maintenance' involve in a fire alarm system?",
    "Define 'Manual Call Point.'",
    "What is the purpose of a 'Mimic Panel'?",
    "Define 'Photoelectric Light Obscuration Smoke Detection.'",
    "What is 'Photoelectric Light-Scattering Smoke Detection' based on?",
    "Describe the characteristics of a 'Point Detector.'",
    "What is the role of a 'Power Supply' in a fire alarm system?",
    "Action for deficiency in any fire extinguisher?",
    "Maintenance for rechargeable fire extinguishers?",
    "What does this standard cover?",
    "Where are the requirements for external fire hydrants covered?",
    "Define Static Water Tank.",
    "Explain the purpose of a Jockey Pump.",
    "What is a Dry-Riser in fire fighting?",
    "What are the three elements of the fire triangle?",
    "Explain the PASS system for using fire extinguishers.",
    "What is the purpose of the fire prevention program?",
    "What are the classifications of fires and their characteristics?",
    "How is LP gas used in the roofing industry and what precautions should be taken?",
    "What is the lead auditor's responsibility in an audit team?",
    "Define 'nonconformity' in the context of the occupational safety and health audit.",
    "Why is auditor independence crucial in the auditing process?",
    "What are the three main goals of audits according to the standard?",
    "Define 'Assisted Evacuation' during emergencies in a building.",
    "What distinguishes an 'Atrium' from an enclosed stairway or lift hoist-way?",
    "Who are the 'Authorities Concerned' responsible for enforcing building codes and standards?",
    "Explain the components and purpose of an 'Automatic Fire Detection and Alarm System.'",
    "What does the standard cover?",
    "Why are standards listed in Annex A subject to revision?",
    "Define 'Alarm Test Valve.'",
    "Explain the function of an 'Alarm Valve.'",
    "Distinguish between 'Pre-action' and 'Recycling' Alarm Valves.",
    "What is the role of an 'Arm Pipe'?",
    "Define 'Assumed Maximum Area of Operation.'",
    "What is the purpose of a 'Cut-Off Sprinkler'?",
    "Explain the concept of 'Design Density.'",
    "Define 'Drencher' and its role in fire protection.",
    "Describe 'End-Side Array' and 'End-Centre Array.'",
  ];

  const handleSuggestionClick = (selectedSuggestion) => {
    setQuestion(selectedSuggestion);
  };

  useEffect(() => {
    generateThreadId();
    fetchConversationHistory();
    const suggestions = questionSuggestions
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);
    setRandomSuggestions(suggestions);
  }, []);

  const generateThreadId = () => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    setThreadId(result);
    return result;
  };

  const fetchConversationHistory = () => {
    const storedConversation = sessionStorage.getItem("hseGptConversation");
    if (storedConversation) {
      setConversation(JSON.parse(storedConversation));
    }
  };

  const saveUserPrompt = async () => {
    try {
      const payload = {
        user_id: userId,
        user_prompt: question,
        gpt_type: "hse",
      };
      await axios.post(`${config.PATH}/api/gpt/save-user-prompts`, payload);
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleSendQuestion = async () => {
    if (!question.trim()) { // Validate if question is not empty
      return;
    }
    try {
      setIsLoading(true);
      const payload = {
        question: question,
        prompt:
          "You are an AI assistant specializing in Health, Safety & Environment (HSE) for events safety. Whether it's music concerts, cricket and football matches, movie sets, or other events. Help people find information about Health, Safety & Environment related queries.",
      };

      const response = await axios.post(
        `${config.PATH}/api/azure/ai-assistant-gpt`,
        payload
      );

      // Set the API response as the current response
      const currentResponse = response.data.data.choices[0].message.content;
      setResponse(currentResponse);
      setTokenUsage(response.data.data.usage.total_tokens);
      saveUserPrompt();
      if (currentResponse.trim() !== "") {
        // Update conversation with new question and response
        const updatedConversation = [
          ...conversation,
          {
            question: question,
            response: currentResponse,
            tokenUsage: response.data.data.usage.total_tokens,
          },
        ];
        setConversation(updatedConversation);

        // Save conversation to session storage for the current session
        sessionStorage.setItem(
          "hseGptConversation",
          JSON.stringify(updatedConversation)
        );
      }

      // Clear current question
      setQuestion("");
    } catch (error) {
      console.error("Error handling question:", error.message);
      setResponse("Error: Unable to fetch the answer.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (question, response, feedback) => {
    try {
      const payload = {
        user_id: userId,
        question: question,
        response: response,
        feedback: feedback,
      };
      console.log(payload);
      await axios.post(`${config.PATH}/api/openai/gpt-feedback/`, payload);
      toast.success("Feedback submitted");
    } catch (err) {
      console.log(err.message);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSendQuestion();
    }
  };

  return (
    <div className="hse-gpt">
      <div className="heading">HSE GPT</div>
      <div className="question-response-container">
        <div className="response-container">
          <label htmlFor="question" className="question-label">
            Enter Prompt Here:
          </label>
          <div style={{ display: "flex" }}>
            <input
              id="question"
              className="question-input"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Start typing or choose from suggestions..."
              onKeyDown={handleKeyPress}
            />
            &nbsp;&nbsp;&nbsp;
            <SendIcon className="send-button" onClick={handleSendQuestion} />
          </div>
          {/* Display question suggestions */}
          <div className="question-suggestions">
            {randomSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className="suggestion"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        </div>
        <div className="response-container">
          {tokenUsage ? (
            <label className="response-label">{`Response: (${tokenUsage} tokens used)`}</label>
          ) : (
            <label className="response-label">{`Response: `}</label>
          )}
          {isLoading ? (
            <div className="response-content">
              <LinearProgress />
              <br />
              Generating answer...
            </div>
          ) : (
            <div className="response-content">
              {conversation
                .map((entry, index) => (
                  <div key={index}>
                    <strong>You:</strong> {entry.question}
                    <br />
                    <strong>GPT:</strong> {entry.response}
                    <div className="feedback-buttons">
                      <button
                        onClick={() =>
                          handleFeedback(
                            entry.question,
                            entry.response,
                            "thumbs_up"
                          )
                        }
                      >
                        <ThumbUpIcon fontSize="small" />
                      </button>
                      <button
                        onClick={() =>
                          handleFeedback(
                            entry.question,
                            entry.response,
                            "thumbs_down"
                          )
                        }
                      >
                        <ThumbDownIcon fontSize="small" />
                      </button>
                      {entry.tokenUsage && (
                        <span className="token-usage">
                          {` (${entry.tokenUsage} tokens used)`}
                        </span>
                      )}
                    </div>
                    <br />
                    <br />
                  </div>
                ))
                .reverse()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HseGpt;
