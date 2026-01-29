
import React, { createContext, useState,useEffect } from "react";

export const ReportContextHSE = createContext();

export const HSEReportProvider = ({ children,allData }) => {
  const [backgroundBrief, setBackgroundBrief] = useState("");
  const [classificationOfAuditObservations,setClassificationOfAuditObservations]=useState("")
  const [auditScoreAnalysis,setAuditScoreAnalysis]=useState("");
  const [improvementOpportunityAreas,setImprovementOpportunityAreas]=useState("");
  const [overallAssessmentIndicator,setOverallAssessmentIndicator]=useState("");
 const [exeSummary, setExeSummary] = useState("");
const [contents, setContents] = useState("");
const [introduction, setIntroduction] = useState("");
const [conclusion, setConclusion] = useState("");
const [bestPractice, setbestPractice] = useState("");
  const [theWayForward, setTheWayForward] = useState("");
    const [criticalObservations, setCriticalObservations]=useState([])
    const [hasEditedCriticalObservations, setHasEditedCriticalObservations] = useState(false);
    const [manualCriticalObservations, setManualCriticalObservations] = useState([]);
    const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [observations, setObservations] = useState([]);
  const [editedObservations, setEditedObservations] = useState([]);
  const [selectedObservations, setSelectedObservations] = useState([]);
  const [isReportEdited, setIsReportEdited] = useState(false);
  const [isRowSaved, setIsRowSaved] = useState(true);
  const [confirmationShown, setConfirmationShown] = useState(false);
const [isEditing, setIsEditing] = useState(false);
const [currentEditedRow, setCurrentEditedRow] = useState(-1);
  const [allObservations, setAllObservations] = useState([]);
    const [selectedTableType, setSelectedTableType] = useState([]);
    const [tableTypes, setTableTypes] = useState([]);
    const [safeGroupedObservations, setSafeGroupedObservations] = useState({});
  // const [timeFrom,setTimeFrom]=useState([]);
  // const [timeTo,setTimeTo]=useState([]);
  // const [briefPropertyDescription,setBriefPropertyDescription]=useState([]);
  // const [numOfFloors,setNumOfFloors]=useState([]);
  // const [avgStaffFootfall,setAvgStaffFootfall]=useState([]);
  // const [noObjectionCertificate,setNoObjectCertificate]=useState([]);
  // const [nationalBuildingCodeCategory,setNationalBuildingCodeCategory]=useState([]);
  // const [coordinationgPersonClientside,setCoordinationgPersonClientside]=useState([]);
  // const [reportPreparedBy,setReportPreparedBy]=useState([]);
  // const [reportReviewedBy,setReportReviewedBy]=useState([]);
const [timeFrom, setTimeFrom] = useState(''); // TIME
const [timeTo, setTimeTo] = useState('');     // TIME
const [briefPropertyDescription, setBriefPropertyDescription] = useState(''); // TEXT
const [numOfFloors, setNumOfFloors] = useState(''); // VARCHAR(20)
const [avgStaffFootfall, setAvgStaffFootfall] = useState(''); // TEXT
const [noObjectionCertificate, setNoObjectionCertificate] = useState(''); // TEXT
const [nationalBuildingCodeCategory, setNationalBuildingCodeCategory] = useState(''); // VARCHAR(100)
const [coordinationgPersonClientside, setCoordinationgPersonClientside] = useState(''); // VARCHAR(100)
const [reportPreparedBy, setReportPreparedBy] = useState(''); // VARCHAR(100)
const [reportReviewedBy, setReportReviewedBy] = useState(''); // VARCHAR(100)


    const [facilityInfo, setFacilityInfo] = useState({
      "Name of Facility": "",
      "Address & Location": "",
      "Geographical Co-ordinates Seismic Zone": "",
      "Brief Property Description": "",
      "Type of Construction": "",
      "Number of Floors": "",
      "Average Worker Foot Fall": "",
      "No Objection Certificate": "",
    });

useEffect(() => {
    const groupedObservations = (selectedObservations || []).reduce((acc, obs) => {
      const key = obs.table_type;
      if (!key) return acc;
      if (!acc[key]) acc[key] = [];
      acc[key].push(obs);
      return acc;
    }, {});

    setSafeGroupedObservations((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((key) => {
        updated[key] = groupedObservations[key] || [];
      });
      Object.keys(groupedObservations).forEach((key) => {
        if (!updated[key]) updated[key] = groupedObservations[key];
      });
      return updated;
    });
  }, [selectedObservations]);

  // ✅ 2. Move table type extraction here
  useEffect(() => {
    if (allData?.data?.length > 0) {
      const types = [
        ...new Set(
          allData.data
            .map((d) => {
              if (typeof d.table_type === "object" && d.table_type !== null) {
                return d.table_type.value || d.table_type.type || "";
              }
              return d.table_type;
            })
            .filter(Boolean)
            .map(String)
        ),
      ];
      setTableTypes(types);
      if (types.length > 0 && !selectedTableType) {
        setSelectedTableType(types[0]);
      }
    }
  }, [allData]);



const resetReportContext = () => {
  setBackgroundBrief("");
  setClassificationOfAuditObservations("")
  setAuditScoreAnalysis("")
  setImprovementOpportunityAreas("");
  setOverallAssessmentIndicator("");
  setExeSummary("");
    setContents("");
    setIntroduction("");
    setbestPractice("");
    setTheWayForward("");
    setConclusion("");
      setCriticalObservations([]);
  setHasEditedCriticalObservations(false);
  setManualCriticalObservations([]);
  setSelectedOrganization(null);
  setSelectedSite(null);
  setStartDate(null);
  setEndDate(null);
    setObservations([]);
  setEditedObservations([]);
  setSelectedObservations([]);
  setIsReportEdited(false);
  setIsRowSaved(true);
  setFacilityInfo({  "Name of Facility": "",
      "Address & Location": "",
      "Geographical Co-ordinates Seismic Zone": "",
      "Brief Property Description": "",
      "Type of Construction": "",
      "Number of Floors": "",
      "Average Worker Foot Fall": "",
      "No Objection Certificate": "",})
}

  return (
    <ReportContextHSE.Provider
      value={{
    
        backgroundBrief,
        setBackgroundBrief,
        classificationOfAuditObservations,
        setClassificationOfAuditObservations,
        auditScoreAnalysis,setAuditScoreAnalysis,
        improvementOpportunityAreas,setImprovementOpportunityAreas,
        overallAssessmentIndicator,setOverallAssessmentIndicator,
        exeSummary,
        setExeSummary,
        contents,
        setContents,
        introduction,
        setIntroduction,
        conclusion,
        setConclusion,
        bestPractice,
        setbestPractice,
        theWayForward,
        setTheWayForward,
        criticalObservations,
        setCriticalObservations,
        facilityInfo,
        setFacilityInfo,
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
      isReportEdited,
    setIsReportEdited,
    isRowSaved,
    setIsRowSaved,


         observations,
    setObservations,
    editedObservations,
    setEditedObservations,
    selectedObservations,
    setSelectedObservations,
        

        resetReportContext,
          confirmationShown,
  setConfirmationShown,
  isEditing,
  setIsEditing,
  currentEditedRow,
  setCurrentEditedRow,
allObservations,setAllObservations,


timeFrom, setTimeFrom,
timeTo, setTimeTo,
briefPropertyDescription, setBriefPropertyDescription,
numOfFloors, setNumOfFloors,
avgStaffFootfall, setAvgStaffFootfall,
noObjectionCertificate, setNoObjectionCertificate,
nationalBuildingCodeCategory, setNationalBuildingCodeCategory,
coordinationgPersonClientside, setCoordinationgPersonClientside,
reportPreparedBy, setReportPreparedBy,
reportReviewedBy, setReportReviewedBy,

  selectedTableType, setSelectedTableType,
  tableTypes, setTableTypes,
  safeGroupedObservations, setSafeGroupedObservations,
      }}
    >
      {children}
    </ReportContextHSE.Provider>
  );
};
