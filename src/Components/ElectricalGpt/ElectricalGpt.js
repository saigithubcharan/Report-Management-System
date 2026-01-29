import React, { useState, useEffect } from "react";
import axios from "axios"; // Update to use Axios directly
import { getAccountDetails } from "../Services/localStorage";
import { config } from "../../config";
import { LinearProgress } from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbDownIcon from "@mui/icons-material/ThumbDownAlt";
import { toast } from "react-toastify";
import SendIcon from '@mui/icons-material/Send';

const ElectricalGpt = () => {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [threadId, setThreadId] = useState("");
  const userId = getAccountDetails().userId;
  const [randomSuggestions, setRandomSuggestions] = useState([]);
  const [tokenUsage, setTokenUsage] = useState("")

  const questionSuggestions = [
    "Key electrical safety considerations for music concerts?",
    "Precautions for preventing electrical hazards at talk shows?",
    "Ensuring electrical safety at outdoor cricket matches?",
    "Safety guidelines for temporary electrical installations at events?",
    "How to ground lighting and sound equipment for event safety?",
    "Emergency protocols for electrical issues during events?",
    "Role of qualified electricians at events?",
    "Preventing tripping hazards with electrical cables at events?",
    "Electrical safety in temporary structures like event tents?",
    "Precautions for using electricity in proximity to water features at events?",
    "Training for event staff on electrical safety protocols?",
    "Collaboration with local authorities for event electrical safety?",
    "Challenges and safety considerations for indoor events?",
    "Importance of backup power sources at events?",
    "Utilizing technology for electrical safety at large-scale events?",
    "Safety measures during setup and dismantling of electrical equipment at events?",
    "Promoting electrical safety awareness among event stakeholders?",
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
    const storedConversation = sessionStorage.getItem(
      "electricalGptConversation"
    );
    if (storedConversation) {
      setConversation(JSON.parse(storedConversation));
    }
  };

  const saveUserPrompt = async () => {
    try {
      const payload = {
        user_id: userId,
        user_prompt: question,
        gpt_type: "electrical",
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
          " You are an AI assistant specializing in Electrical Safety for events. Whether it's music concerts, cricket and football matches, movie sets, or other events. Help people find information about electrical safety-related queries.",
      };

      const response = await axios.post(
        `${config.PATH}/api/azure/ai-assistant-gpt`,
        payload
      );

      // Set the API response as the current response
      const currentResponse = response.data.data.choices[0].message.content;
      setResponse(currentResponse);
      setTokenUsage(response.data.data.usage.total_tokens)
      saveUserPrompt();
      if (currentResponse.trim() !== "") {
        // Update conversation with new question and response
        const updatedConversation = [
          ...conversation,
          { question: question, response: currentResponse,tokenUsage:response.data.data.usage.total_tokens },
        ];
        setConversation(updatedConversation);

        // Save conversation to session storage for the current session
        sessionStorage.setItem(
          "electricalGptConversation",
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
    <div className="hse-gpt" style={{overflow:'auto',height:'100vh',}}>
      <div className="heading">ELECTRICAL GPT</div>
      <div className="question-response-container">
        <div className="response-container">
          <label htmlFor="question" className="question-label">
            Enter Prompt Here:
          </label>
          <div style={{display:"flex"}}>
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
          <SendIcon className="send-button" onClick={handleSendQuestion}/>
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
          )}          {isLoading ? (
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

export default ElectricalGpt;
