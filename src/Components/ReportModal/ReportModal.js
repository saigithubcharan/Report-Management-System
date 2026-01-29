import React, { useState, useEffect, useRef,useContext } from "react";
import { Modal, TextField, Typography, Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import "./ReportModal.css";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import axios from "../../APIs/axios";
import PeviewReportModal from "../PreviewReportModal/PreviewReportModal";
import { config } from "../../config";
import { getAccountDetails } from "../Services/localStorage";
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ObservationsDrawer from "../ObservationsDrawer/ObservationsDrawer";
import { ReportContext } from "../ReportContext/ReportContext";

const ReportModal = ({
  open,
  setOpenModal,
  areaList,
  allData,
  getAllData,
  setLoading,
  getAllReports,
}) => {
    const {
         backgroundBriefEdited,
    setBackgroundBriefEdited,
     exeSummaryEdited,
    setExeSummaryEdited,
    improvementOpportunityAreas,
    overallAssessmentIndicator,
    backgroundBrief,
    exeSummary,
    conclusion,
    theWayForward,
    contents,
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
  setIsRowSaved
  } = useContext(ReportContext);
  const [categoryList, setCategoryList] = useState([]);
  const [selectedArea, setSelectedArea] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [openReviewModal, setOpenReviewModal] = useState(false);
  const [ReportUID, setReportUID] = useState("");
  const [newReportUID, setNewReportUID] = useState("");
  const [selectedDateTime, setSelectedDateTime] = useState(null);
  const [orgList, setOrgList] = useState([]);
  const [siteOptions, setSiteOptions] = useState([]);
  const [reportHeader, setReportHeaders] = useState();
  const { userId } = getAccountDetails();
  const [areasToDisplay, setAreasToDisplay] = useState([]);
  const [categoriesToDisplay, setCategoriesToDisplay] = useState([]);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [notes, setNotes] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [scores, setScores] = useState([
    {
      "Electrical Safety": "Design & Installation",
      "Max Score": 2,
      "Score Obtained": 0,
    },
    {
      "Electrical Safety": "Preventive maintenance",
      "Max Score": 2,
      "Score Obtained": 0,
    },
    {
      "Electrical Safety": "Competency/Training",
      "Max Score": 2,
      "Score Obtained": 0,
    },
    {
      "Electrical Safety": "Lock out-Tag out",
      "Max Score": 2,
      "Score Obtained": 0,
    },
    {
      "Electrical Safety": "Drawings (As built) / Documents",
      "Max Score": 2,
      "Score Obtained": 0,
    },
  ]);
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

  const cumulativeScore = scores.reduce(
    (acc, row) => acc + parseFloat(row["Score Obtained"] || 0),
    0
  );
  const [expanded, setExpanded] = useState(null);

  const handleChangeAccordion = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : null);
  };

  useEffect(() => {
    updateReportUID();
  }, [selectedOrganization, selectedSite, selectedDateTime]);

  useEffect(() => {
    getOrgList();
    getReportHeaders();
  }, [open, selectedOrganization]);

  useEffect(() => {
    generateUniqueId();
    getCurrentDateTime();
    getAllNotes();
  }, []);

  useEffect(() => {
    const getSitesByOrganization = async (orgId) => {
      try {
        const response = await axios.get(
          `${config.PATH}/api/organizations/${orgId}/sites`
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

  const getAllNotes = async () => {
    try {
      const response = await axios.get(
        `${config.PATH}/api/get-all-notes/${userId}`
      );
      setNotes(response.data.sort((a, b) => a.id - b.id));
    } catch (err) {
      console.log(err);
    }
  };

  const getReportHeaders = async () => {
    try {
      const response = await axios.get(`${config.PATH}/api/get-headers`);
      setReportHeaders(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  const getOrgList = async () => {
    try {
      const response = await axios.get(`${config.PATH}/api/organizations`);
      setOrgList(response.data);
    } catch (error) {
      console.log("Error:", error.response?.data?.error || error.message);
    }
  };
 
  const handleOpenDrawer = () => {
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleCloseWithoutSaving = () => {
    setShowConfirmationModal(false);
    setOpenModal(false);
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
  };

  const handleClose = () => {
    if (selectedObservations.length > 0) {
      setShowConfirmationModal(true);
    } else {
      handleCloseWithoutSaving();
    }
  };

  const areaOptions = () => {
    try {
      const options = [];
      areaList.map((area) => options.push({ label: area, value: area }));
      return options;
    } catch (err) {
      console.log(err);
    }
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

  const organizationOptions = orgList.map((e) => ({
    label: e.org_name,
    value: e.id,
  }));

  const handleOrganizationSelection = async (selectedOption) => {
    if (selectedOption && selectedOption.__isNew__ === true) {
      const isValidOrganizationName = /^[a-zA-Z0-9 _-]+$/.test(
        selectedOption.label
      );

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
          `${config.PATH}/api/create-organization`,
          payload
        );

        const newOrganization = response.data;
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
      const isValidSiteName = /^[a-zA-Z0-9 _-]+$/.test(selectedOption.label);
      if (!isValidSiteName) {
        toast.error(
          "Invalid site name. Only hyphens ( - ), underscores ( _ ) and alphanumeric characters are allowed."
        );
        return;
      }

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
        await axios.post(`${config.PATH}/api/add-site`, payload);
        updateReportUID();
      } catch (error) {
        console.log("Failed to create site:", error);
        return;
      }
    }
    setSelectedSite(selectedOption);
    updateReportUID();
  };

  // const handleChangeArea = (areas) => {
  //   try {
  //     setAreasToDisplay(areas);
  //     const selectedArea = areas.map((e) => e.value);
  //     setSelectedArea(selectedArea);

  //     function getCategoriesByAreas(areas) {
  //       const categories = [];
  //       for (const item of allData.data) {
  //         if (selectedArea.includes(item.area)) {
  //           categories.push(item.category);
  //         }
  //       }
  //       setCategoryList(categories);
  //     }

  //     if (areas.length === 0) {
  //       setSelectedCategory([]);
  //       setCategoriesToDisplay([]);
  //       setSelectedObservations([]);
  //       handleChangeCategory([]);
  //       setCategoryList([]);
  //     } else {
  //       const updatedSelectedCategory = selectedCategory.filter((category) => {
  //         const categoryAreas = allData.data
  //           .filter((item) => item.category === category)
  //           .map((item) => item.area);

  //         const includesArea = categoryAreas.some((area) =>
  //           selectedArea.includes(area)
  //         );

  //         return includesArea;
  //       });
  //       setSelectedCategory(updatedSelectedCategory);
  //       getCategoriesByAreas(areas);
  //       const updatedCategoriesToDisplay = categoryList
  //         .filter((category) => updatedSelectedCategory.includes(category))
  //         .map((category) => ({ label: category, value: category }));

  //       const uniqueCategories = [
  //         ...new Set(updatedCategoriesToDisplay.map(JSON.stringify)),
  //       ].map(JSON.parse);
  //       setCategoriesToDisplay(uniqueCategories);
  //       handleChangeCategory(uniqueCategories);
  //     }
  //   } catch (error) {
  //     console.log("An error occurred:", error);
  //   }
  // };

const handleChangeArea = (areas) => {
  try {
    const selectedAreaValues = areas.map((e) => e.value);

    // Prevent unnecessary updates if selected area hasn't changed
    const prevAreaSet = new Set(selectedArea);
    const newAreaSet = new Set(selectedAreaValues);
    const isSameArea =
      prevAreaSet.size === newAreaSet.size &&
      [...prevAreaSet].every((val) => newAreaSet.has(val));

    if (isSameArea) return;

    setAreasToDisplay(areas);
    setSelectedArea(selectedAreaValues);

    function getCategoriesByAreas(selectedAreas) {
      const categories = [];
      for (const item of allData.data) {
        if (selectedAreas.includes(item.area)) {
          categories.push(item.category);
        }
      }
      return [...new Set(categories)];
    }

    if (areas.length === 0) {
      setSelectedCategory([]);
      setCategoriesToDisplay([]);
      setSelectedObservations([]);
      handleChangeCategory([]);
      setCategoryList([]);
    } else {
      const validCategories = getCategoriesByAreas(selectedAreaValues);
      setCategoryList(validCategories);

      const updatedSelectedCategory = selectedCategory.filter((category) => {
        const categoryAreas = allData.data
          .filter((item) => item.category === category)
          .map((item) => item.area);
        return categoryAreas.some((area) => selectedAreaValues.includes(area));
      });

      setSelectedCategory(updatedSelectedCategory);

      const updatedCategoriesToDisplay = validCategories
        .filter((category) => updatedSelectedCategory.includes(category))
        .map((category) => ({ label: category, value: category }));

      const uniqueCategories = [
        ...new Set(updatedCategoriesToDisplay.map(JSON.stringify)),
      ].map(JSON.parse);

      setCategoriesToDisplay(uniqueCategories);
      handleChangeCategory(uniqueCategories); // Will only run if categories changed
    }
  } catch (error) {
    console.log("An error occurred in handleChangeArea:", error);
  }
};

// const handleChangeCategory = async (cat) => {
//   const selectedCat = cat.map((e) => e.value);

//   // Avoid unnecessary updates if selected category hasn't changed
//   const prevCatSet = new Set(selectedCategory);
//   const newCatSet = new Set(selectedCat);
//   const isSameCategory =
//     prevCatSet.size === newCatSet.size &&
//     [...prevCatSet].every((val) => newCatSet.has(val));

//   if (isSameCategory) return;
  
//   setCategoriesToDisplay(cat);
//   setSelectedCategory(selectedCat);

  

// const combinedData = allData.data.concat(
//   notes
//     .filter((note) => note.note_type === "electrical")
//     .map((note) => ({ ...note, isNote: true }))
// );

// // 2. Preserve unsaved new observations
// const newObservations = observations.filter((obs) => obs.isNew);

// // 3. Apply filters only on combinedData
// const filteredObservations = combinedData
//   .filter(
//     (item) =>
//       selectedCat.includes(item.category) &&
//       selectedArea.includes(item.area)
//   )
//   .filter((obs, index, self) =>
//     index ===
//     self.findIndex(
//       (o) => o.observation?.trim() === obs.observation?.trim()
//     )
//   );

// // 4. Merge new filtered observations with previously added new ones
// const updatedObservations = filteredObservations
//   .map((newObs) => {
//     const existingObs = observations.find(
//       (obs) => obs.observation === newObs.observation
//     );
//     return existingObs
//       ? {
//           ...newObs,
//           is_selected: existingObs.is_selected,
//           imageUrls: existingObs.imageUrls,
//         }
//       : newObs;
//   })
//   .concat(newObservations); // <-- keep new observations!

// setObservations(updatedObservations);


//   // Keep only selected observations that still match the new filtered list
//   const stillRelevantSelections = selectedObservations.filter((selectedObs) =>
//     updatedObservations.some(
//       (e) => e.sr_no === selectedObs.sr_no || e.id === selectedObs.id
//     )
//   );

//   setSelectedObservations(stillRelevantSelections);
// };


//  const handleChangeCategory = async (cat) => {
//   const selectedCat = cat.map((e) => e.value);

//   const prevCatSet = new Set(selectedCategory);
//   const newCatSet = new Set(selectedCat);
//   const isSameCategory =
//     prevCatSet.size === newCatSet.size &&
//     [...prevCatSet].every((val) => newCatSet.has(val));

//   if (isSameCategory) return;

//   setCategoriesToDisplay(cat);
//   setSelectedCategory(selectedCat);

//   if (selectedCat.length === 0) {
//     setObservations([]);
//     setSelectedObservations([]);
//     return;
//   }

//   try {
//     const combinedData = [
//       ...(allData?.data || []),
//       ...(
//         notes?.filter((note) => note.note_type === "electrical") || []
//       ).map((note) => ({ ...note, isNote: true })),
//     ];

//     const newObservations = (observations || []).filter((obs) => obs.isNew);

//     const filteredObservations = combinedData
//       .filter(
//         (item) =>
//           selectedCat.includes(item.category) &&
//           selectedArea.includes(item.area)
//       )
//       .filter(
//         (obs, index, self) =>
//           index ===
//           self.findIndex(
//             (o) => o.observation?.trim() === obs.observation?.trim()
//           )
//       );

//     const updatedObservations = filteredObservations.map((obs) => {
//       const existing = observations.find(
//         (sel) => sel.observation === obs.observation
//       );
//       return existing
//         ? { ...obs, is_selected: existing.is_selected, imageUrls: existing.imageUrls }
//         : obs;
//     });

//     const preservedSelections = selectedObservations.filter(
//       (sel) =>
//         sel.variant === true || //  for variants data.
//         !updatedObservations.some(
//           (obs) => obs.observation === sel.observation
//         )
//     );

//     const finalObservations = [
//       ...updatedObservations,
//       ...preservedSelections,
//       ...newObservations,
//     ];

//     const dedupedFinalObs = finalObservations.filter((obs, index, self) => {
//       const key = obs.sr_no || obs.id || obs.tempId || obs.observation;
//       return (
//         index ===
//         self.findIndex(
//           (o) =>
//             (o.sr_no || o.id || o.tempId || o.observation) === key
//         )
//       );
//     });

//     setObservations(dedupedFinalObs);

//     const stillRelevantSelections = selectedObservations.filter((sel) =>
//       dedupedFinalObs.some(
//         (obs) =>
//           obs.sr_no === sel.sr_no ||
//           obs.id === sel.id ||
//           obs.observation === sel.observation
//       )
//     );

//     const mergedSelected = [
//       ...stillRelevantSelections,
//       ...selectedObservations.filter(
//         (v) =>
//           v.variant === true &&
//           !stillRelevantSelections.some(
//             (s) =>
//               s.sr_no === v.sr_no ||
//               s.id === v.id ||
//               s.observation === v.observation
//           )
//       ),
//     ];

//     setSelectedObservations(mergedSelected);

//     // console.log("Variants preserved:", mergedSelected.filter(v => v.variant));
//     // console.log("Final observations count:", dedupedFinalObs.length);
//   } catch (error) {
//     console.log("Error in handleChangeCategory:", error);
//   }
// };


const handleChangeCategory = async (cat) => {
  const selectedCat = cat.map((e) => e.value);

  const prevCatSet = new Set(selectedCategory);
  const newCatSet = new Set(selectedCat);

  const isSameCategory =
    prevCatSet.size === newCatSet.size &&
    [...prevCatSet].every((val) => newCatSet.has(val));

  if (isSameCategory) return;

  setCategoriesToDisplay(cat);
  setSelectedCategory(selectedCat);

  // If no category selected, clear everything
  if (selectedCat.length === 0) {
    setObservations([]);
    setSelectedObservations([]);
    return;
  }

  try {

    const removedCategories = [...prevCatSet].filter(
      (cat) => !newCatSet.has(cat)
    );
    const addedCategories = [...newCatSet].filter(
      (cat) => !prevCatSet.has(cat)
    );

    const combinedData = [
      ...(allData?.data || []),
      ...(
        notes?.filter((note) => note.note_type === "electrical") || []
      ).map((note) => ({ ...note, isNote: true })),
    ];
    let updatedAll = [...observations];
    if (removedCategories.length > 0) {
      updatedAll = updatedAll.filter((obs) => {
        // always preserve added or variant items, even if category removed
        if (obs.isNew === true || obs.variant === true || obs.isNote === true)
          return true;
        // otherwise, remove if category is unselected
        return !removedCategories.includes(obs.category);
      });
    }
    let newCategoryObservations = [];
    if (addedCategories.length > 0) {
      newCategoryObservations = combinedData
        .filter(
          (item) =>
            addedCategories.includes(item.category) &&
            selectedArea.includes(item.area)
        )
        .filter(
          (obs, index, self) =>
            index ===
            self.findIndex(
              (o) => o.observation?.trim() === obs.observation?.trim()
            )
        )
        .map((obs) => {
          const existing = observations.find(
            (sel) => sel.observation === obs.observation
          );
          return existing
            ? { ...obs, is_selected: existing.is_selected, imageUrls: existing.imageUrls }
            : { ...obs, is_selected: 0 };
        });
    }
    const merged = [...updatedAll, ...newCategoryObservations];

    const dedupedFinalObs = merged.filter((obs, index, self) => {
      const key = obs.sr_no || obs.id || obs.tempId || obs.observation;
      return (
        index ===
        self.findIndex(
          (o) => (o.sr_no || o.id || o.tempId || o.observation) === key
        )
      );
    });
    const updatedSelected = selectedObservations.filter((sel) => {
      // preserve added, variant, and note always
      if (sel.isNew === true || sel.variant === true || sel.isNote === true)
        return true;
      // remove if its category is removed
      return !removedCategories.includes(sel.category);
    });
    const finalSelected = updatedSelected.filter((sel) =>
      dedupedFinalObs.some(
        (obs) =>
          obs.sr_no === sel.sr_no ||
          obs.id === sel.id ||
          obs.observation === sel.observation
      )
    );
    setObservations(dedupedFinalObs);
    setSelectedObservations(finalSelected);

    // console.log("Added Categories:", addedCategories);
    // console.log("Removed Categories:", removedCategories);
    // console.log("All Observations after update:", dedupedFinalObs);
    // console.log("Selected Observations after update:", finalSelected);
  } catch (error) {
    console.log("Error in handleChangeCategory:", error);
  }
};


//   const handleObservationSelection = (observation, index) => {
//   const tempObs = [...observations];
//   console.log("criticalobservations",criticalObservations);
//   let isAlreadySelected = observation.is_selected;

//   let updatedSelected = [];

//   if (isAlreadySelected) {
//     delete tempObs[index].is_selected;
//     updatedSelected = selectedObservations.filter((e) => e.refIndex !== index);
//   } else {
//     tempObs[index] = { ...observation, is_selected: 1 };
//     updatedSelected = [...selectedObservations, { ...observation, refIndex: index }];
//   }

//   setSelectedObservations(updatedSelected);

//   const selectedHigh = updatedSelected.filter((e) => e.criticality === "High");

//   const mergedCriticals = [...selectedHigh, ...manualCriticalObservations];
//   setCriticalObservations(mergedCriticals);
//   setHasEditedCriticalObservations(true);
//   setObservations(tempObs);
// };
const handleObservationSelection = (observation, index) => {
  const tempObs = [...observations];
  // console.log("criticalobservations", criticalObservations);

  const isAlreadySelected = observation.is_selected;
  let updatedSelected = [];

  if (isAlreadySelected) {
    delete tempObs[index].is_selected;
    updatedSelected = selectedObservations.filter((e) => e.refIndex !== index);
  } else {
    tempObs[index] = { ...observation, is_selected: 1 };
    updatedSelected = [...selectedObservations, { ...observation, refIndex: index }];
  }

  setSelectedObservations(updatedSelected);

  const selectedHigh = updatedSelected.filter((e) => e.criticality === "High");


  const editedMap = new Map();
  criticalObservations.forEach((e) => {
    const key = `${e.sr_no || e.id || e.observation}`.trim();
    editedMap.set(key, e); // stores the edited version
  });

  const mergedSet = new Set();
  const mergedCriticals = [];

  [...selectedHigh, ...manualCriticalObservations].forEach((obs) => {
    const key = `${obs.sr_no || obs.id || obs.observation}`.trim();
    if (mergedSet.has(key)) return;
    mergedSet.add(key);

    // Use edited version if available
    mergedCriticals.push(editedMap.get(key) || obs);
  });

  setCriticalObservations(mergedCriticals);
  setHasEditedCriticalObservations(true);
  setObservations(tempObs);
};



  const handleProceed = async () => {
    // console.log("background data:",backgroundBrief)
    // console.log(contents);
    // console.log(theWayForward)
    // console.log(conclusion);
    // console.log(criticalObservations);
    try {
      setLoading(true);
      setOpenReviewModal(true);
      setOpenModal(false);
      const reportData = {
        report_id: ReportUID,
        user_id: userId,
        date_time: selectedDateTime,
        organization: selectedOrganization
          ? selectedOrganization.label
          : selectedOrganization,
        org_id: selectedOrganization
          ? selectedOrganization.value
          : selectedOrganization,
        site: selectedSite ? selectedSite.label : selectedSite,
        area: selectedArea,
        category: selectedCategory,
        scores: scores,
        cumulative: cumulativeScore,
        start_date: startDate,
        end_date: endDate,
         background_brief: backgroundBrief,
         improvement_opportunity_areas:improvementOpportunityAreas,
         overall_assessment_indicator:overallAssessmentIndicator,
        exe_summary: exeSummary,
        conclusion:conclusion,
        the_way_forward: theWayForward,
        contents:contents,
        type: "primary",
      };
      await axios.post(`${config.PATH}/api/save-update-report`, reportData);
      const observationsData = {
        report_id: ReportUID,
        all_observations: observations,
      };
      await axios.post(
        `${config.PATH}/api/save-update-observations`,
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
    setNewReportUID(id);
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
      borderBottom: "none",
      boxShadow: "none",
      cursor: "pointer",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      display: "none",
    }),
  };

  const handleStartEndDate = (date, name) => {
    if (!date) {
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
      observation.observation
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      observation.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      observation.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedObservations = filteredObservations.reduce(
    (groups, observation) => {
      const { area } = observation;
      if (!groups[area]) {
        groups[area] = [];
      }
      groups[area].push(observation);
      return groups;
    },
    {}
  );

  const allDataForGlobalSearch = allData.data;
  // const filteredAllData = allDataForGlobalSearch.filter(
  //   (observation) =>
  //     observation.observation
  //       .toLowerCase()
  //       .includes(globalSearchTerm.toLowerCase()) ||
  //     observation.area.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
  //     observation.category
  //       .toLowerCase()
  //       .includes(globalSearchTerm.toLowerCase())
  // );
  const filteredAllData = (allDataForGlobalSearch || []).filter(
  (observation) =>
    observation.observation?.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
    observation.area?.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
    observation.category?.toLowerCase().includes(globalSearchTerm.toLowerCase())
);

  // Group filtered observations by area
  const groupedData = filteredAllData.reduce((groups, observation) => {
    const { area } = observation;
    if (!groups[area]) {
      groups[area] = [];
    }
    groups[area].push(observation);
    return groups;
  }, {});

  if (open) {
    return (
      <div>
        <Modal open={open} onClose={handleClose}>
          <div className="modal-container">
            <div className="modal-header">
              <Typography variant="h5">
                Create Electrical Safety Report
              </Typography>
              <button className="custom-close-button" onClick={handleClose}>
                &#10005;
              </button>
            </div>
            <div className="modal-content">
              <div className="modal-body">
                <div className="report-id">
                  Report ID: {`${ReportUID}`}
                </div>
                {/* Report ID: {`${ReportUID}`} */}
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

                  <div   className="flex-container-start-end-date"> 
                    <div className="to-date-from-date"  >
                      
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
                    <div className="to-date-from-date"
                   >
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
                  <div className="flex-container">
                    {/* <Select 
                      className="select"
                      placeholder="Area"
                      options={areaOptions()}
                      onChange={(e) => handleChangeArea(e)}
                      isMulti={true}
                      value={areasToDisplay}
                      
                    /> */}
                    <Select
                      className="select"
                      placeholder="Area"
                      options={areaOptions()}
                      onChange={handleChangeArea}
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

                  
                    <Select
                      className="select"
                      placeholder="Category"
                      options={categoryOptions()}
                      onChange={handleChangeCategory}
                      isMulti={true}
                      value={categoriesToDisplay}
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          maxHeight: '80px', // Limit the height of selected values
                          overflowY: 'auto', // Enable scrolling
                          display: 'flex',
                          flexWrap: 'wrap',
                        }),
                        valueContainer: (provided) => ({
                          ...provided,
                          maxHeight: '80px', // Keep value container from expanding
                          overflowY: 'auto', // Add scrollbar when needed
                        }),
                      }}
                    />

                  </div>
                </Typography>
                <div className="observation-and-global-search">
                  <div className="observations-container">
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <input
                        type="text"
                        placeholder="Search observations"
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
                    </div>                    
                    {Object.keys(groupedObservations).length > 0 && selectedCategory.length > 0 ? (
                      <div className="observations-list">
                        {Object.entries(groupedObservations).map(([area, observationsInArea], index) => (
                          <Accordion
                            key={area}
                            expanded={expanded === `panel${index}`}
                            onChange={handleChangeAccordion(`panel${index}`)}
                          >
                            <AccordionSummary
                              expandIcon={<ExpandMoreIcon />}
                              aria-controls={`panel${index}-content`}
                              id={`panel${index}-header`}
                            >
                              {/* <Typography component="span" sx={{ width: "33%", flexShrink: 0 }}>
                                {area}
                              </Typography> */}
                                 <Typography component="span" className="accordion-area-label">
                                Area: {area}
                              </Typography>
                              <Typography component="span" sx={{ color: "text.secondary" }}>
                                {observationsInArea.filter(obs => obs.is_selected === 1).length} out of {observationsInArea.length} observations selected
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                           {Array.from(
  new Map(
    observationsInArea.map((obs) => [
      `${obs.observation?.replace(/\s+/g, ' ').trim()}|${obs.category}`,
      obs,
    ])
  ).values()
).map((observation, obsIndex) => (
  <div key={obsIndex} className="observation-item-checkbox">
    <input
      type="checkbox"
      checked={observation.is_selected === 1}
      onChange={() => handleObservationSelection(observation, observations.indexOf(observation))}
    />
    <span>
      {observation.observation.replace(/\s+/g, ' ').trim()} (
      <span style={{ fontWeight: "bold" }}>{observation.category}</span>
      )
    </span>
    {observation.isNote && <span className="note-label">(Note)</span>}
  </div>
))}
  {/* {observationsInArea.map((observation, obsIndex) => (
                                <div key={obsIndex} className="observation-item-checkbox">
                                  <input
                                    type="checkbox"
                                    checked={observation.is_selected === 1}
                                    onChange={() => handleObservationSelection(observation, observations.indexOf(observation))}
                                  />
                                  <span>
                                    {observation.observation} (
                                    <span style={{ fontWeight: "bold" }}>{observation.category}</span>
                                    )
                                  </span>
                                  {observation.isNote && <span className="note-label">(Note)</span>}
                                </div>
                              ))} */}


                            </AccordionDetails>
                          </Accordion>
                        ))}
                      </div>
                    ) : (
                      <div className="no-observations">No observations available.</div>
                    )}
                  </div>
                </div>
                <div className="get-recommendations-container">
                  <button
                    onClick={handleProceed}
                    disabled={
                      selectedObservations.length === 0 ||
                      !selectedOrganization ||
                      !selectedSite ||
                      !startDate ||
                      !endDate
                    }
                    style={{
                      background:
                        selectedObservations.length === 0 ||
                          !selectedOrganization ||
                          !selectedSite ||
                          !startDate ||
                          !endDate
                          ? "lightgrey"
                          : "#efc71d",
                    }}
                    className="button-styles"
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
      <PeviewReportModal
        open={openReviewModal}
        setOpenModal={setOpenReviewModal}
        setOpenCreateReportModal={setOpenModal}
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
        getAllData={getAllData}
        // startDate={startDate}
        // endDate={endDate}
        // setStartDate={setStartDate}
        // setEndDate={setEndDate}
        generateUniqueId={generateUniqueId}
        getCurrentDateTime={getCurrentDateTime}
        setLoading={setLoading}
        areaOptions={areaOptions}
        allData={allData}
        getAllReports={getAllReports}
      />
    );
  }
};

export default ReportModal;
