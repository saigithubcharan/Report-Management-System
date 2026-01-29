import React, { useState, useEffect, useContext, useRef } from "react";
import { Button, Modal, TextField, Typography, Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import "./HseReportModal.css";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import axios from "../../APIs/axios";
import HsePreviewReportModal from "../HsePreviewReportModal/HsePreviewReportModal.js";
import { config } from "../../config";
import { getAccountDetails } from "../Services/localStorage";
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ObservationsDrawer from "../ObservationsDrawer/ObservationsDrawer.js";
import { ReportContextHSE } from "../ReportContext/ReportContextHSE.js";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const HseReportModal = ({
  open,
  setOpenHseModal,
  hseAreaList,
  allData,
  getAllHseData,
  setLoading,
  getAllHseReports,
  selectedSector,
  setSelectedSector,
  selectedParam,
  setSelectedParam,
}) => {
  const {
    backgroundBrief,
    auditScoreAnalysis,
    classificationOfAuditObservations,
    improvementOpportunityAreas,
    overallAssessmentIndicator,
    exeSummary,
    contents,
    introduction,
    conclusion,
    bestPractice,
    theWayForward,
    criticalObservations,
    setCriticalObservations,
    hasEditedCriticalObservations,
    setHasEditedCriticalObservations,
    manualCriticalObservations,
    setManualCriticalObservations,
    observations,
    setObservations,
    selectedObservations,
    setSelectedObservations,
    selectedOrganization,
    setSelectedOrganization,
    selectedSite,
    setSelectedSite,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    editedObservations,
    setEditedObservations,
    allObservations, setAllObservations,
    timeFrom, setTimeFrom,
    timeTo, setTimeTo,
    briefPropertyDescription, setBriefPropertyDescription,
    numOfFloors, setNumOfFloors,
    avgStaffFootfall, setAvgStaffFootfall,
    noObjectionCertificate, setNoObjectionCertificate,
    nationalBuildingCodeCategory, setNationalBuildingCodeCategory,
    coordinationgPersonClientside, setCoordinationgPersonClientside,
    reportPreparedBy, setReportPreparedBy,
    reportReviewedBy, setReportReviewedBy


  } = useContext(ReportContextHSE)
  const [categoryList, setCategoryList] = useState([]);
  const [selectedArea, setSelectedArea] = useState(Array.isArray(allData?.Areas) && allData.Areas.length > 0
    ? allData.Areas.map((e) => e.area)
    : ["NA"]);
  const [selectedCategory, setSelectedCategory] = useState(["Category"]);
  // const [observations, setObservations] = useState([]);
  // const [selectedObservations, setSelectedObservations] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [openReviewModal, setOpenReviewModal] = useState(false);
  const [ReportUID, setReportUID] = useState("");
  const [newReportUID, setNewReportUID] = useState("");
  const [selectedDateTime, setSelectedDateTime] = useState(null);
  // const [selectedOrganization, setSelectedOrganization] = useState(null);
  // const [selectedSite, setSelectedSite] = useState(null);
  // const [startDate, setStartDate] = useState(null);
  // const [endDate, setEndDate] = useState(null);
  const [orgList, setOrgList] = useState([]);
  const [siteOptions, setSiteOptions] = useState([]);
  const [reportHeader, setReportHeaders] = useState();
  // const [criticalObservations, setCriticalObservations] = useState([]);
  const { userId } = getAccountDetails();
  const [areasToDisplay, setAreasToDisplay] = useState([]);
  const [categoriesToDisplay, setCategoriesToDisplay] = useState([]);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [notes, setNotes] = useState([]);
  const [paramList, setParamList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleOpenDrawer = () => {
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  useEffect(() => {
    getOrgList();
    getReportHeaders();
    getParamList();
  }, [open, selectedOrganization, selectedSector]);

  useEffect(() => {
    generateUniqueId();
    getCurrentDateTime();
    getAllNotes();
  }, []);
  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false);
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);
  useEffect(() => {
    const closeDatePickersOnScroll = () => {
      if (isStartDatePickerOpen && startDateRef.current) {
        startDateRef.current.setOpen(false);
        setIsStartDatePickerOpen(false);
      }
      if (isEndDatePickerOpen && endDateRef.current) {
        endDateRef.current.setOpen(false);
        setIsEndDatePickerOpen(false);
      }
    };

    const scrollContainer = document.querySelector('.modal-content'); // or whatever container scrolls

    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', closeDatePickersOnScroll);
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', closeDatePickersOnScroll);
      }
    };
  }, [isStartDatePickerOpen, isEndDatePickerOpen]);


  useEffect(() => {
    const getSitesByOrganization = async (orgId) => {
      try {
        const response = await axios.get(
          `${config.PATH}/api/hse-organizations/${orgId}/sites`
        );
        const siteOptions = response.data.map((site) => ({
          label: site.site_name,
          value: site.site_name,
        }));
        setSiteOptions(siteOptions);
      } catch (error) {
        console.log("Error:", error.response?.data?.error || error.message);
      }
    };
    if (selectedOrganization) {
      getSitesByOrganization(selectedOrganization.value);
    }
  }, [selectedOrganization, selectedSite]);

  useEffect(() => {
    updateReportUID();
  }, [selectedOrganization, selectedSite, selectedDateTime]);

  const getParamList = () => {
    // if (!selectedSector || !selectedSector.value) {
    //   setParamList([]);
    //   setSelectedParam(null);
    //   setSelectedArea(null);
    //   setAreasToDisplay(null);
    //   setCategoriesToDisplay(null);
    //   return [];
    // }

    const list = [
      ...new Set(
        (allData?.data || [])
          // .filter((e) => e.sector_type === selectedSector.value)
          // Filter based on selectedSector
          .map((e) => e.table_type)
          .filter(
            (table_type) =>
              table_type !== null &&
              table_type !== undefined &&
              table_type !== ""
          )
      ),
    ];

    setParamList(list);
    return list;
  };

  const getAllNotes = async () => {
    try {
      const response = await axios.get(
        `${config.PATH}/api/get-all-notes/${userId}`
      );
      setNotes(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  const getReportHeaders = async () => {
    try {
      const response = await axios.get(`${config.PATH}/api/get-hse-headers`);
      // const annexure = await axios.get(`${config.PATH}/api/get-all-annexure-details`);
      // console.log("annexure data",annexure.data)
      setReportHeaders(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  // const getReportHeaders = async () => {
  //   try {
  //     const response = await axios.get(`${config.PATH}/api/get-headers`);
  //     setReportHeaders(response.data);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };

  const getOrgList = async () => {
    try {
      const response = await axios.get(`${config.PATH}/api/get-hse-orgs`);
      setOrgList(response.data);
    } catch (error) {
      console.log("Error:", error.response?.data?.error || error.message);
    }
  };
  const [expanded, setExpanded] = useState(null);
  const handleChangeAccordion = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : null);
  };
  const handleCloseWithoutSaving = () => {
    setShowConfirmationModal(false);
    setOpenHseModal(false);
    setSelectedObservations([]);
    setRecommendations([]);
    setSelectedArea([]);
    setSelectedCategory([]);
    setSelectedOrganization(null);
    setSelectedSite(null);
    setAreasToDisplay([]);
    setCategoriesToDisplay([]);
    generateUniqueId();
    getCurrentDateTime();
    setStartDate(null);
    setEndDate(null);
    setSelectedSector(null);
    setSelectedParam(null);
  };

  const handleClose = () => {
    if (selectedObservations.length > 0) {
      setShowConfirmationModal(true);
    } else {
      handleCloseWithoutSaving();
    }
  };

  const sectors = () => {
    try {
      const options = [];
      const list = [
        ...new Set(
          (allData?.data || [])
            .map((e) => e.sector_type)
            .filter(
              (sector_type) =>
                sector_type !== null &&
                sector_type !== undefined &&
                sector_type !== ""
            )
        ),
      ];
      list.map((area) => options.push({ label: area, value: area }));
      return options;
    } catch (err) {
      console.log(err);
    }
  };

  // const areaOptions = () => {
  //   try {
  //     const options = [];
  //     hseAreaList.map((area) => options.push({ label: area, value: area }));
  //     console.log("options",options);
  //     return options;
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };
  const areaOptions = () => {
    // console.log("hseAreaList in areaOptions:", hseAreaList);

    if (!Array.isArray(hseAreaList)) return []; // safe guard

    return hseAreaList.map((area) => ({
      label: area,
      value: area,
    }));
  };

  const categoryOptions = () => {
    try {
      const options = [];
      let uniqueCategories = [...new Set(categoryList)];
      uniqueCategories.map((cat) => options.push({ label: cat, value: cat }));
      return options;
    } catch (err) {
      console.log(err);
    }
  };

  const paramsOption = () => {
    try {
      const options = [];
      paramList.map((param) => options.push({ label: param, value: param }));
      return options;
    } catch (err) {
      console.log(err);
    }
  };

  const organizationOptions = orgList.map((e) => ({
    label: e.org_name,
    value: e.id,
  }));

  const handleOrganizationSelection = async (selectedOption) => {
    if (selectedOption && selectedOption.__isNew__ === true) {
      const isValidOrganizationName = /^[a-zA-Z0-9_-]+$/.test(
        selectedOption.label
      );

      // Check if the length exceeds 40 characters

      const exceedsCharacterLimit = selectedOption.label.length > 40;

      if (!isValidOrganizationName || exceedsCharacterLimit) {
        let errorMessage = "";
        if (!isValidOrganizationName) {
          errorMessage =
            "Invalid organization name. Only hyphens ( - ), underscores ( _ ) and alphanumeric characters are allowed.";
        } else {
          errorMessage = `Organization name cannot exceed 40 characters. You have typed ${selectedOption.label.length} characters.`;
        }
        alert(errorMessage);
        return;
      }

      const payload = {
        org_name: selectedOption.label,
      };
      try {
        const response = await axios.post(
          `${config.PATH}/api/create-hse-org`,
          payload
        );
        const newOrganization = response.data; // Assuming the API returns the newly created organization object
        setSelectedOrganization({
          label: newOrganization.org_name,
          value: newOrganization.id,
        });
        setSelectedSite(null);
      } catch (error) {
        console.log("Failed to create organization:", error);
        return;
      }
    } else {
      setSelectedOrganization(selectedOption);
      setSelectedSite(null);
    }
  };

  const handleSiteSelection = async (selectedOption) => {
    if (selectedOption && selectedOption.__isNew__ === true) {
      const isValidSiteName = /^[a-zA-Z0-9_-]+$/.test(selectedOption.label);

      // Check if the length exceeds 40 characters

      const exceedsCharacterLimit = selectedOption.label.length > 40;

      if (!isValidSiteName || exceedsCharacterLimit) {
        let errorMessage = "";
        if (!isValidSiteName) {
          errorMessage =
            "Invalid Site name. Only hyphens ( - ), underscores ( _ ) and alphanumeric characters are allowed.";
        } else {
          errorMessage = `Site name cannot exceed 40 characters. You have typed ${selectedOption.label.length} characters.`;
        }
        alert(errorMessage);
        return;
      }

      const payload = {
        site_name: selectedOption.label,
        org_id: selectedOrganization.value,
      };
      try {
        await axios.post(`${config.PATH}/api/create-hse-site`, payload);
        updateReportUID();
      } catch (error) {
        console.log("Failed to create site:", error);
        return;
      }
    }
    setSelectedSite(selectedOption);
    updateReportUID();
  };

  const handleChangeSector = (e) => {
    setSelectedSector(e);
  };

  const handleChangeParam = (e) => {
    if (e === null || e.length === 0 || e === undefined) {
      setSelectedArea([]);
      setAreasToDisplay([]);
      setAllObservations([]);
      setSelectedObservations([]);
    }
    setSelectedParam(e);
  };

  //   const handleChangeArea = (areas) => {
  //     try {
  //       setAreasToDisplay(areas);
  //       const selectedArea = areas.map((e) => e.value);
  //       setSelectedArea(selectedArea);

  //       if (areas.length === 0) {
  //         // If the 'areas' array is empty, clear observations and selected observations
  //         setObservations([]);
  //         setSelectedObservations([]);
  //       } else {
  //         // Filter observations based on the selected areas
  //         const combinedData = (allData?.data || [])
  //           .filter(
  //             (e) =>
  //               e.edited_fields === null ||
  //               e.edited_fields.includes("O") ||
  //               (JSON.parse(e.edited_fields).length === 0)
  //           ).
  //           concat(
  //             notes
  //               .filter((note) => note.note_type === "hse")
  //               .map((note) => ({ ...note, isNote: true }))
  //           );
  // //         const combinedData = (allData?.data || []).concat(
  // //   notes
  // //     .filter((note) => note.note_type === "hse")
  // //     .map((note) => ({ ...note, isNote: true }))
  // // );

  //         // console.log("combinedData", combinedData)

  //         const filteredObservations = combinedData.filter((item) =>
  //           selectedArea.includes(item.area)
  //         );

  //         // console.log("filteredObservations", filteredObservations)
  // const newObservations = observations.filter((obs) => obs.isNew);
  //         const updatedObservations = filteredObservations.map((newObs) => {
  //           const existingObs = observations.find(
  //             (obs) => obs.observation === newObs.observation
  //           );
  //           return existingObs
  //             ? {
  //               ...newObs,
  //               is_selected: existingObs.is_selected,
  //               imageUrls: existingObs.imageUrls,
  //               score: existingObs.score,
  //             }
  //             : newObs;
  //         }) .concat(newObservations); // <-- keep new observations!;



  //         setObservations(updatedObservations);
  //         setSelectedObservations(
  //           selectedObservations.filter((selectedObs) =>
  //             updatedObservations.some(
  //               (e) => e.sr_no === selectedObs.sr_no || e.id === selectedObs.id
  //             )
  //           )
  //         );
  //         console.log("updatedObservations", updatedObservations)
  //         // console.log("selectedobsss",setObservations);



  //         // Optionally, remove selected observations not in the filtered areas
  //         // const removedAreas = selectedObservations.filter(
  //         //   (selectedObs) => !selectedArea.includes(selectedObs.area)
  //         // );
  //         // if (removedAreas.length > 0) {
  //         //   const updatedSelectedObservations = selectedObservations.filter(
  //         //     (selectedObs) =>
  //         //       !removedAreas.some(
  //         //         (removedArea) => removedArea.area === selectedObs.area
  //         //       )
  //         //     );
  //         //     setSelectedObservations(updatedSelectedObservations);
  //         //     console.log("updatedObservations", updatedObservations)
  //         //     console.log("selectedobs",selectedObservations);
  //         //   }

  //         }
  //     } catch (error) {
  //       console.log("An error occurred:", error);
  //     }
  //   };

  const handleChangeArea = (areas) => {
    try {
      setAreasToDisplay(areas);
      const selectedArea = areas.map((e) => e.value);
      setSelectedArea(selectedArea);

      if (areas.length === 0) {
        setObservations([]);
        setSelectedObservations([]);
        return;
      }

      const combinedData = (allData?.data || [])
        .filter(
          (e) =>
            e.edited_fields === null ||
            e.edited_fields.includes("O") ||
            (JSON.parse(e.edited_fields).length === 0)
        )
        .concat(
          // notes
          (notes || [])
            .filter((note) => note.note_type === "hse")
            .map((note) => ({ ...note, isNote: true }))
        );

      const filteredObservations = combinedData.filter((item) =>
        selectedArea.includes(item.area)
      );

      const newObservations = observations.filter((obs) => obs.isNew);

      //  Merge edited fields into the filtered list
      const updatedObservations = filteredObservations.map((obs) => {
        const edited = editedObservations.find((e) => e.sr_no === obs.sr_no);
        const existing = observations.find((o) => o.sr_no === obs.sr_no);
        return {
          ...obs,
          ...existing,
          ...edited, //  gives highest priority to edited values
        };
      }).concat(newObservations); // preserve manually added ones

      //  Update selectedObservations based on updated ones
      const updatedSelected = selectedObservations.filter((selectedObs) =>
        updatedObservations.some(
          (e) => e.sr_no === selectedObs.sr_no || e.id === selectedObs.id
        )
      );

      setObservations(updatedObservations);
      setSelectedObservations(updatedSelected);

    } catch (error) {
      console.log("An error occurred in handleChangeArea:", error);
    }
  };


  const handleChangeCategory = async (cat) => {
    setCategoriesToDisplay(cat);
    const selectedCat = cat.map((e) => e.value);
    setSelectedCategory(selectedCat);

    const combinedData = (allData?.data || [])
      .filter((e) => e.edited_fields === null || e.edited_fields.includes("O"))
      .concat(
        notes
          .filter((note) => note.note_type === "hse")
          .map((note) => ({ ...note, isNote: true }))
      );

    // Filter based on selected category and area
    const filteredObservations = combinedData.filter(
      (item) =>
        selectedCat.includes(item.category) && selectedArea.includes(item.area)
    );

    // Preserve the selection status (is_selected) from the old observations
    const updatedObservations = filteredObservations.map((newObs) => {
      const existingObs = observations.find(
        (obs) => obs.observation === newObs.observation
      );
      return existingObs
        ? {
          ...newObs,
          is_selected: existingObs.is_selected,
          imageUrls: existingObs.imageUrls,
          score: existingObs.score,
        }
        : newObs;
    });

    // Update the observations state with the filtered observations.
    setObservations(updatedObservations);
    setSelectedObservations(
      selectedObservations.filter((selectedObs) =>
        updatedObservations.some(
          (e) => e.sr_no === selectedObs.sr_no || e.id === selectedObs.id
        )
      )
    );
    // Check if any observations in selectedObservations are related to removed categories
    const removedCategories = selectedObservations.filter(
      (selectedObs) => !selectedCat.includes(selectedObs.category)
    );
    if (removedCategories.length > 0) {
      // Remove observations corresponding to removed categories
      const updatedSelectedObservations = selectedObservations.filter(
        (selectedObs) =>
          !removedCategories.some(
            (removedCat) =>
              removedCat.category === selectedObs.category ||
              removedCat.category === selectedObs.category
          )
      );
      setSelectedObservations(updatedSelectedObservations);
    }
  };
  // const handleObservationSelection = (tableType, identifier) => {
  //   // Clone the observations array to avoid direct mutation
  //   const tempObs = [...observations];

  //   // Find the specific observation using sr_no or id
  //   const observationIndex = tempObs.findIndex(
  //     (obs) => obs.table_type === tableType && (obs.sr_no === identifier || obs.id === identifier)
  //   );

  //   if (observationIndex === -1) {
  //     return; // Observation not found
  //   }

  //   // Toggle the selection state
  //   const observation = tempObs[observationIndex];
  //   const isAlreadySelected = observation.is_selected;

  //   tempObs[observationIndex] = {
  //     ...observation,
  //     is_selected: isAlreadySelected ? 0 : 1,
  //   };

  //   // Update the observations state with the modified array
  //   setObservations(tempObs);

  //   if (isAlreadySelected) {
  //     // Unselecting: Remove the observation from selectedObservations and criticalObservations
  //     setSelectedObservations(
  //       selectedObservations.filter(
  //         (e) =>
  //           !(e.table_type === tableType &&
  //             (e.sr_no === identifier || e.id === identifier))
  //       )
  //     );
  //     setCriticalObservations(
  //       criticalObservations.filter(
  //         (e) =>
  //           !(e.table_type === tableType &&
  //             (e.sr_no === identifier || e.id === identifier))
  //       )
  //     );
  //   } else {
  //     // Selecting: Add the observation to selectedObservations and criticalObservations
  //     setSelectedObservations([
  //       ...selectedObservations,
  //       { ...observation, table_type: tableType },
  //     ]);
  //     if (observation.criticality === "High") {
  //       setCriticalObservations([
  //         ...criticalObservations,
  //         { ...observation, table_type: tableType },
  //       ]);
  //     }
  //   }
  // };





  const handleObservationSelection = (tableType, identifier) => {
    const tempObs = [...observations];
    const allObs = [...allObservations]; // clone master

    const observationIndex = tempObs.findIndex(
      (obs) =>
        obs.table_type === tableType &&
        (obs.sr_no === identifier || obs.id === identifier)
    );
    if (observationIndex === -1) return;

    const observation = tempObs[observationIndex];
    const isAlreadySelected = observation.is_selected;

    // Toggle selection in current visible observations
    const updatedObservation = {
      ...observation,
      is_selected: isAlreadySelected ? 0 : 1,
    };
    tempObs[observationIndex] = updatedObservation;
    setObservations(tempObs);

    const masterIndex = allObs.findIndex(
      (obs) =>
        obs.table_type === tableType &&
        (obs.sr_no === identifier || obs.id === identifier)
    );
    if (masterIndex !== -1) {
      allObs[masterIndex] = {
        ...allObs[masterIndex],
        is_selected: isAlreadySelected ? 0 : 1,
      };
      setAllObservations(allObs);
    }

    let updatedSelected = [];
    if (isAlreadySelected) {
      updatedSelected = selectedObservations.filter(
        (e) =>
          !(
            e.table_type === tableType &&
            (e.sr_no === identifier || e.id === identifier)
          )
      );
    } else {
      updatedSelected = [
        ...selectedObservations,
        { ...observation, is_selected: 1, table_type: tableType },
      ];
    }
    setSelectedObservations(updatedSelected);

    const selectedHigh = updatedSelected.filter(
      (e) => e.criticality === "High"
    );

    const editedMap = new Map();
    criticalObservations.forEach((obs) => {
      const key = `${obs.sr_no || obs.id || obs.observation}`.trim();
      editedMap.set(key, obs);
    });

    const mergedSet = new Set();
    const mergedCriticals = [];

    [...selectedHigh, ...manualCriticalObservations].forEach((obs) => {
      const key = `${obs.sr_no || obs.id || obs.observation}`.trim();
      if (!mergedSet.has(key)) {
        mergedSet.add(key);
        mergedCriticals.push(editedMap.get(key) || obs);
      }
    });

    setCriticalObservations(mergedCriticals);
    setHasEditedCriticalObservations(true);
  };


  const handleProceed = async () => {



    try {
      setLoading(true);
      setOpenReviewModal(true);
      setOpenHseModal(false);
      // const reportData = {
      //   report_id: ReportUID,
      //   user_id: userId,
      //   date_time: selectedDateTime,
      //   background_brief: backgroundBrief,
      //    exe_summary: exeSummary,
      //     contents:contents,
      //     introduction:introduction,
      //      conclusion: conclusion,
      //     best_practice: bestPractice,
      //     the_way_forward: theWayForward,
      //   organization: selectedOrganization
      //     ? selectedOrganization.label
      //     : selectedOrganization,
      //   org_id: selectedOrganization
      //     ? selectedOrganization.value
      //     : selectedOrganization,
      //   site: selectedSite ? selectedSite.label : selectedSite,
      //   area: selectedArea,
      //   category: selectedCategory,
      //   start_date: startDate,
      //   end_date: endDate,
      //   type: "primary",
      //   sector_type: selectedSector.value,
      // };
      const reportData = {
        report_id: ReportUID,
        user_id: userId,
        date_time: selectedDateTime,
        background_brief: backgroundBrief,
        classification_of_audit_observations: classificationOfAuditObservations,
        audit_score_analysis: auditScoreAnalysis,
        improvement_opportunity_areas: improvementOpportunityAreas,
        overall_assessment_indicator: overallAssessmentIndicator,

        exe_summary: exeSummary,
        contents: contents,
        introduction: introduction,
        conclusion: conclusion,
        best_practice: bestPractice,
        the_way_forward: theWayForward,
        organization: selectedOrganization?.label || selectedOrganization || null,
        org_id: selectedOrganization?.value || selectedOrganization || null,
        site: selectedSite?.label || selectedSite || null,
        area: selectedArea || null,
        category: selectedCategory || null,
        start_date: startDate,
        end_date: endDate,
        type: "primary",
        sector_type: selectedSector?.value || null,
        time_of_audit_from: timeFrom || null,
        time_of_audit_to: timeTo || null,
        brief_property_description: briefPropertyDescription || null,
        num_of_floors: numOfFloors || null,
        average_staff_footfall: avgStaffFootfall || null,
        no_objection_certificate: noObjectionCertificate || null,
        national_building_code_category: nationalBuildingCodeCategory || null,
        coordinating_person_clientSide: coordinationgPersonClientside || null,
        report_prepared_by: reportPreparedBy || null,
        report_reviewed_by: reportReviewedBy || null
      };
      // console.log("proceed Data",reportData)
      await axios.post(`${config.PATH}/api/save-update-hse-report`, reportData);

      const updatedObservations = [
        ...observations.filter((obs) => obs.is_selected === 1),
        ...observations.filter((obs) => obs.is_selected !== 1),
      ];

      setObservations(updatedObservations);

      const observationsData = {
        report_id: ReportUID,
        // observation: selectedObservations,
        // critical_observations: criticalObservations,
        all_observations: updatedObservations,
      };
      // console.log("Observation data",observationsData)
      // console.log("observationsdata",updatedObservations)
      //   console.log("selectedobsafter proceed",selectedObservations);
      await axios.post(
        `${config.PATH}/api/save-update-hse-observations`,
        observationsData
      );
      setLoading(false);
    } catch (error) {
      console.log("Error:", error.response?.data?.error || error.message);
    }
  };

  const updateReportUID = () => {
    if (
      selectedOrganization &&
      selectedOrganization.label &&
      selectedSite &&
      selectedSite.label &&
      selectedDateTime
    ) {
      const formattedDateTime = selectedDateTime.split("T")[0];
      setReportUID(
        `${newReportUID}-${selectedOrganization.label}_${selectedSite.label}_${formattedDateTime}`
      );
    } else if (!selectedSite) {
      // If selectedSite is null, revert back to the initial ReportUID
      setReportUID(newReportUID);
    }
  };

  const generateUniqueId = () => {
    let id = "";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < 10; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      id += characters.charAt(randomIndex);
    }

    setReportUID(id);
    setNewReportUID(id); // Set newReportUID initially to the generated ID
  };

  const handleDateTime = (e) => {
    setSelectedDateTime(e.target.value);
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    setSelectedDateTime(`${year}-${month}-${day}T${hours}:${minutes}`);
  };

  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      borderBottom: "none", // Hide the separator
      boxShadow: "none", // Hide the box shadow
      cursor: "pointer", // Show the pointer cursor
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      display: "none", // Hide the down arrow
    }),
  };

  const handleStartEndDate = (date, name) => {
    if (!date) {
      // Handle case when date is null or undefined
      if (name === "start-date") {
        setStartDate(null);
      } else if (name === "end-date") {
        setEndDate(null);
      } else {
        if (startDate) setEndDate(null);
      }
      return;
    }

    // Ensure that the date part is set to midnight (00:00:00)
    const adjustedDate = new Date(date);
    adjustedDate.setHours(0, 0, 0, 0);

    if (name === "start-date") {
      if (endDate && adjustedDate > endDate) {
        toast.warning("Start date cannot be after the end date.");
        setStartDate(null);
        return;
      }
      setStartDate(adjustedDate);
    } else {
      if (startDate && adjustedDate < startDate) {
        toast.warning("End date cannot be before the start date.");
        setEndDate(null);
        return;
      }
      setEndDate(adjustedDate);
    }
  };

  const filteredObservations = observations.filter(
    (observation) =>
      observation.table_type !== null &&
      observation.table_type !== undefined &&
      (observation.edited_fields === null ||
        observation.isNote === true || observation.isNew === true) &&
      (observation.observation
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
        observation.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
        observation.table_type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Group filtered observations by table_type
  //   const filteredObservations = observations.filter((observation) => {
  //   const matchesSearch =
  //     observation.observation
  //       ?.toLowerCase()
  //       .includes(searchTerm.toLowerCase()) ||
  //     observation.area?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     observation.table_type?.toLowerCase().includes(searchTerm.toLowerCase());

  //   const isValid =
  //     observation.table_type !== null &&
  //     observation.table_type !== undefined;

  //   const isEditableOrNote =
  //     observation.edited_fields === null || 
  //     observation.isNote === true || 
  //     observation.isNew === true; 

  //   return isValid && isEditableOrNote && matchesSearch;
  // });

  const groupedByTableType = filteredObservations.reduce((groups, observation) => {
    const { table_type, area } = observation;

    // Initialize the table_type group if it doesn't exist
    if (!groups[table_type]) {
      groups[table_type] = {};
    }

    // Initialize the area group within the table_type if it doesn't exist
    if (!groups[table_type][area]) {
      groups[table_type][area] = [];
    }

    // Add the observation to the appropriate table_type and area group
    groups[table_type][area].push(observation);

    return groups;
  }, {});

  const allDataForGlobalSearch = (allData?.data || []).filter(
    (e) => e.table_type !== null
  );

  const filteredAllData = allDataForGlobalSearch.filter(
    (observation) =>
      observation.observation
        .toLowerCase()
        .includes(globalSearchTerm.toLowerCase()) ||
      observation.area.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
      (observation.table_type &&
        observation.table_type
          .toLowerCase()
          .includes(globalSearchTerm.toLowerCase()))
  );
  // Group filtered observations by area
  const groupedData = filteredAllData.reduce((groups, observation) => {
    const { table_type } = observation;
    if (!groups[table_type]) {
      groups[table_type] = [];
    }
    groups[table_type].push(observation);
    return groups;
  }, {});

  if (open) {
    return (
      <div>
        <Modal open={open} onClose={handleClose}>
          <div className="modal-container">
            <div className="modal-header">
              <Typography variant="h5">Create HSE Report</Typography>
              <button className="custom-close-button" onClick={handleClose}>
                &#10005; {/* Unicode for 'X' */}
              </button>
            </div>
            <div className="modal-content">
              <div className="modal-body">
                <div className="report-id">
                  Report ID: {`${ReportUID}`}
                </div>
                <Typography variant="body1" component="div">
                  <div className="select-container">
                    <CreatableSelect
                      placeholder="Organization"
                      options={organizationOptions}
                      onChange={handleOrganizationSelection}
                      value={selectedOrganization}
                      isSearchable
                      isClearable
                    />
                    <CreatableSelect
                      placeholder="Site"
                      options={siteOptions}
                      onChange={handleSiteSelection}
                      value={selectedSite}
                      isSearchable
                      isClearable
                      isDisabled={!selectedOrganization}
                    />
                  </div>
                  <div className="flex-container-start-end-date">
                    <div className="to-date-from-date">
                      <DatePicker
                        selected={startDate}
                        onChange={(e) => handleStartEndDate(e, "start-date")}
                        onCalendarOpen={() => setIsStartDatePickerOpen(true)}
                        onCalendarClose={() => setIsStartDatePickerOpen(false)}
                        ref={startDateRef}
                        placeholderText="Audit Start Date"
                        dateFormat="dd-MM-yyyy"
                        showTimeSelect={false}
                        utcOffset={0}
                        className="class-for-date-pickers"
                        maxDate={endDate}
                        todayButton={"Today"}


                      />
                    </div>
                    <div className="to-date-from-date">
                      <DatePicker
                        selected={endDate}
                        onChange={(e) => handleStartEndDate(e, "end-date")}
                        onCalendarOpen={() => setIsEndDatePickerOpen(true)}
                        onCalendarClose={() => setIsEndDatePickerOpen(false)}
                        ref={endDateRef}
                        className="class-for-date-pickers"
                        placeholderText="Audit End Date"
                        dateFormat="dd-MM-yyyy"
                        utcOffset={0}
                        minDate={startDate}
                        todayButton={"Today"}

                      />
                    </div>
                  </div>
                  {/* from and to time */}
                  {/* <div className="flex-container-start-end-date">
                    <div className="to-date-from-date">
                      <label>Time of Audit From:</label>
    <input
      type="time"
      value={timeFrom}
      onChange={(e) => setTimeFrom(e.target.value)}
      className="class-for-time-pickers"
    />

                    </div>
                    <div className="to-date-from-date">
                      <label>Time of Audit To:</label>
    <input
      type="time"
      value={timeTo}
      onChange={(e) => setTimeTo(e.target.value)}
      className="class-for-time-pickers"
    />
                    </div>
                  </div> */}


                  <div className="flex-container-start-end-date">
                    <div className="to-date-from-date">
                      <DatePicker
                        selected={timeFrom ? new Date(`1970-01-01T${timeFrom}:00`) : null}
                        onChange={(date) => {
                          if(date){
                          const hours = date.getHours().toString().padStart(2, "0");
                          const minutes = date.getMinutes().toString().padStart(2, "0");
                          setTimeFrom(`${hours}:${minutes}`);
                          }
                          else{
                            setTimeFrom("")
                          }
                        }}
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15} // 15 minute intervals
                        timeCaption="Time"
                        dateFormat="HH:mm"
                        // Allow typing manually
                        customInput={<input type="text" />}
                        placeholderText="Time of Audit From" className="class-for-date-pickers" />
                    </div>
                    <div className="to-date-from-date">
                      <DatePicker
                        selected={timeTo ? new Date(`1970-01-01T${timeTo}:00`) : null}
                        onChange={(date) => {
                          if(date){
                          const hours = date.getHours().toString().padStart(2, "0");
                          const minutes = date.getMinutes().toString().padStart(2, "0");
                          setTimeTo(`${hours}:${minutes}`);}
                          else{
                            setTimeTo("")
                          }
                        }}
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        timeCaption="Time"
                        dateFormat="HH:mm"
                        customInput={<input type="text" />}
                        placeholderText="Time of Audit To"
                        className="class-for-date-pickers" />
                    </div> </div>


                  {/* brief property Descriptionand  Number of Floors  */}

                  <div className="select-container " style={{ marginTop: "10px" }}>
                    <input
                      type="text"
                      placeholder="Brief Property Description"
                      value={briefPropertyDescription}
                      onChange={(e) => setBriefPropertyDescription(e.target.value)}
                      className="class-for-selects" // reuse your select input styles if needed
                    />

                    {/* Number of Floors */}
                    <input
                      type="text"
                      placeholder="Number of Floors"
                      value={numOfFloors}
                      onChange={(e) => setNumOfFloors(e.target.value)}
                      maxLength={20}
                      className="class-for-selects" // reuse same CSS for consistent layout
                    />
                  </div>
                  {/* average staff footfall and num of objection certificate */}
                  <div className="select-container " style={{ marginTop: "10px" }}>
                    <input
                      type="text"
                      placeholder="Average Staff Footfall "
                      value={avgStaffFootfall}
                      onChange={(e) => setAvgStaffFootfall(e.target.value)}
                      className="class-for-selects"
                    />
                    <input
                      type="text"
                      placeholder="No Objection Certificate: "
                      value={noObjectionCertificate}
                      onChange={(e) => setNoObjectionCertificate(e.target.value)}
                      className="class-for-selects"
                    />
                  </div>
                  {/* national building code and coordinationg person div  */}
                  <div className="select-container " style={{ marginTop: "10px" }}>
                    <input
                      type="text"
                      placeholder="National Building Code Category "
                      value={nationalBuildingCodeCategory}
                      onChange={(e) => setNationalBuildingCodeCategory(e.target.value)}
                      className="class-for-selects"
                      maxLength={100}
                    />
                    <input
                      type="text"
                      placeholder="Coordinating Person – Client Side "
                      value={coordinationgPersonClientside}
                      onChange={(e) => setCoordinationgPersonClientside(e.target.value)}
                      className="class-for-selects"
                      maxLength={100}
                    />
                  </div>

                  {/* reported prepared by, reviewd by */}
                  <div className="select-container " style={{ marginTop: "10px" }}>
                    <input
                      type="text"
                      placeholder="Report Prepared By "
                      value={reportPreparedBy}
                      onChange={(e) => setReportPreparedBy(e.target.value)}
                      className="class-for-selects"
                      maxLength={100}
                    />
                    <input
                      type="text"
                      placeholder="Report Reviewed By "
                      value={reportReviewedBy}
                      onChange={(e) => setReportReviewedBy(e.target.value)}
                      className="class-for-selects"
                      maxLength={100}
                    />
                  </div>





                  {/* <div style={{ gap: "10px" }} className="flex-container">
                    <Select
                      className="select"
                      placeholder="Sector"
                      options={sectors()}
                      onChange={(e) => handleChangeSector(e)}
                      // isMulti={true}
                      value={selectedSector}
                      isClearable
                      
                    />
                    <Select
                      className="select"
                      placeholder="Parameter"
                      options={paramsOption()}
                      onChange={(e) => handleChangeParam(e)}
                      // isMulti={true}
                      value={selectedParam}
                      isClearable
                      isMulti
                       styles={{
                        control: (provided) => ({
                          ...provided,
                          maxHeight: '80px',  // Limit height of selected values
                          overflowY: 'auto',  // Enable scrolling
                          display: 'flex',
                          flexWrap: 'wrap',
                        }),
                        valueContainer: (provided) => ({
                          ...provided,
                          maxHeight: '80px',  // Keep value container from expanding
                          overflowY: 'auto',  // Add scrollbar when needed
                        }),
                      }}
                    />
                    <Select
                      className="select"
                      placeholder="Area"
                      options={areaOptions()}
                      onChange={(e) => handleChangeArea(e)}
                      isMulti={true}
                      value={areasToDisplay}
                       styles={{
                        control: (provided) => ({
                          ...provided,
                          maxHeight: '80px',  // Limit height of selected values
                          overflowY: 'auto',  // Enable scrolling
                          display: 'flex',
                          flexWrap: 'wrap',
                        }),
                        valueContainer: (provided) => ({
                          ...provided,
                          maxHeight: '80px',  // Keep value container from expanding
                          overflowY: 'auto',  // Add scrollbar when needed
                        }),
                      }}
                    />
                  </div> */}
                </Typography>
                <div className="observation-and-global-search">

                  <div className="observations-container">
                    {/* <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Search Observations"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                      />
                      <div>
                        <button onClick={handleOpenDrawer} className="search-bar-button">
                          <span className="search-icon">&#128269;</span> 
                          <span className="search-text">All Observations</span>
                        </button>

                        <ObservationsDrawer
                          isOpen={isDrawerOpen}
                          onClose={handleCloseDrawer}
                          groupedData={groupedData}
                          globalSearchTerm={globalSearchTerm}
                          setGlobalSearchTerm={setGlobalSearchTerm}
                        />
                    
                      </div>
                    </div> */}

                    {Object.keys(groupedByTableType).length > 0 && selectedArea && selectedArea.length > 0 ? (
                      <div className="hse-observations-list">
                        {Object.entries(groupedByTableType).map(([table_type, areas]) => (
                          <div key={table_type} className="table-group">
                            <h4>
                              Parameter : <u>{table_type}</u>
                            </h4>
                            {Object.entries(areas).map(([area, observations], index) => (
                              <Accordion
                                key={`${table_type}-${area}`}
                                expanded={expanded === `${table_type}-${area}`}
                                onChange={handleChangeAccordion(`${table_type}-${area}`)}
                              >
                                <AccordionSummary
                                  expandIcon={<ExpandMoreIcon />}
                                  aria-controls={`${table_type}-${area}-content`}
                                  id={`${table_type}-${area}-header`}
                                >
                                  {/* <Typography component="span" sx={{ width: "33%", flexShrink: 0 }}>
                Area: {area}
              </Typography> */}
                                  <Typography component="span" className="accordion-area-label">
                                    Area: {area}
                                  </Typography>

                                  <Typography component="span" sx={{ color: "text.secondary" }}>
                                    {
                                      observations.filter((obs) =>
                                        selectedObservations.map((e) => e.observation).includes(obs.observation)
                                      ).length
                                    } out of {observations.length} observations selected
                                  </Typography>
                                </AccordionSummary>

                                <AccordionDetails>
                                  {Array.from(
                                    new Map(
                                      observations.map((obs) => [
                                        `${obs.observation?.replace(/\s+/g, ' ').trim()}|${obs.category}`,
                                        obs
                                      ])
                                    ).values()
                                  ).map((observation, obsIndex) => (
                                    <div key={obsIndex} className="hse-observation-item-checkbox">
                                      <input
                                        type="checkbox"
                                        checked={selectedObservations
                                          .map((e) => e.observation)
                                          .includes(observation.observation)}
                                        onChange={() =>
                                          handleObservationSelection(
                                            observation.table_type,
                                            observation.sr_no || observation.id
                                          )
                                        }
                                      />
                                      <span>
                                        {observation.observation.replace(/\s+/g, ' ').trim()} (
                                        <span style={{ fontWeight: "bold" }}>{observation.category}</span>)
                                      </span>
                                      {observation.isNote && <span className="note-label">(Note)</span>}
                                    </div>
                                  ))}
                                </AccordionDetails>
                              </Accordion>
                            ))}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-observations">No observations available.</div>
                    )}

                  </div>


                </div>
                <div className="get-recommendations-container">
                  <button
                    className="button-styles"
                    onClick={handleProceed}
                    disabled={
                      // selectedObservations.length === 0 ||
                      !selectedOrganization ||
                      !selectedSite ||
                      !startDate ||
                      !endDate
                      // ||
                      // !timeFrom||!timeTo||!reportReviewedBy||!reportPreparedBy||!noObjectionCertificate||
                      // !numOfFloors||!nationalBuildingCodeCategory||!coordinationgPersonClientside||!briefPropertyDescription
                      // ||!avgStaffFootfall
                    }
                    style={{
                      background:
                        // selectedObservations.length === 0 ||
                        !selectedOrganization ||
                          !selectedSite ||
                          !startDate ||
                          !endDate
                          //     ||
                          // !timeFrom||!timeTo||!reportReviewedBy||!reportPreparedBy||!noObjectionCertificate||
                          // !numOfFloors||!nationalBuildingCodeCategory||!coordinationgPersonClientside||!briefPropertyDescription
                          // ||!avgStaffFootfall
                          ? "lightgrey"
                          : "#efc71d",
                    }}
                  >
                    Proceed
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
        {showConfirmationModal && (
          <ConfirmationModal
            setShowConfirmationModal={setShowConfirmationModal}
            handleCloseWithoutSaving={handleCloseWithoutSaving}
          />
        )}
      </div>
    );
  } else if (openReviewModal) {
    return (
      <HsePreviewReportModal
        open={openReviewModal}
        setOpenModal={setOpenReviewModal}
        setOpenCreateReportModal={setOpenHseModal}
        reportHeader={reportHeader}
        // selectedObservations={selectedObservations}
        recommendations={recommendations}
        selectedArea={selectedArea}
        selectedCategory={selectedCategory}
        // setSelectedObservations={setSelectedObservations}
        setRecommendations={setRecommendations}
        setSelectedArea={setSelectedArea}
        setSelectedCategory={setSelectedCategory}
        // setSelectedOrganization={setSelectedOrganization}
        // setSelectedSite={setSelectedSite}
        // selectedOrganization={selectedOrganization}
        // selectedSite={selectedSite}
        ReportUID={ReportUID}
        selectedDateTime={selectedDateTime}
        // observations={observations}
        setAreasToDisplay={setAreasToDisplay}
        setCategoriesToDisplay={setCategoriesToDisplay}
        // setObservations={setObservations}
        getAllHseData={getAllHseData}
        // startDate={startDate}
        // endDate={endDate}
        // setStartDate={setStartDate}
        // setEndDate={setEndDate}
        generateUniqueId={generateUniqueId}
        getCurrentDateTime={getCurrentDateTime}
        setLoading={setLoading}
        areaOptions={areaOptions}
        allData={allData}
        getAllHseReports={getAllHseReports}
        selectedSector={selectedSector}
        setSelectedSector={setSelectedSector}
        setSelectedParam={setSelectedParam}
      />
    );
  }
};

export default HseReportModal;
