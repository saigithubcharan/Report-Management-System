
import React, { createContext, useState } from "react";

export const ReportContext = createContext();

export const ReportProvider = ({ children }) => {
  const [backgroundBrief, setBackgroundBrief] = useState("");
  const [improvementOpportunityAreas,setImprovements]=useState("");
  const [overallAssessmentIndicator,setOverallAssessmentIndicator]=useState("");
  const [exeSummary, setExeSummary] = useState("");
  const [backgroundBriefEdited, setBackgroundBriefEdited] = useState(false);
const [exeSummaryEdited, setExeSummaryEdited] = useState(false);
  const [conclusion, setConclusion] = useState("");
  const [theWayForward, setTheWayForward] = useState("");
  const [contents, setContents] = useState("");
  const [criticalObservations, setCriticalObservations]=useState([])
  const [hasEditedCriticalObservations, setHasEditedCriticalObservations] = useState(false);
  const [manualCriticalObservations, setManualCriticalObservations] = useState([]);
  const [selectedOrganization, setSelectedOrganization] = useState(null);
const [selectedSite, setSelectedSite] = useState(null);
const [startDate, setStartDate] = useState(null);
const [endDate, setEndDate] = useState(null);
const [isSaved, setIsSaved] = useState(false);
 const [scores, setScores] = useState([
    {
      "Electrical Safety": "Design & Installation",
      "Maximum Score": 5,
      "Score Obtained": 0,
    },
    {
      "Electrical Safety": "Preventive maintenance",
      "Maximum Score": 5,
      "Score Obtained": 0,
    },
    {
      "Electrical Safety": "Training",
      "Maximum Score": 5,
      "Score Obtained": 0,
    },
    {
      "Electrical Safety": "Lock out Tag out",
      "Maximum Score": 5,
      "Score Obtained": 0,
    },
    {
      "Electrical Safety": "Drawings (As- built) /Documents",
      "Maximum Score": 5,
      "Score Obtained": 0,
    },
  ]);



const [newRow, setNewRow] = useState({
  area: "",
  category: "",
  check_points: "",
  observation: "",
  criticality: "",
  recommendations: "",
  is_reference: "",
  imageUrls: [],
});
const [observations, setObservations] = useState([]);
const [editedObservations, setEditedObservations] = useState([]);
const [selectedObservations, setSelectedObservations] = useState([]);
const [isReportEdited, setIsReportEdited] = useState(false);
const [isRowSaved, setIsRowSaved] = useState(true);
const resetReportContext = () => {
  setImprovements("");
  setOverallAssessmentIndicator("");
  setBackgroundBrief("");
  setExeSummary("");
  setBackgroundBriefEdited(false);
  setExeSummaryEdited(false);
  setConclusion("");
  setTheWayForward("");
  setContents("");
  setCriticalObservations([]);
  setHasEditedCriticalObservations(false);
  setManualCriticalObservations([]);
  setSelectedOrganization(null);
  setSelectedSite(null);
  setStartDate(null);
  setEndDate(null);
  setNewRow({
    area: "",
    category: "",
    check_points: "",
    observation: "",
    criticality: "",
    recommendations: "",
    is_reference: "",
    imageUrls: [],
  });
  setObservations([]);
  setEditedObservations([]);
  setSelectedObservations([]);
  setIsReportEdited(false);
  setIsRowSaved(true);
};


  return (
    <ReportContext.Provider
      value={{
        improvementOpportunityAreas,
        setImprovements,
        overallAssessmentIndicator,
        setOverallAssessmentIndicator,
         backgroundBriefEdited,
    setBackgroundBriefEdited,
     exeSummaryEdited,
    setExeSummaryEdited,
        backgroundBrief,
        setBackgroundBrief,
        exeSummary,
        setExeSummary,
        conclusion,
        setConclusion,
        theWayForward,
        setTheWayForward,
        contents,
        setContents,
        criticalObservations,
        setCriticalObservations,
            hasEditedCriticalObservations,
    setHasEditedCriticalObservations,
    manualCriticalObservations,
    setManualCriticalObservations,
     selectedOrganization,
    setSelectedOrganization,
    selectedSite,
    setSelectedSite,
    startDate,
    setStartDate,
    endDate,
    setEndDate,


        newRow,
    setNewRow,
    observations,
    setObservations,
    editedObservations,
    setEditedObservations,
    selectedObservations,
    setSelectedObservations,
    isReportEdited,
    setIsReportEdited,
    isRowSaved,
    setIsRowSaved,
    resetReportContext,
    isSaved,
    setIsSaved,
    scores,setScores

      }}
    >
      {children}
    </ReportContext.Provider>
  );
};
