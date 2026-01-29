import React, { useState, useEffect, useRef } from "react";
import { debounce } from 'lodash';
import { FaTrash, FaCheck, FaPlus, FaHeading } from "react-icons/fa";

import {
  Button,
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
  TextField,
  Accordion, AccordionDetails, AccordionSummary
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import "./HseSavedReportModal.css";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import CloseIcon from "@material-ui/icons/Close";
import IconButton from "@material-ui/core/IconButton";
import CancelIcon from "@mui/icons-material/Cancel";
import { config } from "../../config";
import axios from "../../APIs/axios";
import { toast, ToastContainer } from "react-toastify";
import ExportSavedReportPDF from "../ExportSavedReportPDF/ExportSavedReportPDF";
import ExportWordDoc from "../ExportWordDoc/ExportWordDoc";
import { getAccountDetails } from "../Services/localStorage";
import ExportExcel from "../ExportExcel/ExportExcel";
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";
import PlaylistAddCircleIcon from "@mui/icons-material/PlaylistAddCircle";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import Chart from "react-apexcharts";
import html2canvas from "html2canvas";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ImageViewerModal from "../ImageViewerModal/ImageViewerModal";
import Loader from "../Loader/Loader";
import VariantsModal from "../VariantsModal/VariantsModal";
import InfoIcon from "@mui/icons-material/Info";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import CheckIcon from "@mui/icons-material/Check";
import ObservationsDrawer from "../ObservationsDrawer/ObservationsDrawer";
import DeleteIcon from "@mui/icons-material/Delete";
import JoditEditor from 'jodit-react';
import HTMLReactParser from 'html-react-parser';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import InsertPhotoOutlinedIcon from '@mui/icons-material/InsertPhotoOutlined';
import { IoAddCircle } from "react-icons/io5";
import { compressionOptions } from "html-docx-js/dist/html-docx";
import DialogBox from "../DialogBox/DialogBox";


const removeDuplicates = (observations) => {
  const uniqueObservations = Array.from(
    new Map(observations.map((item) => [item.observation, item])).values()
  );
  return uniqueObservations;
};

const HseSavedReportModal = ({
  selectedReportData,
  setOpenSavedReport,
  allData,
  reportHeader,
  getAllHseData,
  module,
  setOpenReportList,
  getAllHseReports,
  exp,
}) => {
  const [expanded, setExpanded] = useState(null);
  const [notes, setNotes] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [screenNumber, setScreenNumber] = useState(exp === true ? 12 : 1);
  const [selectedDateTime, setSelectedDateTime] = useState(
    selectedReportData.date_time
  );
  const [orgList, setOrgList] = useState([]);
  const [selectedOrganization, setSelectedOrganization] = useState({
    label: selectedReportData.organization,
    value: selectedReportData.org_id,
  });
  // console.log("brief",selectedReportData)
  const [selectedSite, setSelectedSite] = useState({
    label: selectedReportData.site,
    value: selectedReportData.site,
  });
  const [startDate, setStartDate] = useState(selectedReportData.start_date);
  const [endDate, setEndDate] = useState(selectedReportData.end_date);
  const [siteOptions, setSiteOptions] = useState([]);
  const [areaList, setAreaList] = useState([]);
  // const [selectedArea, setSelectedArea] = useState(
  //   selectedReportData.Areas?selectedReportData.Areas.map((e) => e.area):[]
  // );
  const [selectedArea, setSelectedArea] = useState(
    Array.isArray(selectedReportData?.Areas) && selectedReportData.Areas.length > 0
      ? selectedReportData.Areas.map((e) => e.area)
      : ["NA"]
  );
  const [categoryList, setCategoryList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(
    selectedReportData.Categories
      ? selectedReportData.Categories.map((e) => e.category)
      : []
  );
  const [selectedSector, setSelectedSector] = useState({
    label: selectedReportData.sector_type || "",
    value: selectedReportData.sector_type || "",
  });
  // const [selectedParam, setSelectedParam] = useState(
  //   Array.from(
  //     new Set(selectedReportData.AllObservations.map((e) => e.table_type) .filter((e) => e !== null && e !== undefined && e !== ""))
  //   ).map((table_type) => ({ label: table_type, value: table_type }))
  // );
  const [selectedParam, setSelectedParam] = useState(() =>
    Array.from(
      new Set(
        (selectedReportData?.AllObservations || [])
          .map((e) => e.table_type)
          .filter((e) => e !== null && e !== undefined && e !== "")
      )
    ).map((table_type) => ({ label: table_type, value: table_type }))
  );

  // const [AllObservations, setAllObservations] = useState(
  //   selectedReportData.AllObservations
  // );
  const [AllObservations, setAllObservations] = useState(
    // selectedReportData.AllObservations
    selectedReportData?.AllObservations || []
  );
  // const [selectedObservations, setSelectedObservations] = useState(
  //   selectedReportData.AllObservations.filter((e) => e.isNew = true)
  // );
  const [selectedObservations, setSelectedObservations] = useState(() =>
    (selectedReportData?.AllObservations || []).filter((e) => e.isNew === true)
  );


  const [recommendations, setRecommendations] = useState(
    selectedReportData.Recommendations
  );
  const [criticalObservations, setCriticalObservations] = useState([]);
  const [otherDetails, setOtherDetails] = useState(
    selectedReportData.other_details
  );
  const [backgroundBrief, setBackgroundBrief] = useState(
    selectedReportData.background_brief
      ? selectedReportData.background_brief
      : reportHeader.background_brief
  );
  const [improvementOpportunityAreas, setImprovementOpportunityAreas,] = useState(
    selectedReportData.improvement_opportunity_areas
      ? selectedReportData.improvement_opportunity_areas
      : reportHeader.improvement_opportunity_areas
  );
  const [classificationOfAuditObservations, setClassificationOfAuditObservations] = useState(
    selectedReportData.classification_of_audit_observations
      ? selectedReportData.classification_of_audit_observations
      : reportHeader.classification_of_audit_observations
  );
  const [auditScoreAnalysis, setAuditScoreAnalysis] = useState(
    selectedReportData.audit_score_analysis
      ? selectedReportData.audit_score_analysis
      : reportHeader.audit_score_analysis
  );
  const [overallAssessmentIndicator, setOverallAssessmentIndicator] = useState(
    selectedReportData.overall_assessment_indicator
      ? selectedReportData.overall_assessment_indicator
      : reportHeader.overall_assessment_indicator
  );
  const [introduction, setIntroduction] = useState(
    selectedReportData.introduction
      ? selectedReportData.introduction
      : reportHeader.introduction
  );
  const [contents, setContents] = useState(
    selectedReportData.contents
      ? selectedReportData.contents.replace("Scoring Table", "Charts")
      : reportHeader.contents.replace("Scoring Table", "Charts")
  );
  const [exeSummary, setExeSummary] = useState(
    selectedReportData.exe_summary
      ? selectedReportData.exe_summary
      : reportHeader.exe_summary
  );
  const [conclusion, setConclusion] = useState(
    selectedReportData.conclusion
      ? selectedReportData.conclusion
      : reportHeader.conclusion
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
  const [imageUrlsByRow, setImageUrlsByRow] = useState(
    JSON.parse(selectedReportData.image_urls)
      ? JSON.parse(selectedReportData.image_urls)
      : {}
  );
  const { userId, name } = getAccountDetails();
  const [editedObservations, setEditedObservations] = useState([]);
  // const [editedRecommendations, setEditedRecommendations] = useState([]);
  // const [editedAreas, setEditedAreas] = useState([]);
  // const [editedCategories, setEditedCategories] = useState([]);
  // const [editedCriticalities, setEditedCriticalities] = useState([]);
  // const [editedIsReference, setEditedIsReference] = useState([]);
  const [isReportEdited, setIsReportEdited] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [currentEditedRow, setCurrentEditedRow] = useState(-1);
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState([]);
  const [scorePercent, setScorePercent] = useState(0);
  const [chartImage, setChartImage] = useState(null);
  const chartContainerRef = useRef(null);
  const [disableSaveNext, setDisableSaveNext] = useState(false);
  const [waitForCharts, setWaitForCharts] = useState(true);
  const regexForBackground = /\bon.*?by\b/;
  const regexForExeSummary = /\bon.*?and\b/;
  const regexForAreas = /\bentire[\s\S]*?and\b/;
  const [loading, setLoading] = useState(false);
  const [area, setArea] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [openVairantModal, setOpenVariantModal] = useState(false);
  const [observationVariants, setObservationVariants] = useState([]);
  const [editedFields, setEditedFields] = useState([]);
  const [confirmationShown, setConfirmationShown] = useState(false);
  const [facilityInfo, setFacilityInfo] = useState({});
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [paramList, setParamList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const [newRowInputs, setNewRowInputs] = useState({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const editor = useRef(null);
  const classificationEditor = useRef();
  const contentEditor = useRef(null);
  const introductionEditor = useRef(null);
  const exeSummaryEditor = useRef(null);
  const bestPracticeEditor = useRef(null);
  const wayForwardPlanEditor = useRef(null);
  const conclusionEditor = useRef(null);
  const auditScoreEditor = useRef(null);
  const improvementEditor = useState(null);
  const overallAssessmentEditor = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [hasEditedCriticalObservations, setHasEditedCriticalObservations] = useState(false);
  const [selectedObservation, setSelectedObservation] = useState({ image: null, index: null });
  // const [timeFrom, setTimeFrom] = useState(selectedReportData.time_of_audit_from);
  // const [timeTo, setTimeTo] = useState(selectedReportData.time_of_audit_to);
  // const [briefPropertyDescription, setBriefPropertyDescription] = useState(selectedReportData.brief_property_description);
  // const [numOfFloors, setNumOfFloors] = useState(selectedReportData.num_of_floors);
  // const [avgStaffFootfall, setAvgStaffFootfall] = useState(selectedReportData.average_staff_footfall);
  // const [noObjectionCertificate, setNoObjectionCertificate] = useState(selectedReportData.no_objection_certificate);
  // const [nationalBuildingCodeCategory, setNationalBuildingCodeCategory] = useState(selectedReportData.national_building_code_category);
  // const [coordinationgPersonClientside, setCoordinationgPersonClientside] = useState(selectedReportData.coordinating_person_clientSide);
  // const [reportPreparedBy, setReportPreparedBy] = useState(selectedReportData.report_prepared_by);
  // const [reportReviewedBy, setReportReviewedBy] = useState(selectedReportData.report_reviewed_by);
const [timeFrom, setTimeFrom] = useState(selectedReportData?.time_of_audit_from ?? "");
const [timeTo, setTimeTo] = useState(selectedReportData?.time_of_audit_to ?? "");
const [briefPropertyDescription, setBriefPropertyDescription] = useState(selectedReportData?.brief_property_description ?? "");
const [numOfFloors, setNumOfFloors] = useState(selectedReportData?.num_of_floors ?? "");
const [avgStaffFootfall, setAvgStaffFootfall] = useState(selectedReportData?.average_staff_footfall ?? "");
const [noObjectionCertificate, setNoObjectionCertificate] = useState(selectedReportData?.no_objection_certificate ?? "");
const [nationalBuildingCodeCategory, setNationalBuildingCodeCategory] = useState(selectedReportData?.national_building_code_category ?? "");
const [coordinationgPersonClientside, setCoordinationgPersonClientside] = useState(selectedReportData?.coordinating_person_clientSide ?? "");
const [reportPreparedBy, setReportPreparedBy] = useState(selectedReportData?.report_prepared_by ?? "");
const [reportReviewedBy, setReportReviewedBy] = useState(selectedReportData?.report_reviewed_by ?? "");
const areaSelectRef = useRef(null);
  const criticalitySelectRef = useRef(null);
  const tableRef = useRef(null);
  const [isAreaDropdownOpen, setIsAreaDropdownOpen] = useState(false);
  const [isCriticalityDropdownOpen, setIsCriticalityDropdownOpen] = useState(false);

    useEffect(() => {
    const closeDropdownOnScroll = () => {
      if (isAreaDropdownOpen && areaSelectRef.current) {
        areaSelectRef.current.blur();
        setIsAreaDropdownOpen(false);
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
  }, [isAreaDropdownOpen, isCriticalityDropdownOpen]);





  const handleOpenImageDialog = (index, observation) => {
    setSelectedObservation({ image: observation, index });
    setOpenDialog(true);
  };

  const handleChangeAccordion = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : null);
  };
  const handleCloseImageDialog = () => {
    setSelectedObservation({ image: null, index: null });
    setOpenDialog(false);
  };
  const handleOpenDrawer = () => {
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  const initializeNewRowInputs = (tableType, sectorType) => {
    setNewRowInputs((prev) => ({
      ...prev,
      [tableType]: {
        table_type: tableType, // Fixed key for table type
        sector_type: sectorType, // Include sector type
        is_selected: 1, // Fixed value for is_selected
        area: "",
        check_points: "",
        observation: "",
        criticality: "",
        recommendations: "",
        is_reference: "",
        score: "",
        system_implementation: "",
        compliance_check: "",
        imageUrls: [],
      },
    }));
  };

  useEffect(() => {
    updateBackgroundBrief();
    updateExecSummary();
    getFacilityInfo();
  }, [
    selectedOrganization,
    selectedSite,
    startDate,
    endDate,
    selectedArea,
    selectedSector,
  ]);


  // useEffect(() => {
  //   const initialSelected = selectedReportData.AllObservations.filter((e) => e.is_selected === 1);
  //   setSelectedObservations(initialSelected);

  //   const initialManual = selectedReportData.manualCriticalObservations || [];
  //   setManualCriticalObservations(initialManual);

  //   const selectedHigh = initialSelected.filter((e) => e.criticality === "High");
  //   setCriticalObservations([...selectedHigh, ...initialManual]);
  // }, [selectedReportData]);

  useEffect(() => {
    if (!selectedReportData) return;

    const allObs = selectedReportData.AllObservations || [];
    const initialSelected = allObs.filter((e) => e.is_selected === 1);
    setSelectedObservations(initialSelected);

    const initialManual = selectedReportData.manualCriticalObservations || [];
    setManualCriticalObservations(initialManual);

    const selectedHigh = initialSelected.filter((e) => e.criticality === "High");
    setCriticalObservations([...selectedHigh, ...initialManual]);
  }, [selectedReportData]);

  useEffect(() => {
    getParamList();
  }, [selectedSector]);

  const getFacilityInfo = async () => {
    const response = await axios.get(
      `${config.PATH}/api/get-facility-info/${selectedReportData.report_id}`
    );
    const data = response.data;
    // Update each field individually
    setFacilityInfo(data);
  };

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
      .replace(
        regexForBackground,
        `on ${new Date(startDate).getDate()}-${new Date(startDate).getMonth() + 1
        }-${new Date(startDate).getFullYear()} and ${new Date(
          endDate
        ).getDate()}-${new Date(endDate).getMonth() + 1}-${new Date(
          endDate
        ).getFullYear()} by`
      );
    setBackgroundBrief(updatedData);
  };

  const updateExecSummary = () => {
    const updatedData = selectedReportData.exe_summary
      .replace(
        `${selectedReportData.organization}(${selectedReportData.site})`,
        `${selectedOrganization
          ? selectedOrganization.label
          : selectedReportData.organization
        }(${selectedSite ? selectedSite.label : selectedReportData.site})`
      )
      .replace(
        regexForExeSummary,
        `on ${new Date(startDate).getDate()}-${new Date(startDate).getMonth() + 1
        }-${new Date(startDate).getFullYear()} till ${new Date(
          endDate
        ).getDate()}-${new Date(endDate).getMonth() + 1}-${new Date(
          endDate
        ).getFullYear()} and`
      )
      .replace(
        regexForAreas,
        `entire ${selectedArea.map((e) => e).join(", ")} and`
      );
    setExeSummary(updatedData);
  };

  const fetchDataForCharts = () => {
    const observations = selectedObservations || [];

    const totalScore =
      observations.length > 0
        ? observations
          .map((e) => e.score || 0)
          .reduce((acc, score) => acc + score, 0)
        : 0;

    const percentage = Math.floor(
      (totalScore / (observations.length * 5)) * 100
    );

    setScorePercent(isNaN(percentage) ? 0 : percentage);
    setData(observations);
  };

  const convertChartToImage = async () => {
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

      chartContainerRef.current.style.height = null;

      const image = canvas.toDataURL("image/png");
      setChartImage(image);
    } catch (error) {
      console.log("Error converting div to image:", error);
    }
  };

  useEffect(() => {
    if (screenNumber === 11) {
      fetchDataForCharts();
      const timeoutId = setTimeout(() => {
        convertChartToImage();
      }, 1000); // Adjust the delay as needed (e.g., 1000 milliseconds)

      // Clear the timeout if the component unmounts or screenNumber changes
      return () => clearTimeout(timeoutId);
    }
  }, [screenNumber, selectedObservations, convertChartToImage]);

  useEffect(() => {
    setWaitForCharts(true);
    if (screenNumber === 11) {
      // Simulate loading for 3 seconds
      const loaderTimeout = setTimeout(() => {
        setWaitForCharts(false);
      }, 5000);

      // Cleanup timeout if the component unmounts or when loading is complete
      return () => clearTimeout(loaderTimeout);
    }
  }, [screenNumber]);
  const [dialog, setDialog] = useState({ open: false, message: "", title: "", accept: "", reject: "", onConfirm: null });
  const handleDialogBoxObservation = (action) => {
    if (action) {
      dialog.onConfirm(); // Execute the confirmed action (allow editing)
    }
    setDialog((prevDialog) => ({ ...prevDialog, open: false }));
  };
  // const handleCellEdit = (e, field, originalContent, observationObj) => {
  //   // Handle the confirmation dialog
  //   const handleConfirmation = () => {
  //     if (!confirmationShown) {
  //       const confirmEdit = window.confirm(
  //         "Editing the observation field will make this a new observation set and the variant list will be updated accordingly. Do you want to continue?"
  //       );
  //       if (!confirmEdit) {
  //         e.target.textContent = originalContent; // Revert content
  //         return false;
  //       } else {
  //         setConfirmationShown(true); // User confirmed
  //         return true;
  //       }
  //     }
  //     return true;
  //   };

  //   // Show confirmation for "observation" field
  //   if (field === "observation" && !handleConfirmation()) {
  //     setIsEditing(false);
  //     return; // Exit if the user cancels the confirmation
  //   }

  //   setIsEditing(true);

  //   const updateEditedFields = (newField) => {
  //     if (!editedFields.includes(newField)) {
  //       setEditedFields((prevFields) => [...prevFields, newField]);
  //     }
  //   };

  //   let currentContent;
  //   if (field === "area" || field === "category" || field === "criticality") {
  //     currentContent = e.value;
  //   } else {
  //     currentContent = e.target.textContent;
  //   }

  //   // Validate character limits
  //   const charLimitExceeded = (limit) => {
  //     if (currentContent.length > limit) {
  //       toast.warning(`Only ${limit} characters are allowed in this field.`);
  //       setIsEditing(false);
  //       return true;
  //     }
  //     return false;
  //   };

  //   if (field === "area" || field === "category") {
  //     if (charLimitExceeded(50)) return;
  //   } else if (field === "observation" || field === "recommendations") {
  //     if (charLimitExceeded(7000)) {
  //       e.target.textContent = currentContent.substring(0, 7000);
  //       const range = document.createRange();
  //       const sel = window.getSelection();
  //       range.setStart(e.target.childNodes[0], 7000);
  //       range.collapse(true);
  //       sel.removeAllRanges();
  //       sel.addRange(range);
  //       e.preventDefault();
  //       return;
  //     }
  //   }

  //   setIsReportEdited(true);

  //   // Find the observation using either sr_no or id
  //   const observationIndex = selectedObservations.findIndex(
  //     (obs) => obs.sr_no === observationObj.sr_no || obs.id === observationObj.id
  //   );

  //   // Check if a different row is being edited without saving the current one
  //   if (currentEditedRow !== -1 && currentEditedRow !== observationObj.sr_no && currentEditedRow !== observationObj.id) {
  //     toast.warning(
  //       "Please save changes in the currently edited row before editing another row."
  //     );
  //     return;
  //   }

  //   // Update the currentEditedRow state with the new sr_no or id
  //   setCurrentEditedRow(observationObj.sr_no || observationObj.id);

  //   let value = currentContent;

  //   const updatedObservations = [...editedObservations];
  //   // let i = updatedObservations.length ? updatedObservations.length - 1 : 0;
  //   // updatedObservations[i] = {
  //   //   ...observationObj,
  //   //   ...updatedObservations[i],
  //   //   [field]: value,
  //   //   selectedRefIndex: observationIndex,
  //   // };
  //   const existingIndex = updatedObservations.findIndex(
  //     (obs) => obs.sr_no === observationObj.sr_no || obs.id === observationObj.id
  //   );

  //   const refIndex = AllObservations.findIndex(
  //     (obs) => obs.sr_no === observationObj.sr_no || obs.id === observationObj.id
  //   );

  //   const newEditedObj = {
  //     ...(existingIndex !== -1 ? updatedObservations[existingIndex] : observationObj),
  //     [field]: value,
  //     selectedRefIndex: observationIndex,
  //     refIndex: refIndex,
  //   };

  //   if (existingIndex !== -1) {
  //     updatedObservations[existingIndex] = newEditedObj;
  //   } else {
  //     updatedObservations.push(newEditedObj);
  //   }


  //   setEditedObservations(updatedObservations);
  //   // console.log("editedobservations", setEditedObservations);
  //   // Check if the content has been reverted to the original
  //   const isReverted = (() => {
  //     switch (field) {
  //       case "observation":
  //       case "recommendations":
  //       case "is_reference":
  //         return e.target.textContent === originalContent;
  //       case "area":
  //       case "category":
  //       case "criticality":
  //         return e.value === originalContent;
  //       default:
  //         return false;
  //     }
  //   })();

  //   // If content is reverted, reset editing state
  //   if (isReverted) {
  //     setCurrentEditedRow(-1); // Reset currentEditedRow
  //     setIsEditing(false);
  //     setEditedObservations([]);
  //     setConfirmationShown(false); // Reset confirmation flag
  //   }

  //   // Update edited fields array based on the field edited
  //   const fieldMap = {
  //     category: "CA",
  //     check_points: "CH",
  //     observation: "O",
  //     criticality: "CR",
  //     recommendations: "R",
  //     is_reference: "I",
  //   };

  //   if (fieldMap[field]) {
  //     updateEditedFields(fieldMap[field]);
  //   }
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

    if (currentEditedRow !== -1 && currentEditedRow !== observationObj.sr_no) {
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
    setCurrentEditedRow(observationObj.sr_no);
    //     console.log("sr_nos",observationObj.sr_no);
    //  console.log("current edited row",setCurrentEditedRow)

    let value = "";

    if (["area", "category", "criticality"].includes(field)) {
      value = e?.value || "";
    } else if (e?.target?.value !== undefined) {
      value = e.target.value;
    } else if (e?.target?.textContent !== undefined) {
      value = e.target.textContent;
    }

    if ((field === "area" || field === "category") && value.length > 100) {
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
      const existingIndex = prev.findIndex(
        (obs) =>
          (obs.sr_no && obs.sr_no === observationObj.sr_no)

      );

      const base = existingIndex !== -1 ? prev[existingIndex] : observationObj;

      const updatedObs = {
        ...base,
        [field]: value,
        selectedRefIndex: index,
        // tempId: base.tempId || observationObj.tempId,
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
  const handleVariantSelection = (selectedVariants, removedSrNos) => {
    const updatedEdited = [...editedObservations];
    const updatedSelected = [...selectedObservations];

    selectedVariants.forEach((variantObs) => {
      // Mark as selected and variant
      variantObs.variant = true;
      variantObs.is_selected = 1;

      // Add to selectedObservations if not already there
      const alreadySelected = updatedSelected.some(
        (obs) => obs.sr_no === variantObs.sr_no || obs.id === variantObs.id
      );
      if (!alreadySelected) {
        updatedSelected.push(variantObs);
      }

      // Add to editedObservations if not already there
      const alreadyEdited = updatedEdited.some(
        (obs) => obs.sr_no === variantObs.sr_no || obs.id === variantObs.id
      );

      if (!alreadyEdited) {
        const selectedRefIndex = updatedSelected.length - 1;
        const refIndex = AllObservations.findIndex(
          (obs) =>
            obs.sr_no === variantObs.sr_no || obs.id === variantObs.id
        );
        updatedEdited.push({
          ...variantObs,
          selectedRefIndex,
          refIndex,
        });
      }
    });

    // If any variants were removed, clear them from selectedObservations
    const filteredSelected = updatedSelected.filter(
      (obs) => !removedSrNos.includes(obs.sr_no)
    );

    setSelectedObservations(filteredSelected);
    setEditedObservations(updatedEdited);
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
          ? `${config.PATH}/api/get-hse-cmv-critical-observations/${selectedReportData.report_id}`
          : `${config.PATH}/api/get-hse-critical-observations/${selectedReportData.report_id}`
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
  }, [allData, selectedCategory, selectedParam]);

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

  const refreshAllObservations = async () => {
    try {
      // Fetch the updated data from the API or wherever

      const endPoint =
        module === "cmv"
          ? `${config.PATH}/api/hse-cmv-report/${selectedReportData.report_id}`
          : `${config.PATH}/api/hse-report/${selectedReportData.report_id}`;
      const report = await axios.get(endPoint);
      // console.log("enddate",endPoint);
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

  const getOrgList = async () => {
    try {
      const response = await axios.get(`${config.PATH}/api/get-hse-orgs`);
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
        await axios.post(`${config.PATH}/api/create-hse-site`, payload);
      } catch (error) {
        console.log("Failed to create site:", error);
        return;
      }
    }
    setSelectedSite(selectedOption);
  };

  // const populateAreaList = async () => {
  //   try {
  //     // Check if selectedSector is an object with a valid value property
  //     if (selectedSector) {
  //       // Extract values from selectedParam if it contains any
  //       const selectedParamValues = selectedParam.map((param) => param.value);

  //       // Filter and get unique areas based on selectedParam values
  //       const area = allData.data
  //         .filter((e) => selectedParamValues.includes(e.table_type))
  //         .map((e) => e.area);

  //       let uniqueAreaList = [...new Set(area)];
  //       setAreaList(uniqueAreaList);
  //     } else {
  //       // Handle the case where selectedSector is null, undefined, or does not have a value
  //       setAreaList([]);
  //     }
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };

  const populateAreaList = async () => {
    try {

      const area = (allData?.data || [])
        .map((e) => e.area);

      let uniqueAreaList = [...new Set(area)];
      setAreaList(uniqueAreaList);

    } catch (err) {
      console.log(err);
    }
  };
  const handleChangeArea = (areas) => {
    // console.log("All before ", AllObservations);
    // console.log("selecte before", selectedObservations);
    // console.log("All critical before ", criticalObservations);


    try {
      const selectedArea = areas.map((e) => e.value);
      setSelectedArea(selectedArea);

      if (selectedArea.length === 0) {
        setAllObservations([]);
        setSelectedObservations([]);

        return;
      }

      //  Combine source data
      const combinedData = [
        ...allData.data,
        ...(selectedReportData.AllObservations || []),
      ];

      //  Get newly added observations (manual rows)
      // const newObservations = AllObservations.filter((obs) => obs.isNew);
      const newObservations = [
        ...selectedObservations,
        ...AllObservations,
      ].filter((obs) => obs.isNew);
      // console.log(selectedObservations);
      // console.log(newObservations)

      //  Filter observations by selected area
      const filteredObservations = combinedData.filter((item) =>
        selectedArea.includes(item.area)
      );

      //  Merge logic with priority: edited > previously selected > base
      const mergedObservations = filteredObservations.map((obs) => {
        const edited = editedObservations.find((e) => e.sr_no === obs.sr_no);
        const existing = AllObservations.find((o) => o.sr_no === obs.sr_no);
        const selected = selectedObservations.find((s) => s.sr_no === obs.sr_no);

        return {
          ...obs,
          ...existing,
          ...edited,
          ...selectedObservations,
          // ...(selected || {}),
          is_selected: selected ? 1 : 0,
          imageUrls: selected?.imageUrls || [],
        };
      });

      //  Combine everything: merged + manually added
      const combined = [...mergedObservations, ...newObservations];

      //  Deduplicate using sr_no
      const uniqueMap = new Map();
      combined.forEach((obs) => {
        uniqueMap.set(obs.sr_no, obs); // latest entry wins
      });
      const dedupedFinalObs = Array.from(uniqueMap.values());

      //  Filter selectedObservations that still exist
      const updatedSelected = selectedObservations.filter((sel) =>
        dedupedFinalObs.some((obs) => obs.sr_no === sel.sr_no)
      );
      // Combine manually added critical observations
      const updatedCritical = [
        ...criticalObservations.filter((obs) => obs.criticality === "High" || obs.sr_no === null),
        ...manualCriticalObservations,
      ].filter(
        (obs, index, self) =>
          obs.observation?.trim() !== "" &&
          index === self.findIndex((o) => o.observation === obs.observation)
      );

      setCriticalObservations(updatedCritical);


      //  Final state updates
      setAllObservations(dedupedFinalObs);
      setSelectedObservations(updatedSelected);
      // console.log("All", AllObservations);
      // console.log("selecte", selectedObservations);
      // console.log("All critical after ", criticalObservations);
      // console.log("updatedcri", updatedCritical)

    } catch (error) {
      console.log("An error occurred in handleChangeArea:", error);
    }
  };

  const handleChangeCategory = async (cat) => {
    const selectedCat = cat.map((e) => e.value);
    setSelectedCategory(selectedCat);

    try {
      const filteredObservations = allData.data
        .concat(selectedReportData.AllObservations)
        .filter(
          (observation) =>
            selectedCat.includes(observation.category) &&
            selectedArea.includes(observation.area)
        )
        .filter((observation, index, self) => {
          const observationValue = observation.observation;

          // Check if the observationValue is unique in the array
          return (
            index ===
            self.findIndex((obs) => obs.observation === observationValue)
          );
        })
        .map((observation) => {
          const selectedObs = selectedObservations.find(
            (selectedObs) => selectedObs.observation === observation.observation
          );
          if (selectedObs) {
            return {
              ...observation,
              is_selected: 1,
              score: selectedObs.score,
              imageUrls: selectedObs.imageUrls,
            };
          }
          return observation;
        });

      setAllObservations(filteredObservations);
      setSelectedObservations(
        filteredObservations.filter((e) => e.is_selected === 1)
      );
      // Check if any observations in selectedObservations are related to removed categories
      const removedCategories = selectedObservations.filter(
        (selectedObs) => !selectedCat.includes(selectedObs.category)
      );
      if (removedCategories.length > 0) {
        // Uncheck these observations
        const updatedSelectedObservations = selectedObservations.filter(
          (selectedObs) =>
            !removedCategories.some(
              (removedCat) => removedCat.sr_no === selectedObs.sr_no
            )
        );
        setSelectedObservations(updatedSelectedObservations);
      }
    } catch (error) {
      console.log("Error:", error.response?.data?.error || error.message);
    }
  };


  // const handleObservationSelection = (observation, index) => {
  //   const tempObs = [...AllObservations];

  //   let isAlreadySelected = observation.is_selected;

  //   if (isAlreadySelected) {
  //     delete tempObs[index].is_selected;
  //     setSelectedObservations(
  //       [...selectedObservations].filter(
  //         (e) =>
  //           `${e.sr_no || e.id}` !== `${observation.sr_no || observation.id}` &&
  //           e.observation !== observation.observation
  //       )
  //     );
  //     setCriticalObservations(
  //       [...selectedObservations].filter(
  //         (e) =>
  //           e.criticality === "High" &&
  //           `${e.sr_no || e.id}` !== `${observation.sr_no || observation.id}` &&
  //           e.observation !== observation.observation
  //       )
  //     );
  //   } else {
  //     tempObs[index] = { ...observation, is_selected: 1 };
  //     setSelectedObservations([
  //       ...selectedObservations,
  //       { ...observation, refIndex: index },
  //     ]);
  //     setCriticalObservations(
  //       [...selectedObservations, observation].filter(
  //         (e) => e.criticality === "High"
  //       )
  //     );
  //   }
  //   setAllObservations(tempObs);
  // };





  const handleObservationSelection = (observation, index) => {
    const tempObs = [...AllObservations];
    const isAlreadySelected = observation.is_selected;

    // Toggle is_selected
    if (isAlreadySelected) {
      delete tempObs[index].is_selected;
    } else {
      tempObs[index] = { ...observation, is_selected: 1 };
    }

    setAllObservations(tempObs);

    // Update selectedObservations list
    const updatedSelectedObservations = isAlreadySelected
      ? selectedObservations.filter(
        (e) =>
          `${e.sr_no || e.id}` !== `${observation.sr_no || observation.id}` &&
          e.observation !== observation.observation
      )
      : [...selectedObservations, { ...observation, refIndex: index }];

    setSelectedObservations(updatedSelectedObservations);

    // Filter for high critical observations only from selected
    const selectedHighCritical = updatedSelectedObservations.filter(
      (e) => e.criticality === "High"
    );

    // Deduplicate merged criticals: manual + edited + selected-high
    const editedMap = new Map();

    // Add existing edited or manually added criticals
    [...criticalObservations, ...manualCriticalObservations].forEach((obs) => {
      const key = `${obs.sr_no || obs.id || obs.observation}`.trim();
      editedMap.set(key, obs);
    });

    // Merge selected high critical observations (give priority to manually edited ones)
    selectedHighCritical.forEach((obs) => {
      const key = `${obs.sr_no || obs.id || obs.observation}`.trim();
      if (!editedMap.has(key)) {
        editedMap.set(key, obs);
      }
    });

    // Final merged critical observations
    const finalCriticals = Array.from(editedMap.values());

    setCriticalObservations(finalCriticals);
    setHasEditedCriticalObservations(true);
    // console.log("obs critical", criticalObservations)
  };


  const handleProceed = async () => {

    try {
      // setLoading(true)
      // Make API call with selectedObservations as input
      const payload = {
        observations: selectedObservations.map((e) => e.observation),
        // observations: selectedObservations.map((e) => e.row_id),
        report_id: selectedReportData.report_id,
      };

      // let res = await axios.post(
      //   `${config.PATH}/api/hse-recommendations`,
      //   payload
      // );
      // const receivedRecommendations = res.data.data;
      // setRecommendations(res.data.data);
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
        audit_score_analysis: auditScoreAnalysis,
        classification_of_audit_observations: classificationOfAuditObservations,
        improvement_opportunity_areas: improvementOpportunityAreas,
        overall_assessment_indicator: overallAssessmentIndicator,
        introduction: introduction,
        contents: contents,
        exe_summary: exeSummary,
        conclusion: conclusion,
        best_practice: bestPractice,
        the_way_forward: theWayForward,
        image_urls: JSON.stringify(imageUrlsByRow),
        is_edited: isReportEdited,
        start_date: startDate,
        end_date: endDate,
        is_saved: true,
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
      if (module === "cmv") {
        reportData.type = "cmv";
      } else {
        reportData.type = "primary";
      }
      handleNext();

      const cmvEndPOint = `${config.PATH}/api/save-update-hse-cmv-report`;
      const reportEndPoint = `${config.PATH}/api/save-update-hse-report`;

      if (module === "cmv") {
        await axios.post(cmvEndPOint, reportData);
      } else {
        await axios.post(reportEndPoint, reportData);
      }

      const observationsData = {
        report_id: selectedReportData.report_id,
        // observation: selectedObservations,
        // critical_observations: criticalObservations,
        all_observations: AllObservations||[],
        organization: selectedOrganization.label,
        site: selectedSite.label,
        user_id: userId,
      };

      const observationEndPoint = `${config.PATH}/api/save-update-hse-observations`;
      const cmvObservationEndPoint = `${config.PATH}/api/save-update-hse-cmv-observations`;

      if (module === "cmv") {
        await axios.post(cmvObservationEndPoint, observationsData);
      } else {
        await axios.post(observationEndPoint, observationsData);
      }
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
    "is_selected",
    "imageUrls",
    "edited_fields",
    "status",
  ];
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
    getAllHseReports();
  };

  const handleSave = async (complete) => {
    // console.log("global",bestPractice)
    if (otherDetails.trim()) {
      toast.warning("Please add the Other critical observation before proceeding.");
      return;
    }

    const hasEmptyObservation = criticalObservations.some(obs => obs.observation.trim() === "");
    if (hasEmptyObservation) {
      toast.warning("Critical observation cannot be empty!");
      return;
    }
    try {
      setLoading(true);
      // console.log("allobservation",AllObservations);

      let updatedSelectedObservations = [...selectedObservations];
      let someData = AllObservations ? [...AllObservations] : [];
      let updatedAllObservations = someData;
      const regroupByArea = (rows) => {
        const grouped = [];
        const areaSet = Array.from(new Set(rows.map(r => r.area)));
        areaSet.forEach(area => {
          grouped.push(...rows.filter(r => r.area === area));
        });
        return grouped;
      };
      if (editedObservations[0]) {
        if (
          Object.entries(editedObservations[0]).filter(
            (e) => !(keyNotToCheck.includes(e[0]) || e[1])
          ).length > 0
        ) {
          toast.error("Table fields can't be empty.");
          setLoading(false);
          return;
        }

        // Trim observations
        const trimmedObservations = editedObservations.map((obj) => {
          const trimmedObj = { ...obj };
          // Adjust the keys below to match the fields that need trimming
          if (trimmedObj.observation) trimmedObj.observation = trimmedObj.observation.trim();
          // Add any other fields to trim here
          return trimmedObj;
        });

        // trimmedObservations.forEach((obj) => {
        //   updatedSelectedObservations[obj.selectedRefIndex] = obj;
        //   updatedAllObservations[obj.refIndex] = { ...obj, is_selected: 1 };
        // });
        trimmedObservations.forEach((obj) => {
          const srNoOrId = obj.sr_no || obj.id;

          // Update selectedObservations
          const selIndex = updatedSelectedObservations.findIndex(
            (obs) => obs.sr_no === srNoOrId || obs.id === srNoOrId
          );
          if (selIndex !== -1) {
            updatedSelectedObservations[selIndex] = obj;
          }

          // Update AllObservations
          const allIndex = updatedAllObservations.findIndex(
            (obs) => obs.sr_no === srNoOrId || obs.id === srNoOrId
          );
          if (allIndex !== -1) {
            updatedAllObservations[allIndex] = { ...obj, is_selected: 1 };
          }
        });


        if (isReportEdited) {
          const payload = trimmedObservations
            .map(({ sr_no, score, edited_fields, ...rest }) => ({
              ...rest,
              edited_fields: editedFields,
            }))
            .filter((item) => Object.keys(item).length > 0);

          if (payload.length > 0) {
            await axios.post(`${config.PATH}/api/insert-new-hse-row`, payload);
          }
        }

        // console.log("setselectedobservations", setSelectedObservations);
        // console.log("setAllobs", setAllObservations);
      }
      updatedSelectedObservations = regroupByArea(updatedSelectedObservations);
      updatedAllObservations = regroupByArea(updatedAllObservations)
      requestAnimationFrame(() => {
        setSelectedObservations(updatedSelectedObservations);
        setAllObservations(updatedAllObservations);
      });
      const reportData = {
        report_id: selectedReportData.report_id,
        user_id: userId,
        date_time: selectedDateTime,
        organization: selectedOrganization?.label || selectedOrganization,
        org_id: selectedOrganization?.value || selectedOrganization,
        site: selectedSite?.label || selectedSite,
        area: selectedArea,
        category: selectedCategory,
        background_brief: backgroundBrief,
        audit_score_analysis: auditScoreAnalysis,
        classification_of_audit_observations: classificationOfAuditObservations,
        improvement_opportunity_areas: improvementOpportunityAreas,
        overall_assessment_indicator: overallAssessmentIndicator,
        contents: contents,
        introduction: introduction,
        exe_summary: exeSummary,
        conclusion: conclusion,
        best_practice: bestPractice,
        the_way_forward: theWayForward,
        image_urls: JSON.stringify(imageUrlsByRow),
        is_edited: isReportEdited,
        is_complete: complete === true,
        start_date: startDate,
        end_date: endDate,
        is_saved: true,
        time_of_audit_from: timeFrom || null,
        time_of_audit_to: timeTo || null,
        brief_property_description: briefPropertyDescription || null,
        num_of_floors: numOfFloors || null,
        average_staff_footfall: avgStaffFootfall || null,
        no_objection_certificate: noObjectionCertificate || null,
        national_building_code_category: nationalBuildingCodeCategory || null,
        coordinating_person_clientSide: coordinationgPersonClientside || null,
        report_prepared_by: reportPreparedBy || null,
        report_reviewed_by: reportReviewedBy || null,
        type: module === "cmv" ? "cmv" : "primary",
      };

      const cmvEndPOint = `${config.PATH}/api/save-update-hse-cmv-report`;
      const reportEndPoint = `${config.PATH}/api/save-update-hse-report`;

      await axios.post(module === "cmv" ? cmvEndPOint : reportEndPoint, reportData);

      const observationsData = {
        report_id: selectedReportData.report_id,
        all_observations: updatedAllObservations,
        organization: selectedOrganization.label,
        site: selectedSite.label,
        user_id: userId,
      };

      const observationEndPoint = `${config.PATH}/api/save-update-hse-observations`;
      const cmvObservationEndPoint = `${config.PATH}/api/save-update-hse-cmv-observations`;

      await axios.post(module === "cmv" ? cmvObservationEndPoint : observationEndPoint, observationsData);

      // setSelectedObservations(updatedSelectedObservations);
      // setAllObservations(updatedAllObservations);
      setIsSaved(true);
      setEditedObservations([]);
      setCurrentEditedRow(-1);
      setIsEditing(false);
      setDisableSaveNext(false);
      // refreshAllObservations();
      getAllHseData();
      saveCriticalObservations(complete);
      saveFacilityInfo();
      setLoading(false);
      updateOrgReportStatus();
      updateSiteReportStatus();
      setEditedFields([]);
      setConfirmationShown(false);
      toast.success(`${complete === true ? "Report Completed and Saved" : "Report Saved"}`);
      // console.log("updatedSelectedObservations after", selectedObservations);
      // console.log("updateAllObservation", updatedAllObservations)
    } catch (err) {
      // console.log("error in saving :", err);
      toast.error("Failed to save report. Please try again.", err);
      // setLoading(false); // Add this line here to reset loading in case of an error
    }
  };

  const saveCriticalObservations = async (complete) => {
    try {
      // Create a new array with objects excluding the 'id' field
      const observationsToSave = criticalObservations.map(
        ({ id, ...observation }) => observation
      );


      const payload = {
        criticalObservations: observationsToSave,
        report_id: selectedReportData.report_id,
      };

      //   const endpoint = complete===true
      // ? `${config.PATH}/api/save-critical-hse-cmv-observations`
      // : `${config.PATH}/api/save-hse-critical-observations`;

      //   await axios.post(endpoint,payload);

      const criticalObsEndPoint = `${config.PATH}/api/save-hse-critical-observations`;
      const cmvCriticalObsEndPoint = `${config.PATH}/api/save-critical-hse-cmv-observations`;

      if (module === "cmv") {
        await axios.post(cmvCriticalObsEndPoint, payload);
      } else if (complete === true && module !== "cmv") {
        await axios.post(cmvCriticalObsEndPoint, payload);
        await axios.post(criticalObsEndPoint, payload);
      } else {
        await axios.post(criticalObsEndPoint, payload);
      }

      // console.log("Critical observations saved successfully.");
    } catch (error) {
      console.error("Error saving critical observations:", error.message);
    }
  };

  const handleChange = (e, name) => {
    setIsSaved(false);
    if (name === "background") {
      setBackgroundBrief(e.target.value);
    } else if (name === "contents") {
      setContents(e.target.value);
    }
    else if (name === "classification") {
      setClassificationOfAuditObservations(e.target.value);
    }
    else if (name === "exe") {
      setExeSummary(e.target.value);
    } else if (name === "conclusion") {
      setConclusion(e.target.value);
    } else if (name === "other details") {
      setOtherDetails(e.target.value);
    } else if (name === "best_practice") {
      setbestPractice(e.target.value);
    } else if (name === "the_way_forward") {
      setTheWayForward(e.target.value);
    } else if (name === "intro") {
      setIntroduction(e.target.value);
    }
  };

  const handleNext = () => {
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
    setScreenNumber(screenNumber + 1);
    // setOpenReportList(false);
  };

  const handlePrev = () => {
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

  // const handleImageUpload = async (table_type, identifier, area, files) => {
  //   // Create deep copies to avoid mutation
  //   const selectedObsCopy = [...selectedObservations];
  //   const obsCopy = [...AllObservations];
  //   const editedObsCopy = [...editedObservations];

  //   // Ensure the correct structure for deep copying
  //   selectedObsCopy.forEach((item) => {
  //     if (!item.imageUrls) item.imageUrls = [];
  //   });

  //   obsCopy.forEach((item) => {
  //     if (!item.imageUrls) item.imageUrls = [];
  //   });

  //   editedObsCopy.forEach((item) => {
  //     if (!item.imageUrls) item.imageUrls = [];
  //   });

  //   try {
  //     setLoading(true);

  //     for (const file of Array.from(files)) {
  //       if (!file.type.startsWith("image/")) {
  //         throw new Error("Only image files are allowed.");
  //       }

  //       const compressedImage = await compressImage(file);

  //       const formData = new FormData();
  //       formData.append("image", compressedImage);

  //       const response = await axios.post(
  //         `${config.PATH}/api/upload/image`,
  //         formData,
  //         {
  //           headers: {
  //             "Content-Type": "multipart/form-data",
  //           },
  //         }
  //       );

  //       const imageUrl = response.data.imageUrl;

  //       // Update the imageUrls in selectedObservations
  //       const selectedObs = selectedObsCopy.find(
  //         (item) =>
  //           item.table_type === table_type &&
  //           (item.sr_no === identifier || item.id === identifier) &&
  //           item.area === area
  //       );
  //       if (selectedObs) {
  //         selectedObs.imageUrls = [...(selectedObs.imageUrls || []), imageUrl];
  //       }

  //       // Update the imageUrls in AllObservations
  //       const obs = obsCopy.find(
  //         (item) =>
  //           item.table_type === table_type &&
  //           (item.sr_no === identifier || item.id === identifier) &&
  //           item.area === area
  //       );
  //       if (obs) {
  //         obs.imageUrls = [...(obs.imageUrls || []), imageUrl];
  //       }

  //       // Update editedObservations if it has values
  //       const editedObs = editedObsCopy.find(
  //         (item) =>
  //           item.table_type === table_type &&
  //           (item.sr_no === identifier || item.id === identifier) &&
  //           item.area === area
  //       );
  //       if (editedObs) {
  //         editedObs.imageUrls = [...(editedObs.imageUrls || []), imageUrl];
  //       }
  //     }

  //     setSelectedObservations(selectedObsCopy);
  //     setAllObservations(obsCopy);

  //     // Update editedObservations only if it has values
  //     if (editedObsCopy.length > 0) {
  //       setEditedObservations(editedObsCopy);
  //     }

  //     setLoading(false);
  //     toast.success("Images uploaded successfully!");
  //   } catch (error) {
  //     console.log("Error uploading image:", error);
  //     toast.error(error.message);
  //   }
  // };
  const handleImageUpload = async (table_type, identifier, area, files) => {
    try {
      setLoading(true);

      const uploadedUrls = [];

      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          throw new Error("Only image files are allowed.");
        }

        const compressedImage = await compressImage(file);

        const formData = new FormData();
        formData.append("image", compressedImage);

        const response = await axios.post(
          `${config.PATH}/api/upload/image`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        uploadedUrls.push(response.data.imageUrl);
      }

      const updateImages = (arr) =>
        arr.map((item) =>
          item.table_type === table_type &&
            (item.sr_no === identifier || item.id === identifier) &&
            item.area === area
            ? { ...item, imageUrls: [...(item.imageUrls || []), ...uploadedUrls] }
            : item
        );

      setSelectedObservations((prev) => updateImages(prev));
      setAllObservations((prev) => updateImages(prev));
      setEditedObservations((prev) => {
        if (prev.length === 0) return prev;
        return updateImages(prev);
      });

      setLoading(false);
      toast.success("Images uploaded successfully!");
    } catch (error) {
      console.log("Error uploading image:", error);
      toast.error(error.message);
    }
  };

  const handleRemoveImage = (table_type, area, identifier, imageIndex) => {

    const selectedObsCopy = [...selectedObservations];
    const obsCopy = [...AllObservations];


    const observationToUpdate = selectedObsCopy.find(
      (obs) =>
        obs.table_type === table_type &&
        obs.area === area &&
        (obs.sr_no === identifier || obs.id === identifier)
    );

    if (observationToUpdate && observationToUpdate.imageUrls) {

      observationToUpdate.imageUrls.splice(imageIndex, 1);


      if (observationToUpdate.imageUrls.length === 0) {
        delete observationToUpdate.imageUrls;
      }


      const obsIndex = obsCopy.findIndex(
        (obs) =>
          obs.table_type === table_type &&
          obs.area === area &&
          (obs.sr_no === identifier || obs.id === identifier)
      );

      if (obsIndex !== -1) {
        obsCopy[obsIndex] = {
          ...obsCopy[obsIndex],
          imageUrls: observationToUpdate.imageUrls,
        };
      }
      setSelectedObservations(selectedObsCopy);
      setAllObservations(obsCopy);
    } else {
      toast.error("Observation not found.");
    }
  };

  const handleClose = () => {
    if (isEditing && screenNumber === 10) {
      toast.warning("Please save changes before closing the report.");
      return;
    } else if (!isSaved && screenNumber !== 1 && !exp) {
      toast.warning("Please save the report before closing.");
    } else {
      closeReport();
    }
  };

  const closeReport = () => {
    setOpenSavedReport(false);
  };
  const debouncedSetTheWayForward = useRef(
    debounce((value) => {
      setTheWayForward(value);
    }, 2000),
  ).current;
  const debouncedSetConclusion = useRef(
    debounce((value) => {
      setConclusion(value);
    }, 2000),
  ).current;
  // const handleScoreChange = (event, tableType, sr_no) => {
  //   setIsSaved(false);
  //   const newScore = parseInt(event.target.value, 10);

  //   // Validate the new score
  //   if ((newScore >= 0 && newScore <= 5) || event.target.value === "") {
  //     // Clone the observations and selectedObservations arrays
  //     const newObservations = [...AllObservations];
  //     const newSelectedObservations = [...selectedObservations];

  //     // Find the relevant observation in observations using either sr_no or id
  //     const globalIndex = newObservations.findIndex(
  //       (obs) => obs.table_type === tableType && (obs.sr_no === sr_no || obs.id === sr_no)
  //     );

  //     if (globalIndex !== -1) {
  //       newObservations[globalIndex].score =
  //         event.target.value === "" ? null : newScore;
  //     }

  //     // Find the relevant observation in selectedObservations using either sr_no or id
  //     const selectedIndex = newSelectedObservations.findIndex(
  //       (obs) => obs.table_type === tableType && (obs.sr_no === sr_no || obs.id === sr_no)
  //     );

  //     if (selectedIndex !== -1) {
  //       newSelectedObservations[selectedIndex].score =
  //         event.target.value === "" ? null : newScore;
  //     }

  //     // Update the state with the modified arrays
  //     setAllObservations(newObservations);
  //     setSelectedObservations(newSelectedObservations);
  //   } else {
  //     alert("Invalid score. Please enter a value between 0 and 5.");
  //     // Find the observation to restore the original score in the input field
  //     const originalObservation = AllObservations.find(
  //       (obs) => obs.table_type === tableType && (obs.sr_no === sr_no || obs.id === sr_no)
  //     );
  //     event.target.value = originalObservation ? originalObservation.score : "";
  //   }
  // };

  const handleScoreChange = (event, tableType, sr_no) => {
    setIsSaved(false);
    const newScore = parseInt(event.target.value, 10);

    if ((newScore >= 0 && newScore <= 5) || event.target.value === "") {
      const newObservations = [...AllObservations];
      const newSelectedObservations = [...selectedObservations];

      const globalIndex = newObservations.findIndex(
        (obs) => obs.table_type === tableType && (obs.sr_no === sr_no || obs.id === sr_no)
      );

      if (globalIndex !== -1) {
        newObservations[globalIndex].score =
          event.target.value === "" ? null : newScore;
      }

      const selectedIndex = newSelectedObservations.findIndex(
        (obs) => obs.table_type === tableType && (obs.sr_no === sr_no || obs.id === sr_no)
      );

      if (selectedIndex !== -1) {
        newSelectedObservations[selectedIndex].score =
          event.target.value === "" ? null : newScore;
      }


      setIsEditing(true);
      setCurrentEditedRow(sr_no);
      setIsReportEdited(true);

      const updatedEdited = [...editedObservations];
      const existingIndex = updatedEdited.findIndex((obs) => obs.sr_no === sr_no);

      const newScoreValue = event.target.value === "" ? null : newScore;

      if (existingIndex !== -1) {
        updatedEdited[existingIndex] = {
          ...updatedEdited[existingIndex],
          score: newScoreValue,
        };
      } else {
        const obsToClone = newObservations[globalIndex];
        if (obsToClone) {
          updatedEdited.push({
            ...obsToClone,
            score: newScoreValue,
          });
        }
      }

      setAllObservations(newObservations);
      setSelectedObservations(newSelectedObservations);
      setEditedObservations(updatedEdited);
    } else {
      alert("Invalid score. Please enter a value between 0 and 5.");
      const originalObservation = AllObservations.find(
        (obs) => obs.table_type === tableType && (obs.sr_no === sr_no || obs.id === sr_no)
      );
      event.target.value = originalObservation ? originalObservation.score : "";
    }
  };
  const handleDuplicateRow = (table_type, area, identifier) => {
    if (isEditing) {
      toast.warn(
        "Please finish editing the current row before adding a new row."
      );
      return;
    }

    // Find the row to duplicate
    const selectedOriginalRow = selectedObservations.find(
      (obs) =>
        obs.table_type === table_type &&
        obs.area === area &&
        (obs.sr_no === identifier || obs.id === identifier)
    );

    if (!selectedOriginalRow) {
      toast.error("Observation not found.");
      return;
    }

    // Create a duplicated row
    const duplicatedRowForSelected = {
      ...selectedOriginalRow,
      refIndex: selectedOriginalRow.refIndex + 1, // Adjust refIndex or handle it based on your requirement
      imageUrls: selectedOriginalRow.imageUrls
        ? [...selectedOriginalRow.imageUrls]
        : [],
    };

    // Create copies of state arrays
    const updatedAllObservations = [...AllObservations];
    const updatedSelectedObservations = [...selectedObservations];

    // Insert duplicated row into observations and selectedObservations
    updatedAllObservations.splice(selectedOriginalRow.refIndex + 1, 0, {
      ...duplicatedRowForSelected,
      is_selected: 1,
    });
    updatedSelectedObservations.splice(
      updatedSelectedObservations.findIndex(
        (obs) =>
          obs.table_type === table_type &&
          obs.area === area &&
          (obs.sr_no === identifier || obs.id === identifier)
      ) + 1,
      0,
      duplicatedRowForSelected
    );

    // Update state
    setAllObservations(updatedAllObservations);
    setSelectedObservations(updatedSelectedObservations);

    toast.success("New row added");
  };

  const handleDeleteRow = (table_type, area, identifier) => {
    // console.log(table_type, area, identifier);
    if (isEditing && currentEditedRow !== -1) {
      toast.warn(
        "Please finish editing the current row before deleting the row."
      );
      return;
    }

    // Create deep copies to avoid mutation
    const updatedSelectedObservations = [...selectedObservations];
    let updatedAllObservations = [...AllObservations]; // Use let instead of const

    // if (updatedSelectedObservations.length === 1) {
    //   toast.warn("Cannot delete the last row.");
    //   return;
    // }

    // Find the index to delete using table_type, area, and identifier (sr_no or id)
    const rowIndex = updatedSelectedObservations.findIndex(
      (obs) =>
        obs.table_type === table_type &&
        obs.area === area &&
        (obs.sr_no === identifier || obs.id === identifier)
    );

    if (rowIndex === -1) {
      toast.error("Row not found.");
      return;
    }

    const observationToDelete = updatedSelectedObservations[rowIndex];
    const refIndex = observationToDelete.refIndex;


    updatedSelectedObservations.splice(rowIndex, 1);
    updatedAllObservations = updatedAllObservations.filter(
      (obs) =>
        !(
          obs.table_type === table_type &&
          obs.area === area &&
          (obs.sr_no === identifier || obs.id === identifier)
        )
    );

    updatedSelectedObservations.forEach(
      (e) => (e.refIndex = e.refIndex > refIndex ? e.refIndex - 1 : e.refIndex)
    );

    setSelectedObservations(updatedSelectedObservations);
    setAllObservations(updatedAllObservations);
    setIsEditing(false);
    setEditedObservations([]);
    setCurrentEditedRow(-1);
    toast.error("Row deleted");
      setSafeGroupedObservations((prev) => {
    const updated = { ...prev };
    const remainingRows = updatedSelectedObservations.filter(o => o.table_type === table_type);

    if (remainingRows.length === 0) {
      delete updated[table_type]; // remove table from table container
    } else {
      updated[table_type] = remainingRows;
    }
    return updated;
  });

  // Remove the deleted table type from selectedTableType
  setSelectedTableType((prev) => prev.filter(t => t.value !== table_type));
  
};

  const sectors = () => {
    try {
      const options = [];
      const list = [
        ...new Set(
          allData.data
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

  const handleChangeSector = (e) => {
    if (!e) {
      setSelectedSector([]);
      setSelectedParam([]);
      setSelectedArea([]);
      setAreaList([]);
    }
    setSelectedSector(e);
  };

  const handleChangeParam = (e) => {

    if (!e || e.length === 0) {
      setSelectedArea([]);
      setAreaList([]);
      // Added code to disable proceed button
      setAllObservations([]);
      setSelectedObservations([]);
    }
    setSelectedParam(e);

  };

  const getScoreColor = (percentage) => {
    if (percentage <= 33) {
      return "#FF0000"; // Red
    } else if (percentage > 33 && percentage <= 66) {
      return "#FFA500"; // Orange
    } else {
      return "#006400"; // Dark Green
    }
  };

  const pieOptions = {
    labels: [
      `Obtained Score(${scorePercent}%)`,
      `Remaining Score(${100 - scorePercent}%)`,
    ],
    colors: [getScoreColor(scorePercent), "grey"],
    dataLabels: {
      enabled: true,
    },
    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: "center",
      fontSize: "14px",
      markers: {
        width: 16,
        height: 16,
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

  const areaCounts = data.reduce((counts, entry) => {
    const area = entry.area;
    counts[area] = (counts[area] || 0) + 1;
    return counts;
  }, {});

  const areasForAreaChart = Object.keys(areaCounts);
  const counts = areasForAreaChart.map((area) => {
    const areaScore = data
      .filter((entry) => entry.area === area)
      .reduce((acc, entry) => acc + (entry.score || 0), 0);
    const totalPossibleScore =
      data.filter((entry) => entry.area === area).length * 5;
    const percentage =
      totalPossibleScore > 0
        ? Math.floor((areaScore / totalPossibleScore) * 100)
        : 0;
    return percentage.toFixed(0);
  });

  const barOptions = {
    chart: {
      id: "bar-chart",
    },
    colors: ["#005cdb"],
    xaxis: {
      categories: areasForAreaChart.map((area) => {
        // Truncate the area name if it's too long
        const maxChars = 15; // Adjust the maximum characters as needed
        return area.length > maxChars
          ? area.substring(0, maxChars) + "..."
          : area;
      }),
      labels: {
        style: {
          fontSize: "10px", // Adjust the font size as needed
        },
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "30%",
        dataLabels: {
          position: "top", // top, center, bottom
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val;
      },
      offsetY: -20,
      style: {
        fontSize: "10px",
        colors: ["#304758"],
      },
    },
    tooltip: {
      y: {
        formatter: function (value, { dataPointIndex }) {
          // Display the full area name on hover
          const area = areasForAreaChart[dataPointIndex];
          return `${area}: ${value}%`; // Show area name along with percentage
        },
      },
    },
  };
  // Group the data by area and severity
  const areaSeverityData = data.reduce((result, entry) => {
    const area = entry.area;
    const severity = entry.criticality;

    if (!result[area]) {
      result[area] = { High: 0, Medium: 0, Low: 0 };
    }

    result[area][severity] += 1;
    return result;
  }, {});

  // Extract areas and severity counts
  const areas = Object.keys(areaSeverityData);
  const severityChartData = Object.keys(areaSeverityData).map((area) => ({
    name: area,
    High: areaSeverityData[area].High,
    Medium: areaSeverityData[area].Medium,
    Low: areaSeverityData[area].Low,
  }));

  // Transpose the data to match the series structure
  const transposedData = {
    High: [],
    Medium: [],
    Low: [],
  };

  severityChartData.forEach((area) => {
    transposedData.High.push(area.High);
    transposedData.Medium.push(area.Medium);
    transposedData.Low.push(area.Low);
  });

  // Prepare series data with specific colors for each severity level
  const seriesData = [
    { name: "High", data: [] },
    { name: "Medium", data: [] },
    { name: "Low", data: [] },
  ];

  areas.forEach((area) => {
    seriesData[0].data.push(areaSeverityData[area]?.High || 0);
    seriesData[1].data.push(areaSeverityData[area]?.Medium || 0);
    seriesData[2].data.push(areaSeverityData[area]?.Low || 0);
  });

  // Severity chart options
  const severityChartOptions = {
    chart: {
      id: "severity-chart",
      stacked: true,
    },
    xaxis: {
      categories: areas.map((area) => {
        // Truncate the area name if it's too long
        const maxChars = 15; // Adjust the maximum characters as needed
        return area.length > maxChars
          ? area.substring(0, maxChars) + "..."
          : area;
      }),
      labels: {
        style: {
          fontSize: "10px", // Adjust the font size as needed
        },
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "30%",
        dataLabels: {
          total: {
            enabled: true,
            style: {
              fontSize: "10px", // Adjust the font size for the total data label
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false, // Hide data labels
    },
    colors: ["#FF0000", "#006400", "#005cdb"],
    tooltip: {
      y: {
        formatter: function (value, { dataPointIndex }) {
          // Display the full area name on hover
          const area = areas[dataPointIndex];
          return `${area}:${value}`;
        },
      },
    },
  };

  const [manualCriticalObservations, setManualCriticalObservations] = useState([]);
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
  const handleObservationEdit = (index, e) => {
    setDisableSaveNext(true);
    const updatedObservations = [...criticalObservations];
    updatedObservations[index].observation = e.target.value;
    setCriticalObservations(updatedObservations);
    // console.log("criticalObs", criticalObservations)
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
  }, [getAllHseData, area]);

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

  const handleConfirmSelection = (selectedVariants, removedItems) => {
    let map = {};

    const getId = (item) => item.sr_no || item.id;

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


  // const handleConfirmSelection = (selectedVariants, removedItems) => {
  //   let map = {};

  //   const getId = (item) => item.sr_no || item.id || item.tempId;

  //   // Update both states with the selected variants
  //   setSelectedObservations(
  //     [...selectedObservations, ...selectedVariants].filter((e) => {
  //       const id = getId(e);
  //       if (!(map[id] || removedItems.includes(id))) {
  //         map[id] = true;
  //         return true;
  //       } else {
  //         return false;
  //       }
  //     })
  //   );

  //   map = {};
  //   setAllObservations(
  //     [...AllObservations, ...selectedVariants].filter((e) => {
  //       const id = getId(e);
  //       if (!(map[id] || removedItems.includes(id))) {
  //         map[id] = true;
  //         return true;
  //       } else {
  //         return false;
  //       }
  //     })
  //   );
  // };
  const closeVariantModal = () => {
    setOpenVariantModal(false);
  };

  const criticalityOptions = [
    { value: "High", label: "High" },
    { value: "Medium", label: "Medium" },
    { value: "Low", label: "Low" },
  ];

  const getObservationVariants = async (observation, index) => {
    try {
      if (isEditing && currentEditedRow !== index) {
        toast.warn("Please finish editing the current row.");
        return;
      }
      setOpenVariantModal(true);
      const payload = {
        observation,
        report: "saved",
      };
      const response = await axios.post(
        `${config.PATH}/api/search-hse-data-by-observation`,
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
      } else {
        console.log("Unexpected response data format:", response.data);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleChangeFacilityInfo = (event) => {
    const { name, value } = event.target;
    setFacilityInfo((prevInfo) => ({
      ...prevInfo,
      [name]: value,
    }));
  };

  const handleNewKeyChange = (event) => {
    setNewKey(event.target.value);
  };

  const handleNewValueChange = (event) => {
    setNewValue(event.target.value);
  };

  const handleAddNewField = () => {
    if (newKey && newValue) {
      const keyExists = facilityInfo.hasOwnProperty(newKey);
      const valueExists = facilityInfo[newKey] === newValue;

      if (keyExists) {
        alert("This field already exists.");
        return;
      }

      setFacilityInfo((prevInfo) => ({
        ...prevInfo,
        [newKey]: newValue,
      }));
      setNewKey("");
      setNewValue("");
    } else {
      alert("Please fill both the fields before adding.");
    }
  };

  const handleRemoveField = (key) => {
    if (Object.keys(facilityInfo).length === 1) {
      alert("Cannot remove the last field.");
      return;
    }

    const updatedFacilityInfo = { ...facilityInfo };
    delete updatedFacilityInfo[key];
    setFacilityInfo(updatedFacilityInfo);
  };

  const saveFacilityInfo = async () => {
    try {
      const payload = {
        report_id: selectedReportData.report_id,
        facility_info: facilityInfo,
      };
      const res = await axios.post(
        `${config.PATH}/api/save-facility-info`,
        payload
      );
    } catch (err) {
      console.log(err.message);
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

  const getParamList = () => {
    if (!selectedSector || selectedSector.length === 0) {
      setParamList([]);
      setSelectedParam([]);
      setSelectedArea([]);
      // setAreasToDisplay(null);
      // setCategoriesToDisplay(null);
      // return [];
      return;
    }

    const list = [
      ...new Set(
        allData.data
          .filter((e) => e.sector_type === selectedSector.value) // Filter based on selectedSector
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
    // return list;
  };

  // const filteredObservations = AllObservations.filter(
  //   (observation) =>
  //     observation.table_type !== null &&
  //     observation.table_type !== undefined &&
  //     (observation.observation
  //       .toLowerCase()
  //       .includes(searchTerm.toLowerCase()) ||
  //       observation.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       observation.table_type.toLowerCase().includes(searchTerm.toLowerCase()))
  // );
  const filteredObservations = (AllObservations || []).filter(
    (observation) =>
      observation.table_type !== null &&
      observation.table_type !== undefined &&
      (
        observation.observation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        observation.area?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        observation.table_type?.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );


  // Group filtered observations by table_type
  // const groupedByTableType = filteredObservations.reduce(
  //   (groups, observation) => {
  //     const { table_type } = observation;
  //     if (!groups[table_type]) {
  //       groups[table_type] = [];
  //     }
  //     groups[table_type].push(observation);
  //     return groups;
  //   },
  //   {}
  // );
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

  // console.log("groupedByTableType", groupedByTableType);

  const allDataForGlobalSearch = allData.data.filter(
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

  // const groupedObservations = selectedObservations.reduce(
  //   (acc, observation) => {
  //     if (!acc[observation.table_type]) {
  //       acc[observation.table_type] = [];
  //     }
  //     acc[observation.table_type].push(observation);
  //     return acc;
  //   },
  //   {}
  // );
  // const groupedObservations = (selectedObservations || []).reduce(
  //   (acc, observation) => {
  //     if (!acc[observation.table_type]) {
  //       acc[observation.table_type] = [];
  //     }
  //     acc[observation.table_type].push(observation);
  //     return acc;
  //   },
  //   {}
  // );
  // const safeGroupedObservations = { ...groupedObservations };
  // if (!safeGroupedObservations["Default"]) {
  //   safeGroupedObservations["Default"] = [];
  // }
  const [selectedTableType, setSelectedTableType] = useState([]);
    const [tableTypes, setTableTypes] = useState([]);
    const [safeGroupedObservations, setSafeGroupedObservations] = useState({});
  
    // useEffect(() => {
    //   const groupedObservations = (selectedObservations || []).reduce((acc, observation) => {
    //     const key = observation.table_type ;
    //     if (!key) return acc;
    //     if (!acc[key]) acc[key] = [];
    //     acc[key].push(observation);
    //     return acc;
    //   }, {});
  
    //   // Ensure "Default" always exists
    //   // if (!groupedObservations["Default"]) groupedObservations["Default"] = [];
  
    //   // setSafeGroupedObservations(groupedObservations);
    //    setSafeGroupedObservations((prev) => ({
    //   ...prev, // keep old tables (even if empty)
    //   ...groupedObservations, // overwrite only those that have data
    // }));
    // }, [selectedObservations]);
  
    // Extract table types from backend data
    
//     useEffect(() => {
//   if (selectedObservations?.length > 0) {
//     const uniqueTypes = [
//       ...new Set(selectedObservations.map((obs) => obs.table_type).filter(Boolean))
//     ];

//     // Prepopulate select with saved types
//     const preselectedOptions = uniqueTypes.map((t) => ({ label: t, value: t }));

//     setSelectedTableType(preselectedOptions);

//     // Ensure dropdown options include them
//     setTableTypes((prev) => [...new Set([...prev, ...uniqueTypes])]);

//     // Initialize grouped observations
//     setSafeGroupedObservations((prev) => {
//       const updated = { ...prev };
//       uniqueTypes.forEach((type) => {
//         updated[type] = selectedObservations.filter(
//           (obs) => obs.table_type === type
//         );
//       });
//       return updated;
//     });
//   }
// }, [selectedObservations]);

//     useEffect(() => {
//       if (allData?.data?.length > 0) {
//         const types = [
//           ...new Set(
//             allData.data
//               .map((d) => {
//                 if (typeof d.table_type === "object" && d.table_type !== null) {
//                   return d.table_type.value || d.table_type.type || "";
//                 }
//                 return d.table_type;
//               })
//               .filter(Boolean)
//               .map(String)
//           ),
//         ];
//         setTableTypes(types);
  
//         if (types.length > 0 && !selectedTableType) {
//           setSelectedTableType(types[0]);
//         }
//       }
//     }, [allData]);

  useEffect(() => {
    const groupedObservations = (selectedObservations || []).reduce((acc, observation) => {
      const key = observation.table_type ;
      if (!key) return acc;
      if (!acc[key]) acc[key] = [];
      acc[key].push(observation);
      return acc;
    }, {});

    // if (!groupedObservations["Default"]) groupedObservations["Default"] = [];

    // setSafeGroupedObservations(groupedObservations);
  //    setSafeGroupedObservations((prev) => ({
  //   ...prev, // keep old tables (even if empty)
  //   ...groupedObservations, // overwrite only those that have data
  // }));
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

    // ✅ Restore only types that actually exist in grouped or selected observations
    const activeTypes = [
      ...new Set(
        (selectedObservations || [])
          .map((obs) => obs.table_type)
          .filter(Boolean)
      ),
    ];

    if (
      activeTypes.length > 0 &&
      (!selectedTableType || selectedTableType.length === 0)
    ) {
      const formatted = activeTypes.map((t) => ({ label: t, value: t }));
      setSelectedTableType(formatted);
    }
  }
}, [allData, selectedObservations]);







  
  //   const handleTableTypeChange = (newValue) => {
  //   if (!newValue) {
  //     setSelectedTableType(null);
  //     return;
  //   }
  
  //   const value = newValue.value;
  //   setSelectedTableType(newValue);
  
  //   setTableTypes((prev) => {
  //     if (!prev.includes(value)) return [...prev, value];
  //     return prev;
  //   });
  
  //   setSafeGroupedObservations((prev) => {
  //     if (!prev[value]) {
  //       return { ...prev, [value]: [] };
  //     }
  //     return prev;
  //   });
  // };

  // const renderNewRowInputs = (tableType) => (
  //   <TableRow key={`new-row-${tableType}`}>
  //     <TableCell>{groupedObservations[tableType]?.length + 1}</TableCell>
  //     <TableCell className="editable-cell" style={{ height: "100px" }}>
  //       <textarea
  //         className="input-field"
  //         value={newRowInputs[tableType]?.area || ""}
  //         onChange={(e) => handleChangeNewRow(tableType, e, "area")}
  //         placeholder="Area"
  //       />
  //     </TableCell>
  //     <TableCell className="editable-cell" style={{ height: "100px" }}>
  //       <textarea
  //         className="input-field"
  //         value={newRowInputs[tableType]?.check_points || ""}
  //         onChange={(e) => handleChangeNewRow(tableType, e, "check_points")}
  //         placeholder="Check Point"
  //       />
  //     </TableCell>
  //     <TableCell className="editable-cell" style={{ height: "100px" }}>
  //       <textarea
  //         className="input-field"
  //         value={newRowInputs[tableType]?.observation || ""}
  //         onChange={(e) => handleChangeNewRow(tableType, e, "observation")}
  //         placeholder="Observation"
  //       />
  //     </TableCell>
  //     <TableCell className="editable-cell" style={{ height: "100px" }}>
  //       <textarea
  //         className="input-field"
  //         value={newRowInputs[tableType]?.criticality || ""}
  //         onChange={(e) => handleChangeNewRow(tableType, e, "criticality")}
  //         placeholder="Criticality"
  //       />
  //     </TableCell>
  //     <TableCell className="editable-cell" style={{ height: "100px" }}>
  //       <textarea
  //         className="input-field"
  //         value={newRowInputs[tableType]?.recommendations || ""}
  //         onChange={(e) => handleChangeNewRow(tableType, e, "recommendations")}
  //         placeholder="Recommendations"
  //       />
  //     </TableCell>
  //     <TableCell className="editable-cell" style={{ height: "100px" }}>
  //       <textarea
  //         className="input-field"
  //         value={newRowInputs[tableType]?.is_reference || ""}
  //         onChange={(e) => handleChangeNewRow(tableType, e, "is_reference")}
  //         placeholder="IS Reference"
  //       />
  //     </TableCell>
  //     <TableCell className="editable-cell" style={{ height: "100px" }}>
  //       <input
  //         // className="input-field"
  //         value={newRowInputs[tableType]?.score || ""}
  //         onChange={(e) => handleChangeNewRow(tableType, e, "score")}
  //         placeholder="Score"
  //         type="number"
  //         style={{ height: "31px", marginTop: "-2%" }}
  //       />
  //     </TableCell>
  //     <TableCell>
  //       <div className="image-container">
  //         <div className="upload-container">
  //           <input
  //             type="file"
  //             accept="image/*"
  //             // onChange={(e) => handleImageUploadNewRow(tableType, e.target.files)}
  //             multiple
  //             style={{ color: "transparent" }}
  //             disabled={true}
  //           />
  //           {newRowInputs[tableType]?.imageUrls?.length === 0 && (
  //             <div className="no-file-chosen">No file chosen</div>
  //           )}
  //         </div>
  //       </div>
  //     </TableCell>
  //     <TableCell>
  //       <div style={{ display: "flex", justifyContent: "center" }}>
  //         <CheckIcon
  //           onClick={() => handleAddRow(tableType)}
  //           style={{ cursor: "pointer", color: "green" }}
  //         />
  //       </div>
  //     </TableCell>
  //   </TableRow>
  // );
// const handleTableTypeChange = (newValues) => {
//   const selectedValues = newValues ? newValues.map(v => v.value) : [];

//   // Update CreatableSelect
//   setSelectedTableType(newValues || []);

//   // Merge newly created types into tableTypes
//   setTableTypes((prev) => {
//     const all = [...new Set([...prev, ...selectedValues])];
//     return all;
//   });

//   // Merge grouped observations instead of replacing
//   setSafeGroupedObservations((prev) => {
//     const updated = { ...prev }; // keep old types
//     selectedValues.forEach((val) => {
//       if (!updated[val]) {
//         // For new type, initialize empty array
//         updated[val] = [];
//       }
//     });
//     return updated;
//   });

//   // Only filter out removed table types (keep all selected so far)
//   setSelectedObservations((prev) =>
//     prev.filter((obs) => selectedValues.includes(obs.table_type))
//   );

//   setAllObservations((prev) =>
//     prev.filter((obs) => selectedValues.includes(obs.table_type))
//   );

//   setEditedObservations((prev) =>
//     prev.filter((obs) => selectedValues.includes(obs.table_type))
//   );
// };
const handleTableTypeChange = (newValues) => {
  const selectedValues = newValues ? newValues.map(v => v.value) : [];

  setSelectedTableType(newValues || []);

  setTableTypes((prev) => {
    const all = [...new Set([...prev, ...selectedValues])];
    return all;
  });

  setSafeGroupedObservations((prev) => {
    const updated = { ...prev };


    Object.keys(updated).forEach((key) => {
      if (!selectedValues.includes(key)) {
        delete updated[key];
      }
    });

    selectedValues.forEach((val) => {
      if (!updated[val]) updated[val] = [];
    });

    return updated;
  });

  setSelectedObservations((prev) =>
    prev.filter((obs) => selectedValues.includes(obs.table_type))
  );

  setAllObservations((prev) =>
    prev.filter((obs) => selectedValues.includes(obs.table_type))
  );

  setEditedObservations((prev) =>
    prev.filter((obs) => selectedValues.includes(obs.table_type))
  );
};


 
  const renderNewRowInputs = (tableType) => (
    <TableRow key={`new-row-${tableType}`}>
      <TableCell>{safeGroupedObservations[tableType]?.length + 1}</TableCell>
      {/* <TableCell className="editable-cell" style={{ height: "100px" }}>
        <textarea
          className="input-field"
          value={newRowInputs[tableType]?.area || ""}
          onChange={(e) => handleChangeNewRow(tableType, e, "area")}
          placeholder="Area"
        />
      </TableCell> */}
      <TableCell className="editable-cell" style={{ height: "100px" }}>
        <CreatableSelect
        ref={areaSelectRef}
          styles={{
            ...customSelectStylesCreatable,
            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
          }}
          placeholder="Area"
          options={areaList.map((area) => ({
            label: area,
            value: area,
          }))}
          value={
            newRowInputs[tableType]?.area
              ? { label: newRowInputs[tableType].area, value: newRowInputs[tableType].area }
              : null
          }
          isSearchable
          onChange={(e) => handleChangeNewRowSelect(tableType, e, "area")}
            onMenuOpen={() => setIsAreaDropdownOpen(true)}
          onMenuClose={() => setIsAreaDropdownOpen(false)}
          menuPortalTarget={document.body}
          menuPlacement="auto"
          isValidNewOption={(inputValue, _, options) => {
            const normalizedInput = inputValue.replace(/\s+/g, "").toLowerCase();
            if (!normalizedInput) return false;
            if (!/^[a-zA-Z0-9\s]+$/.test(inputValue)) return false;
            return !options.some(
              (opt) => opt.value.replace(/\s+/g, "").toLowerCase() === normalizedInput
            );
          }}
          filterOption={(option, inputValue) => {
            const normalizedOption = option.label.replace(/\s+/g, "").toLowerCase();
            const normalizedInput = inputValue.replace(/\s+/g, "").toLowerCase();
            return normalizedOption.includes(normalizedInput);
          }}
        />
      </TableCell>
      {/* checkpoints */}
      {/* <TableCell className="editable-cell" style={{ height: "100px" }}>
        <textarea
          className="input-field"
          value={newRowInputs[tableType]?.check_points || ""}
          onChange={(e) => handleChangeNewRow(tableType, e, "check_points")}
          placeholder="Check Point"
        />
      </TableCell> */}
      <TableCell className="editable-cell" style={{ height: "100px" }}>
        <TextField
          value={newRowInputs[tableType]?.check_points || ""}
          placeholder="Check Point"
          onChange={(e) => handleChangeNewRow(tableType, e, "check_points")}
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
      {/* Observations */}

      <TableCell className="editable-cell" style={{ height: "100px" }}>
        <TextField
          value={newRowInputs[tableType]?.observation || ""}
          placeholder="Observation"
          onChange={(e) => handleChangeNewRow(tableType, e, "observation")}
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

      <TableCell className="editable-cell" style={{ height: "100px" }}>
        <Select
        ref={criticalitySelectRef}
          styles={{
            ...customSelectStylesCreatable,
            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
          }}
          placeholder="Criticality"
          options={criticalityOptions}
          value={
            newRowInputs[tableType]?.criticality
              ? { label: newRowInputs[tableType].criticality, value: newRowInputs[tableType].criticality }
              : null
          }
          isSearchable
          onChange={(e) => handleChangeNewRowSelect(tableType, e, "criticality")}
           onMenuOpen={() => setIsCriticalityDropdownOpen(true)}
           onMenuClose={() => setIsCriticalityDropdownOpen(false)}
          menuPortalTarget={document.body}
          menuPlacement="auto"
        />
      </TableCell>
      {/* Recommendations */}

      <TableCell className="editable-cell" style={{ height: "100px" }}>
        <TextField
          value={newRowInputs[tableType]?.recommendations || ""}
          placeholder="Recommendations"
          onChange={(e) => handleChangeNewRow(tableType, e, "recommendations")}
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
      {/* IsReference */}

      <TableCell className="editable-cell" style={{ height: "100px" }}>
        <TextField
          value={newRowInputs[tableType]?.is_reference || ""}
          placeholder="IS Reference"
          onChange={(e) => handleChangeNewRow(tableType, e, "is_reference")}
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
      {/* Scores */}

      <TableCell className="editable-cell" style={{ height: "100px" }}>
        <TextField
          value={newRowInputs[tableType]?.score || ""}
          onChange={(e) => handleChangeNewRow(tableType, e, "score")}
          placeholder="Score"
          type="number"
          sx={{ width: "100px", mt: -1 }}
          InputProps={{
            sx: { fontSize: "10px", height: "31px" },
            inputProps: { min: 0, max: 5 } // optional: restrict to 0–5
          }}
          variant="outlined"
          size="small"
        />
      </TableCell>
      {/* system_implementation */}
      <TableCell className="editable-cell" style={{ height: "100px" }}>
        <TextField
          value={newRowInputs[tableType]?.system_implementation || ""}
          placeholder="System Implementation"
          onChange={(e) => handleChangeNewRow(tableType, e, "system_implementation")}
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
      {/* compliance_check */}
      <TableCell className="editable-cell" style={{ height: "100px" }}>
        <TextField
          value={newRowInputs[tableType]?.compliance_check || ""}
          placeholder="Compliance Check"
          onChange={(e) => handleChangeNewRow(tableType, e, "compliance_check")}
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

      {/* {image upload } */}
      <TableCell>
        {/* <div className="image-container">
          <div className="upload-container">
            <input
              type="file"
              accept="image/*"
              // onChange={(e) => handleImageUploadNewRow(tableType, e.target.files)}
              multiple
              style={{ color: "transparent" }}
              disabled={true}
            />
            {newRowInputs[tableType]?.imageUrls?.length === 0 && (
              <div className="no-file-chosen">No file chosen</div>
            )}
          </div>
        </div> */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "6px 0", border: "1px solid grey", borderRadius: "5px", width: "100px", cursor: "not-allowed", position: "relative", background: "#f0f0f0", opacity: 0.6 }}>
          <CloudUploadOutlinedIcon size={30} />
        </div>
      </TableCell>
      <TableCell>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <CheckIcon
            onClick={() => handleAddRow(tableType)}
            style={{ cursor: "pointer", color: "green" }}
          />
        </div>
      </TableCell>
    </TableRow>
  );
  const handleChangeNewRow = (tableType, e, field) => {
    if (field === "score" && (e.target.value < 0 || e.target.value > 5)) {
      alert("Invalid score. Please enter a value between 0 and 5.");
      return; // Exit the function if the score is invalid
    }

    if (
      (field === "area" || field === "category" || field === "criticality") &&
      e.target.value.length > 100
    ) {
      alert(`${field} cannot exceed 100 characters.`);
      return; // Do not update the state if validation fails
    }

    setNewRowInputs((prev) => ({
      ...prev,
      [tableType]: {
        ...prev[tableType],
        [field]: e.target.value,
      },
    }));
  };
  const handleChangeNewRowSelect = (tableType, selectedOption, field) => {
    const value = selectedOption?.value || "";

    if (value.length > 100) {
      alert(`${field} cannot exceed 100 characters.`);
      return;
    }

    setNewRowInputs((prev) => ({
      ...prev,
      [tableType]: {
        ...prev[tableType],
        [field]: value,
      },
    }));
  };

  const handleAddRow = (tableType) => {
    // Generate a unique sr_no
    // const newSrNo = Date.now();
    const newSrNo = Date.now() % 1000000;
    // Create the new row with a fixed key, unique sr_no, and other properties
    const newRow = {
      ...newRowInputs[tableType],
      sr_no: newSrNo, // Assign the unique sr_no
      table_type: tableType,
      is_selected: 1,
      sector_type: selectedSector.value,
      isNew: true,
    };

    // Replace empty fields with "N/A"
    const updatedRow = {
      ...newRow,
      area: newRow.area,
      category: newRow.category?.trim() || "N/A",
      check_points: newRow.check_points?.trim() || "N/A",
      observation: newRow.observation,
      criticality: newRow.criticality?.trim() || "N/A",
      recommendations: newRow.recommendations?.trim() || "N/A",
      is_reference: newRow.is_reference?.trim() || "N/A",
      score: parseInt(newRow.score, 10) || 0,
      system_implementation: newRow.system_implementation?.trim() || "N/A",
      compliance_check: newRow.compliance_check?.trim() || "N/A",
      imageUrls: newRow.imageUrls?.length > 0 ? newRow.imageUrls : [],
    };

    // Validate the area, observation, recommendations, and is_reference fields
    if (
      !updatedRow.area ||
      !updatedRow.observation ||
      !updatedRow.recommendations ||
      !updatedRow.is_reference ||
      !updatedRow.system_implementation ||
      !updatedRow.compliance_check
    ) {
      alert(
        "Fields cannot be empty."
      );
      return;
    }

    setEditedObservations((prevObservations) => [
      ...prevObservations,
      updatedRow,
    ]);
    setIsReportEdited(true);

    // Update the state by pushing the new row into the array
    setSelectedObservations((prev) => [
      ...prev, // Spread the existing rows
      updatedRow, // Add the new row
    ]);
    // console.log("setallobservations",AllObservations)
    if (AllObservations?.length) {
      setAllObservations((prev) => [
        // prev?[...prev]:"", // Spread the existing rows
        ...prev,
        updatedRow, // Add the new row
      ]);
    }
    else {
      setAllObservations([updatedRow]);
    }
    // console.log("setallobservationsafter",AllObservations)
    // Clear the new row inputs
    initializeNewRowInputs(tableType, selectedSector.value);
  };
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

  const currentRisk = getRiskLevel(30);
  const [references, setReferences] = useState([]);
    const [newRow, setNewRow] = useState({ document: "", relevance: "", type: "data" });
    const [newHeading, setNewHeading] = useState("");
  
    useEffect(() => {
      fetchReferences();
    }, []);
  
    const fetchReferences = async () => {
      try {
        // const res = await axios.get("http://localhost:5000/api/references");
        const res = await axios.get(
            `${config.PATH}/api/get-all-annexure-details`
          );;
      
        setReferences(res.data);
      } catch (err) {
        console.error("Error fetching references:", err);
      }
    };
  
    const handleAdd = async () => {
      if (!newRow.document.trim() || !newRow.relevance.trim()) {
        alert("Please fill both fields before adding.");
        return;
      }
      try {
        // const res = await axios.post("http://localhost:5000/api/references", newRow);
        const res = await axios.post(
            `${config.PATH}/api/create-annexure-details`,newRow
          );
        setReferences([...references, res.data]);
        setNewRow({ document: "", relevance: "", type: "data" });
      } catch (err) {
        console.error("Error adding reference:", err);
      }
    };
  
    const handleAddHeading = async () => {
      if (!newHeading.trim()) {
        alert("Please enter section heading text.");
        return;
      }
      try {
        const res = await axios.post(`${config.PATH}/api/create-annexure-details`, {
          document: null,
          relevance: "",
          type: "heading",
          section_name: newHeading,
        });
        setReferences([...references, res.data]);
        setNewHeading("");
      } catch (err) {
        console.error("Error adding heading:", err);
      }
    };
  
    const handleDelete = async (id) => {
      if (!window.confirm("Are you sure you want to delete this entry?")) return;
      try {
        await axios.delete(`${config.PATH}/api/delete-annexure-details/${id}`);
        setReferences(references.filter((ref) => ref.id !== id));
      } catch (err) {
        console.error("Error deleting reference:", err);
      }
    };
  
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
                {module === "cmv" ? " HSE CMV Report" : "Saved Report"}
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
                      isDisabled
                    />

                  </div>
                  <div className="flex-container-start-end-date">
                    <div className="to-date-from-date">
                      <DatePicker
                        selected={new Date(startDate)}
                        onChange={(e) => handleStartEndDate(e, "start-date")}
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
                        className="class-for-date-pickers"
                        placeholderText="Audit End Date"
                        dateFormat="dd-MM-yyyy"
                        utcOffset={0}
                        minDate={new Date(startDate)}
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
                          setTimeFrom(`${hours}:${minutes}`);}
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
                          setTimeTo(`${hours}:${minutes}`); }
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
                    {/* Brief Property Description */}
                    <input
                      type="text"
                      placeholder="Brief Property Description"
                      value={briefPropertyDescription}
                      onChange={(e) => setBriefPropertyDescription(e.target.value)}
                      className="class-for-selects" 
                    />

                    {/* Number of Floors */}
                    <input
                      type="text"
                      placeholder="Number of Floors"
                      value={numOfFloors}
                      onChange={(e) => setNumOfFloors(e.target.value)}
                      className="class-for-selects" 
                      maxLength={20}
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
                      defaultValue={selectedSector}
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
                      options={areaList.map((area) => ({
                        label: area,
                        value: area,
                      }))}
                      onChange={(e) => handleChangeArea(e)}
                      isMulti={true}
                 
                         value={selectedArea.map((area) => ({
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
                        <button
                          onClick={handleOpenDrawer}
                          className="search-bar-button"
                        >
                          <span className="search-icon">&#128269;</span>{" "}
                         
                          <span className="search-text">
                            All Observations
                          </span>
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

                    {(AllObservations?.length ?? 0) > 0 && (selectedArea?.length ?? 0) > 0 ? (
                      <div className="ao-observations-list">
                        {Object.entries(groupedByTableType || {}).map(([table_type, areas]) => (
                          <div key={table_type} className="table-group">
                            <h4>
                              Parameter : <u>{table_type}</u>
                            </h4>

                            {Object.entries(areas || {}).map(([area, observationsInArea], index) => (
                              <Accordion
                                key={`${table_type}-${area}`}
                                expanded={expanded === `${table_type}-${area}`}
                                onChange={handleChangeAccordion(`${table_type}-${area}`)}
                              >
                                <AccordionSummary
                                  expandIcon={<ExpandMoreIcon />}
                                  aria-controls={`ao-${index}-content`}
                                  id={`ao-${index}-header`}
                                >
                                  <Typography component="span" sx={{ width: "33%", flexShrink: 0 }}>
                                    Area: {area}
                                  </Typography>
                                  <Typography component="span" sx={{ color: "text.secondary" }}>
                                    {(observationsInArea || []).filter((obs) => obs.is_selected === 1).length} out of{" "}
                                    {(observationsInArea || []).length} observations selected
                                  </Typography>
                                </AccordionSummary>

                                <AccordionDetails>
                                  {(observationsInArea || []).map((observation, obsIndex) => (
                                    <div key={obsIndex} className="observation-item-checkbox">
                                      <input
                                        type="checkbox"
                                        checked={observation.is_selected === 1}
                                        onChange={() =>
                                          handleObservationSelection(
                                            observation,
                                            (AllObservations || []).indexOf(observation)
                                          )
                                        }
                                      />
                                      <span>
                                        {observation.observation} 
                                        {/* (<span style={{ fontWeight: "bold" }}>{observation.category}</span>) */}
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
        {/* {showConfirmationModal && (
          <ConfirmationModal
            setShowConfirmationModal={setShowConfirmationModal}
            handleCloseWithoutSaving={handleCloseWithoutSaving}
          />
        )} */}
      </div>
    );
  }
else if (screenNumber === 2) {
    return (
      <>
        {loading ? <Loader /> : null}
        <Modal open={true} onClose={handleClose}>
          <div className="review-modal-container">
            <div className="review-modal-content">
              <div className="review-modal-header">
                <Typography variant="h5">
                  {module === "cmv" ? " HSE CMV Report" : "Saved Report"}
                </Typography>
                <button className="custom-close-button" onClick={handleClose}>
                  &#10005; {/* Unicode for 'X' */}
                </button>
              </div>
              <div className="review-modal-body" style={{ overflowY: "auto" }}>
                <Typography variant="body1" component="div">
                  <div>
                    <div className="sub-headings">
                      UNDERSTANDING THE REPORT
                    </div>
                    <JoditEditor
                      // ref={editor}
                      ref={contentEditor}
                      placeholder="Enter your text here"
                      value={contents}
                      config={config}
                      tabIndex={1}
                      onBlur={(newContent) => setContents(newContent)} // still update on blur
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
    else if (screenNumber === 3) {
    return (
      <>
        {loading ? <Loader /> : null}
        <Modal open={true} onClose={handleClose}>
          <div className="review-modal-container">
            <div className="review-modal-content">
              <div className="review-modal-header">
                <Typography variant="h6">
                  {module === "cmv" ? " Electrical CMV Report" : "Saved Report"} 
                </Typography>
                <button className="custom-close-button" onClick={handleClose}>
                  &#10005; {/* Unicode for 'X' */}
                </button>
              </div>
              <div className="review-modal-body" style={{ overflowY: "auto" }}>
                <Typography variant="body1" component="div">
                  <div className="sub-headings">
                      AUDIT DESCRIPTION
                    </div>
                  <div className="review-table-wrapper" style={{ borderRadius: "5px" }}>
                    <table style={{ width: "100%", fontFamily: "montserrat", borderCollapse: "collapse", borderRadius: "5px" }}>
                      <tbody>
                        <tr>
                          <td>Client</td>
                          <td>{selectedOrganization.label}</td>
                        </tr>
                        <tr>
                          <td>Location</td>
                          <td>{selectedSite.label}</td>
                        </tr>
                        <tr>
                          <td>Date of Site Visit</td>
                          <td>{new Date(startDate).getDate()}-{new Date(startDate).getMonth() + 1
                          }-{new Date(startDate).getFullYear()}</td>
                        </tr>
                        <tr>
                          <td>Study</td>
                          <td>HSE Audit</td>
                        </tr>
                        <tr>
                          <td>Time of Audit (From & To)</td>
                          {/* <td>{timeFrom.slice(0, 5)} to {timeTo.slice(0, 5)}</td> */}
                          <td>
                            {timeFrom && timeTo
                              ? `${timeFrom.slice(0, 5)} to ${timeTo.slice(0, 5)}`
                              : timeFrom
                                ? `${timeFrom.slice(0, 5)} to N/A`
                                : timeTo
                                  ? `N/A to ${timeTo.slice(0, 5)}`
                                  : "N/A"}
                          </td>

                        </tr>
                        <tr>
                          <td>Brief Property Description</td>
                          <td>{briefPropertyDescription}</td>
                        </tr>
                        <tr>
                          <td>Number of floors</td>
                          <td>{numOfFloors}</td>
                        </tr>
                        <tr>
                          <td>Average Staff Footfall</td>
                          <td>{avgStaffFootfall}</td>
                        </tr>
                        <tr>
                          <td>No Objection Certificate</td>
                          <td>{noObjectionCertificate}</td>
                        </tr>
                        <tr>
                          <td>National Building Code Category</td>
                          <td>{nationalBuildingCodeCategory}</td>
                        </tr>
                        <tr>
                          <td>Coordinating Person – Client Side</td>
                          <td>{coordinationgPersonClientside}</td>
                        </tr>
                        <tr>
                          <td>Report Prepared By</td>
                          <td>{reportPreparedBy}</td>
                        </tr>
                        <tr>
                          <td>Report Reviewed By</td>
                          <td>{reportReviewedBy}</td>
                        </tr>
                        <tr>
                          <td>Date of Submission of Report</td>
                          <td>{new Date(endDate).getDate()}-{new Date(endDate).getMonth() + 1
                          }-{new Date(endDate).getFullYear()}</td>
                        </tr>
                      </tbody>
                    </table>
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
      <div>
        {loading ? <Loader /> : null}
        <Modal open={true} onClose={handleClose}>
          <div className="review-modal-container">
            <div className="review-modal-content">
              <div className="review-modal-header">
                <Typography variant="h5">
                  {module === "cmv" ? " HSE CMV Report" : "Saved Report"}
                </Typography>
                <button className="custom-close-button" onClick={handleClose}>
                  &#10005; {/* Unicode for 'X' */}
                </button>
              </div>
              <div className="review-modal-body" style={{ overflowY: "auto" }}>
                <Typography variant="body1" component="div">
                  <div>
                    <div className="sub-headings">
                     CLASSIFICATION OF AUDIT OBSERVATIONS
                    </div>
                    <JoditEditor
                      ref={classificationEditor}
                      placeholder="Enter your text here"
                      value={classificationOfAuditObservations}
                      config={config}
                      tabIndex={1}
                      onBlur={(newContent) => setClassificationOfAuditObservations(newContent)}

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
        {/* {showConfirmationModal && (
          <ConfirmationModal
            setShowConfirmationModal={setShowConfirmationModal}
            handleCloseWithoutSaving={handleCloseWithoutSaving}
          />
        )} */}
      </div>
    );
  }
else if (screenNumber === 5) {
    return (
      <div>
        {loading ? <Loader /> : null}
        <Modal open={true} onClose={handleClose}>
          <div className="review-modal-container">
            <div className="review-modal-content">
              <div className="review-modal-header">
                <Typography variant="h5">
                  {module === "cmv" ? " HSE CMV Report" : "Saved Report"}
                </Typography>
                <button className="custom-close-button" onClick={handleClose}>
                  &#10005; {/* Unicode for 'X' */}
                </button>
              </div>
              <div className="review-modal-body" style={{ overflowY: "auto" }}>
                <Typography variant="body1" component="div">
                  <div>
                    <div className="sub-headings">
                      AUDIT OBJECTIVE
                    </div>
                    <JoditEditor
                      ref={editor}
                      placeholder="Enter your text here"
                      value={backgroundBrief}
                      config={config}
                      tabIndex={1}
                      onBlur={(newContent) => setBackgroundBrief(newContent)} // This updates backgroundBrief on blur

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
        {/* {showConfirmationModal && (
          <ConfirmationModal
            setShowConfirmationModal={setShowConfirmationModal}
            handleCloseWithoutSaving={handleCloseWithoutSaving}
          />
        )} */}
      </div>
    );
  }
else if (screenNumber === 6) {
    return (
      <>
        {loading ? <Loader /> : null}
        <Modal open={true} onClose={handleClose}>
          <div className="review-modal-container">
            <div className="review-modal-content">
              <div className="review-modal-header">
                <Typography variant="h5">
                  {module === "cmv" ? " HSE CMV Report" : "Saved Report"}
                </Typography>
                <button className="custom-close-button" onClick={handleClose}>
                  &#10005; {/* Unicode for 'X' */}
                </button>
              </div>
              <div className="review-modal-body" style={{ overflowY: "auto" }}>
                <Typography variant="body1" component="div">
                  <div>
                    <div className="sub-headings">EXECUTIVE SUMMARY</div>
                    <JoditEditor
                      // ref={editor}
                      ref={exeSummaryEditor}
                      placeholder="Enter your text here"
                      value={exeSummary}
                      config={config}

                      tabIndex={1}
                      onBlur={(newContent) => setExeSummary(newContent)} // This updates backgroundBrief on blur
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
    else if (screenNumber === 7) {
    return (
      <div>
        {loading ? <Loader /> : null}
        <Modal open={true} onClose={handleClose}>
          <div className="review-modal-container">
            <div className="review-modal-content">
              <div className="review-modal-header">
                <Typography variant="h5">
                  {module === "cmv" ? " HSE CMV Report" : "Saved Report"}
                </Typography>
                <button className="custom-close-button" onClick={handleClose}>
                  &#10005; {/* Unicode for 'X' */}
                </button>
              </div>
              <div className="review-modal-body" style={{ overflowY: "auto" }}>
                <Typography variant="body1" component="div">
                  <div>
                    <div className="sub-headings">
                      AUDIT SCORE ANALYSIS
                    </div>
                    <JoditEditor
                      ref={auditScoreEditor}
                      placeholder="Enter your text here"
                      value={auditScoreAnalysis}
                      config={config}
                      tabIndex={1}
                      onBlur={(newContent) => setAuditScoreAnalysis(newContent)} // This updates backgroundBrief on blur

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
        {/* {showConfirmationModal && (
          <ConfirmationModal
            setShowConfirmationModal={setShowConfirmationModal}
            handleCloseWithoutSaving={handleCloseWithoutSaving}
          />
        )} */}
      </div>
    );
  }
    else if (screenNumber === 8) {
    return (
      <div>
        {loading ? <Loader /> : null}
        <Modal open={true} onClose={handleClose}>
          <div className="review-modal-container">
            <div className="review-modal-content">
              <div className="review-modal-header">
                <Typography variant="h5">
                  {module === "cmv" ? " HSE CMV Report" : "Saved Report"}
                </Typography>
                <button className="custom-close-button" onClick={handleClose}>
                  &#10005; {/* Unicode for 'X' */}
                </button>
              </div>
              <div className="review-modal-body" style={{ overflowY: "auto" }}>
                <Typography variant="body1" component="div">
                  <div>
                    <div className="sub-headings">
                      IMPROVEMENT OPPORTUNITY AREAS
                    </div>
                    <JoditEditor
                      ref={improvementEditor}
                      placeholder="Enter your text here"
                      value={improvementOpportunityAreas}
                      config={config}
                      tabIndex={1}
                      onBlur={(newContent) => setImprovementOpportunityAreas(newContent)} // This updates backgroundBrief on blur

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
        {/* {showConfirmationModal && (
          <ConfirmationModal
            setShowConfirmationModal={setShowConfirmationModal}
            handleCloseWithoutSaving={handleCloseWithoutSaving}
          />
        )} */}
      </div>
    );
  }
    else if (screenNumber === 9) {
    return (
      <>
        <Modal open={true} onClose={handleClose}>
          <div className="review-modal-container">
            <div className="review-modal-content">
              <div className="review-modal-header">
                <Typography variant="h5">Preview Report</Typography>
                <button className="custom-close-button" onClick={handleClose}>
                  &#10005; {/* Unicode for 'X' */}
                </button>
              </div>
               <div className="sub-headings">
                  ANNEXURE - REFERENCES & STANDARDS
                    </div>
              <div className="review-modal-body" style={{ overflowY: "auto" }}>
              <div className="table-containerr">
      <table className="styled-tablee">
        <thead>
          <tr>
            <th>Reference Type and Document / Standard</th>
            <th>Relevance to Audit Findings</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
         {references.map((ref) =>
  ref.type === "heading" ? (
    <tr key={ref.id} className="section-headingg">
      <td colSpan="2">{ref.section_name}</td>
      <td className="action-celll">
        <FaTrash
          className="delete-iconn"
          title="Delete Section"
          onClick={() => handleDelete(ref.id)}
        />
      </td>
    </tr>
  ) : (
    <tr key={ref.id}>
      <td>{ref.document}</td>
      <td>{ref.relevance}</td>
      <td className="action-celll">
        <FaTrash
          className="delete-iconn"
          title="Delete Row"
          onClick={() => handleDelete(ref.id)}
        />
      </td>
    </tr>
  )
)}

          <tr className="new-roww">
            <td>
              <input
                type="text"
                placeholder="Enter new document..."
                value={newRow.document}
                onChange={(e) => setNewRow({ ...newRow, document: e.target.value })}
              />
            </td>
            <td>
              <input
                type="text"
                placeholder="Enter relevance..."
                value={newRow.relevance}
                onChange={(e) => setNewRow({ ...newRow, relevance: e.target.value })}
              />
            </td>
            <td className="action-celll">
              <FaCheck className="add-icon" title="Add Data Row" onClick={handleAdd} />
            </td>
          </tr>

          {/* Row for Adding Section Header */}
          <tr className="new-roww">
            <td colSpan="2">
              <input
                type="text"
                placeholder="Enter section heading..."
                value={newHeading}
                onChange={(e) => setNewHeading(e.target.value)}
              />
            </td>
            <td className="action-celll">
              <FaCheck className="heading-iconn" title="Add Section" onClick={handleAddHeading} />
            </td>
          </tr>
        </tbody>
      </table>
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
                <Typography variant="h5">Saved Report</Typography>
                <button className="custom-close-button" onClick={handleClose}>
                  &#10005; {/* Unicode for 'X' */}
                </button>
              </div>
              <div style={{ fontWeight: "600" }} className="sub-headings">
                CRITICAL OBSERVATIONS, RECOMMENDATIONS & Reasoning - HSE REPORT
              </div>
              <div
                style={{ overflowY: "scroll" }}
                className="review-modal-body"
              >
                                                 <div>
                    {tableTypes.length > 0 && (
                     <CreatableSelect
                    placeholder="Select or type table type..."
                    value={selectedTableType}
                    onChange={handleTableTypeChange}
                    options={tableTypes.map((type) => ({ label: type, value: type }))}
                    isClearable
                    isMulti
                    formatCreateLabel={(inputValue) => ` Create "${inputValue}"`}
                  />
                
                    )}
                  </div>
                <div className="table-container">
                  {Object.keys(safeGroupedObservations).map((tableType) => (
                    <div key={tableType}>
                      <Typography style={{ fontWeight: "500" }} gutterBottom>
                        {tableType}
                      </Typography>
                      <TableContainer
                        component={Paper}
                        className="table-scroll"
                        ref={tableRef}
                      >
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Sr. No.</TableCell>
                              <TableCell>Area / Process</TableCell>
                              <TableCell>Check Point</TableCell>
                              <TableCell>Observation</TableCell>
                              <TableCell>Criticality</TableCell>
                              <TableCell>Recommendation</TableCell>
                              <TableCell>Legal Reference (if any)</TableCell>
                              <TableCell>Score</TableCell>
                              <TableCell>System Implementation</TableCell>
                              <TableCell>Compliance Check</TableCell>
                              <TableCell>Objective Evidence</TableCell>
                              <TableCell>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {safeGroupedObservations[tableType].map(
                              (observation, index) => (
                                <TableRow
                                  key={`${observation.table_type}-${observation.area
                                    }-${observation.sr_no || observation.id}`}
                                  className={(() => {
                                    const foundObservation = selectedObservations.find(
                                      (obs) =>
                                        obs.table_type === observation.table_type &&
                                        obs.area === observation.area &&
                                        (obs.sr_no === observation.sr_no || obs.id === observation.id)
                                    );

                                    // If editing, make all other rows 'odd-row' except the one being edited
                                    if (isEditing && foundObservation) {
                                      // Check if the current row is being edited
                                      if (
                                        currentEditedRow === foundObservation.sr_no ||
                                        currentEditedRow === foundObservation.id
                                      ) {
                                        return "even-row"; // Keep the current editing row as even
                                      } else {
                                        return "odd-row"; // All other rows become odd
                                      }
                                    }

                                    // Default: all rows are even when not editing
                                    return "even-row";
                                  })()}


                                  style={
                                    observation.variant === true
                                      ? { backgroundColor: "#f2f2f2" }
                                      : {}
                                  }
                                >
                                  <TableCell>{index + 1}</TableCell>
                                  {/* area */}
                                  <TableCell
                                    className="editable-cell"
                                    style={{ height: "100px" }}
                                  >
                                    <div
                                      className="cell-content"
                                      style={{
                                        color:
                                          isEditing &&
                                            currentEditedRow !==
                                            observation.sr_no

                                            ? "grey"
                                            : "black",
                                      }}
                                    >
                                      <CreatableSelect
                                        styles={customSelectStylesCreatable}
                                        placeholder="Area"
                                        // options={areaOptions()}
                                        options={areaList.map((area) => ({ label: area, value: area }))}
                                        defaultValue={{
                                          label: observation.area,
                                          value: observation.area,
                                        }}
                                        isSearchable
                                        onChange={(e) =>
                                          handleCellEdit(
                                            e,
                                            index,
                                            "area",
                                            observation.area,
                                            observation
                                          )
                                        }
                                        isDisabled={
                                          isEditing &&
                                          currentEditedRow !==
                                          observation.sr_no


                                        }
                                      />
                                    </div>
                                    {!observation.variant && (
                                      <EditOutlinedIcon
                                        className="edit-icon"
                                        fontSize="small"
                                      />
                                    )}
                                  </TableCell>
                                  {/* checkpoints */}
                                  <TableCell
                                    className="editable-cell"
                                    style={{ height: "100px" }}
                                  >
                                    <div
                                      className="cell-content"
                                      style={{

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
                                            setSelectedObservations((prev) => {
                                              return prev.map((obs) =>
                                                (obs.sr_no || obs.id) === (observation.sr_no || observation.id)
                                                  ? { ...obs, check_points: newValue }
                                                  : obs
                                              );
                                            });

                                          }
                                        }}


                                        onBlur={(e) => {
                                          handleCellEdit(e, index, "check_points", observation.check_points, observation);
                                        }}
                                        sx={{ width: "200px" }}
                                        InputProps={{
                                          sx: { fontSize: "10px" },
                                          disabled: currentEditedRow !== -1 && currentEditedRow !== observation.sr_no,
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
                                  <TableCell className="editable-cell" style={{ height: "100px" }}>
                                    <div
                                      className="cell-content"
                                      style={{
                                        //     color:
                                        // (isEditing && currentEditedRow !== index) ||
                                        //   observation.variant === true
                                        //   ? "grey"
                                        //   : "black",
                                        marginRight: "10px",
                                      }}
                                    >
                                      <TextField
                                        id={`outlined-textarea-${index}`}
                                        placeholder="Observation"
                                        value={
                                          observation.observation
                                            // ? observation.observation.replace(/\s+/g, " ").trim()
                                            // : ""
                                        }
                                        onChange={(e) => {
                                          const newValue = e.target.value;

                                          const proceed = handleCellEdit(
                                            { ...e, target: { ...e.target, textContent: newValue } },
                                            index,
                                            "observation",
                                            observation.observation,
                                            { ...observation, observation: newValue }
                                          );

                                          if (!proceed) return;

                                          setSelectedObservations((prev) =>
                                            prev.map((obs) =>
                                              (obs.sr_no || obs.id) === (observation.sr_no || observation.id)
                                                ? { ...obs, observation: newValue, hasEdited: true }
                                                : obs
                                            )
                                          );
                                        }}
                                        onBlur={(e) => {
                                          const latestValue = e.target.value;

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
                                          disabled: currentEditedRow !== -1 && currentEditedRow !== observation.sr_no,
                                        }}
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        multiline
                                        minRows={1.5}
                                        maxRows={10}
                                      />

                                      <DialogBox dialog={dialog} handleDialogBox={handleDialogBoxObservation} />
                                      {/* Optional: Show dialog if needed */}
                                      {/* <DialogBox dialog={dialog} handleDialogBox={handleDialogBoxObservation} /> */}
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

                                  {/* criticality */}

                                  <TableCell className="editable-cell" style={{ height: "100px" }}>
                                    <Select
                                      styles={{
                                        ...customSelectStylesCreatable,
                                      }}
                                      placeholder="Criticality"
                                      options={criticalityOptions.length > 0 ? criticalityOptions : []}
                                      noOptionsMessage={() => "No options"}
                                      value={
                                        observation.criticality
                                          ? { label: observation.criticality, value: observation.criticality }
                                          : null
                                      }
                                      isSearchable
                                      onChange={(selectedOption) => {
                                        if (currentEditedRow !== -1 && currentEditedRow !== observation.sr_no) {
                                          toast.warning("Please save the current row before editing another.");
                                          return;
                                        }

                                        if (selectedOption) {
                                          const newValue = selectedOption.value;

                                          // Pass updated observation object with new criticality to handleCellEdit
                                          const proceed = handleCellEdit(
                                            { value: newValue }, // mimic the select object
                                            index,
                                            "criticality",
                                            observation.criticality,
                                            { ...observation, criticality: newValue }
                                          );

                                          if (!proceed) return;

                                          // Update selectedObservations
                                          setSelectedObservations((prev) =>
                                            prev.map((obs) =>
                                              (obs.sr_no || obs.id) === (observation.sr_no || observation.id)
                                                ? { ...obs, criticality: newValue, hasEdited: true }
                                                : obs
                                            )
                                          );
                                        }
                                      }}
                                      isDisabled={
                                        (isEditing && currentEditedRow !== observation.sr_no) ||
                                        observation.variant === true
                                      }
                                      menuPlacement="auto"
                                    />

                                    {!observation.variant && (
                                      <EditOutlinedIcon
                                        className="edit-icon"
                                        fontSize="small"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (
                                            (isEditing && currentEditedRow !== observation.sr_no) ||
                                            observation.variant === true
                                          ) {
                                            toast.warning(
                                              "Please save changes in the currently edited row before editing another row."
                                            );
                                          }
                                        }}
                                      />
                                    )}
                                  </TableCell>

                                  {/* recommendations */}
                                  <TableCell className="editable-cell">
                                    <div
                                      className="cell-content"
                                      style={{
                                        //     color:
                                        // (isEditing && currentEditedRow !== index) ||
                                        //   observation.variant === true
                                        //   ? "grey"
                                        //   : "black",
                                        marginRight: "10px"
                                      }}
                                    >

                                      <TextField
                                        id={`outlined-textarea-${index}`}
                                        value={observation.recommendations}
                                        placeholder="Recommendations"
                                        onChange={(e) => {
                                          const newValue = e.target.value;

                                          const proceed = handleCellEdit(
                                            { ...e, target: { ...e.target, textContent: newValue } },
                                            index,
                                            "recommendations",
                                            observation.recommendations,
                                            { ...observation, recommendations: newValue }
                                          );

                                          if (!proceed) return;

                                          setSelectedObservations((prev) =>
                                            prev.map((obs) =>
                                              (obs.sr_no || obs.id) === (observation.sr_no || observation.id)
                                                ? { ...obs, recommendations: newValue, hasEdited: true }
                                                : obs
                                            )
                                          );
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
                                          disabled: currentEditedRow !== -1 && currentEditedRow !== observation.sr_no,
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
                                  {/* isreference */}
                                  <TableCell
                                    className="editable-cell"
                                    style={{ height: "100px" }}
                                  >
                                    <div
                                      className="cell-content"
                                      style={{
                                        //    color:
                                        // (isEditing && currentEditedRow !== index) ||
                                        //   observation.variant === true
                                        //   ? "grey"
                                        //   : "black",
                                        marginRight: "10px"
                                      }}
                                    >

                                      <TextField
                                        id={`outlined-textarea-${index}`}
                                        value={observation.is_reference}
                                        placeholder="IS Reference"
                                        onChange={(e) => {
                                          const newValue = e.target.value;

                                          const proceed = handleCellEdit(
                                            { ...e, target: { ...e.target, textContent: newValue } },
                                            index,
                                            "is_reference",
                                            observation.is_reference,
                                            { ...observation, is_reference: newValue }
                                          );

                                          if (!proceed) return;

                                          setSelectedObservations((prev) =>
                                            prev.map((obs) =>
                                              (obs.sr_no || obs.id) === (observation.sr_no || observation.id)
                                                ? { ...obs, is_reference: newValue, hasEdited: true }
                                                : obs
                                            )
                                          );
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
                                          disabled: currentEditedRow !== -1 && currentEditedRow !== observation.sr_no,
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
                                  {/* scores */}
                                  <TableCell className="editable-cell" style={{ height: "100px" }}>
                                    <div
                                      className="cell-content"
                                      style={{
                                        //    color:
                                        // (isEditing && currentEditedRow !== index) ||
                                        //   observation.variant === true
                                        //   ? "grey"
                                        //   : "black",
                                        marginRight: "10px",
                                      }}
                                    >
                                      <TextField
                                        type="number"
                                        value={observation.score ?? ""}
                                        placeholder="Score"
                                        sx={{ width: "80px" }}
                                        InputProps={{
                                          sx: { fontSize: "10px" },
                                          inputProps: {
                                            min: 0,
                                            max: 5,
                                            step: 1,
                                          },
                                          disabled:
                                            observation.variant === true ||
                                            (isEditing && currentEditedRow !== observation.sr_no),
                                        }}
                                        onChange={(e) =>
                                          handleScoreChange(
                                            e,
                                            observation.table_type,
                                            observation.sr_no || observation.id,
                                            index
                                          )
                                        }
                                        size="small"
                                        variant="outlined"
                                      />
                                    </div>

                                    {!observation.variant && (
                                      <EditOutlinedIcon
                                        onClick={(e) =>
                                          isEditing
                                            ? setCurrentEditedRow(index)
                                            : null
                                        }
                                        className="edit-icon"
                                        fontSize="small"
                                      />
                                    )}
                                  </TableCell>
                                  {/* system_implentation */}
                                  <TableCell className="editable-cell">
                                    <div
                                      className="cell-content"
                                      style={{

                                        marginRight: "10px"
                                      }}
                                    >

                                      <TextField
                                        id={`outlined-textarea-${index}`}
                                        value={observation.system_implementation}
                                        placeholder="System Implementation"
                                        onChange={(e) => {
                                          const newValue = e.target.value;

                                          const proceed = handleCellEdit(
                                            { ...e, target: { ...e.target, textContent: newValue } },
                                            index,
                                            "system_implementation",
                                            observation.system_implementation,
                                            { ...observation, system_implementation: newValue }
                                          );

                                          if (!proceed) return;

                                          setSelectedObservations((prev) =>
                                            prev.map((obs) =>
                                              (obs.sr_no || obs.id) === (observation.sr_no || observation.id)
                                                ? { ...obs, system_implementation: newValue, hasEdited: true }
                                                : obs
                                            )
                                          );
                                        }}
                                        onBlur={(e) => {
                                          const latestValue = e.target.value;

                                          handleCellEdit(
                                            { ...e, target: { ...e.target, textContent: latestValue } },
                                            index,
                                            "system_implementation",
                                            observation.system_implementation,
                                            { ...observation, system_implementation: latestValue }
                                          );
                                        }}
                                        sx={{ width: "200px" }}
                                        InputProps={{
                                          sx: { fontSize: "10px" },
                                          disabled: currentEditedRow !== -1 && currentEditedRow !== observation.sr_no,
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
                                              "system_implementation",
                                              observation.system_implementation,
                                              observation
                                            )
                                            : null
                                        }
                                        className="edit-icon"
                                        fontSize="small"
                                      />
                                    )}
                                  </TableCell>
                                  {/* compliance_check */}
                                  <TableCell className="editable-cell">
                                    <div
                                      className="cell-content"
                                      style={{

                                        marginRight: "10px"
                                      }}
                                    >

                                      <TextField
                                        id={`outlined-textarea-${index}`}
                                        value={observation.compliance_check}
                                        placeholder="Compliance Check"
                                        onChange={(e) => {
                                          const newValue = e.target.value;

                                          const proceed = handleCellEdit(
                                            { ...e, target: { ...e.target, textContent: newValue } },
                                            index,
                                            "compliance_check",
                                            observation.compliance_check,
                                            { ...observation, compliance_check: newValue }
                                          );

                                          if (!proceed) return;

                                          setSelectedObservations((prev) =>
                                            prev.map((obs) =>
                                              (obs.sr_no || obs.id) === (observation.sr_no || observation.id)
                                                ? { ...obs, compliance_check: newValue, hasEdited: true }
                                                : obs
                                            )
                                          );
                                        }}
                                        onBlur={(e) => {
                                          const latestValue = e.target.value;

                                          handleCellEdit(
                                            { ...e, target: { ...e.target, textContent: latestValue } },
                                            index,
                                            "compliance_check",
                                            observation.compliance_check,
                                            { ...observation, compliance_check: latestValue }
                                          );
                                        }}
                                        sx={{ width: "200px" }}
                                        InputProps={{
                                          sx: { fontSize: "10px" },
                                          disabled: currentEditedRow !== -1 && currentEditedRow !== observation.sr_no,
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
                                              "compliance_check",
                                              observation.compliance_check,
                                              observation
                                            )
                                            : null
                                        }
                                        className="edit-icon"
                                        fontSize="small"
                                      />
                                    )}
                                  </TableCell>
                                  {/* image upload */}

                                  <TableCell>
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "15px",
                                      }}
                                    >
                                      {/* Upload Icon with input */}
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          padding: "6px 0",
                                          border: "1px solid grey",
                                          borderRadius: "5px",
                                          width: "100px",
                                          cursor:
                                            isEditing &&
                                              currentEditedRow !== (observation.sr_no || observation.id)
                                              ? "not-allowed"
                                              : "pointer",
                                          position: "relative",
                                          background:
                                            isEditing &&
                                              currentEditedRow !== (observation.sr_no || observation.id)
                                              ? "#f0f0f0"
                                              : "white",
                                          opacity:
                                            isEditing &&
                                              currentEditedRow !== (observation.sr_no || observation.id)
                                              ? 0.6
                                              : 1,
                                        }}
                                      >
                                        <CloudUploadOutlinedIcon fontSize="small" />
                                        <input
                                          type="file"
                                          accept="image/*"
                                          multiple
                                          onChange={(e) =>
                                            handleImageUpload(
                                              observation.table_type,
                                              observation.sr_no || observation.id,
                                              observation.area,
                                              e.target.files
                                            )
                                          }
                                          style={{
                                            position: "absolute",
                                            width: "100%",
                                            height: "100%",
                                            top: 0,
                                            left: 0,
                                            opacity: 0,
                                            cursor:
                                              isEditing &&
                                                currentEditedRow !== (observation.sr_no || observation.id)
                                                ? "not-allowed"
                                                : "pointer",
                                          }}
                                          disabled={
                                            isEditing &&
                                            currentEditedRow !== (observation.sr_no || observation.id)
                                          }
                                        />
                                      </div>

                                      {/* View Uploaded Images Icon */}
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          padding: "6px 0",
                                          border: "1px solid grey",
                                          borderRadius: "5px",
                                          width: "100px",
                                          cursor: "pointer",
                                        }}
                                        onClick={() =>
                                          handleOpenImageDialog(observation.sr_no || observation.id, observation)
                                        }
                                      >
                                        <InsertPhotoOutlinedIcon fontSize="small" />
                                      </div>
                                    </div>

                                    {/* Image Preview Dialog */}
                                    {selectedObservation?.image &&
                                      selectedObservation.image.sr_no === observation.sr_no && (
                                        <Dialog onClose={handleCloseImageDialog} open={openDialog} maxWidth={false}>
                                          <DialogTitle>Uploaded Images</DialogTitle>
                                          <DialogContent dividers>
                                            {selectedObservation.image.imageUrls?.length > 0 ? (
                                              <div
                                                style={{
                                                  display: "grid",
                                                  gridTemplateColumns: "repeat(4, 1fr)",
                                                  gap: "10px",
                                                }}
                                              >
                                                {selectedObservation.image.imageUrls.map(
                                                  (imageUrl, imgIndex) => (
                                                    <div style={{ display: "flex" }} key={imgIndex}>
                                                      <img
                                                        src={imageUrl}
                                                        alt={`Image ${imgIndex + 1}`}
                                                        onClick={() => setSelectedImage(imageUrl)}
                                                        style={{
                                                          cursor: "pointer",
                                                          width: "200px",
                                                          height: "200px",
                                                          objectFit: "cover",
                                                          borderRadius: "4px",
                                                        }}
                                                      />
                                                      <CancelIcon
                                                        className="cancel-icon"
                                                        onClick={() =>
                                                          handleRemoveImage(
                                                            observation.table_type,
                                                            observation.area,
                                                            observation.sr_no || observation.id,
                                                            imgIndex
                                                          )
                                                        }
                                                        style={{ cursor: "pointer", marginLeft: 5 }}
                                                      />
                                                    </div>
                                                  )
                                                )}
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
                                  {/* Info */}
                                  <TableCell className="table-actions">
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "center",
                                      }}
                                    >
                                      <InfoIcon
                                        onClick={() =>
                                          getObservationVariants(observation.observation, observation.sr_no || observation.id)
                                        }
                                        style={{
                                          pointerEvents: (() => {
                                            const matchingObservation = selectedObservations.find(
                                              (obs) =>
                                                obs.table_type === observation.table_type &&
                                                obs.area === observation.area &&
                                                (obs.sr_no === observation.sr_no || obs.id === observation.id)
                                            );

                                            return isEditing &&
                                              (!matchingObservation ||
                                                (matchingObservation.sr_no !== observation.sr_no &&
                                                  matchingObservation.id !== observation.id))
                                              ? "none"
                                              : "auto";
                                          })(),
                                        }}
                                      />
                                      {/* <PlaylistAddCircleIcon
                                        onClick={() =>
                                          handleDuplicateRow(
                                            observation.table_type,
                                            observation.area,
                                            observation.sr_no || observation.id
                                          )
                                        }
                                        style={{
                                          pointerEvents: (() => {
                                            const matchingObservation = selectedObservations.find(
                                              (obs) =>
                                                obs.table_type === observation.table_type &&
                                                obs.area === observation.area &&
                                                (obs.sr_no === observation.sr_no || obs.id === observation.id)
                                            );

                                            return isEditing &&
                                              (!matchingObservation ||
                                                (matchingObservation.sr_no !== observation.sr_no &&
                                                  matchingObservation.id !== observation.id))
                                              ? "none"
                                              : "auto";
                                          })(),
                                        }}
                                      /> */}
                                      <DeleteForeverIcon
                                        onClick={() =>
                                          handleDeleteRow(
                                            observation.table_type,
                                            observation.area,
                                            observation.sr_no || observation.id
                                          )
                                        }
                                        style={{
                                          pointerEvents: (() => {
                                            const matchingObservation = selectedObservations.find(
                                              (obs) =>
                                                obs.table_type === observation.table_type &&
                                                obs.area === observation.area &&
                                                (obs.sr_no === observation.sr_no || obs.id === observation.id)
                                            );

                                            return isEditing &&
                                              (!matchingObservation ||
                                                (matchingObservation.sr_no !== observation.sr_no &&
                                                  matchingObservation.id !== observation.id))
                                              ? "none"
                                              : "auto";
                                          })(),
                                        }}
                                      />
                                    </div>
                                  </TableCell>

                                </TableRow>
                              )
                            )}
                            {renderNewRowInputs(tableType)}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </div>
                  ))}
                </div>
              </div>
              <hr />
              <div
                style={{ marginBottom: "10px" }}
                className="review-modal-footer"
              >
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
  }
else if (screenNumber === 11) {
    return (
      <>
        {loading ? <Loader /> : null}
        <Modal open={true} onClose={handleClose}>
          <div className="review-modal-container">
            <div className="review-modal-content">
              <div className="review-modal-header">
                <Typography variant="h5">Charts</Typography>
                <button className="custom-close-button" onClick={handleClose}>
                  &#10005; {/* Unicode for 'X' */}
                </button>
              </div>
              <div className="review-modal-body" style={{ overflowY: "auto" }}>
                <div
                  id="chart-container-for-report"
                  className="chart-container-for-report"
                  ref={chartContainerRef}
                >
                  <div className="total-serverity-div-for-report">
                    <div className="severity-item-for-report">
                      Total Observations
                      <br />
                      <span>{data.length}</span>
                      <hr />
                    </div>
                    <div
                      style={{ color: "#FF0000" }}
                      className="severity-item-for-report"
                    >
                      High Severity Observations
                      <br />
                      <span>
                        {data.filter((e) => e.criticality === "High").length}
                      </span>
                      <hr />
                    </div>
                    <div
                      style={{ color: "#006400" }}
                      className="severity-item-for-report"
                    >
                      Medium Severity Observations
                      <br />
                      <span>
                        {data.filter((e) => e.criticality === "Medium").length}
                      </span>
                      <hr />
                    </div>
                    <div
                      style={{ color: "#005cdb" }}
                      className="severity-item-for-report"
                    >
                      Low Severity Observations
                      <br />
                      <span>
                        {data.filter((e) => e.criticality === "Low").length}
                      </span>
                      <hr />
                    </div>
                  </div>
                  <div className="area-chart-for-report">
                    Area Chart
                    <Chart
                      options={barOptions}
                      series={[
                        {
                          name: "",
                          data: counts,
                        },
                      ]}
                      type="bar"
                      height={300}
                    />
                  </div>
                  <div className="severity-chart-for-report">
                    Severity Chart
                    <Chart
                      options={severityChartOptions}
                      series={seriesData}
                      type="bar"
                      height={300}
                    />
                  </div>
                  <div className="pie-chart-for-report">
                    Audit Score
                    <Chart
                      options={pieOptions}
                      series={[scorePercent, 100 - scorePercent]}
                      type="pie"
                      style={{ width: "100%" }}
                      height={250}
                    />
                  </div>
                </div>
              </div>
              <hr />
              <div className="review-modal-footer">
                <button
                  className="button-styles"
                  onClick={handleSave}
                  disabled={waitForCharts}
                  style={{
                    background: waitForCharts ? "lightgrey" : "#efc71d",
                  }}
                >
                  {waitForCharts ? "Wait..." : "Save"}
                </button>
                <button
                  className="button-styles"
                  onClick={handlePrev}
                  disabled={waitForCharts}
                  style={{
                    background: waitForCharts ? "lightgrey" : "#efc71d",
                  }}
                >
                  &#171; {waitForCharts ? "Wait..." : "Prev"}
                </button>
                <button
                  className="button-styles"
                  color="primary"
                  onClick={handleNext}
                  disabled={waitForCharts}
                  style={{
                    background: waitForCharts ? "lightgrey" : "#efc71d",
                  }}
                >
                  {waitForCharts ? "Wait..." : "Next"} &#187;
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </>
    );
  }
    else if (screenNumber === 12) {
    return (
      <>
        {loading ? <Loader /> : null}
        <Modal open={true} onClose={handleClose}>
          <div className="review-modal-container">
            <div className="review-modal-content">
              <div className="review-modal-header">
                <Typography variant="h6">
                  {module === "cmv" ? " Electrical CMV Report" : "SAVED REPORT"} : OVERALL ASSESSMENT INDICATOR
                </Typography>
                <button className="custom-close-button" onClick={handleClose}>
                  &#10005; {/* Unicode for 'X' */}
                </button>
              </div>
              <div className="review-modal-body" style={{ overflowY: "auto" }}>
                <Typography variant="body1" component="div">


                  <div className="review-modal-body" style={{ display: "flex", gap: "10px", overflowY: "auto", marginBottom: "20px" }}>

                    {/* Left Risk Section */}
                    <div
                      style={{
                        width: "200px",
                        padding: "10px",
                        borderRadius: "4px",
                        backgroundColor: currentRisk.color,
                        color: "#000",
                        flexShrink: 0,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      {/* <h4>{currentRisk.risk}</h4>
                      <p>{currentRisk.interpretation}</p> */}
                      {/* <p>{Math.floor((cumulativeScore / 10) * 100)}%</p> */}
                      <p>30%</p>
                    </div>

                    {/* Right JoditEditor */}
                    <div style={{ flexGrow: 1 }}>
                      <JoditEditor
                        ref={overallAssessmentEditor}
                        placeholder="Enter your text here"
                        value={overallAssessmentIndicator}
                        config={config}
                        tabIndex={1}
                        onBlur={(newContent) => setOverallAssessmentIndicator(newContent)} // This updates backgroundBrief on blur

                      />
                    </div>
                  </div>
                  <div style={{ marginBottom: "20px", overflowX: "auto" }}>
                    <h3 style={{ color: "#307260", fontFamily: "Montserrat" }}>Risk Legend</h3>
                    {/* <p style={{ fontFamily: "Montserrat" }}>The above image is per display purpose only</p> */}
                    <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Montserrat" }}>
                      <thead>
                        <tr style={{ backgroundColor: "#307260", color: "#efc71d" }}>
                          <th style={{ padding: "8px", border: "1px solid #000", fontSize: "14px" }}>Score Range</th>
                          <th style={{ padding: "8px", border: "1px solid #000", fontSize: "14px" }}>Risk Level</th>
                          <th style={{ padding: "8px", border: "1px solid #000", fontSize: "14px" }}>Interpretation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {riskLevels.map((level, index) => (
                          <tr key={index}>
                            <td style={{ textAlign: "center", color: level.color, border: "1px solid #000", padding: "8px", fontSize: "13px" }}>
                              {level.range}
                            </td>
                            <td style={{ textAlign: "center", backgroundColor: level.color, color: "#000", border: "1px solid #000", padding: "8px", fontSize: "13px" }}>
                              {level.risk}
                            </td>
                            <td style={{ border: "1px solid #000", padding: "8px", fontSize: "13px" }}>
                              {level.interpretation}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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

  else if (screenNumber === 13) {
    return (
      <>
        {loading ? <Loader /> : null}
        <Modal open={true} onClose={handleClose}>
          <div className="review-modal-container">
            <div
              className={exp ? "export-modal-content" : "review-modal-content"}
            >
              <div className="review-modal-header">
                <Typography variant="h5">
                  {exp
                    ? "Export Report"
                    : module === "cmv"
                      ? "HSE CMV Report"
                      : "Saved Report"}
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
                      <div className="sub-headings">CONCLUSION</div>
                      <JoditEditor
                        // ref={editor}
                        ref={conclusionEditor}
                        placeholder="Enter your text here"
                        value={conclusion}
                        config={config}
                        tabIndex={1}
                        onBlur={(newContent) => setConclusion(newContent)} // This updates backgroundBrief on blur
                        onChange={(newContent) => { debouncedSetConclusion(newContent) }} // Updates state on every change
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
                  selectedOrganization={selectedOrganization}
                  selectedSite={selectedSite}
                  backgroundBrief={backgroundBrief}
                  contents={contents}
                  exeSummary={exeSummary}
                  criticalObservations={criticalObservations}
                  selectedObservations={selectedObservations}
                  selectedArea={selectedArea}
                  selectedCategory={selectedCategory}
                  recommendations={recommendations}
                  conclusion={conclusion}
                  selectedDateTime={selectedDateTime.split("T")[0]}
                  imageUrlsByRow={imageUrlsByRow}
                  reportType="HSE"
                  isSaved={exp ? true : isSaved}
                  chartImage={chartImage}
                  otherDetails={otherDetails}
                  ReportUID={selectedReportData.report_id}
                  startDate={new Date(startDate)}
                  endDate={new Date(endDate)}
                  bestPractice={bestPractice}
                  theWayForward={theWayForward}
                  name={name}
                  facilityInfo={facilityInfo}
                  introduction={introduction}
                  timeFrom={timeFrom}
timeTo={timeTo}
briefPropertyDescription={briefPropertyDescription}
numOfFloors={numOfFloors}
avgStaffFootfall={avgStaffFootfall}
noObjectionCertificate={noObjectionCertificate}
nationalBuildingCodeCategory={nationalBuildingCodeCategory}
coordinationgPersonClientside={coordinationgPersonClientside}
reportPreparedBy={reportPreparedBy}
reportReviewedBy={reportReviewedBy}
classificationOfAuditObservations={classificationOfAuditObservations}
auditScoreAnalysis={auditScoreAnalysis}
improvementOpportunityAreas={improvementOpportunityAreas}
overallAssessmentIndicator ={overallAssessmentIndicator}
references={references}
                />
                <ExportExcel
                  selectedOrganization={selectedOrganization}
                  selectedSite={selectedSite}
                  backgroundBrief={backgroundBrief}
                  contents={contents}
                  exeSummary={exeSummary}
                  criticalObservations={criticalObservations}
                  selectedObservations={selectedObservations}
                  selectedArea={selectedArea}
                  selectedCategory={selectedCategory}
                  recommendations={recommendations}
                  conclusion={conclusion}
                  selectedDateTime={selectedDateTime.split("T")[0]}
                  imageUrlsByRow={imageUrlsByRow}
                  isSaved={exp ? true : isSaved}
                  reportType="HSE"
                  otherDetails={otherDetails}
                  ReportUID={selectedReportData.report_id}
                  bestPractice={bestPractice}
                  theWayForward={theWayForward}
                  facilityInfo={facilityInfo}
                  timeFrom={timeFrom}
                startDate={new Date(startDate)}
                  endDate={new Date(endDate)}
                  name={name}
timeTo={timeTo}
briefPropertyDescription={briefPropertyDescription}
numOfFloors={numOfFloors}
avgStaffFootfall={avgStaffFootfall}
noObjectionCertificate={noObjectionCertificate}
nationalBuildingCodeCategory={nationalBuildingCodeCategory}
coordinationgPersonClientside={coordinationgPersonClientside}
reportPreparedBy={reportPreparedBy}
reportReviewedBy={reportReviewedBy}
classificationOfAuditObservations={classificationOfAuditObservations}
auditScoreAnalysis={auditScoreAnalysis}
improvementOpportunityAreas={improvementOpportunityAreas}
overallAssessmentIndicator ={overallAssessmentIndicator}
references={references}
                />
                <ExportWordDoc
                  selectedOrganization={selectedOrganization}
                  selectedSite={selectedSite}
                  backgroundBrief={backgroundBrief}
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
                  otherDetails={otherDetails}
                  reportType="HSE"
                  chartImage={chartImage}
                  ReportUID={selectedReportData.report_id}
                  bestPractice={bestPractice}
                  theWayForward={theWayForward}
                  startDate={new Date(startDate)}
                  endDate={new Date(endDate)}
                  name={name}
                  facilityInfo={facilityInfo}
                  introduction={introduction}

timeFrom={timeFrom}
timeTo={timeTo}
briefPropertyDescription={briefPropertyDescription}
numOfFloors={numOfFloors}
avgStaffFootfall={avgStaffFootfall}
noObjectionCertificate={noObjectionCertificate}
nationalBuildingCodeCategory={nationalBuildingCodeCategory}
coordinationgPersonClientside={coordinationgPersonClientside}
reportPreparedBy={reportPreparedBy}
reportReviewedBy={reportReviewedBy}
classificationOfAuditObservations={classificationOfAuditObservations}
auditScoreAnalysis={auditScoreAnalysis}
improvementOpportunityAreas={improvementOpportunityAreas}
overallAssessmentIndicator ={overallAssessmentIndicator}
references={references}
                />
              </div>
            </div>
          </div>
        </Modal>
      </>
    );
  }


  // if (screenNumber === 1) {
  //   return (
  //     <div>
  //       {loading ? <Loader /> : null}
  //       <Modal open={true} onClose={handleClose}>
  //         <div className="modal-container">
  //           <div className="modal-header">
  //             <Typography variant="h5">
  //               {module === "cmv" ? " HSE CMV Report" : "Saved Report"}
  //             </Typography>
  //             <button className="custom-close-button" onClick={handleClose}>
  //               &#10005; {/* Unicode for 'X' */}
  //             </button>
  //           </div>
  //           <div className="modal-content">
  //             <div className="modal-body">
  //               <div className="report-id">

  //                 Report ID: {`${selectedReportData.report_id}`}
  //               </div>
  //               <Typography variant="body1" component="div">
  //                 <div className="select-container">
  //                   <CreatableSelect
  //                     placeholder="Organization"
  //                     options={orgList.map((e) => ({
  //                       label: e.org_name,
  //                       value: e.id,
  //                     }))}
  //                     onChange={handleOrganizationSelection}
  //                     value={selectedOrganization}
  //                     isSearchable
  //                     isClearable
  //                     isDisabled
  //                   />
  //                   <CreatableSelect
  //                     placeholder="Site"
  //                     options={siteOptions}
  //                     onChange={handleSiteSelection}
  //                     value={selectedSite}
  //                     isSearchable
  //                     isClearable
  //                     // isDisabled={!selectedOrganization}
  //                     isDisabled
  //                   />

  //                 </div>
  //                 <div className="flex-container-start-end-date">
  //                   <div className="to-date-from-date">
  //                     <DatePicker
  //                       selected={new Date(startDate)}
  //                       onChange={(e) => handleStartEndDate(e, "start-date")}
  //                       className="class-for-date-pickers"
  //                       placeholderText="Audit Start Date"
  //                       dateFormat="dd-MM-yyyy"
  //                       utcOffset={0}
  //                       maxDate={new Date(endDate)}
  //                       todayButton={"Today"}
  //                     />
  //                   </div>
  //                   <div className="to-date-from-date">
  //                     <DatePicker
  //                       selected={new Date(endDate)}
  //                       onChange={(e) => handleStartEndDate(e, "end-date")}
  //                       className="class-for-date-pickers"
  //                       placeholderText="Audit End Date"
  //                       dateFormat="dd-MM-yyyy"
  //                       utcOffset={0}
  //                       minDate={new Date(startDate)}
  //                       todayButton={"Today"}
  //                     />
  //                   </div>
  //                 </div>
  //                 {/* from and to time */}
  //                 <div className="flex-container-start-end-date">
  //                   <div className="to-date-from-date">
  //                     <label>Time of Audit From:</label>
  //                     <input
  //                       type="time"
  //                       value={timeFrom}
  //                       onChange={(e) => setTimeFrom(e.target.value)}
  //                       className="class-for-time-pickers"
  //                     />

  //                   </div>
  //                   <div className="to-date-from-date">
  //                     <label>Time of Audit To:</label>
  //                     <input
  //                       type="time"
  //                       value={timeTo}
  //                       onChange={(e) => setTimeTo(e.target.value)}
  //                       className="class-for-time-pickers"
  //                     />
  //                   </div>
  //                 </div>
  //                 {/* brief property Descriptionand  Number of Floors  */}

  //                 <div className="select-container " style={{ marginTop: "10px" }}>
  //                   {/* Brief Property Description */}
  //                   <input
  //                     type="text"
  //                     placeholder="Brief Property Description"
  //                     value={briefPropertyDescription}
  //                     onChange={(e) => setBriefPropertyDescription(e.target.value)}
  //                     className="class-for-selects" // reuse your select input styles if needed
  //                   />

  //                   {/* Number of Floors */}
  //                   <input
  //                     type="text"
  //                     placeholder="Number of Floors"
  //                     value={numOfFloors}
  //                     onChange={(e) => setNumOfFloors(e.target.value)}
  //                     className="class-for-selects" // reuse same CSS for consistent layout
  //                   />
  //                 </div>
  //                 {/* average staff footfall and num of objection certificate */}
  //                 <div className="select-container " style={{ marginTop: "10px" }}>
  //                   <input
  //                     type="text"
  //                     placeholder="Average Staff Footfall "
  //                     value={avgStaffFootfall}
  //                     onChange={(e) => setAvgStaffFootfall(e.target.value)}
  //                     className="class-for-selects"
  //                   />
  //                   <input
  //                     type="text"
  //                     placeholder="No Objection Certificate: "
  //                     value={noObjectionCertificate}
  //                     onChange={(e) => setNoObjectionCertificate(e.target.value)}
  //                     className="class-for-selects"
  //                   />
  //                 </div>
  //                 {/* national building code and coordinationg person div  */}
  //                 <div className="select-container " style={{ marginTop: "10px" }}>
  //                   <input
  //                     type="text"
  //                     placeholder="National Building Code Category "
  //                     value={nationalBuildingCodeCategory}
  //                     onChange={(e) => setNationalBuildingCodeCategory(e.target.value)}
  //                     className="class-for-selects"
  //                   />
  //                   <input
  //                     type="text"
  //                     placeholder="Coordinating Person – Client Side "
  //                     value={coordinationgPersonClientside}
  //                     onChange={(e) => setCoordinationgPersonClientside(e.target.value)}
  //                     className="class-for-selects"
  //                   />
  //                 </div>

  //                 {/* reported prepared by, reviewd by */}
  //                 <div className="select-container " style={{ marginTop: "10px" }}>
  //                   <input
  //                     type="text"
  //                     placeholder="Report Prepared By "
  //                     value={reportPreparedBy}
  //                     onChange={(e) => setReportPreparedBy(e.target.value)}
  //                     className="class-for-selects"
  //                   />
  //                   <input
  //                     type="text"
  //                     placeholder="Report Reviewed By "
  //                     value={reportReviewedBy}
  //                     onChange={(e) => setReportReviewedBy(e.target.value)}
  //                     className="class-for-selects"
  //                   />
  //                 </div>










  //                 {/* <div style={{ gap: "10px" }} className="flex-container">
  //                   <Select
  //                     className="select"
  //                     placeholder="Sector"
  //                     options={sectors()}
  //                     onChange={(e) => handleChangeSector(e)}
  //                     // isMulti={true}
  //                     value={selectedSector}
  //                     isClearable
  //                     defaultValue={selectedSector}
  //                   />
  //                   <Select
  //                     className="select"
  //                     placeholder="Parameter"
  //                     options={paramsOption()}
  //                     onChange={(e) => handleChangeParam(e)}
  //                     // isMulti={true}
  //                     value={selectedParam}
  //                     isClearable
  //                     isMulti
  //                     styles={{
  //                       control: (provided) => ({
  //                         ...provided,
  //                         maxHeight: '80px',  // Limit height of selected values
  //                         overflowY: 'auto',  // Enable scrolling
  //                         display: 'flex',
  //                         flexWrap: 'wrap',
  //                       }),
  //                       valueContainer: (provided) => ({
  //                         ...provided,
  //                         maxHeight: '80px',  // Keep value container from expanding
  //                         overflowY: 'auto',  // Add scrollbar when needed
  //                       }),
  //                     }}
  //                   />
  //                   <Select
  //                     className="select"
  //                     placeholder="Area"
  //                     options={areaList.map((area) => ({
  //                       label: area,
  //                       value: area,
  //                     }))}
  //                     onChange={(e) => handleChangeArea(e)}
  //                     isMulti={true}
                 
  //                        value={selectedArea.map((area) => ({
  //                       label: area,
  //                       value: area,
  //                     }))}
  //                     styles={{
  //                       control: (provided) => ({
  //                         ...provided,
  //                         maxHeight: '80px',  // Limit height of selected values
  //                         overflowY: 'auto',  // Enable scrolling
  //                         display: 'flex',
  //                         flexWrap: 'wrap',
  //                       }),
  //                       valueContainer: (provided) => ({
  //                         ...provided,
  //                         maxHeight: '80px',  // Keep value container from expanding
  //                         overflowY: 'auto',  // Add scrollbar when needed
  //                       }),
  //                     }}
  //                   />
  //                 </div> */}
  //               </Typography>
  //               <div className="observation-and-global-search">
  //                 <div className="observations-container">
  //                   {/* <div
  //                     style={{
  //                       display: "flex",
  //                       justifyContent: "space-between",
  //                     }}
  //                   >
  //                     <input
  //                       type="text"
  //                       placeholder="Search Observations"
  //                       value={searchTerm}
  //                       onChange={(e) => setSearchTerm(e.target.value)}
  //                       className="search-input"
  //                     />
  //                     <div>
  //                       <button
  //                         onClick={handleOpenDrawer}
  //                         className="search-bar-button"
  //                       >
  //                         <span className="search-icon">&#128269;</span>{" "}
                         
  //                         <span className="search-text">
  //                           All Observations
  //                         </span>
  //                       </button>

  //                       <ObservationsDrawer
  //                         isOpen={isDrawerOpen}
  //                         onClose={handleCloseDrawer}
  //                         groupedData={groupedData}
  //                         globalSearchTerm={globalSearchTerm}
  //                         setGlobalSearchTerm={setGlobalSearchTerm}
  //                       />
  //                     </div>
  //                   </div> */}

  //                   {(AllObservations?.length ?? 0) > 0 && (selectedArea?.length ?? 0) > 0 ? (
  //                     <div className="ao-observations-list">
  //                       {Object.entries(groupedByTableType || {}).map(([table_type, areas]) => (
  //                         <div key={table_type} className="table-group">
  //                           <h4>
  //                             Parameter : <u>{table_type}</u>
  //                           </h4>

  //                           {Object.entries(areas || {}).map(([area, observationsInArea], index) => (
  //                             <Accordion
  //                               key={`${table_type}-${area}`}
  //                               expanded={expanded === `${table_type}-${area}`}
  //                               onChange={handleChangeAccordion(`${table_type}-${area}`)}
  //                             >
  //                               <AccordionSummary
  //                                 expandIcon={<ExpandMoreIcon />}
  //                                 aria-controls={`ao-${index}-content`}
  //                                 id={`ao-${index}-header`}
  //                               >
  //                                 <Typography component="span" sx={{ width: "33%", flexShrink: 0 }}>
  //                                   Area: {area}
  //                                 </Typography>
  //                                 <Typography component="span" sx={{ color: "text.secondary" }}>
  //                                   {(observationsInArea || []).filter((obs) => obs.is_selected === 1).length} out of{" "}
  //                                   {(observationsInArea || []).length} observations selected
  //                                 </Typography>
  //                               </AccordionSummary>

  //                               <AccordionDetails>
  //                                 {(observationsInArea || []).map((observation, obsIndex) => (
  //                                   <div key={obsIndex} className="observation-item-checkbox">
  //                                     <input
  //                                       type="checkbox"
  //                                       checked={observation.is_selected === 1}
  //                                       onChange={() =>
  //                                         handleObservationSelection(
  //                                           observation,
  //                                           (AllObservations || []).indexOf(observation)
  //                                         )
  //                                       }
  //                                     />
  //                                     <span>
  //                                       {observation.observation} 
  //                                       {/* (<span style={{ fontWeight: "bold" }}>{observation.category}</span>) */}
  //                                     </span>
  //                                     {observation.isNote && <span className="note-label">(Note)</span>}
  //                                   </div>
  //                                 ))}
  //                               </AccordionDetails>
  //                             </Accordion>
  //                           ))}
  //                         </div>
  //                       ))}
  //                     </div>
  //                   ) : (
  //                     <div className="no-observations">No observations available.</div>
  //                   )}


  //                 </div>
  //               </div>
  //               <div className="get-recommendations-container">
  //                 <button
  //                   className="button-styles"
  //                   onClick={handleProceed}
  //                   disabled={
  //                     // selectedObservations.length === 0 ||
  //                     !selectedOrganization ||
  //                     !selectedSite ||
  //                     !startDate ||
  //                     !endDate
  //                   }
  //                   style={{
  //                     background:
  //                       // selectedObservations.length === 0 ||
  //                       !selectedOrganization ||
  //                         !selectedSite ||
  //                         !startDate ||
  //                         !endDate
  //                         ? "lightgrey"
  //                         : "#efc71d",
  //                   }}
  //                 >
  //                   Proceed
  //                 </button>
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //       </Modal>
  //       {/* {showConfirmationModal && (
  //         <ConfirmationModal
  //           setShowConfirmationModal={setShowConfirmationModal}
  //           handleCloseWithoutSaving={handleCloseWithoutSaving}
  //         />
  //       )} */}
  //     </div>
  //   );
  // } else if (screenNumber === 2) {
  //   return (
  //     <div>
  //       {loading ? <Loader /> : null}
  //       <Modal open={true} onClose={handleClose}>
  //         <div className="review-modal-container">
  //           <div className="review-modal-content">
  //             <div className="review-modal-header">
  //               <Typography variant="h5">
  //                 {module === "cmv" ? " HSE CMV Report" : "Saved Report"}
  //               </Typography>
  //               <button className="custom-close-button" onClick={handleClose}>
  //                 &#10005; {/* Unicode for 'X' */}
  //               </button>
  //             </div>
  //             <div className="review-modal-body" style={{ overflowY: "auto" }}>
  //               <Typography variant="body1" component="div">
  //                 <div>
  //                   <div className="sub-headings">
  //                     AUDIT OBJECTIVE
  //                   </div>
  //                   <JoditEditor
  //                     ref={editor}
  //                     placeholder="Enter your text here"
  //                     value={backgroundBrief}
  //                     config={config}
  //                     tabIndex={1}
  //                     onBlur={(newContent) => setBackgroundBrief(newContent)} // This updates backgroundBrief on blur

  //                   />
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
  //                 className="button-styles"
  //                 onClick={handlePrev}
  //                 style={{ background: "#efc71d" }}
  //               >
  //                 &#171; Prev
  //               </button>
  //               <button
  //                 className="button-styles"
  //                 color="primary"
  //                 onClick={() => handleNext()}
  //                 style={{ background: "#efc71d" }}
  //               >
  //                 Next &#187;
  //               </button>
  //             </div>
  //           </div>
  //         </div>
  //       </Modal>
  //       {/* {showConfirmationModal && (
  //         <ConfirmationModal
  //           setShowConfirmationModal={setShowConfirmationModal}
  //           handleCloseWithoutSaving={handleCloseWithoutSaving}
  //         />
  //       )} */}
  //     </div>
  //   );
  // } else if (screenNumber === 3) {
  //   return (
  //     <>
  //       {loading ? <Loader /> : null}
  //       <Modal open={true} onClose={handleClose}>
  //         <div className="review-modal-container">
  //           <div className="review-modal-content">
  //             <div className="review-modal-header">
  //               <Typography variant="h5">
  //                 {module === "cmv" ? " HSE CMV Report" : "Saved Report"}
  //               </Typography>
  //               <button className="custom-close-button" onClick={handleClose}>
  //                 &#10005; {/* Unicode for 'X' */}
  //               </button>
  //             </div>
  //             <div className="review-modal-body" style={{ overflowY: "auto" }}>
  //               <Typography variant="body1" component="div">
  //                 <div>
  //                   <div className="sub-headings">
  //                     UNDERSTANDING OF THE REVIEW REPORT &#8208; CONTENTS.
  //                   </div>
  //                   <JoditEditor
  //                     // ref={editor}
  //                     ref={contentEditor}
  //                     placeholder="Enter your text here"
  //                     value={contents}
  //                     config={config}
  //                     tabIndex={1}
  //                     onBlur={(newContent) => setContents(newContent)} // still update on blur
  //                   />
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
  //                 className="button-styles"
  //                 onClick={handlePrev}
  //                 style={{ background: "#efc71d" }}
  //               >
  //                 &#171; Prev
  //               </button>
  //               <button
  //                 className="button-styles"
  //                 color="primary"
  //                 onClick={handleNext}
  //                 style={{ background: "#efc71d" }}
  //               >
  //                 Next &#187;
  //               </button>
  //             </div>
  //           </div>
  //         </div>
  //       </Modal>
  //       {/* {showConfirmationModal && (
  //         <ConfirmationModal
  //           setShowConfirmationModal={setShowConfirmationModal}
  //           handleCloseWithoutSaving={handleCloseWithoutSaving}
  //         />
  //       )} */}
  //     </>
  //   );
  // } else if (screenNumber === 4) {
  //   return (
  //     <>
  //       <Modal open={true} onClose={handleClose}>
  //         <div className="review-modal-container">
  //           <div className="review-modal-content">
  //             <div className="review-modal-header">
  //               <Typography variant="h5">Saved Report</Typography>
  //               <button className="custom-close-button" onClick={handleClose}>
  //                 &#10005; {/* Unicode for 'X' */}
  //               </button>
  //             </div>
  //             <div className="review-modal-body" style={{ overflowY: "auto" }}>
  //               <Typography variant="body1" component="div">
  //                 <div>
  //                   <div className="sub-headings">INTRODUCTION</div>
  //                   <JoditEditor
  //                     // ref={editor}
  //                     ref={introductionEditor}
  //                     placeholder="Enter your text here"
  //                     value={introduction}
  //                     config={config}
  //                     tabIndex={1}
  //                     onBlur={(newContent) => setIntroduction(newContent)} // still update on blur
  //                   />
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
  //                 className="button-styles"
  //                 onClick={handlePrev}
  //                 style={{ background: "#efc71d" }}
  //               >
  //                 &#171; Prev
  //               </button>
  //               <button
  //                 className="button-styles"
  //                 color="primary"
  //                 onClick={handleNext}
  //                 style={{ background: "#efc71d" }}
  //               >
  //                 Next &#187;
  //               </button>
  //             </div>
  //           </div>
  //         </div>
  //       </Modal>
  //     </>
  //   );
  // } else if (screenNumber === 5) {
  //   return (
  //     <>
  //       {loading ? <Loader /> : null}
  //       <Modal open={true} onClose={handleClose}>
  //         <div className="review-modal-container">
  //           <div className="review-modal-content">
  //             <div className="review-modal-header">
  //               <Typography variant="h5">
  //                 {module === "cmv" ? " HSE CMV Report" : "Saved Report"}
  //               </Typography>
  //               <button className="custom-close-button" onClick={handleClose}>
  //                 &#10005; {/* Unicode for 'X' */}
  //               </button>
  //             </div>
  //             <div className="review-modal-body" style={{ overflowY: "auto" }}>
  //               <Typography variant="body1" component="div">
  //                 <div>
  //                   <div className="sub-headings">EXECUTIVE SUMMARY</div>
  //                   <br />
  //                   <JoditEditor
  //                     // ref={editor}
  //                     ref={exeSummaryEditor}
  //                     placeholder="Enter your text here"
  //                     value={exeSummary}
  //                     config={config}

  //                     tabIndex={1}
  //                     onBlur={(newContent) => setExeSummary(newContent)} // This updates backgroundBrief on blur
  //                   />
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
  //                 className="button-styles"
  //                 onClick={handlePrev}
  //                 style={{ background: "#efc71d" }}
  //               >
  //                 &#171; Prev
  //               </button>
  //               <button
  //                 className="button-styles"
  //                 color="primary"
  //                 onClick={handleNext}
  //                 style={{ background: "#efc71d" }}
  //               >
  //                 Next &#187;
  //               </button>
  //             </div>
  //           </div>
  //         </div>
  //       </Modal>
  //       {/* {showConfirmationModal && (
  //         <ConfirmationModal
  //           setShowConfirmationModal={setShowConfirmationModal}
  //           handleCloseWithoutSaving={handleCloseWithoutSaving}
  //         />
  //       )} */}
  //     </>
  //   );
  // } else if (screenNumber === 6) {
  //   return (
  //     <Modal open={true} onClose={handleClose}>
  //       <div className="review-modal-container">
  //         <div className="review-modal-content">
  //           <div className="review-modal-header">
  //             <Typography variant="h5">Saved Report</Typography>
  //             <button className="custom-close-button" onClick={handleClose}>
  //               &#10005; {/* Unicode for 'X' */}
  //             </button>
  //           </div>
  //           <div className="review-modal-body" style={{ overflowY: "auto" }}>
  //             <Typography variant="body1" component="div">
  //               <div className="sub-headings">ACADEMIC INFORMATION</div>
  //               <br />
  //               <TableContainer component={Paper}>
  //                 <Table>
  //                   <TableHead>
  //                     <TableRow>
  //                       <TableCell>FACILITY INFORMATION</TableCell>
  //                       <TableCell>COMMENTS & NOTES</TableCell>
  //                     </TableRow>
  //                   </TableHead>
  //                   <TableBody>
  //                     {facilityInfo &&
  //                       Object.entries(facilityInfo).map(
  //                         ([key, value], index) => (
  //                           <TableRow key={index}>
  //                             <TableCell>{key}:</TableCell>
  //                             <TableCell style={{ display: "flex" }}>
  //                               {/* <textarea
  //                                */}
  //                               <TextField
  //                                 value={value}
  //                                 onChange={(e) =>
  //                                   handleChangeFacilityInfo({
  //                                     target: {
  //                                       name: key,
  //                                       value: e.target.value,
  //                                     },
  //                                   })
  //                                 }
  //                                 placeholder="Enter your text here"
  //                                 style={{ width: "100%", minHeight: "80px" }}
  //                               />
  //                               <IconButton
  //                                 onClick={() => handleRemoveField(key)}
  //                                 style={{ color: "red", marginLeft: "10px" }}
  //                                 aria-label="delete"
  //                               >
  //                                 <DeleteIcon />
  //                               </IconButton>
  //                             </TableCell>
  //                           </TableRow>
  //                         )
  //                       )}

  //                     <TableRow>
  //                       <TableCell>
  //                         <TextField
  //                           label="New Field Name"
  //                           value={newKey}
  //                           onChange={handleNewKeyChange}
  //                           variant="outlined"
  //                           style={{ width: "100%" }}
  //                         />
  //                       </TableCell>
  //                       <TableCell>
  //                         <div
  //                           style={{ display: "flex", alignItems: "center" }}
  //                         >
  //                           <TextField
  //                             value={newValue}
  //                             onChange={(e) =>
  //                               handleNewValueChange({
  //                                 target: { value: e.target.value },
  //                               })
  //                             }
  //                             placeholder="Enter your text here"
  //                             style={{ width: "100%", minHeight: "80px" }}
  //                           />
  //                           <button
  //                             onClick={handleAddNewField}
  //                             className="button-styles"
  //                             style={{
  //                               background: "#efc71d",
  //                               marginLeft: "10px",
  //                             }}
  //                           >
  //                             Add
  //                           </button>
  //                         </div>
  //                       </TableCell>

  //                     </TableRow>
  //                   </TableBody>
  //                 </Table>
  //               </TableContainer>
  //             </Typography>
  //           </div>
  //           <hr />
  //           <div className="review-modal-footer">
  //             <button
  //               className="button-styles"
  //               onClick={handleSave}
  //               style={{ background: "#efc71d" }}
  //             >
  //               Save
  //             </button>
  //             <button
  //               className="button-styles"
  //               onClick={handlePrev}
  //               style={{ background: "#efc71d" }}
  //             >
  //               &#171; Prev
  //             </button>
  //             <button
  //               className="button-styles"
  //               color="primary"
  //               onClick={handleNext}
  //               style={{ background: "#efc71d" }}
  //             >
  //               Next &#187;
  //             </button>
  //           </div>
  //         </div>
  //       </div>
  //     </Modal>
  //   );
  // } else if (screenNumber === 7) {
  //   return (
  //     <>
  //       {loading ? <Loader /> : null}
  //       <Modal open={true} onClose={handleClose}>
  //         <div className="review-modal-container">
  //           <div className="review-modal-content">
  //             <div className="review-modal-header">
  //               <Typography variant="h5">
  //                 {module === "cmv" ? " HSE CMV Report" : "Saved Report"}
  //               </Typography>
  //               <button className="custom-close-button" onClick={handleClose}>
  //                 &#10005; {/* Unicode for 'X' */}
  //               </button>
  //             </div>
  //             <div className="review-modal-body" style={{ overflowY: "auto" }}>
  //               <Typography variant="body1" component="div">
  //                 <div>
  //                   <div className="sub-headings">CRITICAL OBSERVATIONS</div>
  //                   <br />
  //                   <div className="critical-observations-div">
  //                     {criticalObservations.length === 0 ? (
  //                       <div className="no-observations">
  //                         <em>No critical observations</em>
  //                       </div>
  //                     ) : (
  //                       criticalObservations.map((observation, index) => (
  //                         <div key={index} className="observation-item">
  //                           <textarea
  //                             onChange={(e) => handleObservationEdit(index, e)}
  //                             style={{ width: "100%", fontFamily: "inherit" }}
  //                             value={observation.observation}
  //                           />
  //                           &nbsp;
  //                           <CancelIcon
  //                             onClick={() => removeItem(index)}
  //                             className="cancel-icon"
  //                           >
  //                             &#10005;
  //                           </CancelIcon>
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
  //                 className="button-styles"
  //                 onClick={handlePrev}
  //                 disabled={disableSaveNext}
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
  //       {/* {showConfirmationModal && (
  //         <ConfirmationModal
  //           setShowConfirmationModal={setShowConfirmationModal}
  //           handleCloseWithoutSaving={handleCloseWithoutSaving}
  //         />
  //       )} */}
  //     </>
  //   );
  // } else if (screenNumber === 8) {
  //   return (
  //     <>
  //       <VariantsModal
  //         data={observationVariants}
  //         open={openVairantModal}
  //         handleClose={closeVariantModal}
  //         handleConfirmSelection={handleConfirmSelection}
  //       />
  //       <ImageViewerModal
  //         imageUrl={selectedImage}
  //         onClose={() => setSelectedImage(null)}
  //       />
  //       <Modal open={true} onClose={handleClose}>
  //         <div className="review-modal-container">
  //           <div className="review-modal-content">
  //             <div className="review-modal-header">
  //               <Typography variant="h5">Saved Report</Typography>
  //               <button className="custom-close-button" onClick={handleClose}>
  //                 &#10005; {/* Unicode for 'X' */}
  //               </button>
  //             </div>
  //             <div style={{ fontWeight: "600" }} className="sub-headings">
  //               CRITICAL HSE OBSERVATIONS, PHOTOS & RECOMMENDATIONS
  //             </div>
  //             <div
  //               style={{ overflowY: "scroll" }}
  //               className="review-modal-body"
  //             >
  //                                                <div>
  //                   {tableTypes.length > 0 && (
  //                    <CreatableSelect
  //                   placeholder="Select or type table type..."
  //                   value={selectedTableType}
  //                   onChange={handleTableTypeChange}
  //                   options={tableTypes.map((type) => ({ label: type, value: type }))}
  //                   isClearable
  //                   isMulti
  //                   formatCreateLabel={(inputValue) => `+ Create "${inputValue}"`}
  //                 />
                
  //                   )}
  //                 </div>
  //               <div className="table-container">
  //                 {Object.keys(safeGroupedObservations).map((tableType) => (
  //                   <div key={tableType}>
  //                     <Typography style={{ fontWeight: "500" }} gutterBottom>
  //                       {tableType}
  //                     </Typography>
  //                     <TableContainer
  //                       component={Paper}
  //                       className="table-scroll"
  //                     >
  //                       <Table>
  //                         <TableHead>
  //                           <TableRow>
  //                             <TableCell>Sr. No.</TableCell>
  //                             <TableCell>Areas</TableCell>
  //                             <TableCell>Check Point</TableCell>
  //                             <TableCell>Observation</TableCell>
  //                             <TableCell>Criticality</TableCell>
  //                             <TableCell>Recommendation</TableCell>
  //                             <TableCell>IS Reference</TableCell>
  //                             <TableCell>Score</TableCell>
  //                             <TableCell>System Implementation</TableCell>
  //                             <TableCell>Compliance Check</TableCell>
  //                             <TableCell>Photo Evidences</TableCell>
  //                             <TableCell>Actions</TableCell>
  //                           </TableRow>
  //                         </TableHead>
  //                         <TableBody>
  //                           {safeGroupedObservations[tableType].map(
  //                             (observation, index) => (
  //                               <TableRow
  //                                 key={`${observation.table_type}-${observation.area
  //                                   }-${observation.sr_no || observation.id}`}
  //                                 className={(() => {
  //                                   const foundObservation = selectedObservations.find(
  //                                     (obs) =>
  //                                       obs.table_type === observation.table_type &&
  //                                       obs.area === observation.area &&
  //                                       (obs.sr_no === observation.sr_no || obs.id === observation.id)
  //                                   );

  //                                   // If editing, make all other rows 'odd-row' except the one being edited
  //                                   if (isEditing && foundObservation) {
  //                                     // Check if the current row is being edited
  //                                     if (
  //                                       currentEditedRow === foundObservation.sr_no ||
  //                                       currentEditedRow === foundObservation.id
  //                                     ) {
  //                                       return "even-row"; // Keep the current editing row as even
  //                                     } else {
  //                                       return "odd-row"; // All other rows become odd
  //                                     }
  //                                   }

  //                                   // Default: all rows are even when not editing
  //                                   return "even-row";
  //                                 })()}


  //                                 style={
  //                                   observation.variant === true
  //                                     ? { backgroundColor: "#f2f2f2" }
  //                                     : {}
  //                                 }
  //                               >
  //                                 <TableCell>{index + 1}</TableCell>
  //                                 {/* area */}
  //                                 <TableCell
  //                                   className="editable-cell"
  //                                   style={{ height: "100px" }}
  //                                 >
  //                                   <div
  //                                     className="cell-content"
  //                                     style={{
  //                                       color:
  //                                         isEditing &&
  //                                           currentEditedRow !==
  //                                           observation.sr_no

  //                                           ? "grey"
  //                                           : "black",
  //                                     }}
  //                                   >
  //                                     <CreatableSelect
  //                                       styles={customSelectStylesCreatable}
  //                                       placeholder="Area"
  //                                       // options={areaOptions()}
  //                                       options={areaList.map((area) => ({ label: area, value: area }))}
  //                                       defaultValue={{
  //                                         label: observation.area,
  //                                         value: observation.area,
  //                                       }}
  //                                       isSearchable
  //                                       onChange={(e) =>
  //                                         handleCellEdit(
  //                                           e,
  //                                           index,
  //                                           "area",
  //                                           observation.area,
  //                                           observation
  //                                         )
  //                                       }
  //                                       isDisabled={
  //                                         isEditing &&
  //                                         currentEditedRow !==
  //                                         observation.sr_no


  //                                       }
  //                                     />
  //                                   </div>
  //                                   {!observation.variant && (
  //                                     <EditOutlinedIcon
  //                                       className="edit-icon"
  //                                       fontSize="small"
  //                                     />
  //                                   )}
  //                                 </TableCell>
  //                                 {/* checkpoints */}
  //                                 <TableCell
  //                                   className="editable-cell"
  //                                   style={{ height: "100px" }}
  //                                 >
  //                                   <div
  //                                     className="cell-content"
  //                                     style={{

  //                                       marginRight: "10px"
  //                                     }}
  //                                   >

  //                                     <TextField
  //                                       id={`outlined-textarea-${index}`}
  //                                       value={observation.check_points}

  //                                       onChange={(e) => {
  //                                         const newValue = e.target.value;

  //                                         const proceed = handleCellEdit(
  //                                           { ...e, target: { ...e.target, textContent: newValue } },
  //                                           index,
  //                                           "check_points",
  //                                           observation.check_points,
  //                                           { ...observation, check_points: newValue }
  //                                         );

  //                                         if (!proceed) return;

  //                                         if (newValue !== observation.check_points) {
  //                                           setSelectedObservations((prev) => {
  //                                             return prev.map((obs) =>
  //                                               (obs.sr_no || obs.id) === (observation.sr_no || observation.id)
  //                                                 ? { ...obs, check_points: newValue }
  //                                                 : obs
  //                                             );
  //                                           });

  //                                         }
  //                                       }}


  //                                       onBlur={(e) => {
  //                                         handleCellEdit(e, index, "check_points", observation.check_points, observation);
  //                                       }}
  //                                       sx={{ width: "200px" }}
  //                                       InputProps={{
  //                                         sx: { fontSize: "10px" },
  //                                         disabled: currentEditedRow !== -1 && currentEditedRow !== observation.sr_no,
  //                                       }}
  //                                       placeholder="Check Point"
  //                                       variant="outlined"
  //                                       size="small"
  //                                       fullWidth
  //                                       multiline
  //                                       minRows={1.5}
  //                                       maxRows={10}
  //                                     />



  //                                   </div>
  //                                   {!observation.variant && (
  //                                     <EditOutlinedIcon
  //                                       onClick={(e) =>
  //                                         isEditing
  //                                           ? handleCellEdit(
  //                                             e,
  //                                             index,
  //                                             "check_points",
  //                                             observation.check_points,
  //                                             observation
  //                                           )
  //                                           : null
  //                                       }
  //                                       className="edit-icon"
  //                                       fontSize="small"
  //                                     />
  //                                   )}
  //                                 </TableCell>
  //                                 {/* observation */}
  //                                 <TableCell className="editable-cell" style={{ height: "100px" }}>
  //                                   <div
  //                                     className="cell-content"
  //                                     style={{
  //                                       //     color:
  //                                       // (isEditing && currentEditedRow !== index) ||
  //                                       //   observation.variant === true
  //                                       //   ? "grey"
  //                                       //   : "black",
  //                                       marginRight: "10px",
  //                                     }}
  //                                   >
  //                                     <TextField
  //                                       id={`outlined-textarea-${index}`}
  //                                       placeholder="Observation"
  //                                       value={
  //                                         observation.observation
  //                                           ? observation.observation.replace(/\s+/g, " ").trim()
  //                                           : ""
  //                                       }
  //                                       onChange={(e) => {
  //                                         const newValue = e.target.value;

  //                                         const proceed = handleCellEdit(
  //                                           { ...e, target: { ...e.target, textContent: newValue } },
  //                                           index,
  //                                           "observation",
  //                                           observation.observation,
  //                                           { ...observation, observation: newValue }
  //                                         );

  //                                         if (!proceed) return;

  //                                         setSelectedObservations((prev) =>
  //                                           prev.map((obs) =>
  //                                             (obs.sr_no || obs.id) === (observation.sr_no || observation.id)
  //                                               ? { ...obs, observation: newValue, hasEdited: true }
  //                                               : obs
  //                                           )
  //                                         );
  //                                       }}
  //                                       onBlur={(e) => {
  //                                         const latestValue = e.target.value;

  //                                         handleCellEdit(
  //                                           { ...e, target: { ...e.target, textContent: latestValue } },
  //                                           index,
  //                                           "observation",
  //                                           observation.observation,
  //                                           { ...observation, observation: latestValue }
  //                                         );
  //                                       }}
  //                                       sx={{ width: "200px" }}
  //                                       InputProps={{
  //                                         sx: { fontSize: "10px" },
  //                                         disabled: currentEditedRow !== -1 && currentEditedRow !== observation.sr_no,
  //                                       }}
  //                                       variant="outlined"
  //                                       size="small"
  //                                       fullWidth
  //                                       multiline
  //                                       minRows={1.5}
  //                                       maxRows={10}
  //                                     />

  //                                     <DialogBox dialog={dialog} handleDialogBox={handleDialogBoxObservation} />
  //                                     {/* Optional: Show dialog if needed */}
  //                                     {/* <DialogBox dialog={dialog} handleDialogBox={handleDialogBoxObservation} /> */}
  //                                   </div>

  //                                   {!observation.variant && (
  //                                     <EditOutlinedIcon
  //                                       onClick={(e) =>
  //                                         isEditing
  //                                           ? handleCellEdit(
  //                                             e,
  //                                             index,
  //                                             "observation",
  //                                             observation.observation,
  //                                             observation
  //                                           )
  //                                           : null
  //                                       }
  //                                       className="edit-icon"
  //                                       fontSize="small"
  //                                     />
  //                                   )}
  //                                 </TableCell>

  //                                 {/* criticality */}

  //                                 <TableCell className="editable-cell" style={{ height: "100px" }}>
  //                                   <Select
  //                                     styles={{
  //                                       ...customSelectStylesCreatable,
  //                                     }}
  //                                     placeholder="Criticality"
  //                                     options={criticalityOptions.length > 0 ? criticalityOptions : []}
  //                                     noOptionsMessage={() => "No options"}
  //                                     value={
  //                                       observation.criticality
  //                                         ? { label: observation.criticality, value: observation.criticality }
  //                                         : null
  //                                     }
  //                                     isSearchable
  //                                     onChange={(selectedOption) => {
  //                                       if (currentEditedRow !== -1 && currentEditedRow !== observation.sr_no) {
  //                                         toast.warning("Please save the current row before editing another.");
  //                                         return;
  //                                       }

  //                                       if (selectedOption) {
  //                                         const newValue = selectedOption.value;

  //                                         // Pass updated observation object with new criticality to handleCellEdit
  //                                         const proceed = handleCellEdit(
  //                                           { value: newValue }, // mimic the select object
  //                                           index,
  //                                           "criticality",
  //                                           observation.criticality,
  //                                           { ...observation, criticality: newValue }
  //                                         );

  //                                         if (!proceed) return;

  //                                         // Update selectedObservations
  //                                         setSelectedObservations((prev) =>
  //                                           prev.map((obs) =>
  //                                             (obs.sr_no || obs.id) === (observation.sr_no || observation.id)
  //                                               ? { ...obs, criticality: newValue, hasEdited: true }
  //                                               : obs
  //                                           )
  //                                         );
  //                                       }
  //                                     }}
  //                                     isDisabled={
  //                                       (isEditing && currentEditedRow !== observation.sr_no) ||
  //                                       observation.variant === true
  //                                     }
  //                                     menuPlacement="auto"
  //                                   />

  //                                   {!observation.variant && (
  //                                     <EditOutlinedIcon
  //                                       className="edit-icon"
  //                                       fontSize="small"
  //                                       onClick={(e) => {
  //                                         e.stopPropagation();
  //                                         if (
  //                                           (isEditing && currentEditedRow !== observation.sr_no) ||
  //                                           observation.variant === true
  //                                         ) {
  //                                           toast.warning(
  //                                             "Please save changes in the currently edited row before editing another row."
  //                                           );
  //                                         }
  //                                       }}
  //                                     />
  //                                   )}
  //                                 </TableCell>

  //                                 {/* recommendations */}
  //                                 <TableCell className="editable-cell">
  //                                   <div
  //                                     className="cell-content"
  //                                     style={{
  //                                       //     color:
  //                                       // (isEditing && currentEditedRow !== index) ||
  //                                       //   observation.variant === true
  //                                       //   ? "grey"
  //                                       //   : "black",
  //                                       marginRight: "10px"
  //                                     }}
  //                                   >

  //                                     <TextField
  //                                       id={`outlined-textarea-${index}`}
  //                                       value={observation.recommendations}
  //                                       placeholder="Recommendations"
  //                                       onChange={(e) => {
  //                                         const newValue = e.target.value;

  //                                         const proceed = handleCellEdit(
  //                                           { ...e, target: { ...e.target, textContent: newValue } },
  //                                           index,
  //                                           "recommendations",
  //                                           observation.recommendations,
  //                                           { ...observation, recommendations: newValue }
  //                                         );

  //                                         if (!proceed) return;

  //                                         setSelectedObservations((prev) =>
  //                                           prev.map((obs) =>
  //                                             (obs.sr_no || obs.id) === (observation.sr_no || observation.id)
  //                                               ? { ...obs, recommendations: newValue, hasEdited: true }
  //                                               : obs
  //                                           )
  //                                         );
  //                                       }}
  //                                       onBlur={(e) => {
  //                                         const latestValue = e.target.value;

  //                                         handleCellEdit(
  //                                           { ...e, target: { ...e.target, textContent: latestValue } },
  //                                           index,
  //                                           "recommendations",
  //                                           observation.recommendations,
  //                                           { ...observation, recommendations: latestValue }
  //                                         );
  //                                       }}
  //                                       sx={{ width: "200px" }}
  //                                       InputProps={{
  //                                         sx: { fontSize: "10px" },
  //                                         disabled: currentEditedRow !== -1 && currentEditedRow !== observation.sr_no,
  //                                       }}
  //                                       variant="outlined"
  //                                       size="small"
  //                                       fullWidth
  //                                       multiline
  //                                       minRows={1.5}
  //                                       maxRows={10}
  //                                     />


  //                                   </div>
  //                                   {!observation.variant && (
  //                                     <EditOutlinedIcon
  //                                       onClick={(e) =>
  //                                         isEditing
  //                                           ? handleCellEdit(
  //                                             e,
  //                                             index,
  //                                             "recommendations",
  //                                             observation.recommendations,
  //                                             observation
  //                                           )
  //                                           : null
  //                                       }
  //                                       className="edit-icon"
  //                                       fontSize="small"
  //                                     />
  //                                   )}
  //                                 </TableCell>
  //                                 {/* isreference */}
  //                                 <TableCell
  //                                   className="editable-cell"
  //                                   style={{ height: "100px" }}
  //                                 >
  //                                   <div
  //                                     className="cell-content"
  //                                     style={{
  //                                       //    color:
  //                                       // (isEditing && currentEditedRow !== index) ||
  //                                       //   observation.variant === true
  //                                       //   ? "grey"
  //                                       //   : "black",
  //                                       marginRight: "10px"
  //                                     }}
  //                                   >

  //                                     <TextField
  //                                       id={`outlined-textarea-${index}`}
  //                                       value={observation.is_reference}
  //                                       placeholder="IS Reference"
  //                                       onChange={(e) => {
  //                                         const newValue = e.target.value;

  //                                         const proceed = handleCellEdit(
  //                                           { ...e, target: { ...e.target, textContent: newValue } },
  //                                           index,
  //                                           "is_reference",
  //                                           observation.is_reference,
  //                                           { ...observation, is_reference: newValue }
  //                                         );

  //                                         if (!proceed) return;

  //                                         setSelectedObservations((prev) =>
  //                                           prev.map((obs) =>
  //                                             (obs.sr_no || obs.id) === (observation.sr_no || observation.id)
  //                                               ? { ...obs, is_reference: newValue, hasEdited: true }
  //                                               : obs
  //                                           )
  //                                         );
  //                                       }}
  //                                       onBlur={(e) => {
  //                                         const latestValue = e.target.value;

  //                                         handleCellEdit(
  //                                           { ...e, target: { ...e.target, textContent: latestValue } },
  //                                           index,
  //                                           "is_reference",
  //                                           observation.is_reference,
  //                                           { ...observation, is_reference: latestValue }
  //                                         );
  //                                       }}
  //                                       sx={{ width: "200px" }}
  //                                       InputProps={{
  //                                         sx: { fontSize: "10px" },
  //                                         disabled: currentEditedRow !== -1 && currentEditedRow !== observation.sr_no,
  //                                       }}
  //                                       variant="outlined"
  //                                       size="small"
  //                                       fullWidth
  //                                       multiline
  //                                       minRows={1.5}
  //                                       maxRows={10}
  //                                     />

  //                                   </div>
  //                                   {!observation.variant && (
  //                                     <EditOutlinedIcon
  //                                       onClick={(e) =>
  //                                         isEditing
  //                                           ? handleCellEdit(
  //                                             e,
  //                                             index,
  //                                             "is_reference",
  //                                             observation.is_reference,
  //                                             observation
  //                                           )
  //                                           : null
  //                                       }
  //                                       className="edit-icon"
  //                                       fontSize="small"
  //                                     />
  //                                   )}
  //                                 </TableCell>
  //                                 {/* scores */}
  //                                 <TableCell className="editable-cell" style={{ height: "100px" }}>
  //                                   <div
  //                                     className="cell-content"
  //                                     style={{
  //                                       //    color:
  //                                       // (isEditing && currentEditedRow !== index) ||
  //                                       //   observation.variant === true
  //                                       //   ? "grey"
  //                                       //   : "black",
  //                                       marginRight: "10px",
  //                                     }}
  //                                   >
  //                                     <TextField
  //                                       type="number"
  //                                       value={observation.score ?? ""}
  //                                       placeholder="Score"
  //                                       sx={{ width: "80px" }}
  //                                       InputProps={{
  //                                         sx: { fontSize: "10px" },
  //                                         inputProps: {
  //                                           min: 0,
  //                                           max: 5,
  //                                           step: 1,
  //                                         },
  //                                         disabled:
  //                                           observation.variant === true ||
  //                                           (isEditing && currentEditedRow !== observation.sr_no),
  //                                       }}
  //                                       onChange={(e) =>
  //                                         handleScoreChange(
  //                                           e,
  //                                           observation.table_type,
  //                                           observation.sr_no || observation.id,
  //                                           index
  //                                         )
  //                                       }
  //                                       size="small"
  //                                       variant="outlined"
  //                                     />
  //                                   </div>

  //                                   {!observation.variant && (
  //                                     <EditOutlinedIcon
  //                                       onClick={(e) =>
  //                                         isEditing
  //                                           ? setCurrentEditedRow(index)
  //                                           : null
  //                                       }
  //                                       className="edit-icon"
  //                                       fontSize="small"
  //                                     />
  //                                   )}
  //                                 </TableCell>
  //                                 {/* system_implentation */}
  //                                 <TableCell className="editable-cell">
  //                                   <div
  //                                     className="cell-content"
  //                                     style={{

  //                                       marginRight: "10px"
  //                                     }}
  //                                   >

  //                                     <TextField
  //                                       id={`outlined-textarea-${index}`}
  //                                       value={observation.system_implementation}
  //                                       placeholder="System Implementation"
  //                                       onChange={(e) => {
  //                                         const newValue = e.target.value;

  //                                         const proceed = handleCellEdit(
  //                                           { ...e, target: { ...e.target, textContent: newValue } },
  //                                           index,
  //                                           "system_implementation",
  //                                           observation.system_implementation,
  //                                           { ...observation, system_implementation: newValue }
  //                                         );

  //                                         if (!proceed) return;

  //                                         setSelectedObservations((prev) =>
  //                                           prev.map((obs) =>
  //                                             (obs.sr_no || obs.id) === (observation.sr_no || observation.id)
  //                                               ? { ...obs, system_implementation: newValue, hasEdited: true }
  //                                               : obs
  //                                           )
  //                                         );
  //                                       }}
  //                                       onBlur={(e) => {
  //                                         const latestValue = e.target.value;

  //                                         handleCellEdit(
  //                                           { ...e, target: { ...e.target, textContent: latestValue } },
  //                                           index,
  //                                           "system_implementation",
  //                                           observation.system_implementation,
  //                                           { ...observation, system_implementation: latestValue }
  //                                         );
  //                                       }}
  //                                       sx={{ width: "200px" }}
  //                                       InputProps={{
  //                                         sx: { fontSize: "10px" },
  //                                         disabled: currentEditedRow !== -1 && currentEditedRow !== observation.sr_no,
  //                                       }}
  //                                       variant="outlined"
  //                                       size="small"
  //                                       fullWidth
  //                                       multiline
  //                                       minRows={1.5}
  //                                       maxRows={10}
  //                                     />


  //                                   </div>
  //                                   {!observation.variant && (
  //                                     <EditOutlinedIcon
  //                                       onClick={(e) =>
  //                                         isEditing
  //                                           ? handleCellEdit(
  //                                             e,
  //                                             index,
  //                                             "system_implementation",
  //                                             observation.system_implementation,
  //                                             observation
  //                                           )
  //                                           : null
  //                                       }
  //                                       className="edit-icon"
  //                                       fontSize="small"
  //                                     />
  //                                   )}
  //                                 </TableCell>
  //                                 {/* compliance_check */}
  //                                 <TableCell className="editable-cell">
  //                                   <div
  //                                     className="cell-content"
  //                                     style={{

  //                                       marginRight: "10px"
  //                                     }}
  //                                   >

  //                                     <TextField
  //                                       id={`outlined-textarea-${index}`}
  //                                       value={observation.compliance_check}
  //                                       placeholder="Compliance Check"
  //                                       onChange={(e) => {
  //                                         const newValue = e.target.value;

  //                                         const proceed = handleCellEdit(
  //                                           { ...e, target: { ...e.target, textContent: newValue } },
  //                                           index,
  //                                           "compliance_check",
  //                                           observation.compliance_check,
  //                                           { ...observation, compliance_check: newValue }
  //                                         );

  //                                         if (!proceed) return;

  //                                         setSelectedObservations((prev) =>
  //                                           prev.map((obs) =>
  //                                             (obs.sr_no || obs.id) === (observation.sr_no || observation.id)
  //                                               ? { ...obs, compliance_check: newValue, hasEdited: true }
  //                                               : obs
  //                                           )
  //                                         );
  //                                       }}
  //                                       onBlur={(e) => {
  //                                         const latestValue = e.target.value;

  //                                         handleCellEdit(
  //                                           { ...e, target: { ...e.target, textContent: latestValue } },
  //                                           index,
  //                                           "compliance_check",
  //                                           observation.compliance_check,
  //                                           { ...observation, compliance_check: latestValue }
  //                                         );
  //                                       }}
  //                                       sx={{ width: "200px" }}
  //                                       InputProps={{
  //                                         sx: { fontSize: "10px" },
  //                                         disabled: currentEditedRow !== -1 && currentEditedRow !== observation.sr_no,
  //                                       }}
  //                                       variant="outlined"
  //                                       size="small"
  //                                       fullWidth
  //                                       multiline
  //                                       minRows={1.5}
  //                                       maxRows={10}
  //                                     />


  //                                   </div>
  //                                   {!observation.variant && (
  //                                     <EditOutlinedIcon
  //                                       onClick={(e) =>
  //                                         isEditing
  //                                           ? handleCellEdit(
  //                                             e,
  //                                             index,
  //                                             "compliance_check",
  //                                             observation.compliance_check,
  //                                             observation
  //                                           )
  //                                           : null
  //                                       }
  //                                       className="edit-icon"
  //                                       fontSize="small"
  //                                     />
  //                                   )}
  //                                 </TableCell>
  //                                 {/* image upload */}

  //                                 <TableCell>
  //                                   <div
  //                                     style={{
  //                                       display: "flex",
  //                                       alignItems: "center",
  //                                       justifyContent: "center",
  //                                       gap: "15px",
  //                                     }}
  //                                   >
  //                                     {/* Upload Icon with input */}
  //                                     <div
  //                                       style={{
  //                                         display: "flex",
  //                                         alignItems: "center",
  //                                         justifyContent: "center",
  //                                         padding: "6px 0",
  //                                         border: "1px solid grey",
  //                                         borderRadius: "5px",
  //                                         width: "100px",
  //                                         cursor:
  //                                           isEditing &&
  //                                             currentEditedRow !== (observation.sr_no || observation.id)
  //                                             ? "not-allowed"
  //                                             : "pointer",
  //                                         position: "relative",
  //                                         background:
  //                                           isEditing &&
  //                                             currentEditedRow !== (observation.sr_no || observation.id)
  //                                             ? "#f0f0f0"
  //                                             : "white",
  //                                         opacity:
  //                                           isEditing &&
  //                                             currentEditedRow !== (observation.sr_no || observation.id)
  //                                             ? 0.6
  //                                             : 1,
  //                                       }}
  //                                     >
  //                                       <CloudUploadOutlinedIcon fontSize="small" />
  //                                       <input
  //                                         type="file"
  //                                         accept="image/*"
  //                                         multiple
  //                                         onChange={(e) =>
  //                                           handleImageUpload(
  //                                             observation.table_type,
  //                                             observation.sr_no || observation.id,
  //                                             observation.area,
  //                                             e.target.files
  //                                           )
  //                                         }
  //                                         style={{
  //                                           position: "absolute",
  //                                           width: "100%",
  //                                           height: "100%",
  //                                           top: 0,
  //                                           left: 0,
  //                                           opacity: 0,
  //                                           cursor:
  //                                             isEditing &&
  //                                               currentEditedRow !== (observation.sr_no || observation.id)
  //                                               ? "not-allowed"
  //                                               : "pointer",
  //                                         }}
  //                                         disabled={
  //                                           isEditing &&
  //                                           currentEditedRow !== (observation.sr_no || observation.id)
  //                                         }
  //                                       />
  //                                     </div>

  //                                     {/* View Uploaded Images Icon */}
  //                                     <div
  //                                       style={{
  //                                         display: "flex",
  //                                         alignItems: "center",
  //                                         justifyContent: "center",
  //                                         padding: "6px 0",
  //                                         border: "1px solid grey",
  //                                         borderRadius: "5px",
  //                                         width: "100px",
  //                                         cursor: "pointer",
  //                                       }}
  //                                       onClick={() =>
  //                                         handleOpenImageDialog(observation.sr_no || observation.id, observation)
  //                                       }
  //                                     >
  //                                       <InsertPhotoOutlinedIcon fontSize="small" />
  //                                     </div>
  //                                   </div>

  //                                   {/* Image Preview Dialog */}
  //                                   {selectedObservation?.image &&
  //                                     selectedObservation.image.sr_no === observation.sr_no && (
  //                                       <Dialog onClose={handleCloseImageDialog} open={openDialog} maxWidth={false}>
  //                                         <DialogTitle>Uploaded Images</DialogTitle>
  //                                         <DialogContent dividers>
  //                                           {selectedObservation.image.imageUrls?.length > 0 ? (
  //                                             <div
  //                                               style={{
  //                                                 display: "grid",
  //                                                 gridTemplateColumns: "repeat(4, 1fr)",
  //                                                 gap: "10px",
  //                                               }}
  //                                             >
  //                                               {selectedObservation.image.imageUrls.map(
  //                                                 (imageUrl, imgIndex) => (
  //                                                   <div style={{ display: "flex" }} key={imgIndex}>
  //                                                     <img
  //                                                       src={imageUrl}
  //                                                       alt={`Image ${imgIndex + 1}`}
  //                                                       onClick={() => setSelectedImage(imageUrl)}
  //                                                       style={{
  //                                                         cursor: "pointer",
  //                                                         width: "200px",
  //                                                         height: "200px",
  //                                                         objectFit: "cover",
  //                                                         borderRadius: "4px",
  //                                                       }}
  //                                                     />
  //                                                     <CancelIcon
  //                                                       className="cancel-icon"
  //                                                       onClick={() =>
  //                                                         handleRemoveImage(
  //                                                           observation.table_type,
  //                                                           observation.area,
  //                                                           observation.sr_no || observation.id,
  //                                                           imgIndex
  //                                                         )
  //                                                       }
  //                                                       style={{ cursor: "pointer", marginLeft: 5 }}
  //                                                     />
  //                                                   </div>
  //                                                 )
  //                                               )}
  //                                             </div>
  //                                           ) : (
  //                                             <Typography gutterBottom>No File Uploaded</Typography>
  //                                           )}
  //                                         </DialogContent>
  //                                         <DialogActions>
  //                                           <Button onClick={handleCloseImageDialog}>Close</Button>
  //                                         </DialogActions>
  //                                       </Dialog>
  //                                     )}
  //                                 </TableCell>
  //                                 {/* Info */}
  //                                 <TableCell className="table-actions">
  //                                   <div
  //                                     style={{
  //                                       display: "flex",
  //                                       justifyContent: "center",
  //                                     }}
  //                                   >
  //                                     <InfoIcon
  //                                       onClick={() =>
  //                                         getObservationVariants(observation.observation, observation.sr_no || observation.id)
  //                                       }
  //                                       style={{
  //                                         pointerEvents: (() => {
  //                                           const matchingObservation = selectedObservations.find(
  //                                             (obs) =>
  //                                               obs.table_type === observation.table_type &&
  //                                               obs.area === observation.area &&
  //                                               (obs.sr_no === observation.sr_no || obs.id === observation.id)
  //                                           );

  //                                           return isEditing &&
  //                                             (!matchingObservation ||
  //                                               (matchingObservation.sr_no !== observation.sr_no &&
  //                                                 matchingObservation.id !== observation.id))
  //                                             ? "none"
  //                                             : "auto";
  //                                         })(),
  //                                       }}
  //                                     />
  //                                     {/* <PlaylistAddCircleIcon
  //                                       onClick={() =>
  //                                         handleDuplicateRow(
  //                                           observation.table_type,
  //                                           observation.area,
  //                                           observation.sr_no || observation.id
  //                                         )
  //                                       }
  //                                       style={{
  //                                         pointerEvents: (() => {
  //                                           const matchingObservation = selectedObservations.find(
  //                                             (obs) =>
  //                                               obs.table_type === observation.table_type &&
  //                                               obs.area === observation.area &&
  //                                               (obs.sr_no === observation.sr_no || obs.id === observation.id)
  //                                           );

  //                                           return isEditing &&
  //                                             (!matchingObservation ||
  //                                               (matchingObservation.sr_no !== observation.sr_no &&
  //                                                 matchingObservation.id !== observation.id))
  //                                             ? "none"
  //                                             : "auto";
  //                                         })(),
  //                                       }}
  //                                     /> */}
  //                                     <DeleteForeverIcon
  //                                       onClick={() =>
  //                                         handleDeleteRow(
  //                                           observation.table_type,
  //                                           observation.area,
  //                                           observation.sr_no || observation.id
  //                                         )
  //                                       }
  //                                       style={{
  //                                         pointerEvents: (() => {
  //                                           const matchingObservation = selectedObservations.find(
  //                                             (obs) =>
  //                                               obs.table_type === observation.table_type &&
  //                                               obs.area === observation.area &&
  //                                               (obs.sr_no === observation.sr_no || obs.id === observation.id)
  //                                           );

  //                                           return isEditing &&
  //                                             (!matchingObservation ||
  //                                               (matchingObservation.sr_no !== observation.sr_no &&
  //                                                 matchingObservation.id !== observation.id))
  //                                             ? "none"
  //                                             : "auto";
  //                                         })(),
  //                                       }}
  //                                     />
  //                                   </div>
  //                                 </TableCell>

  //                               </TableRow>
  //                             )
  //                           )}
  //                           {renderNewRowInputs(tableType)}
  //                         </TableBody>
  //                       </Table>
  //                     </TableContainer>
  //                   </div>
  //                 ))}
  //               </div>
  //             </div>
  //             <hr />
  //             <div
  //               style={{ marginBottom: "10px" }}
  //               className="review-modal-footer"
  //             >
  //               <button
  //                 className="button-styles"
  //                 onClick={handleSave}
  //                 style={{ background: "#efc71d" }}
  //               >
  //                 Save
  //               </button>
  //               <button
  //                 className="button-styles"
  //                 onClick={handlePrev}
  //                 style={{ background: "#efc71d" }}
  //               >
  //                 &#171; Prev
  //               </button>
  //               <button
  //                 className="button-styles"
  //                 color="primary"
  //                 onClick={() => handleNext()}
  //                 style={{ background: "#efc71d" }}
  //               >
  //                 Next &#187;
  //               </button>
  //             </div>
  //           </div>
  //         </div>
  //       </Modal>
  //     </>
  //   );
  // } else if (screenNumber === 9) {
  //   return (
  //     <>
  //       {loading ? <Loader /> : null}
  //       <Modal open={true} onClose={handleClose}>
  //         <div className="review-modal-container">
  //           <div className="review-modal-content">
  //             <div className="review-modal-header">
  //               <Typography variant="h5">
  //                 {module === "cmv" ? " HSE CMV Report" : "Saved Report"}
  //               </Typography>
  //               <button className="custom-close-button" onClick={handleClose}>
  //                 &#10005; {/* Unicode for 'X' */}
  //               </button>
  //             </div>
  //             <div className="review-modal-body" style={{ overflowY: "auto" }}>
  //               <Typography variant="body1" component="div">
  //                 <div>
  //                   <div className="sub-headings">GLOBAL BEST PRACTICES</div>
  //                   <JoditEditor
  //                     // ref={editor}
  //                     ref={bestPracticeEditor}
  //                     placeholder="Enter your text here"
  //                     value={bestPractice}
  //                     config={config}
  //                     tabIndex={1}
  //                     onBlur={(newContent) => setbestPractice(newContent)} // This updates backgroundBrief on blur
  //                   />
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
  //                 className="button-styles"
  //                 onClick={handlePrev}
  //                 style={{ background: "#efc71d" }}
  //               >
  //                 &#171; Prev
  //               </button>
  //               <button
  //                 className="button-styles"
  //                 color="primary"
  //                 onClick={handleNext}
  //                 style={{ background: "#efc71d" }}
  //               >
  //                 Next &#187;
  //               </button>
  //             </div>
  //           </div>
  //         </div>
  //       </Modal>
  //     </>
  //   );
  // } else if (screenNumber === 10) {
  //   return (
  //     <>
  //       {loading ? <Loader /> : null}
  //       <Modal open={true} onClose={handleClose}>
  //         <div className="review-modal-container">
  //           <div className="review-modal-content">
  //             <div className="review-modal-header">
  //               <Typography variant="h5">Charts</Typography>
  //               <button className="custom-close-button" onClick={handleClose}>
  //                 &#10005; {/* Unicode for 'X' */}
  //               </button>
  //             </div>
  //             <div className="review-modal-body" style={{ overflowY: "auto" }}>
  //               <div
  //                 id="chart-container-for-report"
  //                 className="chart-container-for-report"
  //                 ref={chartContainerRef}
  //               >
  //                 <div className="total-serverity-div-for-report">
  //                   <div className="severity-item-for-report">
  //                     Total Observations
  //                     <br />
  //                     <span>{data.length}</span>
  //                     <hr />
  //                   </div>
  //                   <div
  //                     style={{ color: "#FF0000" }}
  //                     className="severity-item-for-report"
  //                   >
  //                     High Severity Observations
  //                     <br />
  //                     <span>
  //                       {data.filter((e) => e.criticality === "High").length}
  //                     </span>
  //                     <hr />
  //                   </div>
  //                   <div
  //                     style={{ color: "#006400" }}
  //                     className="severity-item-for-report"
  //                   >
  //                     Medium Severity Observations
  //                     <br />
  //                     <span>
  //                       {data.filter((e) => e.criticality === "Medium").length}
  //                     </span>
  //                     <hr />
  //                   </div>
  //                   <div
  //                     style={{ color: "#005cdb" }}
  //                     className="severity-item-for-report"
  //                   >
  //                     Low Severity Observations
  //                     <br />
  //                     <span>
  //                       {data.filter((e) => e.criticality === "Low").length}
  //                     </span>
  //                     <hr />
  //                   </div>
  //                 </div>
  //                 <div className="area-chart-for-report">
  //                   Area Chart
  //                   <Chart
  //                     options={barOptions}
  //                     series={[
  //                       {
  //                         name: "",
  //                         data: counts,
  //                       },
  //                     ]}
  //                     type="bar"
  //                     height={300}
  //                   />
  //                 </div>
  //                 <div className="severity-chart-for-report">
  //                   Severity Chart
  //                   <Chart
  //                     options={severityChartOptions}
  //                     series={seriesData}
  //                     type="bar"
  //                     height={300}
  //                   />
  //                 </div>
  //                 <div className="pie-chart-for-report">
  //                   Audit Score
  //                   <Chart
  //                     options={pieOptions}
  //                     series={[scorePercent, 100 - scorePercent]}
  //                     type="pie"
  //                     style={{ width: "100%" }}
  //                     height={250}
  //                   />
  //                 </div>
  //               </div>
  //             </div>
  //             <hr />
  //             <div className="review-modal-footer">
  //               <button
  //                 className="button-styles"
  //                 onClick={handleSave}
  //                 disabled={waitForCharts}
  //                 style={{
  //                   background: waitForCharts ? "lightgrey" : "#efc71d",
  //                 }}
  //               >
  //                 {waitForCharts ? "Wait..." : "Save"}
  //               </button>
  //               <button
  //                 className="button-styles"
  //                 onClick={handlePrev}
  //                 disabled={waitForCharts}
  //                 style={{
  //                   background: waitForCharts ? "lightgrey" : "#efc71d",
  //                 }}
  //               >
  //                 &#171; {waitForCharts ? "Wait..." : "Prev"}
  //               </button>
  //               <button
  //                 className="button-styles"
  //                 color="primary"
  //                 onClick={handleNext}
  //                 disabled={waitForCharts}
  //                 style={{
  //                   background: waitForCharts ? "lightgrey" : "#efc71d",
  //                 }}
  //               >
  //                 {waitForCharts ? "Wait..." : "Next"} &#187;
  //               </button>
  //             </div>
  //           </div>
  //         </div>
  //       </Modal>
  //     </>
  //   );
  // } else if (screenNumber === 11) {
  //   return (
  //     <>
  //       {loading ? <Loader /> : null}
  //       <Modal open={true} onClose={handleClose}>
  //         <div className="review-modal-container">
  //           <div className="review-modal-content">
  //             <div className="review-modal-header">
  //               <Typography variant="h5">
  //                 {module === "cmv" ? " HSE CMV Report" : "Saved Report"}
  //               </Typography>
  //               <button className="custom-close-button" onClick={handleClose}>
  //                 &#10005; {/* Unicode for 'X' */}
  //               </button>
  //             </div>
  //             <div className="review-modal-body" style={{ overflowY: "auto" }}>
  //               <Typography variant="body1" component="div">
  //                 <div>
  //                   <div className="sub-headings">THE WAY FORWARD</div>
  //                   <JoditEditor
  //                     // ref={editor}
  //                     ref={wayForwardPlanEditor}
  //                     placeholder="Enter your text here"
  //                     value={theWayForward}
  //                     tabIndex={1}
  //                     config={{
  //                       ...config,
  //                       readonly: false,
  //                       toolbarSticky: false,
  //                       askBeforePasteFromHTML: false,
  //                       askBeforePasteFromWord: false,
  //                       processPasteFromWord: true,
  //                       defaultActionOnPaste: 'insert_clear_html',  // Clears formatting but keeps structure
  //                       pasteHTMLAction: 'insert_clear_html',
  //                       disablePlugins: ['pasteDialog', 'paste'],
  //                       cleanHTML: {
  //                         removeStyles: true,
  //                         removeClasses: true,
  //                       },
  //                       pasteFromClipboard: true,

  //                     }}
  //                     onBlur={(newContent) => setTheWayForward(newContent)} // This updates backgroundBrief on blur
  //                     // onChange={(newContent) => { setTheWayForward(newContent) }} // Updates state on every change
  //                     onChange={(newContent) => { debouncedSetTheWayForward(newContent) }}
  //                   />
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
  //                 className="button-styles"
  //                 onClick={handlePrev}
  //                 style={{ background: "#efc71d" }}
  //               >
  //                 &#171; Prev
  //               </button>
  //               <button
  //                 className="button-styles"
  //                 color="primary"
  //                 onClick={handleNext}
  //                 style={{ background: "#efc71d" }}
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
  // else if (screenNumber === 12) {
  //   return (
  //     <div>
  //       {loading ? <Loader /> : null}
  //       <Modal open={true} onClose={handleClose}>
  //         <div className="review-modal-container">
  //           <div className="review-modal-content">
  //             <div className="review-modal-header">
  //               <Typography variant="h5">
  //                 {module === "cmv" ? " HSE CMV Report" : "Saved Report"}
  //               </Typography>
  //               <button className="custom-close-button" onClick={handleClose}>
  //                 &#10005; {/* Unicode for 'X' */}
  //               </button>
  //             </div>
  //             <div className="review-modal-body" style={{ overflowY: "auto" }}>
  //               <Typography variant="body1" component="div">
  //                 <div>
  //                   <div className="sub-headings">
  //                     Classification Of Audit Observations
  //                   </div>
  //                   <JoditEditor
  //                     ref={classificationEditor}
  //                     placeholder="Enter your text here"
  //                     value={classificationOfAuditObservations}
  //                     config={config}
  //                     tabIndex={1}
  //                     onBlur={(newContent) => setClassificationOfAuditObservations(newContent)}

  //                   />
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
  //                 className="button-styles"
  //                 onClick={handlePrev}
  //                 style={{ background: "#efc71d" }}
  //               >
  //                 &#171; Prev
  //               </button>
  //               <button
  //                 className="button-styles"
  //                 color="primary"
  //                 onClick={() => handleNext()}
  //                 style={{ background: "#efc71d" }}
  //               >
  //                 Next &#187;
  //               </button>
  //             </div>
  //           </div>
  //         </div>
  //       </Modal>
  //       {/* {showConfirmationModal && (
  //         <ConfirmationModal
  //           setShowConfirmationModal={setShowConfirmationModal}
  //           handleCloseWithoutSaving={handleCloseWithoutSaving}
  //         />
  //       )} */}
  //     </div>
  //   );
  // }
  // else if (screenNumber === 13) {
  //   return (
  //     <div>
  //       {loading ? <Loader /> : null}
  //       <Modal open={true} onClose={handleClose}>
  //         <div className="review-modal-container">
  //           <div className="review-modal-content">
  //             <div className="review-modal-header">
  //               <Typography variant="h5">
  //                 {module === "cmv" ? " HSE CMV Report" : "Saved Report"}
  //               </Typography>
  //               <button className="custom-close-button" onClick={handleClose}>
  //                 &#10005; {/* Unicode for 'X' */}
  //               </button>
  //             </div>
  //             <div className="review-modal-body" style={{ overflowY: "auto" }}>
  //               <Typography variant="body1" component="div">
  //                 <div>
  //                   <div className="sub-headings">
  //                     AUDIT SCORE ANALYSIS
  //                   </div>
  //                   <JoditEditor
  //                     ref={auditScoreEditor}
  //                     placeholder="Enter your text here"
  //                     value={auditScoreAnalysis}
  //                     config={config}
  //                     tabIndex={1}
  //                     onBlur={(newContent) => setAuditScoreAnalysis(newContent)} // This updates backgroundBrief on blur

  //                   />
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
  //                 className="button-styles"
  //                 onClick={handlePrev}
  //                 style={{ background: "#efc71d" }}
  //               >
  //                 &#171; Prev
  //               </button>
  //               <button
  //                 className="button-styles"
  //                 color="primary"
  //                 onClick={() => handleNext()}
  //                 style={{ background: "#efc71d" }}
  //               >
  //                 Next &#187;
  //               </button>
  //             </div>
  //           </div>
  //         </div>
  //       </Modal>
  //       {/* {showConfirmationModal && (
  //         <ConfirmationModal
  //           setShowConfirmationModal={setShowConfirmationModal}
  //           handleCloseWithoutSaving={handleCloseWithoutSaving}
  //         />
  //       )} */}
  //     </div>
  //   );
  // }
  // else if (screenNumber === 14) {
  //   return (
  //     <div>
  //       {loading ? <Loader /> : null}
  //       <Modal open={true} onClose={handleClose}>
  //         <div className="review-modal-container">
  //           <div className="review-modal-content">
  //             <div className="review-modal-header">
  //               <Typography variant="h5">
  //                 {module === "cmv" ? " HSE CMV Report" : "Saved Report"}
  //               </Typography>
  //               <button className="custom-close-button" onClick={handleClose}>
  //                 &#10005; {/* Unicode for 'X' */}
  //               </button>
  //             </div>
  //             <div className="review-modal-body" style={{ overflowY: "auto" }}>
  //               <Typography variant="body1" component="div">
  //                 <div>
  //                   <div className="sub-headings">
  //                     IMPROVEMENT OPPORTUNITY AREAS
  //                   </div>
  //                   <JoditEditor
  //                     ref={improvementEditor}
  //                     placeholder="Enter your text here"
  //                     value={improvementOpportunityAreas}
  //                     config={config}
  //                     tabIndex={1}
  //                     onBlur={(newContent) => setImprovementOpportunityAreas(newContent)} // This updates backgroundBrief on blur

  //                   />
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
  //                 className="button-styles"
  //                 onClick={handlePrev}
  //                 style={{ background: "#efc71d" }}
  //               >
  //                 &#171; Prev
  //               </button>
  //               <button
  //                 className="button-styles"
  //                 color="primary"
  //                 onClick={() => handleNext()}
  //                 style={{ background: "#efc71d" }}
  //               >
  //                 Next &#187;
  //               </button>
  //             </div>
  //           </div>
  //         </div>
  //       </Modal>
  //       {/* {showConfirmationModal && (
  //         <ConfirmationModal
  //           setShowConfirmationModal={setShowConfirmationModal}
  //           handleCloseWithoutSaving={handleCloseWithoutSaving}
  //         />
  //       )} */}
  //     </div>
  //   );
  // }
  // else if (screenNumber === 15) {
  //   return (
  //     <>
  //       {loading ? <Loader /> : null}
  //       <Modal open={true} onClose={handleClose}>
  //         <div className="review-modal-container">
  //           <div className="review-modal-content">
  //             <div className="review-modal-header">
  //               <Typography variant="h6">
  //                 {module === "cmv" ? " Electrical CMV Report" : "SAVED REPORT"} : OVERALL ASSESSMENT INDICATOR
  //               </Typography>
  //               <button className="custom-close-button" onClick={handleClose}>
  //                 &#10005; {/* Unicode for 'X' */}
  //               </button>
  //             </div>
  //             <div className="review-modal-body" style={{ overflowY: "auto" }}>
  //               <Typography variant="body1" component="div">


  //                 <div className="review-modal-body" style={{ display: "flex", gap: "10px", overflowY: "auto", marginBottom: "20px" }}>

  //                   {/* Left Risk Section */}
  //                   <div
  //                     style={{
  //                       width: "200px",
  //                       padding: "10px",
  //                       borderRadius: "4px",
  //                       backgroundColor: currentRisk.color,
  //                       color: "#000",
  //                       flexShrink: 0,
  //                       display: "flex",
  //                       justifyContent: "center",
  //                       alignItems: "center",
  //                     }}
  //                   >
  //                     {/* <h4>{currentRisk.risk}</h4>
  //                     <p>{currentRisk.interpretation}</p> */}
  //                     {/* <p>{Math.floor((cumulativeScore / 10) * 100)}%</p> */}
  //                     <p>30%</p>
  //                   </div>

  //                   {/* Right JoditEditor */}
  //                   <div style={{ flexGrow: 1 }}>
  //                     <JoditEditor
  //                       ref={overallAssessmentEditor}
  //                       placeholder="Enter your text here"
  //                       value={overallAssessmentIndicator}
  //                       config={config}
  //                       tabIndex={1}
  //                       onBlur={(newContent) => setOverallAssessmentIndicator(newContent)} // This updates backgroundBrief on blur

  //                     />
  //                   </div>
  //                 </div>
  //                 <div style={{ marginBottom: "20px", overflowX: "auto" }}>
  //                   <h3 style={{ color: "#307260", fontFamily: "Montserrat" }}>Risk Legend</h3>
  //                   <p style={{ fontFamily: "Montserrat" }}>The above image is per display purpose only</p>
  //                   <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Montserrat" }}>
  //                     <thead>
  //                       <tr style={{ backgroundColor: "#307260", color: "#efc71d" }}>
  //                         <th style={{ padding: "8px", border: "1px solid #000", fontSize: "14px" }}>Score Range</th>
  //                         <th style={{ padding: "8px", border: "1px solid #000", fontSize: "14px" }}>Risk Level</th>
  //                         <th style={{ padding: "8px", border: "1px solid #000", fontSize: "14px" }}>Interpretation</th>
  //                       </tr>
  //                     </thead>
  //                     <tbody>
  //                       {riskLevels.map((level, index) => (
  //                         <tr key={index}>
  //                           <td style={{ textAlign: "center", color: level.color, border: "1px solid #000", padding: "8px", fontSize: "13px" }}>
  //                             {level.range}
  //                           </td>
  //                           <td style={{ textAlign: "center", backgroundColor: level.color, color: "#000", border: "1px solid #000", padding: "8px", fontSize: "13px" }}>
  //                             {level.risk}
  //                           </td>
  //                           <td style={{ border: "1px solid #000", padding: "8px", fontSize: "13px" }}>
  //                             {level.interpretation}
  //                           </td>
  //                         </tr>
  //                       ))}
  //                     </tbody>
  //                   </table>
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
  //                 className="button-styles"
  //                 onClick={handlePrev}
  //                 style={{ background: "#efc71d" }}
  //               >
  //                 &#171; Prev
  //               </button>
  //               <button
  //                 className="button-styles"
  //                 color="primary"
  //                 onClick={handleNext}
  //                 style={{ background: "#efc71d" }}
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
  // else if (screenNumber === 16) {
  //   return (
  //     <>
  //       {loading ? <Loader /> : null}
  //       <Modal open={true} onClose={handleClose}>
  //         <div className="review-modal-container">
  //           <div className="review-modal-content">
  //             <div className="review-modal-header">
  //               <Typography variant="h6">
  //                 {module === "cmv" ? " Electrical CMV Report" : "SAVED REPORT"} : AUDIT Description
  //               </Typography>
  //               <button className="custom-close-button" onClick={handleClose}>
  //                 &#10005; {/* Unicode for 'X' */}
  //               </button>
  //             </div>
  //             <div className="review-modal-body" style={{ overflowY: "auto" }}>
  //               <Typography variant="body1" component="div">
  //                 <div className="review-table-wrapper" style={{ borderRadius: "5px" }}>
  //                   <table style={{ width: "100%", fontFamily: "montserrat", borderCollapse: "collapse", borderRadius: "5px" }}>
  //                     <tbody>
  //                       <tr>
  //                         <td>Client</td>
  //                         <td>{selectedOrganization.label}</td>
  //                       </tr>
  //                       <tr>
  //                         <td>Location</td>
  //                         <td>{selectedSite.label}</td>
  //                       </tr>
  //                       <tr>
  //                         <td>Date of Site Visit</td>
  //                         <td>{new Date(startDate).getDate()}-{new Date(startDate).getMonth() + 1
  //                         }-{new Date(startDate).getFullYear()}</td>
  //                       </tr>
  //                       <tr>
  //                         <td>Study</td>
  //                         <td>Electrical Audit</td>
  //                       </tr>
  //                       <tr>
  //                         <td>Time of Audit (From & To)</td>
  //                         {/* <td>{timeFrom.slice(0, 5)} to {timeTo.slice(0, 5)}</td> */}
  //                         <td>
  //                           {timeFrom && timeTo
  //                             ? `${timeFrom.slice(0, 5)} to ${timeTo.slice(0, 5)}`
  //                             : timeFrom
  //                               ? `${timeFrom.slice(0, 5)} to N/A`
  //                               : timeTo
  //                                 ? `N/A to ${timeTo.slice(0, 5)}`
  //                                 : "N/A"}
  //                         </td>

  //                       </tr>
  //                       <tr>
  //                         <td>Brief Property Description</td>
  //                         <td>{briefPropertyDescription}</td>
  //                       </tr>
  //                       <tr>
  //                         <td>Number of floors</td>
  //                         <td>{numOfFloors}</td>
  //                       </tr>
  //                       <tr>
  //                         <td>Average Staff Footfall</td>
  //                         <td>{avgStaffFootfall}</td>
  //                       </tr>
  //                       <tr>
  //                         <td>No Objection Certificate</td>
  //                         <td>{noObjectionCertificate}</td>
  //                       </tr>
  //                       <tr>
  //                         <td>National Building Code Category</td>
  //                         <td>{nationalBuildingCodeCategory}</td>
  //                       </tr>
  //                       <tr>
  //                         <td>Coordinating Person – Client Side</td>
  //                         <td>{coordinationgPersonClientside}</td>
  //                       </tr>
  //                       <tr>
  //                         <td>Report Prepared By</td>
  //                         <td>{reportPreparedBy}</td>
  //                       </tr>
  //                       <tr>
  //                         <td>Report Reviewed By</td>
  //                         <td>{reportReviewedBy}</td>
  //                       </tr>
  //                       <tr>
  //                         <td>Date of Submission of Report</td>
  //                         <td>{new Date(endDate).getDate()}-{new Date(endDate).getMonth() + 1
  //                         }-{new Date(endDate).getFullYear()}</td>
  //                       </tr>
  //                     </tbody>
  //                   </table>
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
  //                 className="button-styles"
  //                 onClick={handlePrev}
  //                 style={{ background: "#efc71d" }}
  //               >
  //                 &#171; Prev
  //               </button>
  //               <button
  //                 className="button-styles"
  //                 color="primary"
  //                 onClick={handleNext}
  //                 style={{ background: "#efc71d" }}
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
  // else if (screenNumber === 17) {
  //   return (
  //     <>
  //       {loading ? <Loader /> : null}
  //       <Modal open={true} onClose={handleClose}>
  //         <div className="review-modal-container">
  //           <div
  //             className={exp ? "export-modal-content" : "review-modal-content"}
  //           >
  //             <div className="review-modal-header">
  //               <Typography variant="h5">
  //                 {exp
  //                   ? "Export Report"
  //                   : module === "cmv"
  //                     ? "HSE CMV Report"
  //                     : "Saved Report"}
  //               </Typography>
  //               <button className="custom-close-button" onClick={handleClose}>
  //                 &#10005; {/* Unicode for 'X' */}
  //               </button>
  //             </div>
  //             {!exp && (
  //               <div
  //                 className="review-modal-body"
  //                 style={{ overflowY: "auto" }}
  //               >
  //                 <Typography variant="body1" component="div">
  //                   <div>
  //                     <div className="sub-headings">CONCLUSION</div>
  //                     <JoditEditor
  //                       // ref={editor}
  //                       ref={conclusionEditor}
  //                       placeholder="Enter your text here"
  //                       value={conclusion}
  //                       config={config}
  //                       tabIndex={1}
  //                       onBlur={(newContent) => setConclusion(newContent)} // This updates backgroundBrief on blur
  //                       onChange={(newContent) => { debouncedSetConclusion(newContent) }} // Updates state on every change
  //                     />
  //                   </div>
  //                 </Typography>
  //               </div>
  //             )}
  //             <hr />
  //             <div className="review-modal-footer" id="conclusionFooter">
  //               {!exp && (
  //                 <>
  //                   <button
  //                     className="button-styles"
  //                     onClick={handleSave}
  //                     style={{ background: "#efc71d" }}
  //                   >
  //                     Save
  //                   </button>
  //                   <button
  //                     className="button-styles"
  //                     onClick={handlePrev}
  //                     style={{ background: "#efc71d" }}
  //                   >
  //                     &#171; Prev
  //                   </button>
  //                   {module !== "cmv" && (
  //                     <button
  //                       className="button-styles"
  //                       onClick={handleComplete}
  //                       disabled={isComplete}
  //                       style={{
  //                         background: isComplete ? "lightgrey" : "#efc71d",
  //                       }}
  //                     >
  //                       Complete
  //                     </button>
  //                   )}
  //                 </>
  //               )}
  //               <ExportSavedReportPDF
  //                 selectedOrganization={selectedOrganization}
  //                 selectedSite={selectedSite}
  //                 backgroundBrief={backgroundBrief}
  //                 contents={contents}
  //                 exeSummary={exeSummary}
  //                 criticalObservations={criticalObservations}
  //                 selectedObservations={selectedObservations}
  //                 selectedArea={selectedArea}
  //                 selectedCategory={selectedCategory}
  //                 recommendations={recommendations}
  //                 conclusion={conclusion}
  //                 selectedDateTime={selectedDateTime.split("T")[0]}
  //                 imageUrlsByRow={imageUrlsByRow}
  //                 reportType="HSE"
  //                 isSaved={exp ? true : isSaved}
  //                 chartImage={chartImage}
  //                 otherDetails={otherDetails}
  //                 ReportUID={selectedReportData.report_id}
  //                 startDate={new Date(startDate)}
  //                 endDate={new Date(endDate)}
  //                 bestPractice={bestPractice}
  //                 theWayForward={theWayForward}
  //                 name={name}
  //                 facilityInfo={facilityInfo}
  //                 introduction={introduction}
  //               />
  //               <ExportExcel
  //                 selectedOrganization={selectedOrganization}
  //                 selectedSite={selectedSite}
  //                 backgroundBrief={backgroundBrief}
  //                 contents={contents}
  //                 exeSummary={exeSummary}
  //                 criticalObservations={criticalObservations}
  //                 selectedObservations={selectedObservations}
  //                 selectedArea={selectedArea}
  //                 selectedCategory={selectedCategory}
  //                 recommendations={recommendations}
  //                 conclusion={conclusion}
  //                 selectedDateTime={selectedDateTime.split("T")[0]}
  //                 imageUrlsByRow={imageUrlsByRow}
  //                 isSaved={exp ? true : isSaved}
  //                 reportType="HSE"
  //                 otherDetails={otherDetails}
  //                 ReportUID={selectedReportData.report_id}
  //                 bestPractice={bestPractice}
  //                 theWayForward={theWayForward}
  //                 facilityInfo={facilityInfo}
  //               />
  //               <ExportWordDoc
  //                 selectedOrganization={selectedOrganization}
  //                 selectedSite={selectedSite}
  //                 backgroundBrief={backgroundBrief}
  //                 contents={contents}
  //                 exeSummary={exeSummary}
  //                 criticalObservations={criticalObservations}
  //                 selectedObservations={selectedObservations}
  //                 selectedArea={selectedArea}
  //                 selectedCategory={selectedCategory}
  //                 recommendations={recommendations}
  //                 conclusion={conclusion}
  //                 selectedDateTime={selectedDateTime.split("T")[0]}
  //                 isSaved={exp ? true : isSaved}
  //                 otherDetails={otherDetails}
  //                 reportType="HSE"
  //                 chartImage={chartImage}
  //                 ReportUID={selectedReportData.report_id}
  //                 bestPractice={bestPractice}
  //                 theWayForward={theWayForward}
  //                 startDate={new Date(startDate)}
  //                 endDate={new Date(endDate)}
  //                 name={name}
  //                 facilityInfo={facilityInfo}
  //                 introduction={introduction}
  //               />
  //             </div>
  //           </div>
  //         </div>
  //       </Modal>
  //     </>
  //   );
  // }
};

export default HseSavedReportModal;
