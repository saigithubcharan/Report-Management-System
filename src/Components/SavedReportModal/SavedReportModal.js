import React, { useState, useEffect, useRef,useCallback } from "react";
import {
  Button,
  Modal,
  TextField,
  Typography,
  TextareaAutosize,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Accordion, AccordionDetails, AccordionSummary
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  ResponsiveContainer,
} from "recharts";
import html2canvas from "html2canvas";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import "./SavedReportModal.css";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import CloseIcon from "@material-ui/icons/Close";
import IconButton from "@material-ui/core/IconButton";
import CancelIcon from "@mui/icons-material/Cancel";
import { config } from "../../config";
import axios from "../../APIs/axios";
import { toast, ToastContainer } from "react-toastify";
import ExportSavedReportPDF from "../ExportSavedReportPDF/ExportSavedReportPDF";
import { getAccountDetails } from "../Services/localStorage";
import "./SavedReportModal.css";
import ExportExcel from "../ExportExcel/ExportExcel";
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";
import PlaylistAddCircleIcon from "@mui/icons-material/PlaylistAddCircle";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import InfoIcon from "@mui/icons-material/Info";
import ExportWordDoc from "../ExportWordDoc/ExportWordDoc";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ImageViewerModal from "../ImageViewerModal/ImageViewerModal";
import Loader from "../Loader/Loader";
import VariantsModal from "../VariantsModal/VariantsModal";
import CheckIcon from "@mui/icons-material/Check";
import ObservationsDrawer from "../ObservationsDrawer/ObservationsDrawer";
import DeleteIcon from "@mui/icons-material/Delete";
import { IoAddCircle } from "react-icons/io5";
import JoditEditor from 'jodit-react';
import HTMLReactParser from 'html-react-parser';
import DialogBox from "../DialogBox/DialogBox";
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import InsertPhotoOutlinedIcon from '@mui/icons-material/InsertPhotoOutlined';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
const closeAllSelectMenus = () => {
  const menus = document.querySelectorAll('.react-select__menu'); // find any open menu
  menus.forEach((menu) => {
    if (menu && menu.parentNode) {
      menu.parentNode.removeChild(menu); // manually remove open menus
    }
  });
};

// const removeDuplicates = (observations) => {
//   const uniqueObservations = Array.from(
//     new Map(observations.map((item) => [item.observation, item])).values()
//   );
//   return uniqueObservations;
// };
const removeDuplicates = (observations) => {
  const uniqueObservations = Array.from(
    new Map(
      observations.map((item) => [
        // Use sr_no or id as primary unique identifier
        item.sr_no || item.id || `${item.observation}|${item.category}|${item.area}`,
        item,
      ])
    ).values()
  );
  return uniqueObservations;
};


const SavedReportModal = ({
  selectedReportData,
  setOpenSavedReport,
  allData,
  reportHeader,
  getAllData,
  module,
  setOpenReportList,
  getAllReports,
  exp,
}) => {
  const editor = useRef(null);
  const areaSelectRef = useRef(null);
  const categorySelectRef = useRef(null);
  const criticalitySelectRef = useRef(null);
  const tableRef = useRef(null);
  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false);
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);
  
  useEffect(() => {
  const initialSelected = selectedReportData.AllObservations.filter((e) => e.is_selected === 1);
  setSelectedObservations(initialSelected);

  const initialManual = selectedReportData.manualCriticalObservations || [];
  setManualCriticalObservations(initialManual);

  const selectedHigh = initialSelected.filter((e) => e.criticality === "High");
  setCriticalObservations([...selectedHigh, ...initialManual]);
}, [selectedReportData]);
    const chartContainerRef = useRef(null);
  const [chartImage, setChartImage] = useState(null);
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


  const [screenNumber, setScreenNumber] = useState(exp === true ? 9 : 1);
  const [selectedDateTime, setSelectedDateTime] = useState(
    selectedReportData.date_time
  );
  const [orgList, setOrgList] = useState([]);
  const [selectedOrganization, setSelectedOrganization] = useState({
    label: selectedReportData.organization,
    value: selectedReportData.org_id,
  });
  const [selectedSite, setSelectedSite] = useState({
    label: selectedReportData.site,
    value: selectedReportData.site,
  });
  const [startDate, setStartDate] = useState(selectedReportData.start_date);
  const [endDate, setEndDate] = useState(selectedReportData.end_date);
  const [siteOptions, setSiteOptions] = useState([]);
  const [areaList, setAreaList] = useState([]);
  const [selectedArea, setSelectedArea] = useState(
    selectedReportData.Areas.map((e) => e.area)
  );
  const [categoryList, setCategoryList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(
    selectedReportData.Categories.map((e) => e.category)
  );
  const [AllObservations, setAllObservations] = useState(
    removeDuplicates(selectedReportData.AllObservations)
  );
  const [selectedObservations, setSelectedObservations] = useState(
    selectedReportData.AllObservations.filter((e) => e.is_selected === 1)
  );
  // console.log("before",selectedReportData.AllObservations.filter((e) => e.is_selected === 1))
  //  console.log("before",selectedReportData.AllObservations)
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      // Handle resize events
    });
  
    if (tableRef.current) {
      observer.observe(tableRef.current);
    }
  
    return () => {
      observer.disconnect(); // Clean up the observer
    };
  }, [selectedObservations]); // Add dependencies as needed
  const [recommendations, setRecommendations] = useState(
    selectedReportData.Recommendations
  );
  const [criticalObservations, setCriticalObservations] = useState([]);
  const [otherDetails, setOtherDetails] = useState(
    selectedReportData.other_details
  );

  const [backgroundBrief, setBackgroundBrief] = useState("");
    const [improvementOpportunityAreas,setImprovements]=useState(selectedReportData.improvement_opportunity_areas
      ?selectedReportData.improvement_opportunity_areas
      : reportHeader.improvement_opportunity_areas
      
    );
    // console.log("data",selectedReportData.background_brief);
    const [overallAssessmentIndicator,setOverallAssessmentIndicator]=useState(
      selectedReportData.overall_assessment_indicator
      ?selectedReportData.overall_assessment_indicator
      :reportHeader.overall_assessment_indicator
    );
  const [contents, setContents] = useState(
    selectedReportData.contents
      ? selectedReportData.contents
      : reportHeader.contents
  );
  const [bestPractice, setbestPractice] = useState(
    selectedReportData.best_practice
      ? selectedReportData.best_practice
      : reportHeader.best_practice
  );
  const [theWayForward, setTheWayForward] = useState(
    selectedReportData.the_way_forward
      ? selectedReportData.the_way_forward
      : reportHeader.the_way_forward
  );
  const [exeSummary, setExeSummary] = useState("");
  const [conclusion, setConclusion] = useState(
    selectedReportData.conclusion
      ? selectedReportData.conclusion
      : reportHeader.conclusion
  );
  // const [imageUrlsByRow, setImageUrlsByRow] = useState(
  //   JSON.parse(selectedReportData.image_urls)
  //     ? JSON.parse(selectedReportData.image_urls)
  //     : {}
  // );
  const [scores, setScores] = useState(JSON.parse(selectedReportData.scores));
  const cumulativeScore =
    scores.reduce(
      (acc, row) => acc + parseFloat(row["Score Obtained"] || 0),
      0
    ) > 0
      ? scores
        .reduce((acc, row) => acc + parseFloat(row["Score Obtained"] || 0), 0)
        .toFixed(2)
      : 0;
  const { userId, name } = getAccountDetails();
  const [editedObservations, setEditedObservations] = useState([]);
  const [isReportEdited, setIsReportEdited] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [currentEditedRow, setCurrentEditedRow] = useState(-1);
  const [isEditing, setIsEditing] = useState(false);
  const [disableSaveNext, setDisableSaveNext] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const regexForBackground = /\bon.*?by\b/;
  const regexForExeSummary = /\bon.*?which\b/;
  const regexForAreas = /\bentire[\s\S]*?and\b/;
  const [isComplete, setIsComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openVairantModal, setOpenVariantModal] = useState(false);
  const [observationVariants, setObservationVariants] = useState([]);
  const [editedFields, setEditedFields] = useState([]);
  const [area, setArea] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [confirmationShown, setConfirmationShown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [facilityInfo, setFacilityInfo] = useState({
    "Name of Facility": "",
    "Address & Location": "",
    "Geographical Co-ordinates Seismic Zone": "",
    "Brief Property Description:": "",
    "Type of Construction": "",
    "Number of Floors": "",
    "Average Worker Foot Fall:": "",
    "No Objection Certificate": "",
  });
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
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
  const [isRowSaved, setIsRowSaved] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [dialog, setDialog] = useState({ open: false, message: "", title: "", accept: "", reject: "", onConfirm: null });
  const [alertShown, setAlertShown] = useState(false); // tracking for alert if there is any change in row without saving previous one
  const percentage = 74;
  const [isNextDisabled, setIsNextDisabled] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedObservation, setSelectedObservation] = useState({ image: null, index: null });
  const [isAreaDropdownOpen, setIsAreaDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isCriticalityDropdownOpen, setIsCriticalityDropdownOpen] = useState(false);


  const handleChangeAccordion = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : null);
  };
  useEffect(() => {
    const closeDropdownOnScroll = () => {
      if (isAreaDropdownOpen && areaSelectRef.current) {
        areaSelectRef.current.blur();
        setIsAreaDropdownOpen(false);
      }
      if (isCategoryDropdownOpen && categorySelectRef.current) {
        categorySelectRef.current.blur();
        setIsCategoryDropdownOpen(false);
      }
      if (isCriticalityDropdownOpen && criticalitySelectRef.current) {
        criticalitySelectRef.current.blur();
        setIsCriticalityDropdownOpen(false);
      }
    };

    const tableElement = tableRef.current;
    if (tableElement) {
      tableElement.addEventListener("scroll", closeDropdownOnScroll);
      tableElement.addEventListener("wheel", closeDropdownOnScroll, { passive: true });
      tableElement.addEventListener("touchmove", closeDropdownOnScroll, { passive: true });
    }

    return () => {
      if (tableElement) {
        tableElement.removeEventListener("scroll", closeDropdownOnScroll);
        tableElement.removeEventListener("wheel", closeDropdownOnScroll);
        tableElement.removeEventListener("touchmove", closeDropdownOnScroll);
      }
    };
  }, [isAreaDropdownOpen, isCategoryDropdownOpen, isCriticalityDropdownOpen]);

  useEffect(() => {
    updateBackgroundBrief();
    updateExecSummary();
    getFacilityInfo();
  }, [selectedOrganization, selectedSite, startDate, endDate, selectedArea]);
const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const getDayWithSuffix = (day) => {
    if (day > 3 && day < 21) return day + "th";
    switch (day % 10) {
      case 1: return day + "st";
      case 2: return day + "nd";
      case 3: return day + "rd";
      default: return day + "th";
    }
  };

  const start = new Date(startDate);
  const formattedStartDate = `${getDayWithSuffix(start.getDate())} ${monthNames[start.getMonth()]} ${start.getFullYear()}`;

  const updateBackgroundBrief = () => {
    
    
    const updatedData = selectedReportData.background_brief
      .replace(
        selectedReportData.organization,
        `${selectedOrganization
          ? selectedOrganization.label
          : selectedReportData.organization
        }`
      )
      .replace(
        selectedReportData.site,
        `${selectedSite ? selectedSite.label : selectedReportData.site}`
      )
      // .replace(
      //   regexForBackground,
      //   `on ${new Date(startDate).getDate()}-${new Date(startDate).getMonth() + 1
      //   }-${new Date(startDate).getFullYear()} and ${new Date(
      //     endDate
      //   ).getDate()}-${new Date(endDate).getMonth() + 1}-${new Date(
      //     endDate
      //   ).getFullYear()} by`
      // );
       .replace(
      regexForBackground,
      `on <b>${formattedStartDate}</b> by`
    );
    setBackgroundBrief(updatedData);
  };
  //  console.log("SelectedReportData:", selectedReportData)

  const updateExecSummary = () => {
    const updatedData = selectedReportData.exe_summary
      .replace(
        `${selectedReportData.organization}(${selectedReportData.site})`,
        `${selectedOrganization
          ? selectedOrganization.label
          : selectedReportData.organization
        }(${selectedSite ? selectedSite.label : selectedReportData.site})`
      )
      // .replace(
      //   regexForExeSummary,
      //   `on ${new Date(startDate).getDate()}-${new Date(startDate).getMonth() + 1
      //   }-${new Date(startDate).getFullYear()} till ${new Date(
      //     endDate
      //   ).getDate()}-${new Date(endDate).getMonth() + 1}-${new Date(
      //     endDate
      //   ).getFullYear()} and`
      // )
      .replace(
      regexForExeSummary,
      `on <b>${formattedStartDate}</b> which`
    )
      .replace(
        regexForAreas,
        `entire ${selectedArea.map((e) => e).join(", ")} and`
      );
    setExeSummary(updatedData);
  };



  // const handleCellEdit = (e, index, field, originalContent, observationObj) => {
  //   const handleConfirmation = () => {
  //     if (!confirmationShown) {
  //       const confirmEdit = setDialog({
  //         open: true,
  //         title: "Confirm Edit",
  //         message: "Editing the observation field will make this a new observation set and the variant list will be updated accordingly. Do you want to continue?",
  //         accept: "OK",
  //         reject: "Cancel",
  //         onConfirm: () => {
  //           setConfirmationShown(true);   // User clicked "OK", allow editing
  //         }
  //       });
  //       return false; // User clicked "Cancel", stop editing
  //     }
  //     return true; // Already confirmed before
  //   };

  //   // Prevent editing another row before saving the current row
  //   if (currentEditedRow !== -1 && currentEditedRow !== index) {
  //     toast.warning("Please save changes in the currently edited row before editing another row.");
  //     return;
  //   }

  //   // Function to update edited fields array
  //   const updateEditedFields = (newField) => {
  //     if (!editedFields.includes(newField)) {
  //       setEditedFields((prevFields) => [...prevFields, newField]);
  //     }
  //   };

  //   // Show confirmation only for "observation" field
  //   if (field === "observation") {
  //     const isAllowed = handleConfirmation();
  //     if (!isAllowed) {
  //       return false; // Prevent editing
  //     }
  //   }

  //   if (field === "area") {
  //     let area = [];
  //     area.push(e.value);
  //     setArea(area);
  //     updateEditedFields("A");
  //   }

  //   setIsEditing(true);
  //   setCurrentEditedRow(index);

  //   let value = "";

  //   if (["area", "category", "criticality"].includes(field)) {
  //     value = e?.value || "";
  //   } else if (e?.target?.value !== undefined) {
  //     value = e.target.value;
  //   } else if (e?.target?.textContent !== undefined) {
  //     value = e.target.textContent;
  //   }


  //   // Check if the current content exceeds the character limit
  //   if ((field === "area" || field === "category") && value.length > 50) {
  //     toast.warning("Only 50 characters are allowed in this field.");
  //     setIsEditing(false);
  //     return; // Do nothing and exit the function
  //   }

  //   if (value.length > 7000) {
  //     toast.warning("Maximum character limit reached.");
  //     e.target.textContent = value.substring(0, 7000);
  //     const range = document.createRange();
  //     const sel = window.getSelection();
  //     range.setStart(e.target.childNodes[0], 7000);
  //     range.collapse(true);
  //     sel.removeAllRanges();
  //     sel.addRange(range);
  //     e.preventDefault();
  //     return;
  //   }

  //   setIsReportEdited(true);

  //   setEditedObservations((prev) => {
  //     const existingIndex = prev.findIndex((obs) => obs.selectedRefIndex === index);

  //     const updatedObs = {
  //       ...observationObj,
  //       ...prev[existingIndex],
  //       [field]: value,
  //       selectedRefIndex: index,
  //     };

  //     if (existingIndex !== -1) {
  //       const updated = [...prev];
  //       updated[existingIndex] = updatedObs;
  //       return updated;
  //     } else {
  //       return [...prev, updatedObs];
  //     }
  //   });

  //   // Update edited fields array based on the field edited
  //   switch (field) {
  //     case "category":
  //       updateEditedFields("CA");
  //       break;
  //     case "check_points":
  //       updateEditedFields("CH");
  //       break;
  //     case "observation":
  //       updateEditedFields("O");
  //       break;
  //     case "criticality":
  //       updateEditedFields("CR");
  //       break;
  //     case "recommendations":
  //       updateEditedFields("R");
  //       break;
  //     case "is_reference":
  //       updateEditedFields("I");
  //       break;
  //     // Add cases for other fields as needed
  //     default:
  //       break;
  //   }
  //   return true; // Allow editing
  // };

const handleCellEdit = (e, index, field, originalContent, observationObj) => {
  //  console.log("selected observation",selectedObservations)
  // console.log("allObservations",AllObservations)
  const handleConfirmation = () => {
    if (!confirmationShown) {
      setDialog({
        open: true,
        title: "Confirm Edit",
        message:
          "Editing the observation field will make this a new observation set and the variant list will be updated accordingly. Do you want to continue?",
        accept: "OK",
        reject: "Cancel",
        onConfirm: () => {
          setConfirmationShown(true);
        },
      });
      return false;
    }
    return true;
  };

  if (currentEditedRow !== -1 && currentEditedRow !== index) {
    toast.warning(
      "Please save changes in the currently edited row before editing another row."
    );
    return;
  }

  const updateEditedFields = (newField) => {
    if (!editedFields.includes(newField)) {
      setEditedFields((prevFields) => [...prevFields, newField]);
    }
  };

  if (field === "observation") {
    const isAllowed = handleConfirmation();
    if (!isAllowed) return false;
  }

  if (field === "area") {
    setArea([e.value]);
    updateEditedFields("A");
  }

  setIsEditing(true);
  setCurrentEditedRow(index);

  let value = "";

  if (["area", "category", "criticality"].includes(field)) {
    value = e?.value || "";
  } else if (e?.target?.value !== undefined) {
    value = e.target.value;
  } else if (e?.target?.textContent !== undefined) {
    value = e.target.textContent;
  }

  if ((field === "area" || field === "category") && value.length > 50) {
    toast.warning("Only 50 characters are allowed in this field.");
    return;
  }

  if (value.length > 7000) {
    toast.warning("Maximum character limit reached.");
    e.target.textContent = value.substring(0, 7000);
    const range = document.createRange();
    const sel = window.getSelection();
    range.setStart(e.target.childNodes[0], 7000);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    e.preventDefault();
    return;
  }

  setIsReportEdited(true);

  // setEditedObservations((prev) => {
  //   const existingIndex = prev.findIndex(
  //     (obs) =>
  //       (obs.tempId && obs.tempId === observationObj.tempId) ||
  //       (!obs.tempId && obs.selectedRefIndex === index)
  //   );

  //   const base = existingIndex !== -1 ? prev[existingIndex] : observationObj;

  //   const updatedObs = {
  //     ...base,
  //     [field]: value,
  //     selectedRefIndex: index,
  //     tempId: base.tempId || observationObj.tempId,
      
  //   };

  //   if (existingIndex !== -1) {
  //     const updated = [...prev];
  //     updated[existingIndex] = updatedObs;
  //     return updated;
  //   } else {
  //     return [...prev, updatedObs];
  //   }
  // });
setEditedObservations((prev) => {
  const existingIndex = prev.findIndex(
    (obs) =>
      (obs.tempId && obs.tempId === observationObj.tempId) ||
     (!obs.tempId && obs.refIndex === observationObj.refIndex) ||
     (obs.id && obs.id === observationObj.id)||
    (obs.sr_no && obs.sr_no === observationObj.sr_no)
      // (!obs.tempId && obs.sr_no === observationObj.sr_no) 
  );

  const updatedObservation = {
    ...(existingIndex !== -1 ? prev[existingIndex] : observationObj),
    [field]: value,
    edited_fields: [
      ...new Set([
        ...(observationObj.edited_fields || []),
        ...(prev[existingIndex]?.edited_fields || []),
        field,
      ]),
    ],
  };
//  console.log("handleupdated",updatedObservation)
//  console.log("editedobs",editedObservations)
  if (existingIndex !== -1) {
    const updated = [...prev];
    updated[existingIndex] = updatedObservation;
    return updated;
  } else {
    return [...prev, updatedObservation];
  }
});

  switch (field) {
    case "category":
      updateEditedFields("CA");
      break;
    case "check_points":
      updateEditedFields("CH");
      break;
    case "observation":
      updateEditedFields("O");
      break;
    case "criticality":
      updateEditedFields("CR");
      break;
    case "recommendations":
      updateEditedFields("R");
      break;
    case "is_reference":
      updateEditedFields("I");
      break;
    default:
      break;
  }

  return true;
};


  const handleDialogBoxObservation = (action) => {
    if (action) {

      dialog.onConfirm(); // Execute the confirmed action (allow editing)
    }

    setDialog((prevDialog) => ({ ...prevDialog, open: false }));


  };

  const populateCategoryList = async (selectedAreas) => {
    try {
      // Filter the observations based on the selected areas
      const filteredObservations = allData.data.filter((item) =>
        selectedAreas.includes(item.area)
      );

      // Extract unique categories from the filtered observations
      const categories = [
        ...new Set(filteredObservations.map((item) => item.category)),
      ];

      setCategoryList(categories);
    } catch (error) {
      console.log("An error occurred:", error);
    }
  };

  const getCriticalObservations = async () => {
    try {
      const res = await axios.get(
        module === "cmv"
          ? `${config.PATH}/api/get-cmv-critical-observations/${selectedReportData.report_id}`
          : `${config.PATH}/api/get-critical-observations/${selectedReportData.report_id}`
      );
      setCriticalObservations(res.data.data);
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    populateCategoryList(selectedArea); // Populate the category list based on selected areas
  }, [selectedArea]);

  useEffect(() => {
    getOrgList();
    populateAreaList();
  }, [allData, selectedCategory]);

  useEffect(() => {
    getSitesByOrganization(
      selectedOrganization ? selectedOrganization.value : null
    );
  }, [selectedOrganization, selectedSite]);

  useEffect(() => {
    getCriticalObservations();
    const updatedCriticalObservations = criticalObservations.filter((obs) => {
      return selectedObservations.some(
        (selectedObs) =>
          selectedObs.observation === obs.observation &&
          selectedObs.report_id === obs.report_id
      );
    });
    setCriticalObservations(updatedCriticalObservations);
  }, []);

  useEffect(() => {
    // Update refIndex for initially selected observations
    setSelectedObservations((prevSelectedObservations) =>
      prevSelectedObservations.map((obs) => {
        let indexInAllObservations;
        if (obs.id) {
          indexInAllObservations = AllObservations.findIndex(
            (allObs) => allObs.id === obs.id
          );
        } else if (obs.sr_no) {
          indexInAllObservations = AllObservations.findIndex(
            (allObs) => allObs.sr_no === obs.sr_no
          );
        }
        return {
          ...obs,
          refIndex:
            indexInAllObservations !== -1 ? indexInAllObservations : null,
        };
      })
    );
  }, [AllObservations]);

  const refreshAllObservations = async () => {
    try {
      // Fetch the updated data from the API or wherever
      const report = await axios.get(
        `${config.PATH}/api/report/${selectedReportData.report_id}`
      );
      setAllObservations(report.data.AllObservations);
    } catch (error) {
      console.error("Error refreshing AllObservations:", error);
    }
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

  const handleDateTime = (e) => {
    setSelectedDateTime(e.target.value);
  };

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
          `${config.PATH}/api/create-organization`,
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

  const getOrgList = async () => {
    try {
      const response = await axios.get(`${config.PATH}/api/organizations`);
      setOrgList(response.data);
    } catch (error) {
      console.log("Error:", error.response?.data?.error || error.message);
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
        org_id: selectedOrganization ? selectedOrganization.value : null,
      };
      try {
        await axios.post(`${config.PATH}/api/add-site`, payload);
      } catch (error) {
        console.log("Failed to create site:", error);
        return;
      }
    }
    setSelectedSite(selectedOption);
  };

  const populateAreaList = async () => {
    try {
      const area = allData.data.map((e) => e.area);
      let uniqueAreaList = [...new Set(area)];
      setAreaList(uniqueAreaList);
    } catch (err) {
      console.log(err);
    }
  };

  // const handleChangeArea = (areas) => {
  //   try {
  //     // setAreasToDisplay(areas);
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
  //       // If the 'areas' array is empty, set 'categories' and 'categoriesToDisplay' to empty arrays.
  //       setSelectedCategory([]);
  //       // setCategoriesToDisplay([]);
  //       setSelectedObservations([]);
        
  //       // Update the observations based on the empty category list
  //       handleChangeCategory([]);
  //       setCategoryList([]);
  //     } else {
  //       // Remove categories that are not associated with the selected areas.
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

  //       // Set 'categoriesToDisplay' to the categories associated with the selected areas.
  //       const updatedCategoriesToDisplay = categoryList
  //         .filter((category) => updatedSelectedCategory.includes(category))
  //         .map((category) => ({ label: category, value: category }));

  //       const uniqueCategories = [
  //         ...new Set(updatedCategoriesToDisplay.map(JSON.stringify)),
  //       ].map(JSON.parse);
  //       // setCategoriesToDisplay(uniqueCategories);
  //       // Update the observations based on the updated selected categories
  //       handleChangeCategory(uniqueCategories);
  //     }
  //   } catch (error) {
  //     console.log("An error occurred:", error);
  //   }
  // };

const [resetSelection, setResetSelection] = useState(false);

const handleChangeArea = (areas) => {
  try {
    const selectedAreaValues = areas.map((e) => e.value);

    const prevAreaSet = new Set(selectedArea);
    const newAreaSet = new Set(selectedAreaValues);
    const isSameArea =
      prevAreaSet.size === newAreaSet.size &&
      [...prevAreaSet].every((val) => newAreaSet.has(val));

    if (isSameArea) return;

    setSelectedArea(selectedAreaValues);
       if (selectedAreaValues.length === 0) {
        setAllObservations([]);
        setSelectedObservations([]);
            setSelectedCategory([]);
      setCategoryList([]);
      // setCategoriesToDisplay([]); // Optional if unused
      handleChangeCategory([]);
        return;
      }
    // setAreasToDisplay(areas);

    // Extract unique categories for selected areas
    const getCategoriesByAreas = (selectedAreas) => {
      return [
        ...new Set(
          allData.data
            .filter((item) => selectedAreas.includes(item.area))
            .map((item) => item.category)
        ),
      ];
    };

    if (areas.length === 0) {
      setSelectedCategory([]);
      setSelectedObservations([]);
      setCategoryList([]);
      // setCategoriesToDisplay([]); // Optional if unused
      handleChangeCategory([]);
    } else {
      const validCategories = getCategoriesByAreas(selectedAreaValues);
      setCategoryList(validCategories);

      // Retain only selected categories that still match the selected areas
      const updatedSelectedCategory = selectedCategory.filter((category) =>
        allData.data
          .filter((item) => item.category === category)
          .some((item) => selectedAreaValues.includes(item.area))
      );

      setSelectedCategory(updatedSelectedCategory);

      const updatedCategoriesToDisplay = validCategories
        .filter((category) => updatedSelectedCategory.includes(category))
        .map((category) => ({ label: category, value: category }));

      const uniqueCategories = [
        ...new Set(updatedCategoriesToDisplay.map(JSON.stringify)),
      ].map(JSON.parse);

      // setCategoriesToDisplay(uniqueCategories); // Optional if unused
      handleChangeCategory(uniqueCategories);
    }
  } catch (error) {
    console.log("An error occurred in handleChangeArea:", error);
  }
};
// const handleChangeCategory = async (cat) => {
//   const selectedCat = cat.map((e) => e.value);

//   const prevCatSet = new Set(selectedCategory);
//   const newCatSet = new Set(selectedCat);
//   const isSameCategory =
//     prevCatSet.size === newCatSet.size &&
//     [...prevCatSet].every((val) => newCatSet.has(val));

//   if (isSameCategory) return;

//   setSelectedCategory(selectedCat);
//   if (selectedCat.length === 0) {
//         setAllObservations([]);
//         setSelectedObservations([]);
//         return;
//       }

//   try {
//     const combinedData = allData.data.concat(selectedReportData.AllObservations || []);
//     const newObservations = AllObservations.filter((obs) => obs.isNew);

//     const filteredObservations = combinedData
//       .filter(
//         (item) =>
//           selectedCat.includes(item.category) &&
//           selectedArea.includes(item.area)
//       )
//       .filter((obs, index, self) =>
//         index === self.findIndex((o) => o.observation?.trim() === obs.observation?.trim())
//       );

//     // Add is_selected and imageUrls if observation was previously selected
//     const updatedObservations = filteredObservations.map((obs) => {
//       const existing = selectedObservations.find(
//         (sel) => sel.observation === obs.observation
//       );
//       return existing
//         ? {
//             ...obs,
//             is_selected: 1,
//             imageUrls: existing.imageUrls,
//           }
//         : obs;
//     });

//     // Preserve previously selected observations even if they no longer match current filters
//     const preservedSelections = selectedObservations.filter(
//       (sel) =>
//         !updatedObservations.some(
//           (obs) => obs.observation === sel.observation
//         )
//     );

//     const finalObservations = [...updatedObservations, ...preservedSelections, ...newObservations];

//     // Remove duplicates based on observation text
//     const dedupedFinalObs = finalObservations.filter(
//       (obs, index, self) =>
//         index === self.findIndex((o) => o.observation?.trim() === obs.observation?.trim())
//     );

//     setAllObservations(dedupedFinalObs);

//     // Ensure selectedObservations list stays accurate
//     const stillSelected = selectedObservations.filter((sel) =>
//       dedupedFinalObs.some(
//         (obs) => obs.sr_no === sel.sr_no || obs.id === sel.id || obs.observation === sel.observation
//       )
//     );

//     setSelectedObservations(stillSelected);
//   } catch (error) {
//     console.log("Error in handleChangeCategory:", error);
//   }
// };


const handleChangeCategory = async (cat) => {
  const selectedCat = cat.map((e) => e.value);
  const prevSelectedCat = selectedCategory;

  setSelectedCategory(selectedCat);

  try {
  
    const removedCategories = prevSelectedCat.filter(
      (c) => !selectedCat.includes(c)
    );
    const addedCategories = selectedCat.filter(
      (c) => !prevSelectedCat.includes(c)
    );

 
    let updatedAllObservations = [...AllObservations];

    if (removedCategories.length > 0) {
      updatedAllObservations = updatedAllObservations.filter(
        (obs) => !removedCategories.includes(obs.category)
      );
    }

    let newCategoryObservations = [];
    if (addedCategories.length > 0) {
      const combinedData = [
        ...(allData?.data || []),
        ...(selectedReportData?.AllObservations || []),
      ];

      newCategoryObservations = combinedData
        .filter(
          (observation) =>
            addedCategories.includes(observation.category) &&
            selectedArea.includes(observation.area)
        )
        // remove duplicates
        .filter(
          (obs, index, self) =>
            index ===
            self.findIndex(
              (o) => o.observation?.trim() === obs.observation?.trim()
            )
        )
        // retain selected + imageUrls if already selected before
        .map((observation) => {
          const existing = selectedObservations.find(
            (sel) => sel.observation === observation.observation
          );
          return existing
            ? { ...observation, is_selected: 1, imageUrls: existing.imageUrls }
            : { ...observation, is_selected: 0 };
        });
    }

    const mergedObservations = [
      ...updatedAllObservations,
      ...newCategoryObservations,
    ];

    const dedupedAllObs = mergedObservations.filter((obs, index, self) => {
      const key = obs.sr_no || obs.id || obs.tempId || obs.observation;
      return (
        index ===
        self.findIndex(
          (o) => (o.sr_no || o.id || o.tempId || o.observation) === key
        )
      );
    });

    const filteredSelected = selectedObservations.filter(
      (sel) => !removedCategories.includes(sel.category)
    );

    // Preserve selections that still exist in current data
    const finalSelected = filteredSelected.filter((sel) =>
      dedupedAllObs.some(
        (obs) =>
          obs.sr_no === sel.sr_no ||
          obs.id === sel.id ||
          obs.observation === sel.observation
      )
    );

    setAllObservations(dedupedAllObs);
    setSelectedObservations(finalSelected);

    // console.log("Added categories:", addedCategories);
    // console.log("Removed categories:", removedCategories);
    // console.log("All Observations after update:", dedupedAllObs);
    // console.log("Selected Observations after update:", finalSelected);
  } catch (error) {
    console.log("Error in handleChangeCategory:", error);
  }
};

//  console.log("after",selectedReportData.AllObservations.filter((e) => e.is_selected === 1))
//  console.log("after",selectedReportData.AllObservations)


//   const handleObservationSelection = (observation, index) => {
//   console.log(criticalObservations);
//   const tempObs = [...AllObservations];
//   const key = `${observation.sr_no || observation.id || observation.observation}`;
//   const isAlreadySelected = observation.is_selected;

//   let updatedSelected;

//   if (isAlreadySelected) {
//     delete tempObs[index].is_selected;

//     updatedSelected = selectedObservations.filter(
//       (e) =>
//         `${e.sr_no || e.id || e.observation}` !== key
//     );
//   } else {
//     tempObs[index] = { ...observation, is_selected: 1 };
//     updatedSelected = [...selectedObservations, { ...observation, refIndex: index }];
//   }

//   setSelectedObservations(updatedSelected);

// //   const selectedHigh = updatedSelected.filter((e) => e.criticality === "High");
// //   const manualPreserved = criticalObservations.filter((e) => e.sr_no === null);

// //   // ðŸ”¸ Merge and remove duplicates
// //   const seen = new Set();
// //   const mergedCriticals = [...selectedHigh, ...manualPreserved].filter((e) => {
// //     const mergeKey = `${e.sr_no || e.id || e.observation}`;
// //     if (seen.has(mergeKey)) return false;
// //     seen.add(mergeKey);
// //     return true;
// //   });
// // setCriticalObservations(mergedCriticals);
// const selectedHigh = selectedObservations.filter((e) => e.criticality === "High");
// const manualFromCriticals = criticalObservations.filter((e) => e.sr_no === null);

// const allManuals = [...manualCriticalObservations, ...manualFromCriticals];

// // Merge everything and remove duplicates using a Set
// const seen = new Set();
// const mergedCriticals = [...selectedHigh, ...allManuals].filter((e) => {
//   const key = `${e.sr_no || e.id || e.observation}`.trim();
//   if (seen.has(key)) return false;
//   seen.add(key);
//   return true;
// });

// setCriticalObservations(mergedCriticals);

//   setAllObservations(tempObs);
// };

const handleObservationSelection = (observation, index) => {
  
  const tempObs = [...AllObservations];
  const key = `${observation.sr_no || observation.id || observation.observation}`;
  const isAlreadySelected = observation.is_selected;

  let updatedSelected;

  if (isAlreadySelected) {
    delete tempObs[index].is_selected;
    updatedSelected = selectedObservations.filter(
      (e) => `${e.sr_no || e.id || e.observation}` !== key
    );
  } else {
    tempObs[index] = { ...observation, is_selected: 1 };
    updatedSelected = [...selectedObservations, { ...observation, refIndex: index }];
  }

  setSelectedObservations(updatedSelected);

  const selectedHigh = updatedSelected.filter((e) => e.criticality === "High");
  const manualFromCriticals = criticalObservations.filter((e) => e.sr_no === null);
  const allManuals = [...manualCriticalObservations, ...manualFromCriticals];
//  console.log("hanlde selected",selectedObservations)
  const editedMap = new Map();
  criticalObservations.forEach((e) => {
    const key = `${e.sr_no || e.id || e.observation}`.trim();
    editedMap.set(key, e); // stores the edited version
  });

  const combined = [...selectedHigh, ...allManuals];
  const seen = new Set();
  const mergedCriticals = [];

  for (const obs of combined) {
    const mergeKey = `${obs.sr_no || obs.id || obs.observation}`.trim();
    if (seen.has(mergeKey)) continue;
    seen.add(mergeKey);

    // Preserve the edited version if exists
    mergedCriticals.push(editedMap.get(mergeKey) || obs);
  }

  setCriticalObservations(mergedCriticals);
  setAllObservations(tempObs);
 
  // console.log("selectedobservations",selectedObservations)
  //  console.log("TempAllobservations",tempObs);
};


  const handleProceed = async () => {
    // console.log(otherDetails);
    // console.log(AllObservations);
    // console.log(criticalObservations)
    try {
      setLoading(true);
      // const payload = {
      //   observations: selectedObservations.map((e) => e.observation),
      //   report_id: selectedReportData.report_id,
      // };
      const reportData = {
        report_id: selectedReportData.report_id,
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
        background_brief: backgroundBrief,
        improvement_opportunity_areas:improvementOpportunityAreas,
        overall_assessment_indicator:overallAssessmentIndicator,
        contents: contents,
        exe_summary: exeSummary,
        conclusion: conclusion,
        best_practice: bestPractice,
        the_way_forward: theWayForward,
        is_edited: isReportEdited,
        start_date: startDate,
        end_date: endDate,
        is_saved: true,
      };
      // Set the flag based on the module
      if (module === "cmv") {
        reportData.type = "cmv";
      } else {
        reportData.type = "primary";
      }
      handleNext();

      const cmvEndPOint = `${config.PATH}/api/save-update-cmv-report`;
      const reportEndPoint = `${config.PATH}/api/save-update-report`;

      if (module === "cmv") {
        await axios.post(cmvEndPOint, reportData);
      } else {
        await axios.post(reportEndPoint, reportData);
      }

      const observationsData = {
        report_id: selectedReportData.report_id,
        all_observations: AllObservations,
      };
    //  console.log("proceed",selectedObservations)
      const observationEndPoint = `${config.PATH}/api/save-update-observations`;
      const cmvObservationEndPoint = `${config.PATH}/api/save-update-cmv-observations`;

      if (module === "cmv") {
        await axios.post(cmvObservationEndPoint, observationsData);
      } else {
        await axios.post(observationEndPoint, observationsData);
      }
      setLoading(false);
    } catch (error) {
      console.log("Error:", error.response?.data?.error || error.message);
    }
  };

  const keyNotToCheck = [
    "remarks",
    "score",
    "refIndex",
    "selectedRefIndex",
    "equipment",
    "sr_no",
    "status",
    "is_selected",
    "imageUrls",
    "status",
    "sector_type",
    "table_type"
  ];





const handleSave = async (complete) => {
  // console.log("selected observationbefore",selectedObservations)
  // console.log("allObservations",AllObservations)
  // console.log("reportheaders",reportHeader)
  if (otherDetails.trim()) {
    toast.warning("Please add the Other critical observation before proceeding.");
    return;
  }

  const hasEmptyObservation = criticalObservations.some(
    (obs) => obs.observation.trim() === ""
  );
  if (hasEmptyObservation) {
    toast.warning("Critical observation cannot be empty!");
    return;
  }

  const hasEmptyFields = selectedObservations.some(
    (obs) =>
      !obs.is_reference || obs.is_reference.trim() === "" ||
      !obs.area || obs.area.trim() === "" ||
      !obs.category || obs.category.trim() === "" ||
      !obs.check_points || obs.check_points.trim() === "" ||
      !obs.observation || obs.observation.trim() === "" ||
      !obs.criticality || obs.criticality.trim() === "" ||
      !obs.recommendations || obs.recommendations.trim() === ""
  );
  if (hasEmptyFields) {
    toast.warning("Fields cannot be empty!");
    return;
  }

  try {
    setLoading(true);

    // if (screenNumber === 6 && isRowSaved === false) {
    //   toast.warning("Please save the new row by clicking on the tick action button.");
    //   setLoading(false);
    //   return;
    // }

    if (isAnyScoreEmpty()) {
      toast.warning("Please fill the score table before saving the report.");
      setLoading(false);
      return;
    }

    const trimObjectFields = (obj) => {
      const trimmedObj = { ...obj };
      Object.keys(trimmedObj).forEach((key) => {
        if (typeof trimmedObj[key] === "string") {
          trimmedObj[key] = trimmedObj[key].trim();
        }
      });
      return trimmedObj;
    };

    const regroupByArea = (rows) => {
      const grouped = [];
      const areas = Array.from(new Set(rows.map(r => r.area)));
      areas.forEach(area => {
        const group = rows.filter(r => r.area === area);
        grouped.push(...group);
      });
      return grouped;
    };

    // Trim existing observations
    let updatedSelectedObservations = selectedObservations.map(trimObjectFields);
    let updatedAllObservations = AllObservations.map(trimObjectFields);

    // Merge editedObservations into updated lists (with tempId and sr_no fallback)
    editedObservations.forEach((obj) => {
      const trimmedObj = trimObjectFields(obj);

      const emptyFieldFound = Object.entries(trimmedObj).some(
        ([key, value]) => !keyNotToCheck.includes(key) && value === ""
      );
      if (emptyFieldFound) {
        toast.error("Table fields can't be empty.");
        setLoading(false);
        throw new Error("Empty field found in edited observations");
      }

      // Merge into selectedObservations
      const matchRow = (e, obj) => {
      //  console.log("e",e)
      //  console.log("obj",obj)
  // return (e.tempId && obj.tempId && e.tempId === obj.tempId) || (e.id==obj.id)
  return (obj.tempId && e.tempId === obj.tempId) || // match by tempId for new rows
              (obj.id && e.id=== obj.id) ||
              (obj.sr_no&&e.sr_no==obj.sr_no)
      }
  // (!e.tempId && !obj.tempId && e.sr_no && obj.sr_no && e.sr_no === obj.sr_no);
  // (!obj.tempId && e.refIndex === obj.refIndex);

      // const selectedIndex = updatedSelectedObservations.findIndex(
      //   (e) =>
      //     (obj.tempId && e.tempId === obj.tempId) ||
      //   (!obj.tempId && e.refIndex === obj.refIndex)
      // );
      const selectedIndex = updatedSelectedObservations.findIndex(e => matchRow(e, obj));
      // console.log("updatedselectedbefore",updatedSelectedObservations)
      // console.log("selected index",selectedIndex)
      if (selectedIndex !== -1) {
        updatedSelectedObservations[selectedIndex] = {
          ...updatedSelectedObservations[selectedIndex],
          ...trimmedObj,
        };
        //  console.log("updatedsave",updatedSelectedObservations)
      } else {
        updatedSelectedObservations.push(trimmedObj);
        // console.log("updatedsave",updatedSelectedObservations)
      }

      // Merge into all observations
      // const allIndex = updatedAllObservations.findIndex(
      //   (e) =>
      //     (obj.tempId && e.tempId === obj.tempId) ||
      //   (!obj.tempId && e.refIndex === obj.refIndex)
      // );
      const allIndex = updatedAllObservations.findIndex(e => matchRow(e, obj));
      if (allIndex !== -1) {
        updatedAllObservations[allIndex] = {
          ...updatedAllObservations[allIndex],
          ...trimmedObj,
        };
      } else {
        updatedAllObservations.push(trimmedObj);
      }
    });

    // // Regroup by area AFTER merging all changes
    // updatedSelectedObservations = regroupByArea(updatedSelectedObservations);
    // updatedAllObservations = regroupByArea(updatedAllObservations);

    // // Update state before API calls
    // setSelectedObservations(updatedSelectedObservations);
    // setAllObservations(updatedAllObservations);

    if (isReportEdited && editedObservations.length > 0) {
      const payload = editedObservations
        .map(({ sr_no, score, edited_fields,tempId, ...rest }) => ({
          ...trimObjectFields(rest),
          // edited_fields: editedFields,
            edited_fields: edited_fields || [],
        }))
        .filter((item) => Object.keys(item).length > 0);

      if (payload.length > 0) {
        await axios.post(`${config.PATH}/api/insert-new-row`, payload);
      }
    }
   updatedSelectedObservations = regroupByArea(updatedSelectedObservations);
        updatedAllObservations = regroupByArea(updatedAllObservations);

        // requestAnimationFrame(() => {
        //   setSelectedObservations(updatedSelectedObservations);
        //   setAllObservations(updatedAllObservations);
        // });
        // console.log("updatedselected",updatedSelectedObservations)
        setSelectedObservations([...updatedSelectedObservations]);
setAllObservations([...updatedAllObservations]);
        //  console.log("setselected observation",setSelectedObservations)
  // console.log("setallObservations",setAllObservations)
    const reportData = trimObjectFields({
      report_id: selectedReportData.report_id,
      user_id: userId,
      date_time: selectedDateTime,
      organization: selectedOrganization?.label || selectedOrganization,
      site: selectedSite?.label || selectedSite,
      org_id: selectedOrganization?.value || selectedOrganization,
      area: selectedArea,
      category: selectedCategory,
      background_brief: backgroundBrief,
      improvement_opportunity_areas:improvementOpportunityAreas,
      overall_assessment_indicator:overallAssessmentIndicator,
      contents,
      exe_summary: exeSummary,
      conclusion,
      best_practice: bestPractice,
      the_way_forward: theWayForward,
      scores,
      cumulative: cumulativeScore,
      is_edited: isReportEdited,
      other_details: otherDetails,
      is_complete: complete === true,
      start_date: startDate,
      end_date: endDate,
      is_saved: true,
    });

    const cmvEndPoint = `${config.PATH}/api/save-update-cmv-report`;
    const reportEndPoint = `${config.PATH}/api/save-update-report`;

    if (module === "cmv") {
      await axios.post(cmvEndPoint, reportData);
    } else if (complete === true && module !== "cmv") {
      await axios.post(cmvEndPoint, reportData);
      await axios.post(reportEndPoint, reportData);
    } else {
      await axios.post(reportEndPoint, reportData);

    }

    const observationsData = {
      report_id: selectedReportData.report_id,
      //  all_observations: updatedSelectedObservations,
       all_observations: updatedAllObservations,
      organization: selectedOrganization?.label || selectedOrganization,
      site: selectedSite?.label || selectedSite,
    };
  // console.log("updated data",updatedAllObservations)
  //  console.log("select  after ",updatedSelectedObservations)
    const observationEndPoint = `${config.PATH}/api/save-update-observations`;
    const cmvObservationEndPoint = `${config.PATH}/api/save-update-cmv-observations`;

    if (module === "cmv") {
      await axios.post(cmvObservationEndPoint, observationsData);
    } else if (complete === true && module !== "cmv") {
      await axios.post(cmvObservationEndPoint, observationsData);
      await axios.post(observationEndPoint, observationsData);
    } else {
      await axios.post(observationEndPoint, observationsData);
    }
    // console.log("observationsData",observationsData)
    setIsSaved(true);
    setEditedObservations([]);
    setCurrentEditedRow(-1);
    setIsEditing(false);
    setDisableSaveNext(false);
    getAllData();
    updateOrgReportStatus();
    updateSiteReportStatus();
    setEditedFields([]);
    setConfirmationShown(false);
    toast.success(`${complete === true ? "Report completed and Saved" : "Report Saved"}`);
    saveCriticalObservations(complete);
    saveFacilityInfo();
    setLoading(false);
  } catch (error) {
    if (error.message !== "Empty field found in edited observations") {
      console.error("Error saving report:", error);
      toast.error("Error saving report.");
    }
    setLoading(false);
  }
};


// for variants
// const handleSave = async (complete) => {
//   console.log("selected observation before", selectedObservations);

//   if (otherDetails.trim()) {
//     toast.warning("Please add the Other critical observation before proceeding.");
//     return;
//   }

//   const hasEmptyObservation = criticalObservations.some(
//     (obs) => obs.observation.trim() === ""
//   );
//   if (hasEmptyObservation) {
//     toast.warning("Critical observation cannot be empty!");
//     return;
//   }

//   const hasEmptyFields = selectedObservations.some(
//     (obs) =>
//       !obs.is_reference || obs.is_reference.trim() === "" ||
//       !obs.area || obs.area.trim() === "" ||
//       !obs.category || obs.category.trim() === "" ||
//       !obs.check_points || obs.check_points.trim() === "" ||
//       !obs.observation || obs.observation.trim() === "" ||
//       !obs.criticality || obs.criticality.trim() === "" ||
//       !obs.recommendations || obs.recommendations.trim() === ""
//   );
//   if (hasEmptyFields) {
//     toast.warning("Fields cannot be empty!");
//     return;
//   }

//   try {
//     setLoading(true);

//     if (isAnyScoreEmpty()) {
//       toast.warning("Please fill the score table before saving the report.");
//       setLoading(false);
//       return;
//     }

//     // Helper: consistent key resolver for matching rows
//     const getRowKey = (item = {}) => {
//       // prefer stable ids in this order
//       if (item.tempId) return `temp_${item.tempId}`;
//       if (item.sr_no !== undefined && item.sr_no !== null) return `sr_${item.sr_no}`;
//       if (item.id !== undefined && item.id !== null) return `id_${item.id}`;
//       if (item.refIndex !== undefined && item.refIndex !== null) return `ref_${item.refIndex}`;
//       return null;
//     };

//     const matchRow = (a = {}, b = {}) => {
//       const ka = getRowKey(a);
//       const kb = getRowKey(b);
//       // if both have keys, compare; else try fallback comparisons
//       if (ka && kb) return ka === kb;
//       // fallback: try sr_no equality if present
//       if (a.sr_no !== undefined && b.sr_no !== undefined) return a.sr_no === b.sr_no;
//       return false;
//     };

//     // Trim strings in object fields
//     const trimObjectFields = (obj) => {
//       const trimmedObj = { ...obj };
//       Object.keys(trimmedObj).forEach((key) => {
//         if (typeof trimmedObj[key] === "string") {
//           trimmedObj[key] = trimmedObj[key].trim();
//         }
//       });
//       return trimmedObj;
//     };

//     const regroupByArea = (rows) => {
//       const grouped = [];
//       const areas = Array.from(new Set(rows.map(r => r.area)));
//       areas.forEach(area => {
//         const group = rows.filter(r => r.area === area);
//         grouped.push(...group);
//       });
//       return grouped;
//     };

//     // Start with trimmed copies to avoid mutating originals
//     let updatedSelectedObservations = selectedObservations.map(trimObjectFields);
//     let updatedAllObservations = AllObservations.map(trimObjectFields);

//     // Merge editedObservations into updated lists
//     for (const obj of editedObservations) {
//       const trimmedObj = trimObjectFields(obj);

//       const emptyFieldFound = Object.entries(trimmedObj).some(
//         ([key, value]) => !keyNotToCheck.includes(key) && value === ""
//       );
//       if (emptyFieldFound) {
//         toast.error("Table fields can't be empty.");
//         setLoading(false);
//         throw new Error("Empty field found in edited observations");
//       }

//       // find indexes using robust matchRow
//       const selIndex = updatedSelectedObservations.findIndex(e => matchRow(e, trimmedObj));
//       const allIndex = updatedAllObservations.findIndex(e => matchRow(e, trimmedObj));

//       // When merging, preserve existing nested/array fields (like imageUrls) unless the incoming object has a meaningful value.
//       const mergePreserve = (existing = {}, incoming = {}) => {
//         const merged = { ...existing, ...incoming };
//         // preserve imageUrls if incoming doesn't provide it or it's empty
//         if (!incoming.imageUrls || (Array.isArray(incoming.imageUrls) && incoming.imageUrls.length === 0)) {
//           merged.imageUrls = existing.imageUrls || [];
//         }
//         // preserve score if incoming doesn't provide
//         if (incoming.score === undefined) {
//           merged.score = existing.score;
//         }
//         // preserve other nested fields as needed — add similar lines for other nested pieces
//         return merged;
//       };

//       if (selIndex !== -1) {
//         updatedSelectedObservations[selIndex] = mergePreserve(updatedSelectedObservations[selIndex], trimmedObj);
//       } else {
//         // If new, try to preserve imageUrls from AllObservations if there's a match there
//         const existingInAll = updatedAllObservations.find(e => matchRow(e, trimmedObj));
//         const toPush = existingInAll ? mergePreserve(existingInAll, trimmedObj) : { ...trimmedObj, imageUrls: trimmedObj.imageUrls || [] };
//         updatedSelectedObservations.push(toPush);
//       }

//       if (allIndex !== -1) {
//         updatedAllObservations[allIndex] = mergePreserve(updatedAllObservations[allIndex], trimmedObj);
//         // ensure selected copy is marked selected
//         updatedAllObservations[allIndex].is_selected = 1;
//       } else {
//         const existingInSel = updatedSelectedObservations.find(e => matchRow(e, trimmedObj));
//         const toPushAll = existingInSel ? mergePreserve(existingInSel, trimmedObj) : { ...trimmedObj, imageUrls: trimmedObj.imageUrls || [], is_selected: 1 };
//         updatedAllObservations.push(toPushAll);
//       }
//     }

//     // After merging edits, ensure that any selectedObservations that have matching AllObservations get consistent imageUrls and is_selected flag
//     const allMap = {};
//     updatedAllObservations.forEach(a => {
//       const k = getRowKey(a);
//       if (k) allMap[k] = a;
//     });

//     updatedSelectedObservations = updatedSelectedObservations.map(s => {
//       const k = getRowKey(s);
//       if (k && allMap[k]) {
//         // merge but preserve existing nested arrays if missing in s
//         return {
//           ...allMap[k],
//           ...s,
//           imageUrls: (s.imageUrls && s.imageUrls.length > 0) ? s.imageUrls : (allMap[k].imageUrls || []),
//           is_selected: 1,
//         };
//       }
//       return s;
//     });

//     // De-duplicate both lists using getRowKey (keep the last merged instance)
//     const dedupeByKey = (arr) => {
//       const map = new Map();
//       for (const item of arr) {
//         const k = getRowKey(item) || JSON.stringify(item); // fallback to stringify (rare)
//         map.set(k, item);
//       }
//       return Array.from(map.values());
//     };

//     updatedSelectedObservations = dedupeByKey(updatedSelectedObservations);
//     updatedAllObservations = dedupeByKey(updatedAllObservations);

//     // Regroup by area
//     updatedSelectedObservations = regroupByArea(updatedSelectedObservations);
//     updatedAllObservations = regroupByArea(updatedAllObservations);

//     // Update UI state
//     setSelectedObservations([...updatedSelectedObservations]);
//     setAllObservations([...updatedAllObservations]);

//     // Prepare payload for backend if edited rows exist
//     if (isReportEdited && editedObservations.length > 0) {
//       const payload = editedObservations
//         .map(({ sr_no, score, edited_fields, tempId, ...rest }) => ({
//           ...trimObjectFields(rest),
//           edited_fields: edited_fields || [],
//         }))
//         .filter((item) => Object.keys(item).length > 0);

//       if (payload.length > 0) {
//         await axios.post(`${config.PATH}/api/insert-new-row`, payload);
//       }
//     }

//     // Prepare report data (trimmed)
//     const reportData = trimObjectFields({
//       report_id: selectedReportData.report_id,
//       user_id: userId,
//       date_time: selectedDateTime,
//       organization: selectedOrganization?.label || selectedOrganization,
//       site: selectedSite?.label || selectedSite,
//       org_id: selectedOrganization?.value || selectedOrganization,
//       area: selectedArea,
//       category: selectedCategory,
//       background_brief: backgroundBrief,
//       improvement_opportunity_areas: improvementOpportunityAreas,
//       overall_assessment_indicator: overallAssessmentIndicator,
//       contents,
//       exe_summary: exeSummary,
//       conclusion,
//       best_practice: bestPractice,
//       the_way_forward: theWayForward,
//       scores,
//       cumulative: cumulativeScore,
//       is_edited: isReportEdited,
//       other_details: otherDetails,
//       is_complete: complete === true,
//       start_date: startDate,
//       end_date: endDate,
//       is_saved: true,
//     });

//     const cmvEndPoint = `${config.PATH}/api/save-update-cmv-report`;
//     const reportEndPoint = `${config.PATH}/api/save-update-report`;

//     if (module === "cmv") {
//       await axios.post(cmvEndPoint, reportData);
//     } else if (complete === true && module !== "cmv") {
//       await axios.post(cmvEndPoint, reportData);
//       await axios.post(reportEndPoint, reportData);
//     } else {
//       await axios.post(reportEndPoint, reportData);
//     }

//     const observationsData = {
//       report_id: selectedReportData.report_id,
//       all_observations: updatedAllObservations.map(trimObjectFields),
//       organization: selectedOrganization?.label || selectedOrganization,
//       site: selectedSite?.label || selectedSite,
//     };

//     console.log("updated data", updatedAllObservations);
//     console.log("select", updatedSelectedObservations);

//     const observationEndPoint = `${config.PATH}/api/save-update-observations`;
//     const cmvObservationEndPoint = `${config.PATH}/api/save-update-cmv-observations`;

//     if (module === "cmv") {
//       await axios.post(cmvObservationEndPoint, observationsData);
//     } else if (complete === true && module !== "cmv") {
//       await axios.post(cmvObservationEndPoint, observationsData);
//       await axios.post(observationEndPoint, observationsData);
//     } else {
//       await axios.post(observationEndPoint, observationsData);
//     }

//     // finalize UI
//     setIsSaved(true);
//     setEditedObservations([]);
//     setCurrentEditedRow(-1);
//     setIsEditing(false);
//     setDisableSaveNext(false);
//     getAllData();
//     updateOrgReportStatus();
//     updateSiteReportStatus();
//     setEditedFields([]);
//     setConfirmationShown(false);
//     toast.success(`${complete === true ? "Report completed and Saved" : "Report Saved"}`);
//     saveCriticalObservations(complete);
//     saveFacilityInfo();
//     setLoading(false);
//   } catch (error) {
//     if (error.message !== "Empty field found in edited observations") {
//       console.error("Error saving report:", error);
//       toast.error("Error saving report.");
//     }
//     setLoading(false);
//   }
// };



  const saveCriticalObservations = async (complete) => {
    try {
      // Create a new array with objects excluding the 'id' field
      const observationsToSave = criticalObservations.map(
        ({ id, ...observation }) => observation
      );

      // if (observationsToSave.length === 0) {
      //   console.log("No observations to save.");
      //   return;
      // }

      const payload = {
        criticalObservations: observationsToSave,
        report_id: selectedReportData.report_id,
      };

      // await axios.post(
      //   module === "cmv"
      //     ? `${config.PATH}/api/save-critical-cmv-observations`
      //     : `${config.PATH}/api/save-critical-observations`,
      //   payload
      // )

      const criticalObsEndPoint = `${config.PATH}/api/save-critical-observations`;
      const cmvCriticalObsEndPoint = `${config.PATH}/api/save-critical-cmv-observations`;

      // if (complete === true && module !== "cmv") {
      //   console.log("only true")
      //   await axios.post(cmvCriticalObsEndPoint, payload);
      //   await axios.post(criticalObsEndPoint, payload);
      // } else if (complete === true && module === "cmv") {
      //   console.log("both")
      //   await axios.post(cmvCriticalObsEndPoint, payload);
      // } else {
      //   console.log("nothing")
      //   await axios.post(criticalObsEndPoint, payload);
      // }

      if (module === "cmv") {
        // console.log("1");
        await axios.post(cmvCriticalObsEndPoint, payload);
      } else if (complete === true && module !== "cmv") {
        // console.log("2");
        await axios.post(cmvCriticalObsEndPoint, payload);
        await axios.post(criticalObsEndPoint, payload);
      } else {
        // console.log("3");
        await axios.post(criticalObsEndPoint, payload);
      }

      // console.log("Critical observations saved successfully.");
    } catch (error) {
      console.log("Error saving critical observations:", error.message);
    }
  };

  const handleChange = (e, name) => {
    setIsSaved(false);
    if (name === "background") {
      setBackgroundBrief(e.target.value);
    } else if (name === "improvementOpportunityAreas") {
      setImprovements(e.target.value);
    } else if (name === "overallAssessmentIndicator") {
      setOverallAssessmentIndicator(e.target.value);
    } else if (name === "contents") {
      setContents(e.target.value);
    } else if (name === "exe") {
      setExeSummary(e.target.value);
    } else if (name === "conclusion") {
      setConclusion(e.target.value);
    } else if (name === "other details") {
      setOtherDetails(e.target.value);
    } else if (name === "best_practice") {
      setbestPractice(e.target.value);
    } else if (name === "the_way_forward") {
      setTheWayForward(e.target.value);
    }
  };

  const handleNext = () => {
    const latestBackgroundBrief = editor.current?.editor?.getHTML?.() || backgroundBrief;
    setBackgroundBrief(latestBackgroundBrief); // update state if needed for export
    const unsavedCritical = criticalObservations.some(obs => !obs.observation?.trim());

    if (unsavedCritical) {
      toast.warning("Please save the critical observations before proceeding.");
      return;
    }
    if (otherDetails.trim()) {
      toast.warning("Please add the Other critical observation before proceeding.");
      return;
    }
    // if (screenNumber === 6 && isRowSaved === false) {
    //   toast.warning(
    //     "Please save the new row by clicking on tick action button."
    //   );
    //   setLoading(false);
    //   return;
    // }

    if (isEditing) {
      toast.warning("Please save changes before proceeding.");
      return;
    }
    setScreenNumber(screenNumber + 1);
    // setOpenReportList(false);
  };

  const handlePrev = () => {
    const latestBackgroundBrief = editor.current?.editor?.getHTML?.() || backgroundBrief;
    setBackgroundBrief(latestBackgroundBrief); // ensures the content is synced

    const unsavedCritical = criticalObservations.some(obs => !obs.observation?.trim());

    if (unsavedCritical) {
      toast.warning("Please save the critical observations before going back.");
      return;
    }
    if (otherDetails.trim()) {
      toast.warning("Please add the Other critical observation before going back.");
      return;
    }
    // if (screenNumber === 6 && isRowSaved === false) {
    //   toast.warning(
    //     "Please save the new row by clicking on tick action button."
    //   );
    //   setLoading(false);
    //   return;
    // }

    if (isEditing) {
      toast.warning("Please save changes before going back.");
      return;
    }
    setScreenNumber(screenNumber - 1);
  };

  const removeItem = (index) => {
    const updatedObservations = [...criticalObservations];
    updatedObservations.splice(index, 1);
    setCriticalObservations(updatedObservations);
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const img = new Image();

      img.onload = () => {
        const MAX_WIDTH = 800; // Maximum width for the compressed image
        const MAX_HEIGHT = 800; // Maximum height for the compressed image

        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.7); // 0.7 is the image quality (0.0 - 1.0)
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (index, files) => {
    const selectedObsCopy = [...selectedObservations];
    const obsCopy = [...AllObservations];
    const editedObsCopy = [...editedObservations];

    if (!selectedObsCopy[index].imageUrls) {
      selectedObsCopy[index].imageUrls = [];
    }

    try {
      setLoading(true);

      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          throw new Error("Only image files are allowed.");
        }

        const compressedImage = await compressImage(file);

        const formData = new FormData();
        formData.append("image", compressedImage);

        const response = await axios.post(
          `${config.PATH}/api/upload/image `,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const imageUrl = response.data.imageUrl;
        selectedObsCopy[index].imageUrls.push(imageUrl);

        // Update editedObservations if it has values
        if (editedObsCopy.length > 0) {
          const editedIndex = editedObsCopy.findIndex(
            (observation) =>
              observation.refIndex === selectedObsCopy[index].refIndex
          );
          if (editedIndex !== -1) {
            editedObsCopy[editedIndex].imageUrls =
              selectedObsCopy[index].imageUrls;
          }
        }
      }

      selectedObsCopy.forEach((e) => {
        obsCopy[e.refIndex] = {
          ...obsCopy[e.refIndex],
          imageUrls: e.imageUrls,
        };
      });

      setSelectedObservations(selectedObsCopy);
      setAllObservations(obsCopy);

      // Update editedObservations only if it has values
      if (editedObsCopy.length > 0) {
        setEditedObservations(editedObsCopy);
      }

      setLoading(false);
      toast.success("Images uploaded successfully!");
    } catch (error) {
      console.log("Error uploading image:", error);
      toast.error(error.message);
    }
  };

  const handleRemoveImage = (index, imageIndex) => {
    const selectedObsCopy = [...selectedObservations];
    const obsCopy = [...AllObservations];

    if (selectedObsCopy[index].imageUrls) {
      selectedObsCopy[index].imageUrls.splice(imageIndex, 1);

      // If there are no more images in the array, remove the property
      if (selectedObsCopy[index].imageUrls.length === 0) {
        delete selectedObsCopy[index].imageUrls;
      }

      // Update the corresponding observation in obsCopy
      obsCopy[selectedObsCopy[index].refIndex] = {
        ...obsCopy[selectedObsCopy[index].refIndex],
        imageUrls: selectedObsCopy[index].imageUrls,
      };

      // Update state
      setSelectedObservations(selectedObsCopy);
      setAllObservations(obsCopy);
    }
  };

  const handleClose = () => {
    if (isEditing) {
      toast.warning("Please save changes before closing the report.");
      return;
    } else if (!isSaved && screenNumber !== 1 && !exp) {
      toast.warning("Please save the report before closing.");
      return;
    } else {
      closeReport();
    }
  };

  const closeReport = () => {
    if (isAnyScoreEmpty()) {
      toast.warning("Please fill the score table before closing the report.");
      return;
    }
    setOpenSavedReport(false);
  };

  const handleOpenDrawer = () => {
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleDuplicateRow = (index) => {
    if (isEditing) {
      toast.warn(
        "Please finish editing the current row before adding a new row."
      );
      return;
    }

    const selectedOriginalRow = selectedObservations[index];

    // Check if imageUrls is defined, and create a deep copy if it is, or an empty array otherwise
    const duplicatedRowForSelected = {
      ...selectedOriginalRow,
      refIndex: selectedOriginalRow.refIndex + 1,
      imageUrls: selectedOriginalRow.imageUrls
        ? [...selectedOriginalRow.imageUrls]
        : [],
    };

    const updatedAllObservations = [...AllObservations];
    const updatedSelectedObservations = [...selectedObservations];

    updatedAllObservations.splice(selectedOriginalRow.refIndex + 1, 0, {
      ...duplicatedRowForSelected,
      is_selected: 1,
    });
    updatedSelectedObservations.splice(index + 1, 0, duplicatedRowForSelected);

    setAllObservations(updatedAllObservations);
    setSelectedObservations(updatedSelectedObservations);

    toast.success("New row added");
  };
//    const handleDeleteRow = (index) => {
//       if (isEditing && currentEditedRow !== index) {
//         toast.warn("Please finish editing the current row before deleting the row.");
//         return;
//       }
    
//       if (selectedObservations.length === 1) {
//         toast.warn("Cannot delete the last row.");
//         return;
//       }
    
//       closeAllSelectMenus(); // Optional, but consider managing this with state
    
//       // Clone arrays
//       const updatedSelectedObservations = [...selectedObservations];
//       const updatedAllObservations = [...AllObservations];
//       // console.log("before",selectedObservations);
  
    
//       // Get the correct refIndex BEFORE deleting from selectedObservations
//       const refIndexToDelete = updatedSelectedObservations[index].refIndex;
 
//       // updatedAllObservations.forEach((data,i)=>{

//       //   if(i==refIndexToDelete){data.is_selected =0}
   
   
// // })
//       // Remove from observations first using correct refIndex
//       updatedAllObservations.splice(refIndexToDelete, 1);
    
//       // Then remove from selectedObservations
//       updatedSelectedObservations.splice(index, 1);
    
//       // Rebuild refIndexes correctly
//       const reindexedSelected = updatedSelectedObservations.map((item, idx) => ({
//         ...item,
//         refIndex: idx, // Update refIndex to match new position
//       }));
      
//       // Update state using functional updates to ensure you're working with the latest state
//       setSelectedObservations(reindexedSelected);
//       setAllObservations(updatedAllObservations);
//       setIsEditing(false);
//       setEditedObservations([]);
//       setCurrentEditedRow(-1);
//       toast.error("Row deleted");
//       // console.log("after",selectedObservations)
//     };
const handleDeleteRow= (index) => {
  if (isEditing && currentEditedRow !== index) {
    toast.warn("Please finish editing the current row before deleting the row.");
    return;
  }

  if (selectedObservations.length === 1) {
    toast.warn("Cannot delete the last row.");
    return;
  }

  closeAllSelectMenus();

  const updatedSelectedObservations = [...selectedObservations];
  const updatedAllObservations = [...AllObservations];

  const rowToDelete = updatedSelectedObservations[index];

  // Identify uniquely using tempId if available
  const identifier = rowToDelete.tempId 
    ? (row) => row.tempId === rowToDelete.tempId 
     : (row) => row.id === rowToDelete.id
    // : (row) => row.sr_no === rowToDelete.sr_no

  const allIndexToDelete = updatedAllObservations.findIndex(identifier);
  if (allIndexToDelete !== -1) {
    updatedAllObservations.splice(allIndexToDelete, 1);
  }

  updatedSelectedObservations.splice(index, 1);

  // Reassign refIndex properly
  const reindexedSelected = updatedSelectedObservations.map((item, idx) => ({
    ...item,
    refIndex: idx,
  }));

  setSelectedObservations(reindexedSelected);
  setAllObservations(updatedAllObservations);
  setIsEditing(false);
  setEditedObservations([]);
  setCurrentEditedRow(-1);
  toast.error("Row deleted");
};

  const handleScoreChange = (index, value) => {
    setIsSaved(false);
    // Ensure the value is a number and within the range [0, 2]
    const parsedValue = parseFloat(value);
    const scoreValue = isNaN(parsedValue)
      ? ""
      : Math.min(5.0, Math.max(0, parsedValue));

    // const updatedScores = [...scores];
    // updatedScores[index]["Score Obtained"] = scoreValue;
        const updatedScores = scores.map((row, i) =>
    i === index ? { ...row, "Score Obtained": scoreValue } : row
  );
    setScores(updatedScores);
  };

  const isAnyScoreEmpty = () => {
    return scores.some((score) => score["Score Obtained"] === "");
  };

  const handleObservationEdit = (index, e) => {
    setDisableSaveNext(true);
    const updatedObservations = [...criticalObservations];
    updatedObservations[index].observation = e.target.value;
    setCriticalObservations(updatedObservations);
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

  const updateOrgReportStatus = () => {
    try {
      const org_id = selectedOrganization.value;
      axios.post(`${config.PATH}/api/update-org-report-status/${org_id}`);
    } catch (error) {
      console.log(error.message);
    }
  };

  const updateSiteReportStatus = () => {
    try {
      const org_id = selectedOrganization.value;
      const site_name = selectedSite.value;
      axios.post(
        `${config.PATH}/api/update-site-report-status/${org_id}/${site_name}`
      );
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleComplete = async () => {
    if (!isSaved) {
      toast.warning("Please save the report before marking as complete.");
      return;
    }
    const userConfirmed = window.confirm(
      `Are you sure you want to mark this report as complete? Once done action cannot be reversed and you cannot edit the report.`
    );

    if (!userConfirmed) {
      return;
    }
    setIsComplete(true);
    handleSave(true);
    closeReport();
    setOpenReportList(false);
    getAllReports();
  };

  useEffect(() => {
    const uniqueCategories = new Set();
    const filteredOptions = [];

    allData.data.forEach((e) => {
      if (area.includes(e.area) && !uniqueCategories.has(e.category)) {
        filteredOptions.push({ value: e.category, label: e.category });
        uniqueCategories.add(e.category);
      }
    });

    setCategoryOptions(filteredOptions);
  }, [getAllData, area]);

  const customSelectStylesCreatable = {
    control: (provided) => ({
      ...provided,
      // borderBottom: "none", // Hide the separator
      boxShadow: "none", // Hide the box shadow
      cursor: "pointer", // Show the pointer cursor
      width: "150px",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      borderLeft: 0, // Hide the vertical separator beside the dropdown indicator
      padding: 0,
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999, // Increase the z-index
      position: "absolute",
    }),
  };

  const getObservationVariants = async (observation, index) => {
    try {
      if (isEditing && currentEditedRow !== index) {
        toast.warn("Please finish editing the current row.");
        return;
      }
      const payload = {
        observation,
        report: "saved",
      };
      const response = await axios.post(
        `${config.PATH}/api/search-by-observation`,
        payload
      );
      
      // Ensure the response data is an array
      if (Array.isArray(response.data)) {
        // Add variant: true to each item in the response data
        const updatedVariants = response.data.map((item) => ({
          ...item,
          variant: true,
        }));
        setObservationVariants(updatedVariants);
        setOpenVariantModal(true);
      } else {
        console.log("Unexpected response data format:", response.data);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleConfirmSelection = (selectedVariants, removedItems) => {
    let map = {};

    const getId = (item) => item.sr_no || item.id || item.tempId;

    // Update both states with the selected variants
    setSelectedObservations(
      [...selectedObservations, ...selectedVariants].filter((e) => {
        const id = getId(e);
        if (!(map[id] || removedItems.includes(id))) {
          map[id] = true;
          return true;
        } else {
          return false;
        }
      })
    );

    map = {};
    setAllObservations(
      [...AllObservations, ...selectedVariants].filter((e) => {
        const id = getId(e);
        if (!(map[id] || removedItems.includes(id))) {
          map[id] = true;
          return true;
        } else {
          return false;
        }
      })
    );
  };

  const closeVariantModal = () => {
    setOpenVariantModal(false);
  };

  const criticalityOptions = [
    { value: "High", label: "High" },
    { value: "Medium", label: "Medium" },
    { value: "Low", label: "Low" },
  ];

  const filteredObservations = AllObservations.filter(
    (observation) =>
      observation.observation
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      observation.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      observation.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group filtered observations by area
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
  const filteredAllData = allDataForGlobalSearch.filter(
    (observation) =>
      observation.observation
        .toLowerCase()
        .includes(globalSearchTerm.toLowerCase()) ||
      observation.area.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
      observation.category
        .toLowerCase()
        .includes(globalSearchTerm.toLowerCase())
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

  useEffect(() => {
    handleEmptyFields();
  }, [newRow]);

  const handleEmptyFields = () => {
    const isEmpty = Object.entries(newRow).every(([key, value]) => {
      if (key === "is_selected") return true; // ignore the is_selected field
      if (Array.isArray(value)) {
        return value.length === 0;
      } else {
        return value === "";
      }
    });
    if (isEmpty) {
      setIsRowSaved(true); // Set isNewRowSaved to true if all fields are empty
    }
  };

  const handleChangeNewRow = (e, field) => {
    const value = e.target.value;
    if (
      (field === "area" || field === "category" || field === "criticality") &&
      value.length > 100
    ) {
      alert(`${field} cannot exceed 100 characters.`);
      return; // Do not update the state if validation fails
    }
    setNewRow((prev) => ({ ...prev, [field]: value, is_selected: 1 }));
    setIsRowSaved(false); // Set isNewRowSaved to false if any change is made
  };

  const handleChangeNewRow2 = (selectedOption, field) => {
    const value = selectedOption ? selectedOption.value : ""; // Ensure selectedOption is not undefined
    if ((field === "area" || field === "category" || field === "criticality") && value.length > 100) {
      alert(`${field} cannot exceed 100 characters.`);
      return; // Do not update the state if validation fails
    }
    if (field === "area") {
      let area = [];
      area.push(selectedOption.value);
      setArea(area);
    }
    setNewRow((prev) => ({ ...prev, [field]: value, is_selected: 1 }));
    setIsRowSaved(false); // Set isNewRowSaved to false if any change is made
  };


  const handleAddRow = () => {
    if (
      !newRow.area.trim() ||
      !newRow.observation.trim() ||
      !newRow.recommendations.trim() ||
      (typeof newRow.is_reference === "string" && !newRow.is_reference.trim())
    ) {
      toast.warning("Area, Observation, Recommendations & IS Reference fields cannot be empty.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
      return;
    }

    const trimmedRow = {
      ...newRow,
      area: newRow.area.trim() || "N/A",
      category: newRow.category.trim() || "N/A",
      check_points: newRow.check_points.trim() || "N/A",
      observation: newRow.observation.trim() || "N/A",
      criticality: newRow.criticality.trim() || "N/A",
      recommendations: newRow.recommendations.trim() || "N/A",
      is_reference: newRow.is_reference.trim() || "N/A",
      imageUrls: newRow.imageUrls.length > 0 ? newRow.imageUrls : [],
      isNew: true,
      tempId: Date.now() % 1000000,
    };

    const insertRowAtCorrectPosition = (rows, newRow) => {
      const insertIndex = rows.findIndex((row) => row.area === newRow.area);
      if (insertIndex === -1) {
        return { updatedRows: [...rows, newRow], newIndex: rows.length };
      } else {
        let lastAreaIndex = insertIndex;
        for (let i = insertIndex + 1; i < rows.length; i++) {
          if (rows[i].area === newRow.area) {
            lastAreaIndex = i;
          } else {
            break;
          }
        }
        const before = rows.slice(0, lastAreaIndex + 1);
        const after = rows.slice(lastAreaIndex + 1);
        const updatedRows = [...before, newRow, ...after];
        return { updatedRows, newIndex: lastAreaIndex + 1 };
      }
    };


    setSelectedObservations((prev) => {
      const { updatedRows, newIndex } = insertRowAtCorrectPosition(prev, trimmedRow);
      trimmedRow.selectedRefIndex = newIndex;
      return updatedRows;
    });

    setAllObservations((prev) => {
      const { updatedRows, newIndex } = insertRowAtCorrectPosition(prev, trimmedRow);
      trimmedRow.refIndex = newIndex;
      return updatedRows;
    });

    setEditedObservations((prev) => [...prev, trimmedRow]);
    setIsReportEdited(true);
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
//  console.log("selected observation",selectedObservations)
//   console.log("allObservations",AllObservations)
  };


  const getFacilityInfo = async () => {
    const response = await axios.get(
      `${config.PATH}/api/get-electrical-facility-info/${selectedReportData.report_id}`
    );
    const data = response.data;
    // Update each field individually
    setFacilityInfo(data);
  };

  const saveFacilityInfo = async () => {
    try {
      const payload = {
        report_id: selectedReportData.report_id,
        facility_info: facilityInfo,
      };
      const res = await axios.post(
        `${config.PATH}/api/save-electrical-facility-info`,
        payload
      );
    } catch (err) {
      console.log(err.message);
    }
  };

  // the below function has been removed in electrical as of new request to remove screen 5 
  // const handleChangeFacilityInfo = (event) => {
  //   const { name, value } = event.target;
  //   setFacilityInfo((prevInfo) => ({
  //     ...prevInfo,
  //     [name]: value,
  //   }));
  // };

  // const handleNewKeyChange = (event) => {
  //   setNewKey(event.target.value);
  // };

  // const handleNewValueChange = (event) => {
  //   setNewValue(event.target.value);
  // };

  // const handleAddNewField = () => {
  //   if (newKey && newValue) {
  //     const keyExists = facilityInfo.hasOwnProperty(newKey);
  //     const valueExists = facilityInfo[newKey] === newValue;

  //     if (keyExists) {
  //       alert("This field already exists.");
  //       return;
  //     }

  //     setFacilityInfo((prevInfo) => ({
  //       ...prevInfo,
  //       [newKey]: newValue,
  //     }));
  //     setNewKey("");
  //     setNewValue("");
  //   } else {
  //     alert("Please fill both the fields before adding.");
  //   }
  // };

  // const handleRemoveField = (key) => {
  //   if (Object.keys(facilityInfo).length === 1) {
  //     alert("Cannot remove the last field.");
  //     return;
  //   }

  //   const updatedFacilityInfo = { ...facilityInfo };
  //   delete updatedFacilityInfo[key];
  //   setFacilityInfo(updatedFacilityInfo);
  // };

  // const addObservation = () => {   //it adds a new line of observation in critical observation screen 7 to make it point wise
  //   setCriticalObservations([
  //     ...criticalObservations,
  //     { observation: otherDetails },
  //   ]);
  //   setOtherDetails(""); // Clear the text area after adding
  // };
  const [manualCriticalObservations, setManualCriticalObservations] = useState([]);

  // const addObservation = () => {
  //   // Check if there's already any empty observation
  //   const hasEmptyObservation = criticalObservations.some(
  //     (obs) => obs.observation.trim() === ""
  //   );

  //   if (hasEmptyObservation) {
  //     toast.warning("Please fill the existing empty critical observation before adding a new one!");
  //     return;
  //   }

  //   // Prepare new observation: either from user input or blank
  //   const newObservation = {
  //     observation: otherDetails.trim() !== "" ? otherDetails.trim() : ""
  //   };

  //   // Add to the end of the list
  //   setCriticalObservations([...criticalObservations, newObservation]);
  //   setOtherDetails(""); // Clear the input
  // };
  const addObservation = () => {
  const hasEmptyObservation = criticalObservations.some(
    (obs) => obs.observation.trim() === ""
  );

  if (hasEmptyObservation) {
    toast.warning("Please fill the existing empty critical observation before adding a new one!");
    return;
  }

  const newObservation = {
    observation: otherDetails.trim() !== "" ? otherDetails.trim() : ""
  };

  const updatedManual = [...manualCriticalObservations, newObservation];

  setManualCriticalObservations(updatedManual);

  // const selectedHigh = selectedObservations.filter((e) => e.criticality === "High");

  // setCriticalObservations([...selectedHigh, ...updatedManual]);
    const updatedCriticalObservations = [
    ...criticalObservations,
    newObservation
  ];

  setCriticalObservations(updatedCriticalObservations);
  setOtherDetails(""); // Clear input
};

  const handleOpenImageDialog = (index, observation) => {
    setSelectedObservation({ image: observation, index });
    setOpenDialog(true);
  };

  const handleCloseImageDialog = () => {
    setSelectedObservation({ image: null, index: null });
    setOpenDialog(false);
  };
const getCategoryOptions = (area) => {
  const uniqueCategories = new Set();         
  const filteredOptions = [];               

  allData.data.forEach((e) => {
    if (e.area === area && !uniqueCategories.has(e.category)) {
      filteredOptions.push({ value: e.category, label: e.category });
      uniqueCategories.add(e.category);       
    }
  });

  return filteredOptions;                  
};
const convertChartToImage = useCallback(async () => {
  try {
    if (!chartContainerRef.current) {
      console.error("chartContainerRef is null or undefined");
      return;
    }

    const contentHeight = chartContainerRef.current.scrollHeight;
    chartContainerRef.current.style.height = `${contentHeight}px`;

    const canvas = await html2canvas(chartContainerRef.current, {
      scrollY: -window.scrollY,
    });

    chartContainerRef.current.style.height = "300px";;

    const image = canvas.toDataURL("image/png");
    setChartImage(image);
  } catch (error) {
    console.log("Error converting div to image:", error);
  }
}, []);
useEffect(() => {
  if (screenNumber === 7) {
    // 1. Wait 1 second for chart rendering
    const chartTimeout = setTimeout(() => {
      convertChartToImage();

      // 2. Then wait another 1 second (or total 2 seconds) before enabling Next
      const nextTimeout = setTimeout(() => {
        setIsNextDisabled(false); // Enable Next button after 2 seconds
      }, 1000);

      return () => clearTimeout(nextTimeout);
    }, 1000);

    // Disable Next immediately when entering screen 9
    setIsNextDisabled(true);

    // Cleanup both timers
    return () => clearTimeout(chartTimeout);
  }
}, [scores, cumulativeScore, convertChartToImage, screenNumber]);

//  const gaugeContainerRef = useRef(null);
//    const [gaugeImage, setGaugeImage] = useState(null);

//  const convertGaugeToImage = useCallback(async () => {
//     try {
//       if (!gaugeContainerRef.current) {
//         console.error("gaugeContainerRef is null or undefined");
//         return;
//       }

//       // Capture
//       const canvas = await html2canvas(gaugeContainerRef.current, {
//         scrollY: -window.scrollY,
//       });

//       const image = canvas.toDataURL("image/png");
//       setGaugeImage(image);
//        console.log("gag",gaugeImage);
//     } catch (error) {
//       console.log("Error converting gauge to image:", error);
//     }
//   }, []);
// console.log("gag",gaugeImage);
// useEffect(() => {
//     if (screenNumber === 8) {
    

//       const chartTimeout = setTimeout(() => {
//         convertGaugeToImage();

//         const nextTimeout = setTimeout(() => {
  
//         }, 1000);

//         return () => clearTimeout(nextTimeout);
//       }, 1000);

//       return () => clearTimeout(chartTimeout);
//     }
//   }, [screenNumber, convertGaugeToImage]);
  const riskLevels = [
  {
    range: "≥ 85%",
    risk: "Low Risk",
    color: "#00A651",
    interpretation: "Electrical systems and controls are well maintained, only minor improvements needed.",
  },
  {
    range: "65% – 84%",
    risk: "Medium Risk",
    color: "#FFFF00",
    interpretation: "Controls are adequate but with noticeable weaknesses.",
  },
  {
    range: "25% – 64%",
    risk: "High Risk",
    color: "#FFA500",
    interpretation: "High vulnerabilities with major compliance gaps.",
  },
  {
    range: "≤ 25%",
    risk: "Severe Risk",
    color: "#FF0000",
    interpretation: "Controls are ineffective, urgent corrective action required.",
  },
];
const getRiskLevel = (score) => {
  if (score >= 85) return riskLevels[0];
  if (score >= 65) return riskLevels[1];
  if (score >= 25) return riskLevels[2];
  return riskLevels[3];
};

const currentRisk = getRiskLevel((cumulativeScore / 25) * 100);
// const cleanHTML = (html) => {
//   if (!html) return "";

//   return html
//     // Replace multiple empty paragraphs (<p><br></p>) with one
//     .replace(/(<p>\s*(<br\s*\/?>)*\s*<\/p>){2,}/gi, "<p><br></p>")
//     // Fix multiple <p> gaps by replacing with a single one
//     .replace(/<\/p>\s*<p>\s*<\/p>\s*<p>/gi, "</p><p>")
//     // Optional: normalize consecutive <p> tags (large paragraph gaps)
//     .replace(/<\/p>\s*<p>/g, "</p><br><p>")
//     // Trim leading/trailing whitespace
//     .trim();
// };
  const cleanHTML = (html) => {
  if (!html) return "";

  return html
    // (<p><br></p>)
    .replace(/(<p>\s*(<br\s*\/?>)*\s*<\/p>){2,}/gi, "<p><br></p>")
    .replace(/(<p>\s*(<br\s*\/?>)*\s*<\/p>)+/gi, "")
    // multiple <p> gaps by replacing with a single one
    .replace(/<\/p>\s*<p>\s*<\/p>\s*<p>/gi, "</p><p>")
    // consecutive <p> tags (large paragraph gaps)
    .replace(/<\/p>\s*<p>/g, "</p><br><p>")
    .replace(/(<br\s*\/?>\s*){2,}/gi, "<br>")
     .replace(/¶/g, "")        // Remove literal pilcrow
    .replace(/&para;/g, "")   // Remove encoded pilcrow
    .replace(/\u00B6/g, "")
    .trim();
};

  if (screenNumber === 1) {
    return (
      <div>
        {loading ? <Loader /> : null}
        <Modal open={true} onClose={handleClose}>
          <div className="modal-container">
            <div className="modal-header">
              <Typography variant="h5">
                {module === "cmv" ? " Electrical CMV Report" : "Saved Report"}
              </Typography>
              <button className="custom-close-button" onClick={handleClose}>
                &#10005; {/* Unicode for 'X' */}
              </button>
            </div>
            <div className="modal-content">
              <div className="modal-body">
                <div className="report-id">
                  Report ID: {`${selectedReportData.report_id}`}
                </div>
                {/* Report ID: {`${selectedReportData.report_id}`} */}
                <Typography variant="body1" component="div">
                  <div className="select-container">
                    
                    <CreatableSelect
                      placeholder="Organization"
                      options={orgList.map((e) => ({
                        label: e.org_name,
                        value: e.id,
                      }))}
                      onChange={handleOrganizationSelection}
                      value={selectedOrganization}
                      isSearchable
                      isClearable
                      isDisabled
                    />
                    <CreatableSelect
                      placeholder="Site"
                      options={siteOptions}
                      onChange={handleSiteSelection}
                      value={selectedSite}
                      isSearchable
                      isClearable
                      // isDisabled={!selectedOrganization}
                      isDisabled={true}
                    />
                  </div>

                  <div className="flex-container-start-end-date">
                    <div className="to-date-from-date">
                      <DatePicker
                        selected={new Date(startDate)}
                        onChange={(e) => handleStartEndDate(e, "start-date")}
                        onCalendarOpen={() => setIsStartDatePickerOpen(true)}
                        onCalendarClose={() => setIsStartDatePickerOpen(false)}
                        ref={startDateRef}
                        className="class-for-date-pickers"
                        placeholderText="Audit Start Date"
                        dateFormat="dd-MM-yyyy"
                        utcOffset={0}
                        maxDate={new Date(endDate)}
                        todayButton={"Today"}
                      />
                    </div>
                    <div className="to-date-from-date">
                      <DatePicker
                        selected={new Date(endDate)}
                        onChange={(e) => handleStartEndDate(e, "end-date")}
                        onCalendarOpen={() => setIsEndDatePickerOpen(true)}
                        onCalendarClose={() => setIsEndDatePickerOpen(false)}
                        ref={endDateRef}
                        className="class-for-date-pickers"
                        placeholderText="Audit End Date"
                        dateFormat="dd-MM-yyyy"
                        utcOffset={0}
                        minDate={new Date(startDate)}
                        todayButton={"Today"}
                      />
                    </div>
                  </div>
                  <div className="flex-container">
                    <Select
                      className="select"
                      placeholder="Area"
                      options={areaList.map((area) => ({
                        label: area,
                        value: area,
                      }))}
                      onChange={(e) => handleChangeArea(e)}
                      isMulti={true}
                      defaultValue={selectedArea.map((area) => ({
                        label: area,
                        value: area,
                      }))}
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
                      options={[...new Set(categoryList)].map((cat) => ({
                        label: cat,
                        value: cat,
                      }))}
                      onChange={(e) => handleChangeCategory(e)}
                      isMulti={true}
                      value={selectedCategory.map((cat) => ({
                        label: cat,
                        value: cat,
                      }))}
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
                  </div>
                </Typography>

                <div className="observation-and-global-search">
                  <div className="observations-container">
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <input
                        type="text"
                        placeholder="Search Observations"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                      />
                      <div>
                        <button onClick={handleOpenDrawer} className="search-bar-button">
                          <span className="search-icon">&#128269;</span> {/* Unicode for search icon */}
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
                              <Typography component="span" sx={{ width: "33%", flexShrink: 0 }}>
                                {area}
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
      onChange={() => handleObservationSelection(observation, AllObservations.indexOf(observation))}
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
      onChange={() => handleObservationSelection(observation, AllObservations.indexOf(observation))}
    />
    <span>
      {observation.observation.replace(/\s+/g, ' ').trim()} (
      <span style={{ fontWeight: "bold" }}>{observation.category}</span>
      )
    </span>
    {observation.isNote && <span className="note-label">(Note)</span>}
    {observation.variant && <span className="variant-label">(Variant)</span>}
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
                    className="button-styles"
                    onClick={handleProceed}
                    disabled={
                      selectedObservations.length === 0 ||
                      !selectedSite ||
                      !selectedOrganization ||
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
                  >
                    Proceed
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    );
  } else if (screenNumber === 2) {
    return (
      <div>
        {loading ? <Loader /> : null}
        <Modal open={true} onClose={handleClose}>
          <div className="review-modal-container">
            <div className="review-modal-content">
              <div className="review-modal-header">
                <Typography variant="h6">
                  {module === "cmv" ? " Electrical CMV Report" : "SAVED REPORT"} : BACKGROUND - PROJECT BRIEF
                </Typography>
                <button className="custom-close-button" onClick={handleClose}>
                  &#10005; {/* Unicode for 'X' */}
                </button>
              </div>
              <div className="review-modal-body" style={{ overflowY: "auto" }}>
                <Typography variant="body1" component="div">
                  <div>

                    <JoditEditor
                      ref={editor}
                      placeholder="Enter your text here"
                      value={backgroundBrief}
                      // config={config}
                      config={{
                        ...config,
                        readonly: false,
                        toolbarSticky: false,
                        askBeforePasteFromHTML: false,
                        askBeforePasteFromWord: false,
                        processPasteFromWord: true,
                        defaultActionOnPaste: 'insert_clear_html',  // Clears formatting but keeps structure
                        pasteHTMLAction: 'insert_clear_html',
                        disablePlugins: ['pasteDialog', 'paste'],
                        cleanHTML: {
                          removeStyles: true,
                          removeClasses: true,
                        },
                        pasteFromClipboard: true,

                      }}
                      tabIndex={1}
                      // onBlur={(newContent) => setBackgroundBrief(newContent)} 
                      onBlur={(newContent) => {
        const cleaned = cleanHTML(newContent);
        setBackgroundBrief(cleaned);
        if (editor.current) {
          editor.current.value = cleaned;
        }
      }}
                    // onChange={(newContent) => { setBackgroundBrief(newContent) }} // Updates state on every change
                    />
                  </div>
                </Typography>
              </div>
              <hr />
              <div className="review-modal-footer">
                <button
                  className="button-styles"
                  onClick={handleSave}
                  style={{ background: "#efc71d" }}
                >
                  Save
                </button>
                <button
                  className="button-styles"
                  onClick={handlePrev}
                  style={{ background: "#efc71d" }}
                >
                  &#171; Prev
                </button>
                <button
                  className="button-styles"
                  color="primary"
                  onClick={() => handleNext()}
                  style={{ background: "#efc71d" }}
                >
                  Next &#187;
                </button>
              </div>
            </div>
          </div>
        </Modal>

      </div>
    );
  } else if (screenNumber === 3) {
    return (
      <>
        {loading ? <Loader /> : null}
        <Modal open={true} onClose={handleClose}>
          <div className="review-modal-container">
            <div className="review-modal-content">
              <div className="review-modal-header">
                <Typography variant="h6">
                  {module === "cmv" ? " Electrical CMV Report" : "SAVED REPORT"} : UNDERSTANDING THE REPORT.
                </Typography>
                <button className="custom-close-button" onClick={handleClose}>
                  &#10005; {/* Unicode for 'X' */}
                </button>
              </div>
              <div className="review-modal-body" style={{ overflowY: "auto" }}>
                <Typography variant="body1" component="div">
                  <div>
                    {/* <div className="sub-headings">
                      UNDERSTANDING OF THE REVIEW REPORT &#8208; CONTENTS.
                    </div>
                    <br />
                    <TextareaAutosize
                      value={contents}
                      onChange={(e) => handleChange(e, "contents")}
                      placeholder="Enter your text here"
                      className="text-area"
                      style={{ background: "whitesmoke" }}
                    /> */}
                    <JoditEditor
                      ref={editor}
                      placeholder="Enter your text here"
                      value={contents}
                      // config={config}
                      config={{
                        ...config,
                        readonly: false,
                        toolbarSticky: false,
                        askBeforePasteFromHTML: false,
                        askBeforePasteFromWord: false,
                        processPasteFromWord: true,
                        defaultActionOnPaste: 'insert_clear_html',  // Clears formatting but keeps structure
                        pasteHTMLAction: 'insert_clear_html',
                        disablePlugins: ['pasteDialog', 'paste'],
                        cleanHTML: {
                          removeStyles: true,
                          removeClasses: true,
                        },
                        pasteFromClipboard: true,

                      }}
                      tabIndex={1}
                      // onBlur={(newContent) => setContents(newContent)} /
                      onBlur={(newContent) => {
        const cleaned = cleanHTML(newContent);
        setContents(cleaned);
        if (editor.current) {
          editor.current.value = cleaned;
        }
      }}
                    // onChange={(newContent) => { setContents(newContent) }} // Updates state on every change
                    />
                  </div>
                </Typography>
              </div>
              <hr />
              <div className="review-modal-footer">
                <button
                  className="button-styles"
                  onClick={handleSave}
                  style={{ background: "#efc71d" }}
                >
                  Save
                </button>
                <button
                  className="button-styles"
                  onClick={handlePrev}
                  style={{ background: "#efc71d" }}
                >
                  &#171; Prev
                </button>
                <button
                  className="button-styles"
                  color="primary"
                  onClick={handleNext}
                  style={{ background: "#efc71d" }}
                >
                  Next &#187;
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </>
    );
  } 
  else if (screenNumber === 4) {
    return (
      <>
        {loading ? <Loader /> : null}
        <Modal open={true} onClose={handleClose}>
          <div className="review-modal-container">
            <div className="review-modal-content">
              <div className="review-modal-header">
                <Typography variant="h6">
                  {module === "cmv" ? " Electrical CMV Report" : "SAVED REPORT"} : EXECUTIVE SUMMARY
                </Typography>
                <button className="custom-close-button" onClick={handleClose}>
                  &#10005; {/* Unicode for 'X' */}
                </button>
              </div>
              <div className="review-modal-body" style={{ overflowY: "auto" }}>
                <Typography variant="body1" component="div">
                  <div>
                    <JoditEditor
                      ref={editor}
                      placeholder="Enter your text here"
                      value={exeSummary}
                      // config={config}
                      config={{
                        ...config,
                        readonly: false,
                        toolbarSticky: false,
                        askBeforePasteFromHTML: false,
                        askBeforePasteFromWord: false,
                        processPasteFromWord: true,
                        defaultActionOnPaste: 'insert_clear_html',  // Clears formatting but keeps structure
                        pasteHTMLAction: 'insert_clear_html',
                        disablePlugins: ['pasteDialog', 'paste'],
                        cleanHTML: {
                          removeStyles: true,
                          removeClasses: true,
                        },
                        pasteFromClipboard: true,

                      }}
                      tabIndex={1}
                      // onBlur={(newContent) => setExeSummary(newContent)} 
                      onBlur={(newContent) => {
        const cleaned = cleanHTML(newContent);
        setExeSummary(cleaned);
        if (editor.current) {
          editor.current.value = cleaned;
        }
      }}

                    />
                  </div>
                </Typography>
              </div>
              <hr />
              <div className="review-modal-footer">
                <button
                  className="button-styles"
                  onClick={handleSave}
                  style={{ background: "#efc71d" }}
                >
                  Save
                </button>
                <button
                  className="button-styles"
                  onClick={handlePrev}
                  style={{ background: "#efc71d" }}
                >
                  &#171; Prev
                </button>
                <button
                  className="button-styles"
                  color="primary"
                  onClick={handleNext}
                  style={{ background: "#efc71d" }}
                >
                  Next &#187;
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </>
    );
  }
  else if (screenNumber === 5) {
    return (
      <>
        {loading ? <Loader /> : null}
        <Modal open={true} onClose={handleClose}>
          <div className="review-modal-container">
            <div className="review-modal-content">
              <div className="review-modal-header">
                <Typography variant="h6">
                  {module === "cmv" ? " Electrical CMV Report" : "SAVED REPORT"} : IMPROVEMENT OPPORTUNITY AREAS (DEDUCTIBLES)
                </Typography>
                <button className="custom-close-button" onClick={handleClose}>
                  &#10005; {/* Unicode for 'X' */}
                </button>
              </div>
              <div className="review-modal-body" style={{ overflowY: "auto" }}>
                <Typography variant="body1" component="div">
                  <div>
                    <JoditEditor
                      ref={editor}
                      placeholder="Enter your text here"
                      value={improvementOpportunityAreas}
                      // config={config}
                      config={{
                        ...config,
                        readonly: false,
                        toolbarSticky: false,
                        askBeforePasteFromHTML: false,
                        askBeforePasteFromWord: false,
                        processPasteFromWord: true,
                        defaultActionOnPaste: 'insert_clear_html',  // Clears formatting but keeps structure
                        pasteHTMLAction: 'insert_clear_html',
                        disablePlugins: ['pasteDialog', 'paste'],
                        cleanHTML: {
                          removeStyles: true,
                          removeClasses: true,
                        },
                        pasteFromClipboard: true,

                      }}
                      tabIndex={1}
                      // onBlur={(newContent) => setImprovements(newContent)} 
                      onBlur={(newContent) => {
        const cleaned = cleanHTML(newContent);
        setImprovements(cleaned);
        if (editor.current) {
          editor.current.value = cleaned;
        }
      }}

                    />
                  </div>
                </Typography>
              </div>
              <hr />
              <div className="review-modal-footer">
                <button
                  className="button-styles"
                  onClick={handleSave}
                  style={{ background: "#efc71d" }}
                >
                  Save
                </button>
                <button
                  className="button-styles"
                  onClick={handlePrev}
                  style={{ background: "#efc71d" }}
                >
                  &#171; Prev
                </button>
                <button
                  className="button-styles"
                  color="primary"
                  onClick={handleNext}
                  style={{ background: "#efc71d" }}
                >
                  Next &#187;
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </>
    );
  }

  
  // else if (screenNumber === 7) {
  //   return (
  //     <>
  //       {loading ? <Loader /> : null}
  //       <Modal open={true} onClose={handleClose}>
  //         <div className="review-modal-container">
  //           <div className="review-modal-content">
  //             <div className="review-modal-header">
  //               <Typography variant="h6">
  //                 {module === "cmv" ? " Electrical CMV Report" : "SAVED REPORT"} : CRITICAL OBSERVATIONS
  //               </Typography>
  //               <button className="custom-close-button" onClick={handleClose}>
  //                 &#10005; {/* Unicode for 'X' */}
  //               </button>
  //             </div>
  //             <div className="review-modal-body" style={{ overflowY: "auto" }}>
  //               <Typography variant="body1" component="div">
  //                 <div>
  //                   {/* <div className="sub-headings">CRITICAL OBSERVATIONS</div> */}
  //                   {/* <br /> */}
  //                   <div className="critical-observations-div">
  //                     {criticalObservations.length === 0 ? (
  //                       <div className="no-observations">
  //                         <em>No critical observations</em>
  //                       </div>
  //                     ) : (
  //                       criticalObservations.map((observation, index) => (
  //                         <div key={index} className="observation-item">
  //                           {/* <textarea
  //                             onChange={(e) => handleObservationEdit(index, e)}
  //                             style={{ width: "100%", fontFamily: "inherit" }}
  //                             value={observation.observation}
  //                           /> */}
  //                           <TextField
  //                             id="outlined-multiline-flexible"
  //                             label="Critical Observations"
  //                             placeholder="Critical Observations"
  //                             multiline
  //                             onChange={(e) => handleObservationEdit(index, e)}
  //                             // value={observation.observation}
  //                              value={observation.observation ? observation.observation.replace(/\s+/g, ' ').trim() : ''}
                            
  //                             style={{ width: "100%", fontFamily: "inherit", backgroundColor: "white" }}
  //                           />
  //                           &nbsp;
  //                           {/* <CancelIcon
  //                             onClick={() => removeItem(index)}
  //                             className="cancel-icon"
  //                           >
  //                             &#10005;
  //                           </CancelIcon> */}
  //                           <DeleteIcon
  //                             onClick={() => removeItem(index)}
  //                             className="cancel-icon"
  //                           />
  //                         </div>
  //                       ))
  //                     )}
  //                   </div>
  //                   <br />
  //                   {/* <textarea
  //                     onChange={(e) => handleChange(e, "other details")}
  //                     value={otherDetails}
  //                     placeholder="Other Details..."
  //                     style={{
  //                       width: "99%",
  //                       height: "10vh",
  //                       fontFamily: "inherit",
  //                     }}
  //                   /> */}
  //                   <div className="custom-text-box">
  //                     <TextField
  //                       id="outlined-multiline-flexible"
  //                       label="Add Other Critical Observations"
  //                       placeholder="Other Observations. . ."
  //                       multiline
  //                       onChange={(e) => handleChange(e, "other details")}
  //                       value={otherDetails}
  //                       style={{ width: "100%", fontFamily: "inherit", backgroundColor: "white" }}
  //                     />
  //                     <IoAddCircle size={30} className="IoAddCircle" style={{ cursor: "pointer" }} onClick={addObservation} />
  //                   </div>
  //                 </div>
  //               </Typography>
  //             </div>

  //             <hr />
  //             <div className="review-modal-footer">
  //               <button
  //                 className="button-styles"
  //                 onClick={handleSave}
  //                 style={{ background: "#efc71d" }}
  //               >
  //                 Save
  //               </button>
  //               <button
  //                 disabled={disableSaveNext}
  //                 className="button-styles"
  //                 onClick={handlePrev}
  //                 style={{
  //                   background: disableSaveNext ? "lightgrey" : "#efc71d",
  //                 }}
  //               >
  //                 &#171; Prev
  //               </button>
  //               <button
  //                 className="button-styles"
  //                 color="primary"
  //                 onClick={handleNext}
  //                 disabled={disableSaveNext}
  //                 style={{
  //                   background: disableSaveNext ? "lightgrey" : "#efc71d",
  //                 }}
  //               >
  //                 Next &#187;
  //               </button>
  //             </div>
  //           </div>
  //         </div>
  //       </Modal>
  //     </>
  //   );
  // } 
  else if (screenNumber === 6) {
    return (
      <>
        {loading ? <Loader /> : null}
        <VariantsModal
          data={observationVariants}
          open={openVairantModal}
          handleClose={closeVariantModal}
          handleConfirmSelection={handleConfirmSelection}
        />
        <ImageViewerModal
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
        <Modal open={true} onClose={handleClose}>
          <div className="review-modal-container">
            <div className="review-modal-content">
              <div className="review-modal-header">
                <Typography variant="h6">
                  {module === "cmv" ? " Electrical CMV Report" : "SAVED REPORT"} : CRITICAL OBSERVATIONS, RECOMMENDATIONS & REASONING - ELECTRICAL REPORT
                </Typography>
                <button className="custom-close-button" onClick={handleClose}>
                  &#10005; {/* Unicode for 'X' */}
                </button>
              </div>
              {/* <div className="sub-headings" style={{ fontWeight: 500 }}>
                CRITICAL OBSERVATIONS, RECOMMENDATIONS & REASONING - ELECTRICAL
                SAFETY
              </div> */}
              <div className="review-modal-body">
                <div className="table-container">
                  <TableContainer component={Paper} className="table-scroll"   style={{ overflowAnchor: "none" }} ref={tableRef}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Sr. No.</TableCell>
                          <TableCell>Areas</TableCell>
                          <TableCell>Categories</TableCell>
                          <TableCell>Check Point</TableCell>
                          <TableCell>Observation</TableCell>
                          <TableCell>Criticality</TableCell>
                          <TableCell>Recommendation</TableCell>
                          <TableCell>IS Reference</TableCell>
                          <TableCell>Photo Evidence</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedObservations.map((observation, index) => (
                          <TableRow
                            key={index}
                            className={
                              (isEditing && currentEditedRow === index) ||
                                !isEditing
                                ? "even-row"
                                : "odd-row"
                            }
                          >
                            <TableCell>{index + 1}</TableCell>
                            {/* Area */}
                            <TableCell
                              className="editable-cell"
                              style={{ height: "100px" }}
                            >
                              <div
                                className="cell-content"
                                style={{
                                  color:
                                    isEditing && currentEditedRow !== index
                                      ? "grey"
                                      : "black",
                                }}
                              >

                                <CreatableSelect
                                  styles={{
                                    ...customSelectStylesCreatable,
                                    color:
                                      (isEditing && currentEditedRow !== index) ||
                                        observation.variant === true
                                        ? "grey"
                                        : "black",
                                  }}
                                  placeholder="Area"
                                  options={areaList.map((area) => ({ label: area, value: area }))} // Show empty array if no options
                                  noOptionsMessage={() => "No options"} // Display "No options" when empty
                                  value={
                                    observation.area ? { label: observation.area, value: observation.area } : null
                                  }
                                  isSearchable
                                  onChange={(selectedOption) => {
                                    if (selectedOption) {
                                      // Ensure state updates correctly
                                      const updatedObservations = [...selectedObservations];
                                      updatedObservations[index] = {
                                        ...observation,
                                        area: selectedOption.value, // Update the area field
                                      };

                                      setSelectedObservations(updatedObservations); // Update state
                                      handleCellEdit(
                                        selectedOption,
                                        index,
                                        "area",
                                        observation.area,
                                        observation
                                      );
                                    }
                                  }}
                                  isDisabled={isEditing && currentEditedRow !== index}
                                  menuPlacement="auto" // Automatically adjusts placement to avoid cut-off
                                />
                              </div>
                              <EditOutlinedIcon
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevents triggering unwanted events
                                  if ((isEditing && currentEditedRow !== index) || observation.variant === true) {
                                    toast.warning("Please save changes in the currently edited row before editing another row.");
                                  }
                                }}
                                className="edit-icon"
                                fontSize="small"
                              />
                            </TableCell>
                            {/* Category */}
                            <TableCell
                              className="editable-cell"
                              style={{ height: "100px" }}
                            >
                              <div
                                className="cell-content"
                                style={{
                                  color:
                                    isEditing && currentEditedRow !== index
                                      ? "grey"
                                      : "black",
                                }}
                              >

                                <CreatableSelect
                                  styles={{
                                    ...customSelectStylesCreatable,
                                  }}
                                  placeholder="Category..."
                                  // options={categoryOptions.length > 0 ? categoryOptions : []} // Ensure no options when empty
                                 options={getCategoryOptions(observation.area)}
                                  noOptionsMessage={() => "No options"} // Display "No options" when empty
                                  value={
                                    observation.category
                                      ? { label: observation.category, value: observation.category }
                                      : null
                                  }
                                  isSearchable
                                  onChange={(selectedOption) => {
                                    if (selectedOption) {
                                      // Update state correctly
                                      const updatedObservations = [...selectedObservations];
                                      updatedObservations[index] = {
                                        ...observation,
                                        category: selectedOption.value, // Update category field
                                      };

                                      setSelectedObservations(updatedObservations); // Update state
                                      handleCellEdit(
                                        selectedOption,
                                        index,
                                        "category",
                                        observation.category,
                                        observation
                                      );
                                    }
                                  }}
                                  isDisabled={
                                    (isEditing && currentEditedRow !== index) || observation.variant === true
                                  }
                                  menuPlacement="auto" // Automatically adjusts placement to avoid cut-off
                                />
                              </div>
                              <EditOutlinedIcon className="edit-icon" fontSize="small"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevents triggering unwanted events
                                  if ((isEditing && currentEditedRow !== index) || observation.variant === true) {
                                    toast.warning("Please save changes in the currently edited row before editing another row.");
                                  }
                                }}
                              />
                            </TableCell>
                            {/* Check Points */}
                            <TableCell
                              className="editable-cell"
                              style={{ height: "100px" }}
                            >
                              <div
                                className="cell-content"
                                style={{
                                  color:
                                    isEditing && currentEditedRow !== index
                                      ? "grey"
                                      : "black",
                                }}
                              >

                                <TextField
                                  id={`outlined-textarea-${index}`}
                                  value={observation.check_points}
                                  onChange={(e) => {
                                    if (currentEditedRow !== -1 && currentEditedRow !== index) {
                                      toast.warning("Please save the current row before editing another.");
                                      return;
                                    }
                                    const updatedObservations = [...selectedObservations];
                                    updatedObservations[index] = {
                                      ...observation,
                                      check_points: e.target.value,
                                    };

                                    setSelectedObservations(updatedObservations);
                                    handleCellEdit(e, index, "check_points", observation.check_points, observation);
                                  }}
                                  sx={{ width: "200px" }}
                                  InputProps={{
                                    sx: { fontSize: "10px" },
                                    disabled: currentEditedRow !== -1 && currentEditedRow !== index, // Disable other rows when editing
                                  }}
                                  placeholder="Check Point"
                                  variant="outlined"
                                  size="small"
                                  fullWidth
                                  multiline
                                  minRows={1.5}
                                  maxRows={20}
                                />
                              </div>
                              <EditOutlinedIcon
                                onClick={(e) =>
                                  isEditing
                                    ? handleCellEdit(
                                      e,
                                      index,
                                      "check_points",
                                      observation.check_points,
                                      observation
                                    )
                                    : null
                                }
                                className="edit-icon"
                                fontSize="small"
                              />
                            </TableCell>
                            {/* Observations */}
                            <TableCell
                              className="editable-cell"
                              style={{ height: "100px" }}
                            >
                              <div
                                className="cell-content"
                                style={{
                                  color:
                                    isEditing && currentEditedRow !== index
                                      ? "grey"
                                      : "black",
                                }}
                              >

                                <TextField
                                  id="outlined-textarea"
                                  placeholder="Observation"
                                  // value={observation.observation}
                                  //  value={observation.observation ? observation.observation.replace(/\s+/g, ' ').trim() : ''}
                                  value={observation.observation || ''}

                                  onChange={(e) => {
                                    if (currentEditedRow !== -1 && currentEditedRow !== index) {
                                      toast.warning("Please save the current row before editing another.");
                                      return;
                                    }
                                    const newValue = e.target.value;

                                    // if (!observation.hasEdited) {
                                    //   const isAllowedToEdit = handleCellEdit(e, index, "observation", observation.observation, observation);
                                    //   if (!isAllowedToEdit) return; // Stop updating if user cancels
                                    // }

                                    const isAllowedToEdit = handleCellEdit(e, index, "observation", observation.observation, observation);
                                    if (!isAllowedToEdit) return; // Stop updating if user cancels

                                    const updatedObservations = [...selectedObservations];
                                    updatedObservations[index] = {
                                      ...observation,
                                      observation: newValue,
                                      hasEdited: true,
                                    };

                                    setSelectedObservations(updatedObservations);
                                  }}
                                  sx={{ width: "200px" }}
                                  InputProps={{
                                    sx: { fontSize: "10px" },
                                    disabled: currentEditedRow !== -1 && currentEditedRow !== index, // Disable other rows when editing
                                  }}
                                  variant="outlined"
                                  size="small"
                                  fullWidth
                                  multiline
                                  minRows={1.5}
                                  maxRows={20}
                                />

                                <DialogBox dialog={dialog} handleDialogBox={handleDialogBoxObservation} />
                              </div>

                              <EditOutlinedIcon
                                onClick={(e) =>
                                  isEditing
                                    ? handleCellEdit(
                                      e,
                                      index,
                                      "observation",
                                      observation.observation,
                                      observation
                                    )
                                    : null
                                }
                                className="edit-icon"
                                fontSize="small"
                              />
                            </TableCell>
                            {/* Criticality */}
                            <TableCell
                              className="editable-cell"
                              style={{ height: "100px" }}
                            >

                              <Select
                                styles={{
                                  ...customSelectStylesCreatable,
                                  // menuPortal: (base) => ({ ...base, zIndex: 9999 }), // Ensures dropdown appears above other elements
                                }}
                                placeholder="Criticality"
                                options={criticalityOptions.length > 0 ? criticalityOptions : []} // Prevents errors when options are empty
                                noOptionsMessage={() => "No options"} // Displays "No options" when list is empty
                                value={
                                  observation.criticality
                                    ? { label: observation.criticality, value: observation.criticality }
                                    : null
                                }
                                isSearchable
                                // onChange={(e) =>
                                //   handleCellEdit(e, index, "criticality", observation.criticality, observation)
                                // }
                                onChange={(selectedOption) => {
                                  if (currentEditedRow !== -1 && currentEditedRow !== index) {
                                    toast.warning("Please save the current row before editing another.");
                                    return;
                                  }
                                  if (selectedOption) {
                                    // Ensure state updates correctly
                                    const updatedObservations = [...selectedObservations];
                                    updatedObservations[index] = {
                                      ...observation,
                                      criticality: selectedOption.value, // Update the criticality field
                                    };
                                    setSelectedObservations(updatedObservations); // Update state
                                    handleCellEdit(
                                      selectedOption,
                                      index,
                                      "criticality",
                                      observation.criticality,
                                      observation
                                    );
                                  }
                                }}
                                isDisabled={(isEditing && currentEditedRow !== index) || observation.variant === true}
                                // menuPortalTarget={document.body} // Moves dropdown outside container for proper placement
                                menuPlacement="auto" // Automatically adjusts placement to prevent cut-off
                              />

                              <EditOutlinedIcon
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevents triggering unwanted events
                                  if ((isEditing && currentEditedRow !== index) || observation.variant === true) {
                                    toast.warning("Please save changes in the currently edited row before editing another row.");
                                  }
                                }}
                                className="edit-icon"
                                fontSize="small"
                              />
                            </TableCell>
                            {/* Recommendations */}
                            <TableCell className="editable-cell">
                              <div
                                className="cell-content"
                                style={{
                                  color:
                                    isEditing && currentEditedRow !== index
                                      ? "grey"
                                      : "black",
                                }}
                              >

                                <TextField
                                  id="outlined-textarea"
                                  value={observation.recommendations}
                                  placeholder="Recommendations"
                                  // label="Recommendations"
                                  onChange={(e) => {
                                    // Update state with the new value and mark as edited
                                    const updatedObservations = [...selectedObservations];
                                    updatedObservations[index] = {
                                      ...observation,
                                      recommendations: e.target.value,
                                    };
                                    setSelectedObservations(updatedObservations);
                                    handleCellEdit(e, index, "recommendations", observation.recommendations, observation);

                                  }}
                                  sx={{ width: "200px" }}
                                  InputProps={{
                                    sx: { fontSize: "10px" },
                                    disabled: currentEditedRow !== -1 && currentEditedRow !== index, // Disable other rows when editing
                                  }}
                                  variant="outlined"
                                  size="small"
                                  fullWidth
                                  multiline
                                  minRows={1.5}
                                  maxRows={20}
                                />
                              </div>

                              <EditOutlinedIcon
                                onClick={(e) =>
                                  isEditing
                                    ? handleCellEdit(
                                      e,
                                      index,
                                      "recommendations",
                                      observation.recommendations,
                                      observation
                                    )
                                    : null
                                }
                                className="edit-icon"
                                fontSize="small"
                              />
                            </TableCell>
                            {/* IS Reference */}
                            <TableCell
                              className="editable-cell"
                              style={{ height: "100px" }}
                            >
                              <div
                                className="cell-content"
                                style={{
                                  color:
                                    isEditing && currentEditedRow !== index
                                      ? "grey"
                                      : "black",
                                }}
                              >

                                <TextField
                                  id="outlined-textarea"
                                  value={observation.is_reference}
                                  placeholder="IS Reference"
                                  // label="IS Reference"
                                  onChange={(e) => {
                                    const newValue = e.target.value;
                                    const isAllowedToEdit = handleCellEdit(e, index, "is_reference", observation.is_reference, observation);
                                    if (!isAllowedToEdit) return;

                                    // Update state with the new value and mark as edited
                                    const updatedObservations = [...selectedObservations];
                                    updatedObservations[index] = {
                                      ...observation,
                                      is_reference: newValue,
                                      hasEdited: true, // Flag to indicate field was edited
                                    };
                                    setSelectedObservations(updatedObservations);
                                  }}
                                  sx={{ width: "200px" }}
                                  InputProps={{
                                    sx: { fontSize: "10px" },
                                    disabled: currentEditedRow !== -1 && currentEditedRow !== index, // Disable other rows when editing
                                  }}
                                  variant="outlined"
                                  size="small"
                                  fullWidth
                                  multiline
                                  minRows={1.5}
                                  maxRows={20}
                                />
                              </div>
                              <EditOutlinedIcon
                                onClick={(e) =>
                                  isEditing
                                    ? handleCellEdit(
                                      e,
                                      index,
                                      "is_reference",
                                      observation.is_reference,
                                      observation
                                    )
                                    : null
                                }
                                className="edit-icon"
                                fontSize="small"
                              />
                            </TableCell>
                            {/* Image Upload */}
                            <TableCell>

                              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "15px" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "6px 0", border: "1px solid grey", borderRadius: "5px", width: "100px", cursor: isEditing && currentEditedRow !== index ? "not-allowed" : "pointer", position: "relative", background: isEditing && currentEditedRow !== index ? "#f0f0f0" : "white", opacity: isEditing && currentEditedRow !== index ? 0.6 : 1 }}>
                                  <CloudUploadOutlinedIcon size={30} />
                                  <input type="file" accept="image/*" multiple onChange={(e) => handleImageUpload(index, e.target.files)}
                                    style={{ position: "absolute", width: "100%", height: "100%", top: 0, left: 0, opacity: 0, cursor: isEditing && currentEditedRow !== index ? "not-allowed" : "pointer" }}
                                    disabled={isEditing && currentEditedRow !== index} />
                                </div>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "6px 0", border: "1px solid grey", borderRadius: "5px", width: "100px", cursor: "pointer" }} onClick={() => handleOpenImageDialog(index, observation)}>
                                  <InsertPhotoOutlinedIcon size={30} />
                                </div>
                              </div>
                              {selectedObservation.image && (
                                <Dialog onClose={handleCloseImageDialog} open={openDialog} maxWidth={false}>
                                  <DialogTitle>Uploaded Images</DialogTitle>
                                  <DialogContent dividers>
                                    {selectedObservation.image.imageUrls?.length > 0 ? (
                                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
                                        {selectedObservation.image.imageUrls.map((imageUrl, imgIndex) => (
                                          <div style={{ display: "flex" }} key={imgIndex}>
                                            <img src={imageUrl} alt={`Image ${imgIndex + 1}`} onClick={() => setSelectedImage(imageUrl)} // className="photo-image-saved"
                                              style={{ cursor: "pointer", width: "200px", height: "200px" }} />
                                            <CancelIcon className="cancel-icon" onClick={() => handleRemoveImage(selectedObservation.index, imgIndex)} />
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <Typography gutterBottom>No File Uploaded</Typography>
                                    )}
                                  </DialogContent>
                                  <DialogActions>
                                    <Button onClick={handleCloseImageDialog}>Close</Button>
                                  </DialogActions>
                                </Dialog>
                              )}
                            </TableCell>
                            {/* Action */}
                            <TableCell>
                              <div style={{ display: "flex" }}>
                                <InfoIcon
                                  onClick={() =>
                                    getObservationVariants(
                                      observation.observation,
                                      index
                                    )
                                  }
                                  style={{ cursor: "pointer" }}
                                />

                                {/* <PlaylistAddCircleIcon
                                  onClick={() => handleDuplicateRow(index)}
                                  style={{ cursor: "pointer" }}
                                /> */}
                                <DeleteForeverIcon
                                  onClick={() => handleDeleteRow(index)}
                                  style={{ cursor: "pointer" }}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}

                        <TableRow>
                          <TableCell>
                            {selectedObservations.length + 1}
                          </TableCell>
                          {/* Area */}
                          <TableCell
                            className="editable-cell"
                            style={{ height: "100px" }}
                          >
                            <CreatableSelect
                              ref={areaSelectRef}
                              styles={{
                                ...customSelectStylesCreatable,
                                menuPortal: (base) => ({ ...base, zIndex: 9999 }) // Ensure it appears above other elements
                              }}
                              placeholder="Area"
                              options={areaList.map((area) => ({
                                label: area,
                                value: area,
                              }))}
                              value={
                                newRow.area ? { label: newRow.area, value: newRow.area } : null
                              }
                              isSearchable
                              onChange={(e) => handleChangeNewRow2(e, "area")}
                              menuPortalTarget={document.body} // Moves dropdown outside the container
                              menuPlacement="auto"
                              onMenuOpen={() => setIsAreaDropdownOpen(true)}
                              onMenuClose={() => setIsAreaDropdownOpen(false)}
                              isValidNewOption={(inputValue, _, options) => {
                                const normalizedInput = inputValue.replace(/\s+/g, "").toLowerCase();
                                if (!normalizedInput) return false;
                                return !options.some(
                                  (opt) =>
                                    opt.value.replace(/\s+/g, "").toLowerCase() === normalizedInput
                                );
                              }}
                              filterOption={(option, inputValue) => {
                                const normalizedOption = option.label.replace(/\s+/g, "").toLowerCase();
                                const normalizedInput = inputValue.replace(/\s+/g, "").toLowerCase();
                                return normalizedOption.includes(normalizedInput);
                              }}
                            />



                            {/* </div> */}
                          </TableCell>
                          {/* Category */}
                          <TableCell
                            className="editable-cell"
                            style={{ height: "100px" }}
                          >
                            <CreatableSelect
                              ref={categorySelectRef}
                              styles={{
                                ...customSelectStylesCreatable,
                                menuPortal: (base) => ({ ...base, zIndex: 9999 }), // Ensure dropdown appears above everything
                                menu: (base) => ({ ...base, position: "absolute" }), // Fix positioning
                              }}
                              placeholder="Category"
                              options={categoryOptions.length > 0 ? categoryOptions : []}
                              noOptionsMessage={() => "No options"}
                              value={newRow.category ? { label: newRow.category, value: newRow.category } : null}
                              isSearchable
                              onChange={(e) => handleChangeNewRow2(e, "category")}
                              menuPortalTarget={document.body} // Moves dropdown outside the container
                              menuPlacement="auto" // Automatically positions dropdown
                              onMenuOpen={() => setIsCategoryDropdownOpen(true)}
                              onMenuClose={() => setIsCategoryDropdownOpen(false)}
                              isValidNewOption={(inputValue, _, options) => {
                                const normalizedInput = inputValue.replace(/\s+/g, "").toLowerCase();
                                if (!normalizedInput) return false;
                                return !options.some(
                                  (opt) =>
                                    opt.value.replace(/\s+/g, "").toLowerCase() === normalizedInput
                                );
                              }}
                              filterOption={(option, inputValue) => {
                                const normalizedOption = option.label.replace(/\s+/g, "").toLowerCase();
                                const normalizedInput = inputValue.replace(/\s+/g, "").toLowerCase();
                                return normalizedOption.includes(normalizedInput);
                              }}
                            />
                          </TableCell>
                          {/* check Point */}
                          <TableCell
                            className="editable-cell"
                            style={{ height: "100px" }}
                          >
                            <TextField
                              id="outlined-textarea"
                              value={newRow.check_points}
                              placeholder="Check Point"
                              onChange={(e) => handleChangeNewRow(e, "check_points")}
                              sx={{ width: "200px" }}
                              InputProps={{
                                sx: { fontSize: "10px" },
                              }}
                              variant="outlined"
                              size="small"
                              fullWidth
                              multiline
                              minRows={1.5}
                            />
                          </TableCell>
                          {/* Observation */}
                          <TableCell
                            className="editable-cell"
                            style={{ height: "100px" }}
                          >
                            <TextField
                              id="outlined-textarea"
                              value={newRow.observation}
                              placeholder="Observation"
                              // label="Observation"
                              onChange={(e) => handleChangeNewRow(e, "observation")}
                              sx={{ width: "200px" }}
                              InputProps={{
                                sx: { fontSize: "10px" },
                              }}
                              variant="outlined"
                              size="small"
                              fullWidth
                              multiline
                              minRows={1.5}
                            />
                          </TableCell>
                          {/* Criticality */}
                          <TableCell
                            className="editable-cell"
                            style={{ height: "100px" }}
                          >
                            <Select
                              ref={criticalitySelectRef}
                              styles={{
                                ...customSelectStylesCreatable,
                                menuPortal: (base) => ({ ...base, zIndex: 9999 }) // Ensures dropdown appears above everything
                              }}
                              placeholder="Criticality"
                              options={criticalityOptions}
                              value={
                                newRow.criticality ? { label: newRow.criticality, value: newRow.criticality } : null
                              }
                              isSearchable
                              onChange={(e) => handleChangeNewRow2(e, "criticality")}
                              menuPortalTarget={document.body} // Moves dropdown outside the container
                              menuPlacement="auto"
                              onMenuOpen={() => setIsCriticalityDropdownOpen(true)}
                              onMenuClose={() => setIsCriticalityDropdownOpen(false)}
                            />
                          </TableCell>
                          {/* Recommendation */}
                          <TableCell
                            className="editable-cell"
                            style={{ height: "100px" }}
                          >
                            <TextField
                              id="outlined-textarea"
                              value={newRow.recommendations}
                              placeholder="Recommendations"
                              // label="Recommendations"
                              onChange={(e) => handleChangeNewRow(e, "recommendations")}
                              sx={{ width: "200px" }}
                              InputProps={{
                                sx: { fontSize: "10px" },
                              }}
                              variant="outlined"
                              size="small"
                              fullWidth
                              multiline
                              minRows={1.5}
                            />
                          </TableCell>
                          {/* IS Reference */}
                          <TableCell
                            className="editable-cell"
                            style={{ height: "100px" }}
                          >
                            <TextField
                              id="outlined-textarea"
                              value={newRow.is_reference}
                              placeholder="IS Reference"
                              // label="IS Reference"
                              onChange={(e) => handleChangeNewRow(e, "is_reference")}
                              sx={{ width: "200px" }}
                              InputProps={{
                                sx: { fontSize: "10px" },
                              }}
                              variant="outlined"
                              size="small"
                              fullWidth
                              multiline
                              minRows={1.5}
                            />
                          </TableCell>
                          {/* Image Upload */}
                          <TableCell>

                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "6px 0", border: "1px solid grey", borderRadius: "5px", width: "100px", cursor: "not-allowed", position: "relative", background: "#f0f0f0", opacity: 0.6 }}>
                              <CloudUploadOutlinedIcon size={30} />
                            </div>
                          </TableCell>
                          {/* Action */}
                          <TableCell>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "center",
                              }}
                            >
                              {/* <CheckIcon
                                onClick={handleAddRow}
                                style={{ cursor: "pointer", color: "green" }}
                              /> */}
                              <IoAddCircle size={30} onClick={handleAddRow} style={{ cursor: "pointer", color: "green" }} />
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </div>
              </div>
              <hr />
              <div className="review-modal-footer">
                <button
                  className="button-styles"
                  onClick={handleSave}
                  style={{ background: "#efc71d" }}
                >
                  Save
                </button>
                <button
                  className="button-styles"
                  onClick={handlePrev}
                  style={{ background: "#efc71d" }}
                >
                  &#171; Prev
                </button>
                <button
                  className="button-styles"
                  color="primary"
                  onClick={() => handleNext()}
                  style={{ background: "#efc71d" }}
                >
                  Next &#187;
                </button>
              </div>
            </div>
          </div>
        </Modal>

      </>
    );
  } else if (screenNumber === 7) {
    return (
      <>
        {loading ? <Loader /> : null}

        <Modal open={true} onClose={handleClose}>
          <div className="review-modal-container">
            <div className="review-modal-content">
              <div className="review-modal-header">
                <Typography variant="h6">
                  {module === "cmv" ? " Electrical CMV Report" : "SAVED REPORT"} : SCORING TABLE
                </Typography>
                <button className="custom-close-button" onClick={handleClose}>
                  &#10005; {/* Unicode for 'X' */}
                </button>
              </div>
              <div className="review-modal-body" style={{ overflowY: "auto" }}>
                <Typography variant="body1" component="div">
                  <div>
                    {/* <div className="sub-headings">
                      Electrical Safety Scoring Table
                    </div> */}
                    <br />
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow style={{ background: "grey" }}>
                            <TableCell>Parameter</TableCell>
                            <TableCell>Max Score</TableCell>
                            <TableCell>Score Obtained</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {scores.map((row, index) => (
                            <TableRow key={index}>
                              <TableCell>{row["Electrical Safety"]}</TableCell>
                              <TableCell>{row["Maximum Score"]}</TableCell>
                              <TableCell>
                                <input
                                  type="number"
                                  placeholder="Enter score"
                                  value={row["Score Obtained"]}
                                  onChange={(e) =>
                                    handleScoreChange(index, e.target.value)
                                  }
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow style={{ background: "#efc71d" }}>
                            <TableCell>Cumulative</TableCell>
                            <TableCell style={{ fontWeight: "bold" }}>
                              {scores.reduce(
                                (acc, row) =>
                                  acc + parseFloat(row["Maximum Score"] || 0),
                                0
                              )}
                            </TableCell>
                            <TableCell style={{ fontWeight: "bold" }}>
                              {cumulativeScore}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <p style={{ color: "#307268",marginLeft:"50px",fontSize:"25px" }}>Overall Score - <span style={{ color: "#a3a300",fontSize: 25 }}>{((cumulativeScore / 25) * 100).toFixed(2)}%</span></p>
   
                  </div>
                                    <div className="graphClass"
                                    ref={chartContainerRef}
                                    style={{ width: "60%", height: 300, margin: "20px auto" }}>
                       <h3 style={{ textAlign: "center"}}>
                      Parameterwise Scoring
                    </h3>
                    <ResponsiveContainer>
                      <BarChart
                        data={scores}
                        margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                        barGap={0}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        {/* <XAxis
                          dataKey="Electrical Safety"
                          angle={-20}
                          textAnchor="end"
                          interval={0}
                        /> */}
                        <XAxis
                        dataKey="Electrical Safety"
                        interval={0}
                        tick={(props) => {
                          const { x, y, payload } = props;
                          const words = payload.value.split(" ");
                          return (
                            <text x={x} y={y + 10} textAnchor="middle">
                              {words.map((word, index) => (
                                <tspan
                                  key={index}
                                  x={x}
                                  dy={index === 0 ? 0 :16} // line height
                                >
                                  {word}
                                </tspan>
                              ))}
                            </text>
                          );
                        }}
                      />
                        <YAxis domain={[0, 2]} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Maximum Score" fill="#006400" >
                          <LabelList dataKey="Maximum Score" position="top" />
                        </Bar>
                        <Bar dataKey="Score Obtained" fill="#FFD700" >
                          <LabelList dataKey="Score Obtained" position="top" />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Typography>
              </div>
              <hr />
              {/* <div className="review-modal-footer">
                <button
                  className="button-styles"
                  onClick={handleSave}
                  style={{ background: "#efc71d" }}
                >
                  Save
                </button>
                <button
                  className="button-styles"
                  onClick={handlePrev}
                  style={{ background: "#efc71d" }}
                >
                  &#171; Prev
                </button>
                <button
                  className="button-styles"
                  color="primary"
                  onClick={() => handleNext()}
                  style={{ background: "#efc71d" }}
                >
                  Next &#187;
                </button>
              </div> */}
                   <div className="review-modal-footer">
                <button
                  className="button-styles"
                  onClick={handleSave}
                  // style={{ background: "#efc71d" }}
                  disabled={isNextDisabled}
  style={{
    background: "#efc71d",
    opacity: isNextDisabled ? 0.6 : 1,
    cursor: isNextDisabled ? "not-allowed" : "pointer"
  }}
                >
                  Save
                </button>
                <button
                  className="button-styles"
                  onClick={handlePrev}
                  // style={{ background: "#efc71d" }}
                  disabled={isNextDisabled}
  style={{
    background: "#efc71d",
    opacity: isNextDisabled ? 0.6 : 1,
    cursor: isNextDisabled ? "not-allowed" : "pointer"
  }}
                >
                  &#171; Prev
                </button>
                
                <button
  className="button-styles"
  color="primary"
  onClick={handleNext}
  disabled={isNextDisabled}
  style={{
    background: "#efc71d",
    opacity: isNextDisabled ? 0.6 : 1,
    cursor: isNextDisabled ? "not-allowed" : "pointer"
  }}
>
  Next &#187;
</button>

              </div>
            </div>
          </div>
        </Modal>
      </>
    );
  } 
    else if (screenNumber === 8) {
    return (
      <>
        {loading ? <Loader /> : null}
        <Modal open={true} onClose={handleClose}>
          <div className="review-modal-container">
            <div className="review-modal-content">
              <div className="review-modal-header">
                <Typography variant="h6">
                  {module === "cmv" ? " Electrical CMV Report" : "SAVED REPORT"} : OVERALL RISK ASSESSMENT INDICATOR
                </Typography>
                <button className="custom-close-button" onClick={handleClose}>
                  &#10005; {/* Unicode for 'X' */}
                </button>
              </div>
              <div className="review-modal-body" style={{ overflowY: "auto" }}>
                <Typography variant="body1" component="div">
 
                  {/* <div>
                    <JoditEditor
                      ref={editor}
                      placeholder="Enter your text here"
                      value={overallAssessmentIndicator}
                      // config={config}
                      config={{
                        ...config,
                        readonly: false,
                        toolbarSticky: false,
                        askBeforePasteFromHTML: false,
                        askBeforePasteFromWord: false,
                        processPasteFromWord: true,
                        defaultActionOnPaste: 'insert_clear_html',  // Clears formatting but keeps structure
                        pasteHTMLAction: 'insert_clear_html',
                        disablePlugins: ['pasteDialog', 'paste'],
                        cleanHTML: {
                          removeStyles: true,
                          removeClasses: true,
                        },
                        pasteFromClipboard: true,

                      }}
                      tabIndex={1}
                      onBlur={(newContent) => setOverallAssessmentIndicator(newContent)} 

                    />
                  </div> */}
                                    <div className="review-modal-body" style={{ display: "flex", gap: "10px", overflowY: "auto",marginBottom: "20px" }}>
                    
                    {/* Left Risk Section */}
                    <div
                      style={{
                        width: "200px",
                        padding: "10px",
                        borderRadius: "4px",
                        backgroundColor: currentRisk.color,
                        color: "#000",
                        flexShrink: 0,
                        display:"flex",
                        justifyContent:"center",
                        alignItems:"center",
                      }}
                    >
                      {/* <h4>{currentRisk.risk}</h4>
                      <p>{currentRisk.interpretation}</p> */}
                      <p style={{fontSize:"25px"}}>{Math.floor((cumulativeScore / 25) * 100)}%</p>
                    </div>
                  
                    {/* Right JoditEditor */}
                    <div style={{ flexGrow: 1 }}>
                   <JoditEditor
                      ref={editor}
                      placeholder="Enter your text here"
                      value={overallAssessmentIndicator}
                      // config={config}
                      config={{
                        ...config,
                        readonly: false,
                        toolbarSticky: false,
                        askBeforePasteFromHTML: false,
                        askBeforePasteFromWord: false,
                        processPasteFromWord: true,
                        defaultActionOnPaste: 'insert_clear_html',  // Clears formatting but keeps structure
                        pasteHTMLAction: 'insert_clear_html',
                        disablePlugins: ['pasteDialog', 'paste'],
                        cleanHTML: {
                          removeStyles: true,
                          removeClasses: true,
                        },
                        pasteFromClipboard: true,

                      }}
                      tabIndex={1}
                      onBlur={(newContent) => setOverallAssessmentIndicator(newContent)} 

                    />
                    </div>
                  </div>
                                    <div style={{ marginBottom: "20px", overflowX: "auto" }}>
                  <h3 style={{color:"#307260",fontFamily:"Montserrat"}}>Risk Legend</h3>
                   {/* <p style={{fontFamily: "Montserrat"}}>The above image is per display purpose only</p> */}
            <table style={{ width: "100%", borderCollapse: "collapse",fontFamily:"Montserrat" }}>
              <thead>
                <tr style={{ backgroundColor: "#307260", color: "#efc71d" }}>
                  <th style={{ padding: "8px", border: "1px solid #000",fontSize:"14px" }}>Score Range</th>
                  <th style={{ padding: "8px", border: "1px solid #000",fontSize:"14px" }}>Risk Level</th>
                  <th style={{ padding: "8px", border: "1px solid #000",fontSize:"14px" }}>Interpretation</th>
                </tr>
              </thead>
              <tbody>
                {riskLevels.map((level, index) => (
                  <tr key={index}>
                    <td style={{ textAlign: "center", color: level.color, border: "1px solid #000", padding: "8px",fontSize:"13px" }}>
                      {level.range}
                    </td>
                    <td style={{ textAlign: "center", backgroundColor: level.color, color: "#000", border: "1px solid #000", padding: "8px",fontSize:"13px" }}>
                      {level.risk}
                    </td>
                    <td style={{ border: "1px solid #000", padding: "8px",fontSize:"13px" }}>
                      {level.interpretation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
                </Typography>
                                {/* <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',marginTop:"20px"}}
                                 ref={gaugeContainerRef}
                                >
                      <ReactSpeedometer
                        maxValue={100}
                       
                         value={Number(((cumulativeScore / 10) * 100).toFixed(2))}
                        needleColor="black"
                          segmentColors={["#4caf50", "#ffeb3b", "red"]}
                        segments={3}
                        ringWidth={30}
                      />
                     
                    </div> */}
              </div>
              <hr />
              <div className="review-modal-footer">
                <button
                  className="button-styles"
                  onClick={handleSave}
                  style={{ background: "#efc71d" }}
                >
                  Save
                </button>
                <button
                  className="button-styles"
                  onClick={handlePrev}
                  style={{ background: "#efc71d" }}
                >
                  &#171; Prev
                </button>
                <button
                  className="button-styles"
                  color="primary"
                  onClick={handleNext}
                  style={{ background: "#efc71d" }}
                >
                  Next &#187;
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </>
    );
  }
  else if (screenNumber === 9) {
    return (
      <>
        {loading ? <Loader /> : null}
        <Modal open={true} onClose={handleClose}>
          <div className="review-modal-container">
            <div className="review-modal-content">
              <div className="review-modal-header">
                <Typography variant="h6">
                  {module === "cmv" ? " Electrical CMV Report" : "SAVED REPORT"} : WAY FORWARD PLAN
                </Typography>
                <button className="custom-close-button" onClick={handleClose}>
                  &#10005; {/* Unicode for 'X' */}
                </button>
              </div>
              <div className="review-modal-body" style={{ overflowY: "auto" }}>
                <Typography variant="body1" component="div">
                  <div>

                    <JoditEditor
                      ref={editor}
                      placeholder="Enter your text here"
                      value={theWayForward}
                      // config={config}
                      tabIndex={1}
                      config={{
                        ...config,
                        readonly: false,
                        toolbarSticky: false,
                        askBeforePasteFromHTML: false,
                        askBeforePasteFromWord: false,
                        processPasteFromWord: true,
                        defaultActionOnPaste: 'insert_clear_html',  // Clears formatting but keeps structure
                        pasteHTMLAction: 'insert_clear_html',
                        disablePlugins: ['pasteDialog', 'paste'],
                        cleanHTML: {
                          removeStyles: true,
                          removeClasses: true,
                        },
                        pasteFromClipboard: true,

                      }}
                      onBlur={(newContent) => setTheWayForward(newContent)} // This updates backgroundBrief on blur
                    // onChange={(newContent) => { setTheWayForward(newContent) }} // Updates state on every change
                    />
                  </div>
                </Typography>
              </div>
              <hr />
              <div className="review-modal-footer">
                <button
                  className="button-styles"
                  onClick={handleSave}
                  style={{ background: "#efc71d" }}
                >
                  Save
                </button>
                <button
                  className="button-styles"
                  onClick={handlePrev}
                  style={{ background: "#efc71d" }}
                >
                  &#171; Prev
                </button>
                <button
                  className="button-styles"
                  color="primary"
                  onClick={handleNext}
                  style={{ background: "#efc71d" }}
                >
                  Next &#187;
                </button>
              </div>
            </div>
          </div>
        </Modal>
        {/* {showConfirmationModal && (
          <ConfirmationModal
            setShowConfirmationModal={setShowConfirmationModal}
            handleCloseWithoutSaving={handleCloseWithoutSaving}
          />
        )} */}
      </>
    );
  } 
  else if (screenNumber === 10) {
    return (
      <>
        {loading ? <Loader /> : null}
        <Modal open={true} onClose={handleClose}>
          <div className="review-modal-container">
            <div
              className={exp ? "export-modal-content" : "review-modal-content"}
            >
              <div className="review-modal-header">
                <Typography variant="h6">
                  {exp ? "EXPORT REPORT" : module === "cmv" ? "Electrical CMV Report" : "SAVED REPORT"} : CONCLUSION
                </Typography>
                <button className="custom-close-button" onClick={handleClose}>
                  &#10005; {/* Unicode for 'X' */}
                </button>
              </div>
              {!exp && (
                <div
                  className="review-modal-body"
                  style={{ overflowY: "auto" }}
                >
                  <Typography variant="body1" component="div">
                    <div>
                      {/* <div className="sub-headings">CONCLUSION</div> */}
                      {/* <br /> */}
                      {/* <TextareaAutosize
                        value={conclusion}
                        onChange={(e) => handleChange(e, "conclusion")}
                        placeholder="Enter your text here"
                        className="text-area"
                        style={{ background: "whitesmoke" }}
                      /> */}
                      <JoditEditor
                        ref={editor}
                        placeholder="Enter your text here"
                        value={conclusion}
                        // config={config}
                        tabIndex={1}
                        config={{
                          ...config,
                          readonly: false,
                          toolbarSticky: false,
                          askBeforePasteFromHTML: false,
                          askBeforePasteFromWord: false,
                          processPasteFromWord: true,
                          defaultActionOnPaste: 'insert_clear_html',  // Clears formatting but keeps structure
                          pasteHTMLAction: 'insert_clear_html',
                          disablePlugins: ['pasteDialog', 'paste'],
                          cleanHTML: {
                            removeStyles: true,
                            removeClasses: true,
                          },
                          pasteFromClipboard: true,

                        }}
                        onBlur={(newContent) => setConclusion(newContent)} // This updates backgroundBrief on blur
                      // onChange={(newContent) => { setConclusion(newContent) }} // Updates state on every change
                      />
                    </div>
                  </Typography>
                </div>
              )}
              <hr />
              <div className="review-modal-footer" id="conclusionFooter">
                {!exp && (
                  <>
                    <button
                      className="button-styles"
                      onClick={handleSave}
                      style={{ background: "#efc71d" }}
                    >
                      Save
                    </button>
                    <button
                      className="button-styles"
                      onClick={handlePrev}
                      style={{ background: "#efc71d" }}
                    >
                      &#171; Prev
                    </button>
                    {/* {module !== "cmv" && (
                      <button
                        className="button-styles"
                        onClick={handleComplete}
                        disabled={isComplete}
                        style={{
                          background: isComplete ? "lightgrey" : "#efc71d",
                        }}
                      >
                        Complete
                      </button>
                    )} */}
                  </>
                )}
                <ExportSavedReportPDF
                //  gaugeImageWord={gaugeImage}
                  selectedOrganization={selectedOrganization}
                  selectedSite={selectedSite}
                  backgroundBrief={backgroundBrief}
                     improvementOpportunityAreas={improvementOpportunityAreas}
                  overallAssessmentIndicator={overallAssessmentIndicator}
                    chartImageElectrical={chartImage}
                  contents={contents}
                  exeSummary={exeSummary}
                  criticalObservations={criticalObservations}
                  selectedObservations={selectedObservations}
                  selectedArea={selectedArea}
                  selectedCategory={selectedCategory}
                  recommendations={recommendations}
                  conclusion={conclusion}
                  selectedDateTime={selectedDateTime.split("T")[0]}
                  isSaved={exp ? true : isSaved}
                  scores={scores}
                  cumulativeScore={cumulativeScore}
                  otherDetails={otherDetails}
                  ReportUID={selectedReportData.report_id}
                  startDate={new Date(startDate)}
                  endDate={new Date(endDate)}
                  bestPractice={bestPractice}
                  theWayForward={theWayForward}
                  name={name}
                  facilityInfo={facilityInfo}
                />
                <ExportExcel
                  selectedOrganization={selectedOrganization}
                  selectedSite={selectedSite}
                  backgroundBrief={backgroundBrief}
                     improvementOpportunityAreas={improvementOpportunityAreas}
                  overallAssessmentIndicator={overallAssessmentIndicator}
                  contents={contents}
                  exeSummary={exeSummary}
                  criticalObservations={criticalObservations}
                  selectedObservations={selectedObservations}
                  selectedArea={selectedArea}
                  selectedCategory={selectedCategory}
                  recommendations={recommendations}
                  conclusion={conclusion}
                  selectedDateTime={selectedDateTime.split("T")[0]}
                  isSaved={exp ? true : isSaved}
                  scores={scores}
                  cumulativeScore={cumulativeScore}
                  otherDetails={otherDetails}
                  ReportUID={selectedReportData.report_id}
                  bestPractice={bestPractice}
                  theWayForward={theWayForward}
                  startDate={new Date(startDate)}
                  endDate={new Date(endDate)}
                  name={name}
                  facilityInfo={facilityInfo}
                />
                <ExportWordDoc
                //  gaugeImageWord={gaugeImage}
                  selectedOrganization={selectedOrganization}
                  selectedSite={selectedSite}
                  backgroundBrief={backgroundBrief}
                  improvementOpportunityAreas={improvementOpportunityAreas}
                  overallAssessmentIndicator={overallAssessmentIndicator}
                   chartImageElectrical={chartImage}
                  contents={contents}
                  exeSummary={exeSummary}
                  criticalObservations={criticalObservations}
                  selectedObservations={selectedObservations}
                  selectedArea={selectedArea}
                  selectedCategory={selectedCategory}
                  recommendations={recommendations}
                  conclusion={conclusion}
                  selectedDateTime={selectedDateTime.split("T")[0]}
                  isSaved={exp ? true : isSaved}
                  scores={scores}
                  cumulativeScore={cumulativeScore}
                  otherDetails={otherDetails}
                  ReportUID={selectedReportData.report_id}
                  startDate={new Date(startDate)}
                  endDate={new Date(endDate)}
                  bestPractice={bestPractice}
                  theWayForward={theWayForward}
                  name={name}
                  facilityInfo={facilityInfo}
                />
              </div>
            </div>
          </div>
        </Modal>
      </>
    );
  }
};  

export default SavedReportModal;
  