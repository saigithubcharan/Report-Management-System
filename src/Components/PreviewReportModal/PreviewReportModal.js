import React, { useState, useEffect, useRef, useCallback, useContext } from "react";
import { debounce } from 'lodash';
import {
  Modal,
  Typography,
  TextareaAutosize,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField
} from "@mui/material";
import html2canvas from "html2canvas";
import "./PreviewReportModal.css";
import CancelIcon from "@mui/icons-material/Cancel";
import CloseIcon from "@material-ui/icons/Close";
import IconButton from "@material-ui/core/IconButton";
import ExportSavedReportPDF from "../ExportSavedReportPDF/ExportSavedReportPDF";
import ExportExcel from "../ExportExcel/ExportExcel";
import ExportWordDoc from "../ExportWordDoc/ExportWordDoc";
import { config } from "../../config";
import axios from "../../APIs/axios";
import { toast } from "react-toastify";
import { getAccountDetails } from "../Services/localStorage";
import Electrical_Cover from "../../Electrical_Cover.jpg";
// import Electrical_Cover_New from "../../Electrical_Safety_Report_Cover.png";
// import Electrical_Cover_New from "../../Electrical PNG.png";
import Electrical_Cover_New from "../../ElectricalPortrait.png";
import EditIcon from "@material-ui/icons/Edit";
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";
import PlaylistAddCircleIcon from "@mui/icons-material/PlaylistAddCircle";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import InfoIcon from "@mui/icons-material/Info";
import ImageViewerModal from "../ImageViewerModal/ImageViewerModal";
import CreatableSelect from "react-select/creatable";
import VariantsModal from "../VariantsModal/VariantsModal";
import Select from "react-select";
import CheckIcon from "@mui/icons-material/Check";
import DeleteIcon from "@mui/icons-material/Delete";
import { IoAddCircle } from "react-icons/io5";
import JoditEditor from 'jodit-react';
import HTMLReactParser from 'html-react-parser';
import DialogBox from "../DialogBox/DialogBox";
import PhotoOutlinedIcon from '@mui/icons-material/PhotoOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import InsertPhotoOutlinedIcon from '@mui/icons-material/InsertPhotoOutlined';
import { ReportContext } from "../ReportContext/ReportContext";

import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { Menu } from 'react-select';
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

const closeAllSelectMenus = () => {
  const menus = document.querySelectorAll('.react-select__menu'); // find any open menu
  menus.forEach((menu) => {
    if (menu && menu.parentNode) {
      menu.parentNode.removeChild(menu); // manually remove open menus
    }
  });
};

const PreviewReportModal = ({
  open,
  setOpenModal,
  setOpenCreateReportModal,
  reportHeader,
  // selectedObservations,
  recommendations,
  selectedArea,
  selectedCategory,
  // setSelectedObservations,
  // selectedOrganization,
  // selectedSite,
  setRecommendations,
  setSelectedArea,
  setSelectedCategory,
  // setSelectedOrganization,
  // setSelectedSite,
  ReportUID,
  selectedDateTime,
  // observations,
  setCategoriesToDisplay,
  setAreasToDisplay,
  // setObservations,
  getAllData,
  // startDate,
  // endDate,
  // setStartDate,
  // setEndDate,
  generateUniqueId,
  // getCategoriesByAreas,
  getCurrentDateTime,
  setLoading,
  areaOptions,
  allData,
  getAllReports,
}) => {
  const {
    backgroundBrief,
    setBackgroundBrief,
    improvementOpportunityAreas,
    setImprovements,
    overallAssessmentIndicator,
    setOverallAssessmentIndicator,
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
    selectedSite,
    startDate,
    endDate,
    setEndDate,
    setStartDate,
    setSelectedSite,
    setSelectedOrganization,


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
    isSaved,
    setIsSaved, scores, setScores,



    resetReportContext
  } = useContext(ReportContext);

  let serial_num = 0;
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
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
    });

    if (tableRef.current) {
      observer.observe(tableRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [selectedObservations]); 
  const editor = useRef(null);
  const percentage = 74;
  const [isNextDisabled, setIsNextDisabled] = useState(false);
  const [dialog, setDialog] = useState({ open: false, message: "", title: "", accept: "", reject: "", onConfirm: null });
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedObservation, setSelectedObservation] = useState({ image: null, index: null });

  const [isAreaDropdownOpen, setIsAreaDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isCriticalityDropdownOpen, setIsCriticalityDropdownOpen] = useState(false);
  const isTyping = useRef(false);
  // Refs for dropdowns
  const areaSelectRef = useRef(null);
  const categorySelectRef = useRef(null);
  const criticalitySelectRef = useRef(null);
  const tableRef = useRef(null);
    const chartContainerRef = useRef(null);
  const [chartImage, setChartImage] = useState(null);

  // const [backgroundBrief, setBackgroundBrief] = useState(
  //   reportHeader.background_brief
  //     .replace("Alpha Maier Pvt.Ltd", `${selectedOrganization.label}`)
  //     .replace("Manesar plant", `${selectedSite.label}`)
  //     .replace(
  //       "30th & 31st March 2022",
  //       `${startDate.getDate()}-${startDate.getMonth() + 1
  //       }-${startDate.getFullYear()} and ${endDate.getDate()}-${endDate.getMonth() + 1
  //       }-${endDate.getFullYear()}`
  //     )
  // );
  const [latestBriefDraft, setLatestBriefDraft] = useState(backgroundBrief);
  // console.log('Raw background_brief:', reportHeader.background_brief);

  // const [contents, setContents] = useState(reportHeader.contents);
  const [bestPractice, setbestPractice] = useState(reportHeader.best_practice);
  // const [theWayForward, setTheWayForward] = useState(
  //   reportHeader.the_way_forward
  // );
  // const [exeSummary, setExeSummary] = useState(
  //   reportHeader.exe_summary
  //     .replace(
  //       "Alpha Maier private Ltd",
  //       `${selectedOrganization.label} (${selectedSite.label})`
  //     )
  //     .replace(
  //       "30th &amp; 31st March 2022",
  //       `${startDate.getDate()}-${startDate.getMonth() + 1
  //       }-${startDate.getFullYear()} and ${endDate.getDate()}-${endDate.getMonth() + 1
  //       }-${endDate.getFullYear()}`
  //     )
  //   // .replace("<areas>", selectedArea.join(","))
  // );
  const prevContentRef = useRef(exeSummary);

  //   useEffect(() => {
  //   if (reportHeader.critical_observations?.length && criticalObservations.length === 0) {
  //     setCriticalObservations(reportHeader.critical_observations);
  //   }
  // }, [reportHeader]);
  useEffect(() => {
    // If criticalObservations was never touched, initialize it from reportHeader
    if (
      reportHeader.critical_observations?.length &&
      !hasEditedCriticalObservations &&
      (!criticalObservations || criticalObservations.length === 0)
    ) {
      // setCriticalObservations(reportHeader.critical_observations);
      const clonedCritical = reportHeader.critical_observations.map((obs) => ({
        ...obs
      }));
      setCriticalObservations(clonedCritical);

    }
  }, [reportHeader.report_id]); // better dependency: only reset when new report is loaded
  useEffect(() => {
    setHasEditedCriticalObservations(false);
  }, [reportHeader.report_id]);

  const [otherDetails, setOtherDetails] = useState("");
  // const [conclusion, setConclusion] = useState(reportHeader.conclusion);
  const [screenNumber, setScreenNumber] = useState(1);
  // const [imageUrlsByRow, setImageUrlsByRow] = useState({});
  const { userId, name } = getAccountDetails();
  // const [editedObservations, setEditedObservations] = useState([]);
  // const [isReportEdited, setIsReportEdited] = useState(false);
  // const [isSaved, setIsSaved] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [currentEditedRow, setCurrentEditedRow] = useState(-1);
  const [isEditing, setIsEditing] = useState(false);
  const [disableSaveNext, setDisableSaveNext] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [area, setArea] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [editedFields, setEditedFields] = useState([]);
  const [observationVariants, setObservationVariants] = useState([]);
  const [openVairantModal, setOpenVariantModal] = useState(false);
  const [confirmationShown, setConfirmationShown] = useState(false);
  // const [isRowSaved, setIsRowSaved] = useState(true)
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
  // const [scores, setScores] = useState([
  //   {
  //     "Electrical Safety": "Design & Installation",
  //     "Maximum Score": 2,
  //     "Score Obtained": 0,
  //   },
  //   {
  //     "Electrical Safety": "Preventive maintenance",
  //     "Maximum Score": 2,
  //     "Score Obtained": 0,
  //   },
  //   {
  //     "Electrical Safety": "Competency/Training",
  //     "Maximum Score": 2,
  //     "Score Obtained": 0,
  //   },
  //   {
  //     "Electrical Safety": "Lock out-Tag out",
  //     "Maximum Score": 2,
  //     "Score Obtained": 0,
  //   },
  //   {
  //     "Electrical Safety": "Drawings (As built) / Documents",
  //     "Maximum Score": 2,
  //     "Score Obtained": 0,
  //   },
  // ]);

  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const cumulativeScore = scores.reduce(
    (acc, row) => acc + parseFloat(row["Score Obtained"] || 0),
    0
  ) > 0
    ? scores
      .reduce((acc, row) => acc + parseFloat(row["Score Obtained"] || 0), 0)
      .toFixed(2)
    : 0;

  //     useEffect(() => {
  //       updateBackgroundBrief();
  //       updateExecSummary();
  //     }, [selectedOrganization, selectedSite, startDate, endDate, selectedArea]);
  // const hasInitialized = useRef(false);


  useEffect(() => {
     const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"
  ];

  const formattedStartDate = `${startDate.getDate()}th ${monthNames[startDate.getMonth()]} ${startDate.getFullYear()}`;

    const originalBackground = reportHeader.background_brief
      .replace("Alpha Maier Pvt.Ltd", `${selectedOrganization?.label || ""}`)
      .replace("Manesar plant", `${selectedSite?.label || ""}`)
      .replace(
        "30th & 31st March 2022",
        // `${startDate.getDate()}-${startDate.getMonth() + 1}-${startDate.getFullYear()} and ${endDate.getDate()}-${endDate.getMonth() + 1}-${endDate.getFullYear()}`
     formattedStartDate 
      );

    const originalSummary = reportHeader.exe_summary
      .replace("Alpha Maier private Ltd", `${selectedOrganization?.label}, ${selectedSite?.label}`)
      .replace(
        "30th & 31st March 2022",
        // `${startDate.getDate()}-${startDate.getMonth() + 1}-${startDate.getFullYear()} and ${endDate.getDate()}-${endDate.getMonth() + 1}-${endDate.getFullYear()}`
       formattedStartDate 
      )  
    //   .replace(/(<p>\s*(<br\s*\/?>)*\s*<\/p>){2,}/gi, "<p><br></p>")
    // // Fix multiple <p> gaps by replacing with a single one
    // .replace(/<\/p>\s*<p>\s*<\/p>\s*<p>/gi, "</p><p>")
    // // Normalize consecutive <p> tags (large paragraph gaps)
    // .replace(/<\/p>\s*<p>/g, "</p><br><p>")
    // // Remove pilcrow symbols
    // .replace(/¶/g, "")        // Remove literal pilcrow
    // .replace(/&para;/g, "")   // Remove encoded pilcrow
    // .replace(/\u00B6/g, "")   // Remove Unicode pilcrow
    // // Trim whitespace
    // .trim();
  const originalContents =reportHeader.contents.replace(/(<p>\s*(<br\s*\/?>)*\s*<\/p>){2,}/gi, "<p><br></p>")
    // Fix multiple <p> gaps by replacing with a single one
    .replace(/<\/p>\s*<p>\s*<\/p>\s*<p>/gi, "</p><p>")
    // Normalize consecutive <p> tags (large paragraph gaps)
    .replace(/<\/p>\s*<p>/g, "</p><br><p>")
    // Remove pilcrow symbols
    .replace(/¶/g, "")        // Remove literal pilcrow
    .replace(/&para;/g, "")   // Remove encoded pilcrow
    .replace(/\u00B6/g, "")   // Remove Unicode pilcrow
    // Trim whitespace
    .trim();
    if (!backgroundBrief || backgroundBrief === reportHeader.background_brief) {
      setBackgroundBrief(originalBackground);
    }
    // console.log("improve",reportHeader.improvement_opportunity_areas)
   if(!improvementOpportunityAreas){
    setImprovements(reportHeader.improvement_opportunity_areas)
   } 
  //  console.log("alldata",reportHeader.overall_assessment_indicator)
   if(!overallAssessmentIndicator){
    setOverallAssessmentIndicator(reportHeader.overall_assessment_indicator)
   } 
 
    if (!exeSummary || exeSummary === reportHeader.exe_summary) {
      setExeSummary(originalSummary);
    }

    if (!conclusion) {
      setConclusion(reportHeader.conclusion);
    }

    if (!theWayForward) {
      setTheWayForward(reportHeader.the_way_forward);
    }

    if (!contents) {
      setContents(reportHeader.contents);
      // setContents(originalContents);
    }
  }, [reportHeader, selectedOrganization, selectedSite, startDate, endDate]);




  // useEffect(() => {
  //   if (hasInitialized.current) return;

  //   setBackgroundBrief((prev) => prev || reportHeader.background_brief
  //     .replace("Alpha Maier Pvt.Ltd", `${selectedOrganization.label}`)
  //     .replace("Manesar plant", `${selectedSite.label}`)
  //     .replace("30th & 31st March 2022", `${startDate.getDate()}-${startDate.getMonth() + 1}-${startDate.getFullYear()} and ${endDate.getDate()}-${endDate.getMonth() + 1}-${endDate.getFullYear()}`));

  //   setExeSummary((prev) => prev || reportHeader.exe_summary
  //     .replace("Alpha Maier private Ltd", `${selectedOrganization.label} (${selectedSite.label})`)
  //     .replace("30th &amp; 31st March 2022", `${startDate.getDate()}-${startDate.getMonth() + 1}-${startDate.getFullYear()} and ${endDate.getDate()}-${endDate.getMonth() + 1}-${endDate.getFullYear()}`));

  //   setConclusion((prev) => prev || reportHeader.conclusion);
  //   setTheWayForward((prev) => prev || reportHeader.the_way_forward);
  //   setContents((prev) => prev || reportHeader.contents);

  //   hasInitialized.current = true;
  // }, [reportHeader, selectedOrganization, selectedSite, startDate, endDate]);

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

  useEffect(() => {
    handleEmptyFields();
  }, [newRow]);

  const updateBackgroundBrief = () => {
    const updatedData = reportHeader.background_brief
      .replace("Alpha Maier Pvt.Ltd", `${selectedOrganization.label}`)
      .replace("Manesar plant", `${selectedSite.label}`)
      .replace(
        "30th & 31st March 2022",
        `${startDate.getDate()}-${startDate.getMonth() + 1
        }-${startDate.getFullYear()} and ${endDate.getDate()}-${endDate.getMonth() + 1
        }-${endDate.getFullYear()}`
      );
    setBackgroundBrief(updatedData);
  };


  const updateExecSummary = () => {
    let updatedData = reportHeader.exe_summary
      .replace(
        "Alpha Maier private Ltd",
        `${selectedOrganization.label}(${selectedSite.label})`
      )
      .replace(
        "30th &amp; 31st March 2022",
        `${startDate.getDate()}-${startDate.getMonth() + 1
        }-${startDate.getFullYear()} till ${endDate.getDate()}-${endDate.getMonth() + 1
        }-${endDate.getFullYear()}`
      );
    // .replace("<areas>", selectedArea.join(","));  

    // Append new analysis sentence
    updatedData +=
      "\n\nWhile detailed point-by-point analysis has been put forth in the following pages, a few trends have emerged which may be improved upon and are mentioned below :\n";

    // Concatenate critical observations
    if (criticalObservations.length === 0) {
      updatedData += "\n*No critical observations*";
    } else {
      updatedData += criticalObservations
        .map((obs, index) => `\n${index + 1}. ${obs.observation} : ${obs.recommendations}`)
        .join("");
    }
    setExeSummary(updatedData);
  };



  // const handleCellEdit = (e, index, field, originalContent, observationObj) => {
  //   const handleConfirmation = () => {
  //     if (!confirmationShown) {
  //       setDialog({
  //         open: true,
  //         title: "Confirm Edit",
  //         message: "Editing the observation field will make this a new observation set and the variant list will be updated accordingly. Do you want to continue?",
  //         accept: "OK",
  //         reject: "Cancel",
  //         onConfirm: () => {
  //           setConfirmationShown(true); // User confirmed
  //         }
  //       });
  //       return false;
  //     }
  //     return true;
  //   };

  //   if (currentEditedRow !== -1 && currentEditedRow !== index) {
  //     toast.warning("Please save changes in the currently edited row before editing another row.");
  //     return;
  //   }

  //   const updateEditedFields = (newField) => {
  //     if (!editedFields.includes(newField)) {
  //       setEditedFields((prevFields) => [...prevFields, newField]);
  //     }
  //   };

  //   if (field === "observation") {
  //     const isAllowed = handleConfirmation();
  //     if (!isAllowed) return false;
  //   }

  //   if (field === "area") {
  //     setArea([e.value]);
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


  //   if ((field === "area" || field === "category") && value.length > 50) {
  //     toast.warning("Only 50 characters are allowed in this field.");
  //     return;
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

  //   // Update or insert into editedObservations
  //   setEditedObservations((prev) => {
  //     // const existingIndex = prev.findIndex((obs) => obs.selectedRefIndex === index);
  //     const existingIndex = prev.findIndex(
  //       (obs) =>
  //         (obs.tempId && obs.tempId === observationObj.tempId) || // For new unsaved rows
  //         (!obs.tempId && obs.selectedRefIndex === index) // Fallback for old rows
  //     );

  //     const updatedObs = {
  //       ...observationObj,
  //       ...prev[existingIndex],
  //       [field]: value,
  //       selectedRefIndex: index,
  //       tempId: observationObj.tempId, // Keep the ID intact
  //     };

  //     if (existingIndex !== -1) {
  //       const updated = [...prev];
  //       updated[existingIndex] = updatedObs;
  //       return updated;
  //     } else {
  //       return [...prev, updatedObs];
  //     }
  //   });

  //   // Track which field was edited
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
  //     default:
  //       break;
  //   }

  //   return true;
  // };

  const handleCellEdit = (e, index, field, originalContent, observationObj) => {
    const handleConfirmation = () => {
      if (!confirmationShown) {
        setDialog({
          open: true,
          title: "Confirm Edit",
          message: "Editing the observation field will make this a new observation set and the variant list will be updated accordingly. Do you want to continue?",
          accept: "OK",
          reject: "Cancel",
          onConfirm: () => {
            setConfirmationShown(true);
          }
        });
        return false;
      }
      return true;
    };

    if (currentEditedRow !== -1 && currentEditedRow !== index) {
      toast.warning("Please save changes in the currently edited row before editing another row.");
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

    setEditedObservations((prev) => {
      console.log("previous",prev);
      const existingIndex = prev.findIndex(
      
        (obs) =>
          (obs.tempId && obs.tempId === observationObj.tempId) ||
          (!obs.tempId && obs.selectedRefIndex === index)
      );
       console.log("edited obs",editedObservations);
      const base = existingIndex !== -1 ? prev[existingIndex] : observationObj;

      const updatedObs = {
        ...base,
        [field]: value,
        selectedRefIndex: index,
        tempId: base.tempId || observationObj.tempId,
      };

      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = updatedObs;
        return updated;
      } else {
        return [...prev, updatedObs];
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


  const handleChange = (e, name) => {
    setIsSaved(false);
    if (name === "background") {
      setBackgroundBrief(e.target.value);
    } else if (name === "contents") {
      setContents(e.target.value);
    } else if (name === "improvementOpportunityAreas") {
      setImprovements(e.target.value);
    } else if (name === "overallAssessmentIndicator") {
      setOverallAssessmentIndicator(e.target.value);
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

  const handleDialogBoxObservation = (action) => {
    if (action) {
      dialog.onConfirm(); // Execute the confirmed action (allow editing)
    }
    setDialog((prevDialog) => ({ ...prevDialog, open: false }));
  };

  const handleDialogBox = (proceed) => {
    setDialog({ open: false, message: "" }); // Reset dialog state
    if (!proceed) return;

    setScreenNumber(screenNumber + 1); // Now proceeds to the next screen
  };

  const handleNext = () => {
    if (isNextDisabled) return; 
    setBackgroundBrief(backgroundBrief);
    const unsavedCritical = criticalObservations.some(obs => !obs.observation?.trim());

    if (unsavedCritical) {
      toast.warning("Please save the critical observations before proceeding.");
      return;
    }
    if (otherDetails.trim()) {
      toast.warning("Please add the Other critical observation before proceeding.");
      return;
    }

    if (isEditing) {
      toast.warning("Please save changes before proceeding.");
      return;
    }
    // const hasUnfilledBlanks = /_{3,}/.test(exeSummary);
    // if (screenNumber === 4 && hasUnfilledBlanks) {
    //   toast.warning("Please fill all blanks (underscores) in the Executive Summary before proceeding.");
    //   return;
    // }
    // if (exeSummary.includes("spanned ____________.") && screenNumber === 4) {
    //   setDialog({
    //     open: true,
    //     message: (
    //       <>
    //         You have not filled the{" "}
    //         <span style={{ textDecoration: "underline" }}>blank area</span> in the summary.
    //         Are you sure you want to proceed?
    //       </>
    //     ),
    //     title: "INCOMPLETE EXECUTIVE SUMMARY",
    //     accept: "Proceed",
    //     reject: "Cancel"
    //   });
    //   return
    // }
    setScreenNumber(screenNumber + 1);
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
    if (isEditing) {
      toast.warning("Please save changes before going back.");
      return;
    }
    // if (screenNumber === 6 && isRowSaved === false) {
    //   toast.warning("Please save the new row by clicking on tick action button.");
    //   setLoading(false);
    //   return;
    // }
    setScreenNumber(screenNumber - 1);
  };

  const handleEdit = () => {
    // console.log("backgrond",backgroundBrief)
    // console.log(contents);
    // console.log(theWayForward)
    // console.log(conclusion);
    // console.log(criticalObservations)
    setOpenModal(false);
    setOpenCreateReportModal(true);
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
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;

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

        canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.7);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (index, files) => {
    const selectedObsCopy = [...selectedObservations];
    const obsCopy = [...observations];
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
      setObservations(obsCopy);

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
    const obsCopy = [...observations];

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
      setObservations(obsCopy);
    }
  };

  const keyNotToCheck = [
    "remarks",
    "score",
    "refIndex",
    "selectedRefIndex",
    "equipment",
    "is_selected",
    "imageUrls",
    "edited_fields",
    "status",
    "sector_type",
    "table_type"
  ];



  const handleSave = async (complete) => {
    // console.log("criticalobservations",criticalObservations);
    // console.log("summary",exeSummary)
     setExeSummary(cleanHTML(exeSummary));
     setContents(cleanHTML(contents))
    const toSave = restorePlaceholders(backgroundBrief);

    if (otherDetails.trim()) {
      toast.warning("Please add the Other critical observation before proceeding.");
      return;
    }

    const hasEmptyObservation = criticalObservations.some(obs => obs.observation.trim() === "");
    if (hasEmptyObservation) {
      toast.warning("Critical observation cannot be empty!");
      return;
    }
    // console.log("criticalobservations:",criticalObservations);
    const hasEmptyFields = selectedObservations.some(obs =>
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
      //   toast.warning("Please save the new row by clicking on tick action button");
      //   setLoading(false);
      //   return;
      // }

      if (isAnyScoreEmpty()) {
        toast.warning("Please fill the score table before saving the report.");
        setLoading(false);
        return;
      }
      // console.log("selectedobservations",selectedObservations)

      let updatedSelectedObservations = [...selectedObservations];
      let updatedAllObservations = [...observations];
      let values = selectedObservations.map((data) => data.sr_no)
      //         let finalObj={}
      //         values.forEach((data,i)=>{
      //             finalObj[data]=[data,i]
      //         })
      //         console.log("finalobj",finalObj)
      // //         let Updatedall=  observations.map((e,i)=>{
      // //           let currentSr_No=e.sr_no
      // //  console.log("current sr-No",currentSr_No);
      // //           let objData=finalObj[currentSr_No]
      // //        console.log("obj data",objData);
      // //           if(objData){
      // //               if((e.sr_no==objData[0]) && (e?.imageUrls?.length>0)){
      // //  console.log("updating sr_no:",e.sr_no)
      // //                   e[i]=updatedSelectedObservations[objData[1]]
      // //                   console.log("printing e",e);
      // //               }
      // //           }
      // //           return e
      // //       })
      // let Updatedall=  observations.map((e,i)=>{
      //   let selectedObj= observations[i]
      //       let currentSr_No=selectedObj.sr_no
      //       console.log("currentSr_no",currentSr_No);
      //       let objData=finalObj[currentSr_No]
      //    console.log("object actual data",objData)
      //       if(objData){
      //         if((selectedObj?.sr_no==objData[0]) && (selectedObj.imageUrls?.length>0)){
      //           console.log("obj data",objData[1])
      //               selectedObj['imageUrls'] =selectedObservations[objData[1]].imageUrls
      //             console.log("select",selectedObservations[objData[1]].imageUrls)
      //           }
      //       }
      //       return selectedObj
      //   })
      const selectedObsMap = Object.fromEntries(
        selectedObservations.map((obs, index) => [obs.sr_no, index])
      );

      // Update imageUrls in observations where matching sr_no is found
      // updatedAllObservations = updatedAllObservations.map(obs => {
      //   const matchIndex = selectedObsMap[obs.sr_no];
      //   if (matchIndex !== undefined) {
      //     const matchedSelected = selectedObservations[matchIndex];
      //     return {
      //       ...obs,
      //       imageUrls: matchedSelected.imageUrls || [],
      //     };
      //   }
      //   return obs;
      // });
      updatedAllObservations = updatedAllObservations.map(obs => {
        let matchedSelected;

        if (obs.sr_no !== undefined) {
          const matchIndex = selectedObsMap[obs.sr_no];
          matchedSelected = matchIndex !== undefined ? selectedObservations[matchIndex] : null;
        }

        if (!matchedSelected && obs.tempId !== undefined) {
          matchedSelected = selectedObservations.find(selObs => selObs.tempId === obs.tempId);
        }

        if (matchedSelected) {
          return {
            ...obs,
            imageUrls: matchedSelected.imageUrls || [],
          };
        }

        return obs;
      });

      // observations.map((e)=>{if(e.sr_no==finalObj.sr_no[0]){e.sr_no=updatedSelectedObservations.sr_no}})
      // console.log("saveobservations",updatedSelectedObservations);
      // console.log("updatedObservations",updatedAllObservations);
      const trimFields = obj =>
        Object.fromEntries(
          Object.entries(obj).map(([key, value]) =>
            typeof value === "string" ? [key, value.trim()] : [key, value]
          )
        );

      const regroupByArea = (rows) => {
        const grouped = [];
        const areaSet = Array.from(new Set(rows.map(r => r.area)));
        areaSet.forEach(area => {
          grouped.push(...rows.filter(r => r.area === area));
        });
        return grouped;
      };

      if (editedObservations.length > 0) {
        for (const obj of editedObservations) {
          const trimmedObj = trimFields(obj);

          const emptyFieldFound = Object.entries(trimmedObj).some(
            ([key, value]) => !keyNotToCheck.includes(key) && value === ""
          );
          if (emptyFieldFound) {
            toast.error("Table fields can't be empty.");
            setLoading(false);
            return;
          }

          // const selectedIndex = updatedSelectedObservations.findIndex(
          //   (e) => (obj.tempId && e.tempId === obj.tempId) || (!obj.tempId && e.id === obj.id)
          // );

          // const allIndex = updatedAllObservations.findIndex(
          //   (e) => (obj.tempId && e.tempId === obj.tempId) || (!obj.tempId && e.id === obj.id)
          // );
          // const selectedIndex = updatedSelectedObservations.findIndex(
          //   (e) => e.sr_no === obj.sr_no
          // );

          // const allIndex = updatedAllObservations.findIndex(
          //   (e) => e.sr_no === obj.sr_no
          // );
          const selectedIndex = updatedSelectedObservations.findIndex(
            (e) =>
              (obj.tempId && e.tempId === obj.tempId) || // match by tempId for new rows
              (obj.sr_no && e.sr_no === obj.sr_no)       // match by sr_no for saved rows
          );

          const allIndex = updatedAllObservations.findIndex(
            (e) =>
              (obj.tempId && e.tempId === obj.tempId) ||
              (obj.sr_no && e.sr_no === obj.sr_no)
          );

          if (selectedIndex !== -1) {
            updatedSelectedObservations[selectedIndex] = {
              ...updatedSelectedObservations[selectedIndex],
              ...trimmedObj,
            };
          }

          if (allIndex !== -1) {
            updatedAllObservations[allIndex] = {
              ...updatedAllObservations[allIndex],
              ...trimmedObj,
              is_selected: 1,
            };
          }
        }

        if (isReportEdited) {
          const payload = editedObservations
            .map(({ sr_no, score, edited_fields, tempId, ...rest }) => ({
              ...trimFields(rest),
              // image: rest.image ,
              edited_fields: edited_fields || [],
            }))
            .filter(item => Object.keys(item).length > 0);
          // console.log("Payload to send:", payload);  
          if (payload.length > 0) {
            await axios.post(`${config.PATH}/api/insert-new-row`, payload);
          }
        }
      }

      updatedSelectedObservations = regroupByArea(updatedSelectedObservations);
      updatedAllObservations = regroupByArea(updatedAllObservations);

      requestAnimationFrame(() => {
        setSelectedObservations(updatedSelectedObservations);
        setObservations(updatedAllObservations);
      });

      const reportData = {
        report_id: ReportUID,
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
        critical_observations: criticalObservations,
        is_saved: 1,
        is_complete: complete === true,
        start_date: startDate,
        end_date: endDate,
        type: module === "cmv" ? "cmv" : "primary",
      };

      const reportEndPoint = `${config.PATH}/api/save-update-report`;
      await axios.post(reportEndPoint, reportData);
      // let updatedAllObservations1=updatedAllObservations.filter(data=>data.sr_no!=serial_num)
      let updatedAllObservations1 = [...updatedAllObservations]; // Already reflects the current UI after deletions

      // const observationsData = {
      //   report_id: ReportUID,
      //   all_observations: updatedAllObservations1.filter(e => {
      //     // if (e.id) e.sr_no = e.id;

      //     return trimFields(e);
      //   }),
      //   // all_observations: updatedAllObservations.map(e => {
      //   //   if (e.id) e.sr_no = e.id;
      //   //   return trimFields(e);
      //   // }),
      //   organization: selectedOrganization.label,
      //   site: selectedSite.label,
      // };
      const observationsData = {
        report_id: ReportUID,
        all_observations: updatedAllObservations1.map(trimFields),
        organization: selectedOrganization.label,
        site: selectedSite.label,
      };

      const observationEndpoint = complete === true
        ? `${config.PATH}/api/save-update-cmv-observations`
        : `${config.PATH}/api/save-update-observations`;

      await axios.post(observationEndpoint, observationsData);
      //       console.log("observations",updatedSelectedObservations);
      // console.log("allobservations",updatedAllObservations1);
      requestAnimationFrame(() => {
        setIsSaved(true);
        setEditedObservations([]);
        setCurrentEditedRow(-1);
        setIsEditing(false);
        setDisableSaveNext(false);
        setEditedFields([]);
        setLoading(false);
        setConfirmationShown(false);
      });

      getAllData();
      updateOrgReportStatus();
      updateSiteReportStatus();
      saveCriticalObservations(complete);
      saveFacilityInfo();
      getAllReports();

      toast.success(`${complete == true ? "Report Completed and Saved" : "Report Saved"}`);
    } catch (error) {
      console.log("Error saving report:", error);
      setLoading(false);
      toast.error("Error occurred while saving the report.");
    }
  };





  const closeReport = () => {
    if (isAnyScoreEmpty()) {
      toast.warning("Please fill the score table before closing the report.");
      return;
    }
    resetReportContext();
    setOpenModal(false);
    setSelectedObservations([]);
    setRecommendations([]);
    setSelectedArea([]);
    setSelectedCategory([]);
    setSelectedOrganization([]);
    setSelectedSite([]);
    setAreasToDisplay([]);
    setCategoriesToDisplay([]);
    setStartDate(null);
    setEndDate(null);
    generateUniqueId();
    // getCategoriesByAreas();
    getCurrentDateTime();
  };

  const handleClose = () => {
    if (isEditing ) {
      toast.warning("Please save changes before closing the report.");
      return;
    } else if (!isSaved) {
      toast.warning("Please save the report before closing.");
    } else {
      closeReport();
    }
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

    const updatedAllObservations = [...observations];
    const updatedSelectedObservations = [...selectedObservations];

    updatedAllObservations.splice(selectedOriginalRow.refIndex + 1, 0, {
      ...duplicatedRowForSelected,
      is_selected: 1,
    });
    updatedSelectedObservations.splice(index + 1, 0, duplicatedRowForSelected);

    setObservations(updatedAllObservations);
    setSelectedObservations(updatedSelectedObservations);

    toast.success("New row added");
  };


  const [deletedSrNos, setDeletedSrNos] = useState([]);

  //   const handleDeleteRow = (index) => {
  //     if (isEditing && currentEditedRow !== index) {
  //       toast.warn("Please finish editing the current row before deleting the row.");
  //       return;
  //     }

  //     if (selectedObservations.length === 1) {
  //       toast.warn("Cannot delete the last row.");
  //       return;
  //     }

  //     closeAllSelectMenus(); // Optional, but consider managing this with state

  //     // Clone arrays
  //     const updatedSelectedObservations = [...selectedObservations];
  //     const updatedAllObservations = [...observations];
  //     console.log("before",selectedObservations);
  //     console.log("before",updatedAllObservations)


  //     // Get the correct refIndex BEFORE deleting from selectedObservations
  //     const refIndexToDelete = updatedSelectedObservations[index].refIndex;
  //      serial_num =  updatedSelectedObservations[index].sr_no;
  //     console.log("serialnum",serial_num);
  //    let refIndexdeleted= updatedAllObservations.map((data,i)=>{

  //       if(data.sr_no==serial_num){data.is_selected =0}
  //       return data;

  // })
  // console.log("deleted",refIndexdeleted);
  //     // Remove from observations first using correct refIndex
  //     updatedAllObservations.splice(refIndexToDelete, 1);

  //     // Then remove from selectedObservations
  //     updatedSelectedObservations.splice(index, 1);

  //     // Rebuild refIndexes correctly
  //     const reindexedSelected = updatedSelectedObservations.map((item, idx) => ({
  //       ...item,
  //       refIndex: idx, // Update refIndex to match new position
  //     }));
  //     console.log("refindex",reindexedSelected)

  //     selectedObservations = [...reindexedSelected];
  //     // Update state using functional updates to ensure you're working with the latest state
  //     setSelectedObservations(reindexedSelected);

  //     setObservations(updatedAllObservations);
  //     setIsEditing(false);
  //     setEditedObservations([]);
  //     setCurrentEditedRow(-1);
  //     toast.error("Row deleted");
  //     console.log("after",selectedObservations)
  //     console.log("after",updatedAllObservations)
  //   };
  const handleDeleteRow = (index) => {
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
    const updatedAllObservations = [...observations];
    // console.log("before",selectedObservations);
    // console.log("before",updatedAllObservations)
    const deletedRow = updatedSelectedObservations[index];
    const serial_num = deletedRow.sr_no;
    if (serial_num) {
      setDeletedSrNos(prev => [...prev, serial_num]);
    }
    const tempId = deletedRow.tempId;

    // console.log("Deleting row with sr_no:", serial_num, "tempId:", tempId);

    // Remove from selectedObservations
    updatedSelectedObservations.splice(index, 1);

    // Mark the row as unselected (instead of deleting from original array)
    const markedObservations = updatedAllObservations.map((obs) => {
      if (
        (serial_num && obs.sr_no === serial_num) ||
        (tempId && obs.tempId === tempId)
      ) {
        return { ...obs, is_selected: 0 }; // Mark as not selected
      }
      return obs;
    });

    // Rebuild refIndexes for selectedObservations
    const reindexedSelected = updatedSelectedObservations.map((item, idx) => ({
      ...item,
      refIndex: idx,
    }));
    // console.log("refindex",reindexedSelected)
    setSelectedObservations(reindexedSelected);
    setObservations(markedObservations);
    setIsEditing(false);
    setEditedObservations([]);
    setCurrentEditedRow(-1);
    toast.error("Row deleted");
    //   console.log("after",selectedObservations)
    //   console.log("after",updatedAllObservations)
    // console.log("Updated allObservations", markedObservations);
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
        //criticalObservations: selectedObservations,
        report_id: ReportUID,
      };
      // console.log("criticalObservations:",JSON.stringify(payload))
      const endpoint =
        complete === true
          ? `${config.PATH}/api/save-critical-cmv-observations`
          : `${config.PATH}/api/save-critical-observations`;

      await axios.post(endpoint, payload);

      // console.log("Critical observations saved successfully.");
    } catch (error) {
      console.error("Error saving critical observations:", error.message);
    }
  };

  const isAnyScoreEmpty = () => {
    return scores.some((score) => score["Score Obtained"] === "");
  };

  const handleObservationEdit = (index, e) => {
    setDisableSaveNext(true);
    // const updatedObservations = [...criticalObservations];
    // updatedObservations[index].observation = e.target.value;
    // setCriticalObservations(updatedObservations);
    const updatedObservations = criticalObservations.map((obs, i) =>
      i === index ? { ...obs, observation: e.target.value } : obs
    );
    setCriticalObservations(updatedObservations);

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
  };

  const customSelectStylesCreatable = {
    control: (provided) => ({
      ...provided,
      boxShadow: "none",
      cursor: "pointer",
      width: "150px",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      borderLeft: "none",
      padding: 0,
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
      position: "absolute",
      width: "150px",
    }),
    menuList: (provided) => ({
      ...provided,
      maxHeight: "200px",
      overflowY: "auto",
    }),
  };

  const getObservationVariants = async (observation, index) => {
    try {
      if (isEditing && currentEditedRow !== index) {
        toast.warn("Please finish editing the current row.");
        return;
      }
      //  setObservationVariants([]);
      const payload = {
        observation: observation,
        report: "new",
      };
      const response = await axios.post(
        `${config.PATH}/api/search-by-observation`,
        payload
      );
      setObservationVariants(response.data);
      setOpenVariantModal(true);
    } catch (e) {
      console.log(e);
    }
  };

  const closeVariantModal = () => {
    setOpenVariantModal(false);
    // setObservationVariants([]);
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
    setObservations(
      [...observations, ...selectedVariants].filter((e) => {
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

  const criticalityOptions = [
    { value: "High", label: "High" },
    { value: "Medium", label: "Medium" },
    { value: "Low", label: "Low" },
  ];

  const handleEmptyFields = () => {
    const isEmpty = Object.entries(newRow).every(([key, value]) => {
      if (key === 'is_selected') return true; // ignore the is_selected field
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
    if ((field === 'area' || field === 'category' || field === 'criticality') && value.length > 100) {
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
      // selectedArea.push(selectedOption.value)
    }

    // if (field === "category") {
    //   selectedCategory.push(selectedOption.value)
    // }
    setNewRow((prev) => ({ ...prev, [field]: value, is_selected: 1 }));
    setIsRowSaved(false); // Set isNewRowSaved to false if any change is made
  };



  // const handleAddRow = () => {
  //   if (!newRow.area.trim() || !newRow.observation.trim() || !newRow.recommendations.trim() || (typeof newRow.is_reference === "string" && !newRow.is_reference.trim())) {
  //     toast.warning("Area, Observation, Recommendations & IS Reference fields cannot be empty.", {
  //       // toast.warning("Please save the report before adding new row", {
  //       position: "top-right",
  //       autoClose: 3000, // Closes after 3 seconds
  //       hideProgressBar: false,
  //       closeOnClick: true,
  //       pauseOnHover: true,
  //       draggable: true,
  //       theme: "colored",
  //     });
  //     return
  //   }
  //   const refIndex = observations.length; // or wherever this row should go
  //   const selectedRefIndex = selectedObservations.length;

  //   const updatedRow = {
  //     ...newRow,
  //     tempId: Date.now(), // Unique ID
  //     area: newRow.area.trim() || "N/A",
  //     category: newRow.category.trim() || "N/A",
  //     check_points: newRow.check_points.trim() || "N/A",
  //     observation: newRow.observation.trim() || "N/A",
  //     criticality: newRow.criticality.trim() || "N/A",
  //     recommendations: newRow.recommendations.trim() || "N/A",
  //     is_reference: typeof newRow.is_reference === "string" ? newRow.is_reference.trim() || "N/A" : newRow.is_reference,
  //     imageUrls: Array.isArray(newRow.imageUrls) && newRow.imageUrls.length > 0 ? newRow.imageUrls : [],
  //     refIndex,
  //     selectedRefIndex,
  //     edited_fields: [
  //       "area",
  //       "category",
  //       "check_points",
  //       "observation",
  //       "criticality",
  //       "recommendations",
  //       "is_reference",
  //     ],
  //     isNew: true, // Custom flag to identify unsaved new row
  //     disabled: false, // The new row should be editable
  //   };

  //   const areAllFieldsEmpty = Object.values(updatedRow).every(
  //     (value) => value === "N/A" || (Array.isArray(value) && value.length === 0)
  //   );

  //   if (areAllFieldsEmpty) {
  //     alert("Cannot add empty row.");
  //     return;
  //   }

  //   const insertRowAtCorrectPosition = (prevObservations) => {
  //     const lastIndex = prevObservations
  //       .map((obs, index) => (obs.area === updatedRow.area ? index : -1))
  //       .filter(index => index !== -1)
  //       .pop();

  //     return lastIndex !== undefined && lastIndex !== -1
  //       ? [...prevObservations.slice(0, lastIndex + 1), updatedRow, ...prevObservations.slice(lastIndex + 1)]
  //       : [...prevObservations, updatedRow];
  //   };

  //   // setEditedObservations((prev) => insertRowAtCorrectPosition(prev));
  //   // setSelectedObservations((prev) => insertRowAtCorrectPosition(prev));
  //   // setObservations((prev) => insertRowAtCorrectPosition(prev)); 
  //   // setIsReportEdited(true);
  //   // setIsRowSaved(false);

  //   // setNewRow({
  //   //   area: "",
  //   //   category: "",
  //   //   check_points: "",
  //   //   observation: "",
  //   //   criticality: "",
  //   //   recommendations: "",
  //   //   is_reference: "",
  //   //   imageUrls: [],
  //   // });
  //   requestAnimationFrame(() => {
  //     setEditedObservations((prev) => insertRowAtCorrectPosition(prev));
  //     setSelectedObservations((prev) => insertRowAtCorrectPosition(prev));
  //     setObservations((prev) => insertRowAtCorrectPosition(prev));
  //     setIsReportEdited(true);
  //     setIsRowSaved(false);

  //     setNewRow({
  //       area: "",
  //       category: "",
  //       check_points: "",
  //       observation: "",
  //       criticality: "",
  //       recommendations: "",
  //       is_reference: "",
  //       imageUrls: [],
  //     });
  //   });


  // };

  const handleAddRow = () => {
    if (!newRow.area.trim() || !newRow.observation.trim() || !newRow.recommendations.trim() || (typeof newRow.is_reference === "string" && !newRow.is_reference.trim())) {
      toast.warning("Area, Observation, Recommendations & IS Reference fields cannot be empty.", {
        // toast.warning("Please save the report before adding new row", {
        position: "top-right",
        autoClose: 3000, // Closes after 3 seconds
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
      return
    }
    const refIndex = observations.length; // or wherever this row should go
    const selectedRefIndex = selectedObservations.length;

    const updatedRow = {
      ...newRow,
      tempId: Date.now(), // Unique ID
      area: newRow.area.trim() || "N/A",
      category: newRow.category.trim() || "N/A",
      check_points: newRow.check_points.trim() || "N/A",
      observation: newRow.observation.trim() || "N/A",
      criticality: newRow.criticality.trim() || "N/A",
      recommendations: newRow.recommendations.trim() || "N/A",
      is_reference: typeof newRow.is_reference === "string" ? newRow.is_reference.trim() || "N/A" : newRow.is_reference,
      imageUrls: Array.isArray(newRow.imageUrls) && newRow.imageUrls.length > 0 ? newRow.imageUrls : [],
      equipment: newRow.equipment || null,
      score: null,
      status: "NO", // Match backend rows
      // sr_no: Date.now(), 
      refIndex,
      selectedRefIndex,
      edited_fields: [
        "area",
        "category",
        "check_points",
        "observation",
        "criticality",
        "recommendations",
        "is_reference",
      ],
      isNew: true, // Custom flag to identify unsaved new row
      disabled: false, // The new row should be editable
    };

    const areAllFieldsEmpty = Object.values(updatedRow).every(
      (value) => value === "N/A" || (Array.isArray(value) && value.length === 0)
    );

    if (areAllFieldsEmpty) {
      alert("Cannot add empty row.");
      return;
    }

    const insertRowAtCorrectPosition = (prevObservations) => {
      const lastIndex = prevObservations
        .map((obs, index) => (obs.area === updatedRow.area ? index : -1))
        .filter(index => index !== -1)
        .pop();

      return lastIndex !== undefined && lastIndex !== -1
        ? [...prevObservations.slice(0, lastIndex + 1), updatedRow, ...prevObservations.slice(lastIndex + 1)]
        : [...prevObservations, updatedRow];
    };

    // setEditedObservations((prev) => insertRowAtCorrectPosition(prev));
    // setSelectedObservations((prev) => insertRowAtCorrectPosition(prev));
    // setObservations((prev) => insertRowAtCorrectPosition(prev)); 
    // setIsReportEdited(true);
    // setIsRowSaved(false);

    // setNewRow({
    //   area: "",
    //   category: "",
    //   check_points: "",
    //   observation: "",
    //   criticality: "",
    //   recommendations: "",
    //   is_reference: "",
    //   imageUrls: [],
    // });
    requestAnimationFrame(() => {
      setEditedObservations((prev) => insertRowAtCorrectPosition(prev));
      setSelectedObservations((prev) => insertRowAtCorrectPosition(prev));
      setObservations((prev) => insertRowAtCorrectPosition(prev));
      setIsReportEdited(true);
      setIsRowSaved(false);

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
    });


  };
  const saveFacilityInfo = async () => {
    try {
      const payload = {
        report_id: ReportUID,
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
  const addObservation = () => {
    // Check if there's already any empty observation
    const hasEmptyObservation = criticalObservations.some(
      (obs) => obs.observation.trim() === ""
    );

    if (hasEmptyObservation) {
      toast.warning("Please fill the existing empty critical observation before adding a new one!");
      return;
    }

    // Prepare new observation: either from user input or blank
    const newObservation = {
      observation: otherDetails.trim() !== "" ? otherDetails.trim() : ""
    };

    // Add to the end of the list
    const updatedManual = [...manualCriticalObservations, newObservation];
    setManualCriticalObservations(updatedManual);
    // setCriticalObservations([...criticalObservations, newObservation]);
    const clonedCritical = criticalObservations.map((obs) => ({ ...obs }));
    setCriticalObservations([...clonedCritical, { ...newObservation }]);

    setHasEditedCriticalObservations(true);
    setOtherDetails(""); // Clear the input

  };


  const handleOpenImageDialog = (index, observation) => {
    setSelectedObservation({ image: observation, index });
    setOpenDialog(true);
  };

  const handleCloseImageDialog = () => {
    setSelectedObservation({ image: null, index: null });
    setOpenDialog(false);
  };
  // const debouncedChange = useCallback(
  //   debounce((value) => {
  //     setBackgroundBrief(value);
  //   }, 5000), 
  //   []
  // );
  //For backgroundBrief
  const debouncedChange = useRef(
    debounce((value) => {
      setBackgroundBrief(value);
    }, 2000)
  ).current;

  const debouncedSetContents = useRef(
    debounce((value) => {
      setContents(value);
    }, 2000),
  ).current;

  const debouncedSetExeSummary = useRef(
    debounce((value) => {
      setExeSummary(value);
    }, 2000),
  ).current;
  const debouncedSetTheWayForward = useRef(
    debounce((value) => {
      setTheWayForward(value);
    }, 2000),
  ).current;
  const debouncedSetImporvements = useRef(
    debounce((value) => {
      setImprovements(value);
    }, 2000),
  ).current;
  const debouncedSetOverallAssessmentsIndicator = useRef(
    debounce((value) => {
      setOverallAssessmentIndicator(value);
    }, 2000),
  ).current;
  const debouncedSetConclusion = useRef(
    debounce((value) => {
      setConclusion(value);
    }, 2000),
  ).current;
  const formatDate = (date) =>
    `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;

  const processBackgroundBrief = (template) => {
    const orgName = selectedOrganization?.label || "_________";
    const formattedStart = startDate ? formatDate(startDate) : "dd-mm-yyyy";
    const formattedEnd = endDate ? formatDate(endDate) : "dd-mm-yyyy";

    return template
      .replace(/\${selectedOrganization.label}/g, orgName)
      .replace(/\${startDate}-\${startMonth}-\${startYear}/g, formattedStart)
      .replace(/\${endDate}-\${endMonth}-\${endYear}/g, formattedEnd);
  };
  useEffect(() => {
    if (open && backgroundBrief) {
      const processed = processBackgroundBrief(backgroundBrief);
      setBackgroundBrief(processed);
    }
  }, [open, backgroundBrief, selectedOrganization, startDate, endDate]);
  const restorePlaceholders = (htmlContent) => {
    return htmlContent
      .replace(new RegExp(selectedOrganization.label, "g"), "${selectedOrganization.label}")
      .replace(new RegExp(formatDate(startDate), "g"), "${startDate}-${startMonth}-${startYear}")
      .replace(new RegExp(formatDate(endDate), "g"), "${endDate}-${endMonth}-${endYear}");
  };
  const processExeSummary = (template) => {
    const orgName = selectedOrganization?.label || "_________";
    const siteName = selectedSite?.label || "_________";
    const formattedStart = startDate ? formatDate(startDate) : "dd-mm-yyyy";
    const formattedEnd = endDate ? formatDate(endDate) : "dd-mm-yyyy";

    return template
      .replace(/\${selectedOrganization.label}/g, orgName)
      .replace(/\${selectedSite.label}/g, siteName)
      .replace(/\${startDate}-\${startMonth}-\${startYear}/g, formattedStart)
      .replace(/\${endDate}-\${endMonth}-\${endYear}/g, formattedEnd);
  };
  useEffect(() => {
    if (open && exeSummary) {
      const processed = processExeSummary(exeSummary);
      setExeSummary(processed);
    }
  }, [open, exeSummary, selectedOrganization, selectedSite, startDate, endDate]);


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

// useEffect(() => {
//   if (screenNumber === 9) {
//     const timeoutId = setTimeout(() => {
//       convertChartToImage();
//     }, 1000); // wait for Recharts to fully render

//     // Cleanup
//     return () => clearTimeout(timeoutId);
//   }
// }, [screenNumber, convertChartToImage]);
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
//       // console.log("gag",gaugeImage);
//     } catch (error) {
//       console.log("Error converting gauge to image:", error);
//     }
//   }, []);

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




  if (screenNumber === 1) {
    return (
      <>
        <Modal open={open} onClose={handleClose}>
          <div className="review-modal-container">
            <div className="review-modal-content">
              <div className="review-modal-header">
                <Typography variant="h6">PREVIEW REPORT : COVER PAGE</Typography>
                <button className="custom-close-button" onClick={handleClose}>
                  &#10005; {/* Unicode for 'X' */}
                </button>
              </div>
              <div className="review-modal-body" style={{ overflowY: "auto" }}>


                {/* New cover page with HTML */}
                {/* <div className="report-container">
                  <div className="report-cover">
                    <img src={Electrical_Cover_New} alt="Cover" style={{ width: "100%", height: "100%" }} />
                  </div>
                  <div className="report-details">
                    <p >
                      Client : {selectedOrganization.label}
                    </p>
                    <p >
                      Location : {selectedSite.label}
                    </p>
                    <p >
                      Service : Electrical Audit
                    </p>
                    <p >
                      Date : {startDate.getTime() === endDate.getTime()
                        ? `${startDate.getDate()}-${startDate.getMonth() + 1
                        }-${startDate.getFullYear()}`
                        : `${startDate.getDate()}-${startDate.getMonth() + 1
                        }-${startDate.getFullYear()} to ${endDate.getDate()}-${endDate.getMonth() + 1
                        }-${endDate.getFullYear()}`}
                    </p>
                    <a href="https://www.momentumindia.in" >
                      www.momentumindia.in
                    </a>
                  </div>
                  <div className="report-title">
              
                    Electrical<br />Audit<br />Report
                    <span className="report-year">
                      <span className="line"></span>
                      {new Date().getFullYear()}
                    </span>
                  </div>

                  <div className="report-footer">
                    Prepared by Momentum India
                  </div>
                </div> */}
                <div className="report-container">
                  <div className="report-cover">
                    <img src={Electrical_Cover_New} alt="Cover" style={{ width: "100%", height: "100%" }} />
                  </div>
      <div
  style={{
    position: "absolute",
    top: "585px",
    left: "155px",
    fontSize: "22px",
    fontFamily: "Montserrat",
    color: "#307268",
  }}
>
  {selectedOrganization?.label || ""}
</div>

<div
  style={{
    position: "absolute",
    top: "676px",
    left: "159px",
    fontSize: "22px",
    fontFamily: "Montserrat",
    color: "#307268",
  }}
>
  Electrical Audit
</div>

<div
  style={{
    position: "absolute",
    top: "630px",
    left: "170px",
    fontSize: "22px",
    fontFamily: "Montserrat",
    color: "#307268",
  }}
>
  {selectedSite?.label || ""}
</div>

<div
  style={{
    position: "absolute",
    top: "725px",
    left: "128px",
    fontSize: "18px",
    fontFamily: "Montserrat",
    color: "#307268",
  }}
>
  {startDate.getTime() === endDate.getTime()
    ? `${startDate.getDate()}-${startDate.getMonth() + 1}-${startDate.getFullYear()}`
    : `${startDate.getDate()}-${startDate.getMonth() + 1}-${startDate.getFullYear()} to ${endDate.getDate()}-${endDate.getMonth() + 1}-${endDate.getFullYear()}`}
</div>

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
                  onClick={handleEdit}
                  style={{ background: "#efc71d" }}
                >
                  Back
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
  } else if (screenNumber === 2) {
    return (
      <>
        <Modal open={open} onClose={handleClose}>
          <div className="review-modal-container">
            <div className="review-modal-content">
              <div className="review-modal-header">
                <Typography variant="h6">PREVIEW REPORT : BACKGROUND - PROJECT BRIEF</Typography>
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
                      config={config}
                      tabIndex={1}
                      onBlur={(newContent) => setBackgroundBrief(newContent)} 
      //                onBlur={(newContent) => {
      //   const cleaned = cleanHTML(newContent);
      //   setBackgroundBrief(cleaned);
      //   if (editor.current) {
      //     editor.current.value = cleaned;
      //   }
      // }}
                      //  onChange={(newContent) => { setBackgroundBrief(newContent) }} // Updates state on every chang
                      onChange={(newContent) => {
                        isTyping.current = true;
                        debouncedChange(newContent)
                      }}
                    />
                    
   {/* <SimpleBarChart /> */}

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
      </>
    );
  } else if (screenNumber === 3) {
    return (
      <>
        <Modal open={open} onClose={handleClose}>
          <div className="review-modal-container">
            <div className="review-modal-content">
              <div className="review-modal-header">
                <Typography variant="h6">PREVIEW REPORT : UNDERSTANDING THE REPORT</Typography>
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
                      value={contents}
                      config={config}
                      tabIndex={1}
                      onBlur={(newContent) => setContents(newContent)} 
                      //  onBlur={(newContent) => {const cleaned = cleanHTML(newContent);
                      //   setContents(cleaned)} }
      //                  onBlur={(newContent) => {
      //   const cleaned = cleanHTML(newContent);
      //   setContents(cleaned);
      //   if (editor.current) {
      //     editor.current.value = cleaned;
      //   }
      // }}
                      onChange={(newContent) => debouncedSetContents(newContent)} // debounced change
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
  } else if (screenNumber === 4) {
    return (
      <>
        <Modal open={open} onClose={handleClose}>
          <div className="review-modal-container">
            <div className="review-modal-content">
              <div className="review-modal-header">
                <Typography variant="h6">PREVIEW REPORT : EXECUTIVE SUMMARY</Typography>
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
                      config={config}

                      tabIndex={1}
                      onBlur={(newContent) => setExeSummary(newContent)}
                      //  onBlur={(newContent) => {const cleaned = cleanHTML(newContent);
                      //   setExeSummary(cleaned)} }
      //                  onBlur={(newContent) => {
      //   const cleaned = cleanHTML(newContent);
      //   setExeSummary(cleaned);
      //   if (editor.current) {
      //     editor.current.value = cleaned;
      //   }
      // }}
                      onChange={(newContent) => {
                        prevContentRef.current = newContent;
                        debouncedSetExeSummary(newContent)
                      }} // Updates state on every change
                    />
                  </div>
                </Typography>
                <DialogBox dialog={dialog} handleDialogBox={handleDialogBox} />
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
        <Modal open={open} onClose={handleClose}>
          <div className="review-modal-container">
            <div className="review-modal-content">
              <div className="review-modal-header">
                <Typography variant="h6">PREVIEW REPORT : IMPROVEMENT OPPORTUNITY AREAS (DEDUCTIBLES)</Typography>
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
                      config={config}
                      tabIndex={1}
                      onBlur={(newContent) => setImprovements(newContent)} 
                      //  onBlur={(newContent) => {const cleaned = cleanHTML(newContent);
                      //   setImprovements(cleaned)} }
      //                  onBlur={(newContent) => {
      //   const cleaned = cleanHTML(newContent);
      //   setImprovements(cleaned);
      //   if (editor.current) {
      //     editor.current.value = cleaned;
      //   }
      // }}
                      onChange={(newContent) => { debouncedSetImporvements(newContent) }} 
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




  // else if (screenNumber === 6) {
  //   return (
  //     <>
  //       <Modal open={open} onClose={handleClose}>
  //         <div className="review-modal-container">
  //           <div className="review-modal-content">
  //             <div className="review-modal-header">
  //               <Typography variant="h6">PREVIEW REPORT : CRITICAL OBSERVATIONS</Typography>
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

  //                           <TextField
  //                             id="outlined-multiline-flexible"
  //                             label="Critical Observations"
  //                             placeholder="Critical Observations"
  //                             multiline
  //                             onChange={(e) => handleObservationEdit(index, e)}
  //                             // value={observation.observation}
  //                             value={observation.observation ? observation.observation.replace(/\s+/g, ' ').trim() : ''}
  //                             style={{ width: "100%", fontFamily: "inherit", backgroundColor: "white" }}
  //                           />
  //                           &nbsp;
  //                           <DeleteIcon
  //                             onClick={() => removeItem(index)}
  //                             className="cancel-icon"
  //                           />
  //                         </div>
  //                       ))
  //                     )}
  //                   </div>
  //                   <br />
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
        <Modal open={open} onClose={handleClose}>
          <div className="review-modal-container" >
            <div className="review-modal-content">
              <div className="review-modal-header">
                <Typography variant="h6">PREVIEW REPORT : CRITICAL OBSERVATIONS, RECOMMENDATIONS & REASONING - ELECTRICAL REPORT</Typography>
                <button className="custom-close-button" onClick={handleClose}>
                  &#10005; {/* Unicode for 'X' */}
                </button>
              </div>
              {/* <div className="sub-headings" style={{ fontWeight: 500 }}>
                CRITICAL OBSERVATIONS, RECOMMENDATIONS & REASONING - ELECTRICAL
                SAFETY
              </div>
              <br /> */}
              <div className="review-modal-body">
                <div className="table-container">
                  <TableContainer component={Paper} className="table-scroll" ref={tableRef}>
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
                            style={
                              observation.variant === true
                                ? { backgroundColor: "#f2f2f2" }
                                : {}
                            }
                          >
                            <TableCell>{index + 1}</TableCell>
                            {/* Areas */}
                            <TableCell className="editable-cell" style={{ height: "100px" }}>
                              <div className="cell-content">
                                <CreatableSelect
                                  styles={{
                                    ...customSelectStylesCreatable,
                                    // menuPortal: (base) => ({ ...base, zIndex: 9999 }), // Ensures dropdown appears on top
                                    color:
                                      (isEditing && currentEditedRow !== index) ||
                                        observation.variant === true
                                        ? "grey"
                                        : "black",
                                  }}
                                  placeholder="Area"
                                  options={areaOptions().length > 0 ? areaOptions() : []} // Show empty array if no options
                                  noOptionsMessage={() => "No options"} // Display "No options" when empty
                                  value={
                                    observation.area
                                      ? { label: observation.area, value: observation.area }
                                      : null
                                  }
                                  isSearchable
                                  // onChange={(e) => {
                                  //   // Immediately update the observation object in the state
                                  //   const updatedObservations = [...selectedObservations];
                                  //   updatedObservations[index] = {
                                  //     ...observation,
                                  //     area: e.value, // Update the area field
                                  //   };

                                  //   setSelectedObservations(updatedObservations); // Update state
                                  //   handleCellEdit(e, index, "area", observation.area, observation);
                                  // }}
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
                                  isDisabled={
                                    (isEditing && currentEditedRow !== index) || observation.variant === true
                                  }
                                  // menuPortalTarget={document.body} // Moves dropdown outside container to prevent layout issues
                                  menuPlacement="auto" // Automatically adjusts placement to avoid cut-off
                                />
                              </div>
                              {!observation.variant && (
                                <EditOutlinedIcon className="edit-icon" fontSize="small"
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevents triggering unwanted events
                                    if ((isEditing && currentEditedRow !== index) || observation.variant === true) {
                                      toast.warning("Please save changes in the currently edited row before editing another row.");
                                    }
                                  }} />
                              )}
                            </TableCell>
                            {/* Category */}
                            <TableCell className="editable-cell" style={{ height: "100px" }}>
                              <div className="cell-content">
                                <CreatableSelect
                                  styles={{
                                    ...customSelectStylesCreatable,
                                    // menuPortal: (base) => ({ ...base, zIndex: 9999 }) // Ensures dropdown appears on top
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
                                  // onChange={(e) =>
                                  //   handleCellEdit(e, index, "category", observation.category, observation)
                                  // }
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
                                  // menuPortalTarget={document.body} // Moves dropdown outside container to prevent layout issues
                                  menuPlacement="auto" // Automatically adjusts placement to avoid cut-off
                                />
                              </div>
                              {!observation.variant && (
                                <EditOutlinedIcon className="edit-icon" fontSize="small"
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevents triggering unwanted events
                                    if ((isEditing && currentEditedRow !== index) || observation.variant === true) {
                                      toast.warning("Please save changes in the currently edited row before editing another row.");
                                    }
                                  }}
                                />
                              )}
                            </TableCell>
                            {/* Check Point */}
                            <TableCell
                              className="editable-cell"
                              style={{ height: "100px" }}
                            >
                              <div
                                className="cell-content"
                                style={{
                                  color:
                                    (isEditing && currentEditedRow !== index) ||
                                      observation.variant === true
                                      ? "grey"
                                      : "black",
                                  marginRight: "10px"
                                }}
                              >

                                <TextField
                                  id={`outlined-textarea-${index}`}
                                  value={observation.check_points}

                                  onChange={(e) => {
                                    const newValue = e.target.value;

                                    const proceed = handleCellEdit(
                                      { ...e, target: { ...e.target, textContent: newValue } },
                                      index,
                                      "check_points",
                                      observation.check_points,
                                      { ...observation, check_points: newValue }
                                    );

                                    if (!proceed) return;

                                    if (newValue !== observation.check_points) {
                                      const updatedObservations = [...selectedObservations];
                                      updatedObservations[index] = {
                                        ...observation,
                                        check_points: newValue,
                                      };
                                      setSelectedObservations(updatedObservations);
                                    }
                                  }}


                                  onBlur={(e) => {
                                    handleCellEdit(e, index, "check_points", observation.check_points, observation);
                                  }}
                                  sx={{ width: "200px" }}
                                  InputProps={{
                                    sx: { fontSize: "10px" },
                                    disabled: currentEditedRow !== -1 && currentEditedRow !== index,
                                  }}
                                  placeholder="Check Point"
                                  variant="outlined"
                                  size="small"
                                  fullWidth
                                  multiline
                                  minRows={1.5}
                                  maxRows={10}
                                />



                              </div>
                              {!observation.variant && (
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
                              )}
                            </TableCell>
                            {/* observation */}
                            <TableCell
                              className="editable-cell"
                              style={{ height: "100px" }}
                            >
                              <div
                                className="cell-content"
                                style={{
                                  color:
                                    (isEditing && currentEditedRow !== index) ||
                                      observation.variant === true
                                      ? "grey"
                                      : "black",
                                  marginRight: "10px"
                                }}
                              >

                                <TextField
                                  id={`outlined-textarea-${index}`}
                                  placeholder="Observation"
                                  // value={observation.observation}
                                  // value={observation.observation ? observation.observation.replace(/\s+/g, ' ').trim() : ''}
                                  value={observation.observation || ''}


                                  onChange={(e) => {
                                    if (currentEditedRow !== -1 && currentEditedRow !== index) {
                                      toast.warning("Please save the current row before editing another.");
                                      return;
                                    }

                                    const newValue = e.target.value;

                                    const proceed = observation.hasEdited
                                      ? handleCellEdit(
                                        { ...e, target: { ...e.target, textContent: newValue } },
                                        index,
                                        "observation",
                                        observation.observation,
                                        { ...observation, observation: newValue }
                                      )
                                      : (() => {
                                        const allowed = handleCellEdit(
                                          { ...e, target: { ...e.target, textContent: newValue } },
                                          index,
                                          "observation",
                                          observation.observation,
                                          { ...observation, observation: newValue }
                                        );
                                        if (!allowed) return false;
                                        return true;
                                      })();

                                    if (!proceed) return;

                                    const updatedObservations = [...selectedObservations];
                                    updatedObservations[index] = {
                                      ...observation,
                                      observation: newValue,
                                      hasEdited: true,
                                    };
                                    setSelectedObservations(updatedObservations);
                                  }}

                                  onBlur={(e) => {
                                    const latestValue = e.target.value;

                                    // Ensure final value is saved when the field loses focus
                                    handleCellEdit(
                                      { ...e, target: { ...e.target, textContent: latestValue } },
                                      index,
                                      "observation",
                                      observation.observation,
                                      { ...observation, observation: latestValue }
                                    );
                                  }}
                                  sx={{ width: "200px" }}
                                  InputProps={{
                                    sx: { fontSize: "10px" },
                                    disabled: currentEditedRow !== -1 && currentEditedRow !== index,
                                  }}
                                  variant="outlined"
                                  size="small"
                                  fullWidth
                                  multiline
                                  minRows={1.5}
                                  maxRows={10}
                                />

                                <DialogBox dialog={dialog} handleDialogBox={handleDialogBoxObservation} />
                              </div>
                              {!observation.variant && (
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
                              )}
                            </TableCell>
                            {/* Criticality */}
                            <TableCell className="editable-cell" style={{ height: "100px" }}>
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

                              {!observation.variant && (
                                <EditOutlinedIcon className="edit-icon" fontSize="small"
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevents triggering unwanted events
                                    if ((isEditing && currentEditedRow !== index) || observation.variant === true) {
                                      toast.warning("Please save changes in the currently edited row before editing another row.");
                                    }
                                  }} />
                              )}
                            </TableCell>
                            {/* Recommendation */}
                            <TableCell className="editable-cell">
                              <div
                                className="cell-content"
                                style={{
                                  color:
                                    (isEditing && currentEditedRow !== index) ||
                                      observation.variant === true
                                      ? "grey"
                                      : "black",
                                  marginRight: "10px"
                                }}
                              >

                                <TextField
                                  id={`outlined-textarea-${index}`}
                                  value={observation.recommendations}
                                  placeholder="Recommendations"
                                  // onChange={(e) => {
                                  //   if (currentEditedRow !== -1 && currentEditedRow !== index) {
                                  //     toast.warning("Please save the current row before editing another.");
                                  //     return;
                                  //   }

                                  //   const newValue = e.target.value;

                                  //   // First-time edit confirmation handling
                                  //   if (!observation.hasEdited) {
                                  //     const isAllowedToEdit = handleCellEdit(
                                  //       { ...e, target: { ...e.target, textContent: newValue } },
                                  //       index,
                                  //       "recommendations",
                                  //       observation.recommendations,
                                  //       { ...observation, recommendations: newValue }
                                  //     );
                                  //     if (!isAllowedToEdit) return;
                                  //   }

                                  //   const updatedObservations = [...selectedObservations];
                                  //   updatedObservations[index] = {
                                  //     ...observation,
                                  //     recommendations: newValue,
                                  //     hasEdited: true,
                                  //   };
                                  //   setSelectedObservations(updatedObservations);
                                  // }}
                                  onChange={(e) => {
                                    const newValue = e.target.value;

                                    // Handle first-time edit confirmation
                                    const proceed = handleCellEdit(
                                      { ...e, target: { ...e.target, textContent: newValue } },
                                      index,
                                      "recommendations",
                                      observation.recommendations,
                                      { ...observation, recommendations: newValue }
                                    );

                                    if (!proceed) return;

                                    if (newValue !== observation.recommendations) {
                                      const updatedObservations = [...selectedObservations];
                                      updatedObservations[index] = {
                                        ...observation,
                                        recommendations: newValue,
                                        hasEdited: true, // Mark as edited after the first change
                                      };
                                      setSelectedObservations(updatedObservations);
                                    }
                                  }}

                                  onBlur={(e) => {
                                    const latestValue = e.target.value;
                                    handleCellEdit(
                                      { ...e, target: { ...e.target, textContent: latestValue } },
                                      index,
                                      "recommendations",
                                      observation.recommendations,
                                      { ...observation, recommendations: latestValue }
                                    );
                                  }}
                                  sx={{ width: "200px" }}
                                  InputProps={{
                                    sx: { fontSize: "10px" },
                                    disabled: currentEditedRow !== -1 && currentEditedRow !== index,
                                  }}
                                  variant="outlined"
                                  size="small"
                                  fullWidth
                                  multiline
                                  minRows={1.5}
                                  maxRows={10}
                                />

                              </div>
                              {!observation.variant && (
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
                              )}
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
                                    (isEditing && currentEditedRow !== index) ||
                                      observation.variant === true
                                      ? "grey"
                                      : "black",
                                  marginRight: "10px"
                                }}
                              >

                                <TextField
                                  id={`outlined-textarea-${index}`}
                                  value={observation.is_reference}
                                  placeholder="IS Reference"

                                  onChange={(e) => {
                                    const newValue = e.target.value;

                                    // Handle first-time edit confirmation
                                    const proceed = handleCellEdit(
                                      { ...e, target: { ...e.target, textContent: newValue } },
                                      index,
                                      "is_reference",
                                      observation.is_reference,
                                      { ...observation, is_reference: newValue }
                                    );

                                    if (!proceed) return;

                                    if (newValue !== observation.is_reference) {
                                      const updatedObservations = [...selectedObservations];
                                      updatedObservations[index] = {
                                        ...observation,
                                        is_reference: newValue,
                                        hasEdited: true, // Mark as edited after the first change
                                      };
                                      setSelectedObservations(updatedObservations);
                                    }
                                  }}

                                  onBlur={(e) => {
                                    const latestValue = e.target.value;
                                    handleCellEdit(
                                      { ...e, target: { ...e.target, textContent: latestValue } },
                                      index,
                                      "is_reference",
                                      observation.is_reference,
                                      { ...observation, is_reference: latestValue }
                                    );
                                  }}
                                  sx={{ width: "200px" }}
                                  InputProps={{
                                    sx: { fontSize: "10px" },
                                    disabled: currentEditedRow !== -1 && currentEditedRow !== index,
                                  }}
                                  variant="outlined"
                                  size="small"
                                  fullWidth
                                  multiline
                                  minRows={1.5}
                                  maxRows={10}
                                />

                              </div>
                              {!observation.variant && (
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
                              )}
                            </TableCell>
                            {/* Photo Upload */}
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
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "center",
                                }}
                              >
                                {!observation.variant && (

                                  <InfoIcon
                                    onClick={
                                      isEditing && currentEditedRow !== index
                                        ? undefined
                                        : () =>
                                          getObservationVariants(observation.observation, index)
                                    }
                                    style={{
                                      cursor:
                                        isEditing && currentEditedRow !== index ? "not-allowed" : "pointer",
                                      opacity: isEditing && currentEditedRow !== index ? 0.5 : 1,
                                    }}
                                  />

                                )}

                                {/* <DeleteForeverIcon
                                  onClick={() => handleDeleteRow(index)}
                                  style={{ cursor: "pointer" }}
                                  size={30}
                                  isDisabled={
                                    isEditing && currentEditedRow !== index
                                  } /> */}
                                <DeleteForeverIcon
                                  onClick={
                                    isEditing && currentEditedRow !== index
                                      ? undefined
                                      : () => handleDeleteRow(index)
                                  }
                                  style={{
                                    cursor: isEditing && currentEditedRow !== index ? "not-allowed" : "pointer",
                                    opacity: isEditing && currentEditedRow !== index ? 0.5 : 1,
                                  }}
                                  aria-disabled={isEditing && currentEditedRow !== index}
                                />

                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {/* Add new row for user input */}
                        <TableRow >
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
                              options={areaOptions()}
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
                                if (!/^[a-zA-Z0-9\s]+$/.test(inputValue)) return false;
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
                              options={categoryOptions}
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
                            {/* <textarea
                                className="input-field"
                                value={newRow.check_points}
                                onChange={(e) =>
                                  handleChangeNewRow(e, "check_points")
                                }
                                placeholder="Check Point"
                              /> */}
                            <TextField
                              // id="outlined-textarea"

                              value={newRow.check_points}
                              placeholder="Check Point"
                              // label="Check Point"
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
                            {/* <textarea
                              className="input-field"
                              value={newRow.observation}
                              onChange={(e) =>
                                handleChangeNewRow(e, "observation")
                              }
                              placeholder="Observation"
                            /> */}
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
                            {/* <textarea
                              className="input-field"
                              value={newRow.recommendations}
                              onChange={(e) =>
                                handleChangeNewRow(e, "recommendations")
                              }
                              placeholder="Recommendations"
                            /> */}
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
                            {/* <textarea
                              className="input-field"
                              value={newRow.is_reference}
                              onChange={(e) =>
                                handleChangeNewRow(e, "is_reference")
                              }
                              placeholder="IS Reference"
                            /> */}
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
                            {/* <div className="image-container">
                              <div className="upload-container">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleImageUpload(
                                      selectedObservations.length,
                                      e.target.files
                                    )
                                  }
                                  multiple
                                  style={{ color: "transparent" }}
                                  disabled
                                />
                                {newRow.imageUrls?.length === 0 && (
                                  <div className="no-file-chosen">No file chosen</div>
                                )}
                              </div> 
                            </div> */}
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
        <Modal open={open} onClose={handleClose}>
          <div className="review-modal-container">
            <div className="review-modal-content">
              <div className="review-modal-header">
                <Typography variant="h6">PREVIEW REPORT : SCORING TABLE</Typography>
                <button className="custom-close-button" onClick={handleClose}>
                  &#10005; {/* Unicode for 'X' */}
                </button>
              </div>
              <div className="review-modal-body" style={{ overflowY: "auto" }}>
                <Typography variant="body1" component="div">
                  <div>
                    {/* <div className="sub-headings">
                      Electrical Safety Scoring Table
                    </div>
                    <br /> */}
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
                  <div 
                  className="graphClass"
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
      <YAxis domain={[0, 5]} />
      <Tooltip />
      <Legend />
      <Bar dataKey="Maximum Score" fill="#006400" >
        <LabelList dataKey="Maximum Score" position="top" />
      </Bar>
      <Bar dataKey="Score Obtained" fill="#FFD700" 
      >
        <LabelList dataKey="Score Obtained" position="top" />
      </Bar>
    </BarChart>
  </ResponsiveContainer>
</div>

                </Typography>
              </div>
              <hr />
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
                {/* <button
                  className="button-styles"
                  color="primary"
                  onClick={() => handleNext()}
                  style={{ background: "#efc71d" }}
                >
                  Next &#187;
                </button> */}
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
        <Modal open={open} onClose={handleClose}>
          <div className="review-modal-container">
            <div className="review-modal-content">
              <div className="review-modal-header">
                <Typography variant="h6">PREVIEW REPORT : OVERALL RISK ASSESSMENT INDICATOR</Typography>
                <button className="custom-close-button" onClick={handleClose}>
                  &#10005; {/* Unicode for 'X' */}
                </button>
              </div>
              <div className="review-modal-body" style={{ overflowY: "auto" }}>
                <Typography variant="body1" component="div">
                  <div className="review-modal-body" style={{ display: "flex", gap: "10px", overflowY: "auto", marginBottom:"20px"}}>
  
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
      config={config}
      tabIndex={1}
      onBlur={(newContent) => setOverallAssessmentIndicator(newContent)} 
      onChange={(newContent) => { debouncedSetOverallAssessmentsIndicator(newContent) }} 
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
                  {/* <div>
                  
                    <JoditEditor
                      ref={editor}
                      placeholder="Enter your text here"
                      value={overallAssessmentIndicator}
                      config={config}
                      tabIndex={1}
                      onBlur={(newContent) => setOverallAssessmentIndicator(newContent)} 
                      onChange={(newContent) => { debouncedSetOverallAssessmentsIndicator(newContent) }} 
                    />
                  </div> */}
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
        animate={false}
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
        <Modal open={open} onClose={handleClose}>
          <div className="review-modal-container">
            <div className="review-modal-content">
              <div className="review-modal-header">
                <Typography variant="h6">PREVIEW REPORT : WAY FORWARD PLAN</Typography>
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
                      config={config}
                      tabIndex={1}
                      onBlur={(newContent) => setTheWayForward(newContent)} 
                      //  onBlur={(newContent) => {const cleaned = cleanHTML(newContent);
                      //   setTheWayForward(cleaned)} }
                      onChange={(newContent) => { debouncedSetTheWayForward(newContent) }} // Updates state on every change
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
  else if (screenNumber === 10) {
    return (
      <>
        <Modal open={open} onClose={handleClose}>
          <div className="review-modal-container">
            <div className="review-modal-content">
              <div className="review-modal-header">
                <Typography variant="h6">PREVIEW REPORT : CONCLUSION</Typography>
                <button className="custom-close-button" onClick={handleClose}>
                  &#10005; {/* Unicode for 'X' */}
                </button>
              </div>
              <div className="review-modal-body" style={{ overflowY: "auto" }}>
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
                      config={config}
                      tabIndex={1}
                      // config={{
                      //   ...config,
                      //   readonly: false,
                      //   toolbarSticky: false,
                      //   askBeforePasteFromHTML: false,
                      //   askBeforePasteFromWord: false,
                      //   processPasteFromWord: true,
                      //   defaultActionOnPaste: 'insert_clear_html',  // Clears formatting but keeps structure
                      //   pasteHTMLAction: 'insert_clear_html',
                      //   disablePlugins: ['pasteDialog', 'paste'],
                      //   cleanHTML: {
                      //     removeStyles: true,
                      //     removeClasses: true,
                      //   },
                      //   pasteFromClipboard: true,

                      // }}
                      onBlur={(newContent) => setConclusion(newContent)} 
                      //  onBlur={(newContent) => {const cleaned = cleanHTML(newContent);
                      //   setConclusion(cleaned)} }
                      onChange={(newContent) => { debouncedSetConclusion(newContent) }} // Updates state on every change
                    />
                  </div>
                </Typography>
              </div>
              <hr />
              <div className="review-modal-footer" id="conclusionFooter">
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
                {/* <button
                  className="button-styles"
                  onClick={handleComplete}
                  // disabled={isComplete}
                  style={{ background: "#efc71d" }}
                >
                  Complete
                </button> */}
                <ExportSavedReportPDF
                  selectedOrganization={selectedOrganization}
                  chartImageElectrical={chartImage}
                    // gaugeImageWord={gaugeImage}
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
                  // imageUrlsByRow={imageUrlsByRow}
                  isSaved={isSaved}
                  scores={scores}
                  cumulativeScore={cumulativeScore}
                  otherDetails={otherDetails}
                  ReportUID={ReportUID}
                  startDate={startDate}
                  endDate={endDate}
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
                  // gaugeImageWord={gaugeImage}
                  contents={contents}
                  exeSummary={exeSummary}
                  criticalObservations={criticalObservations}
                  selectedObservations={selectedObservations}
                  selectedArea={selectedArea}
                  selectedCategory={selectedCategory}
                  recommendations={recommendations}
                  conclusion={conclusion}
                  selectedDateTime={selectedDateTime.split("T")[0]}
                  // imageUrlsByRow={imageUrlsByRow}
                  isSaved={isSaved}
                  scores={scores}
                  cumulativeScore={cumulativeScore}
                  otherDetails={otherDetails}
                  ReportUID={ReportUID}
                  bestPractice={bestPractice}
                  theWayForward={theWayForward}
                  startDate={startDate}
                  endDate={endDate}
                  name={name}
                  facilityInfo={facilityInfo}
                />
                <ExportWordDoc
                  selectedOrganization={selectedOrganization}
                  chartImageElectrical={chartImage}
                  //  gaugeImageWord={gaugeImage}
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
                  isSaved={isSaved}
                  scores={scores}
                  cumulativeScore={cumulativeScore}
                  otherDetails={otherDetails}
                  ReportUID={ReportUID}
                  bestPractice={bestPractice}
                  theWayForward={theWayForward}
                  startDate={startDate}
                  endDate={endDate}
                  name={name}
                  facilityInfo={facilityInfo}
                   client = {selectedOrganization.label}
                   location={selectedSite.label}
                   date= {startDate.getTime() === endDate.getTime()
                        ? `${startDate.getDate()}-${startDate.getMonth() + 1
                        }-${startDate.getFullYear()}`
                        : `${startDate.getDate()}-${startDate.getMonth() + 1
                        }-${startDate.getFullYear()} to ${endDate.getDate()}-${endDate.getMonth() + 1
                        }-${endDate.getFullYear()}`}
                />
              </div>
            </div>
          </div>
        </Modal>
      </>
    );
  }
};

export default PreviewReportModal;

