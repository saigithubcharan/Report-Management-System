import React, { useState, useEffect, useRef, useContext } from "react";
import { debounce } from 'lodash';
import {
  Modal,
  Typography,
  Button,
  TextareaAutosize,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  TextField,
} from "@mui/material";
import "./HsePreviewReportModal.css";
import CancelIcon from "@mui/icons-material/Cancel";
import CloseIcon from "@material-ui/icons/Close";
import IconButton from "@material-ui/core/IconButton";
import { config } from "../../config";
import axios from "../../APIs/axios";
import { toast } from "react-toastify";
import { getAccountDetails } from "../Services/localStorage";
import HSE_Cover from "../../HSE_Cover.jpg";
import HSE_Cover_New from "../../HSE_Report_Cover.png";
import ExportExcel from "../ExportExcel/ExportExcel";
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";
import ExportSavedReportPDF from "../ExportSavedReportPDF/ExportSavedReportPDF";
import ExportWordDoc from "../ExportWordDoc/ExportWordDoc";
import PlaylistAddCircleIcon from "@mui/icons-material/PlaylistAddCircle";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import InfoIcon from "@mui/icons-material/Info";
import Chart from "react-apexcharts";
import html2canvas from "html2canvas";
import ImageViewerModal from "../ImageViewerModal/ImageViewerModal";
import CreatableSelect from "react-select/creatable";
import VariantsModal from "../VariantsModal/VariantsModal";
import Select from "react-select";
import { Category } from "@mui/icons-material";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import CheckIcon from "@mui/icons-material/Check";
import DeleteIcon from "@mui/icons-material/Delete";
import { IoAddCircle } from "react-icons/io5";
import JoditEditor from 'jodit-react';
import HTMLReactParser from 'html-react-parser';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import InsertPhotoOutlinedIcon from '@mui/icons-material/InsertPhotoOutlined';
import DialogBox from "../DialogBox/DialogBox";
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import { ReportContextHSE } from "../ReportContext/ReportContextHSE";

const HsePreviewReportModal = ({
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
  getAllHseData,
  // startDate,
  // endDate,
  // setEndDate,
  // setStartDate,

  generateUniqueId,
  getCurrentDateTime,
  setLoading,
  areaOptions,
  allData,
  getAllHseReports,
  selectedSector,
  setSelectedSector,
  setSelectedParam
}) => {
  const {
    backgroundBrief,
    setBackgroundBrief,
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
    resetReportContext,
    editedObservations,
    setEditedObservations,
    isReportEdited,
    setIsReportEdited,
    facilityInfo,
    setFacilityInfo,
    allObservations,setAllObservations

  } = useContext(ReportContextHSE)
  // const [backgroundBrief, setBackgroundBrief] = useState(
  //   reportHeader.background_brief
  //     .replace("Alpha Maier Pvt.Ltd", `${selectedOrganization.label}`)
  //     .replace("Manesar plant", `${selectedSite.label}`)
  //     .replace("Electrical Systems", "Health, Safety and Environment")
  //     .replace(
  //       "30th & 31st March 2022",
  //       `${startDate.getDate()}-${startDate.getMonth() + 1
  //       }-${startDate.getFullYear()} and ${endDate.getDate()}-${endDate.getMonth() + 1
  //       }-${endDate.getFullYear()}`
  //     )
  // );


  useEffect(() => {
    const originalBackground =
      reportHeader.background_brief
        .replace("Alpha Maier Pvt.Ltd", `${selectedOrganization.label}`)
        .replace("Manesar plant", `${selectedSite.label}`)
        .replace("Electrical Systems", "Health, Safety and Environment")
        .replace(
          "30th & 31st March 2022",
          `${startDate.getDate()}-${startDate.getMonth() + 1
          }-${startDate.getFullYear()} and ${endDate.getDate()}-${endDate.getMonth() + 1
          }-${endDate.getFullYear()}`
        )

    const originalSummary =
      reportHeader.exe_summary
        .replace(
          "Alpha Maier private Ltd",
          `${selectedOrganization.label}(${selectedSite.label})`
        )
        .replace(
          "30th &amp; 31st March 2022",
          `${startDate.getDate()}-${startDate.getMonth() + 1
          }-${startDate.getFullYear()} and ${endDate.getDate()}-${endDate.getMonth() + 1
          }-${endDate.getFullYear()}`
        )
        .replace("<areas>", selectedArea.join(","))
        .replaceAll("electrical", "HSE")
        .replaceAll("Electrical", "HSE");

    if (!backgroundBrief || backgroundBrief === reportHeader.background_brief) {
      setBackgroundBrief(originalBackground);
    }

    if (!exeSummary || exeSummary === reportHeader.exe_summary) {
      setExeSummary(originalSummary);
    }


    if (!theWayForward) {
      setTheWayForward(reportHeader.the_way_forward);
    }

    if (!contents) {
      setContents(reportHeader.contents.replace("Scoring Table", "Charts"));
    }
    if (!introduction) {
      setIntroduction(reportHeader.introduction);
    }
    if (!bestPractice) {
      setbestPractice(reportHeader.best_practice);
    }
    if (!conclusion) {
      setConclusion(reportHeader.conclusion.replaceAll("electrical", "HSE"));
    }

  }, [reportHeader, selectedOrganization, selectedSite, startDate, endDate]);
  const [dialog, setDialog] = useState({ open: false, message: "", title: "", accept: "", reject: "", onConfirm: null });
  const handleDialogBoxObservation = (action) => {
    if (action) {
      dialog.onConfirm(); // Execute the confirmed action (allow editing)
    }
    setDialog((prevDialog) => ({ ...prevDialog, open: false }));
  };

  // const [contents, setContents] = useState(
  //   reportHeader.contents.replace("Scoring Table", "Charts")
  // );

  // const [exeSummary, setExeSummary] = useState(
  //   reportHeader.hse_exe_summary
  //     .replace(
  //       "Alpha Maier private Ltd",
  //       `${selectedOrganization.label}(${selectedSite.label})`
  //     )
  //     .replace(
  //       "30th &amp; 31st March 2022",
  //       `${startDate.getDate()}-${startDate.getMonth() + 1
  //       }-${startDate.getFullYear()} and ${endDate.getDate()}-${endDate.getMonth() + 1
  //       }-${endDate.getFullYear()}`
  //     )
  //     .replace("<areas>", selectedArea.join(","))
  // );

  // const [introduction, setIntroduction] = useState(reportHeader.introduction);


  // const [criticalObservations, setCriticalObservations] = useState(
  //   selectedObservations
  //     .filter((e) => e.criticality === "High")
  //     .map((observation) => ({ ...observation }))
  // );
  //   const [isCriticalInitialized,setIsCriticalInitialized]=useState(false);
  //  useEffect(() => {
  //   if (!isCriticalInitialized && selectedObservations.length > 0) {
  //     const highCritical = selectedObservations
  //       .filter((e) => e.criticality === "High")
  //       .map((obs) => ({ ...obs }));
  //     setCriticalObservations(highCritical);
  //     setIsCriticalInitialized(true);
  //   }
  // }, [selectedObservations, isCriticalInitialized]);



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

  // const [conclusion, setConclusion] = useState(
  //   reportHeader.conclusion.replaceAll("electrical", "HSE")
  // );

  // const [bestPractice, setbestPractice] = useState(reportHeader.best_practice);

  // const [theWayForward, setTheWayForward] = useState(
  //   reportHeader.the_way_forward
  // );
  const [screenNumber, setScreenNumber] = useState(1);
  const { userId, name } = getAccountDetails();

  // const [isReportEdited, setIsReportEdited] = useState(false);
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
  const [selectedImage, setSelectedImage] = useState(null);
  const [area, setArea] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [editedFields, setEditedFields] = useState([]);
  const [observationVariants, setObservationVariants] = useState([]);
  const [openVairantModal, setOpenVariantModal] = useState(false);
  const [confirmationShown, setConfirmationShown] = useState(false);

  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newRowInputs, setNewRowInputs] = useState({});

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
        imageUrls: [],
      },
    }));
  };

  // useEffect(() => {
  //   updateBackgroundBrief();
  //   updateExecSummary();
  // }, [selectedOrganization, selectedSite, startDate, endDate, selectedArea]);

  // const updateBackgroundBrief = () => {
  //   const updatedData = reportHeader.background_brief
  //     .replace("Alpha Maier Pvt.Ltd", `${selectedOrganization.label}`)
  //     .replace("Manesar plant", `${selectedSite.label}`)
  //     .replace("Electrical Systems", "Health, Safety and Environment")
  //     .replace(
  //       "30th & 31st March 2022",
  //       `${startDate.getDate()}-${startDate.getMonth() + 1
  //       }-${startDate.getFullYear()} and ${endDate.getDate()}-${endDate.getMonth() + 1
  //       }-${endDate.getFullYear()}`
  //     );
  //   setBackgroundBrief(updatedData);
  // };

  // const updateExecSummary = () => {
  //   const updatedData = 
  // reportHeader.exe_summary
  //     .replace(
  //       "Alpha Maier private Ltd",
  //       `${selectedOrganization.label}(${selectedSite.label})`
  //     )
  //     .replace(
  //       "30th &amp; 31st March 2022",
  //       `${startDate.getDate()}-${startDate.getMonth() + 1
  //       }-${startDate.getFullYear()} and ${endDate.getDate()}-${endDate.getMonth() + 1
  //       }-${endDate.getFullYear()}`
  //     )
  //     .replace("<areas>", selectedArea.join(","))
  //     .replaceAll("electrical", "HSE")
  //     .replaceAll("Electrical", "HSE");
  //   setExeSummary(updatedData);
  // };

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
    if (screenNumber === 10) {
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
    if (screenNumber === 10) {
      // Simulate loading for 3 seconds
      const loaderTimeout = setTimeout(() => {
        setWaitForCharts(false);
      }, 5000);

      // Cleanup timeout if the component unmounts or when loading is complete
      return () => clearTimeout(loaderTimeout);
    }
  }, [screenNumber]);


  // const handleCellEdit = (e, field, originalContent, observationObj) => {
  //   const handleConfirmation = () => {
  //     if (!confirmationShown) {
  //       const confirmEdit = window.confirm(
  //         "Editing the observation field will make this a new observation set and the variant list will be updated accordingly. Do you want to continue?"
  //       );
  //       if (!confirmEdit) {
  //         e.target.textContent = originalContent;
  //         return false;
  //       } else {
  //         setConfirmationShown(true);
  //         return true;
  //       }
  //     }
  //     return true;
  //   };

  //   if (currentEditedRow !== -1 && currentEditedRow !== observationObj.sr_no) {
  //     toast.warning("Please save changes in the currently edited row before editing another row.");
  //     return;
  //   }

  //   if (field === "observation" && !handleConfirmation()) {
  //     return;
  //   }

  //   setIsEditing(true);

  //   const updateEditedFields = (newField) => {
  //     if (!editedFields.includes(newField)) {
  //       setEditedFields((prev) => [...prev, newField]);
  //     }
  //   };

  //   let currentContent;
  //   if (field === "area" || field === "category" || field === "criticality") {
  //     currentContent = e.value;
  //   } else {
  //     currentContent = e.target.textContent;
  //   }

  //   const charLimitExceeded = (limit) => {
  //     if (currentContent.length > limit) {
  //       toast.warning(`Only ${limit} characters are allowed in this field.`);
  //       setIsEditing(false);
  //       return true;
  //     }
  //     return false;
  //   };

  //   if (["area", "category"].includes(field) && charLimitExceeded(50)) return;
  //   if (["observation", "recommendations"].includes(field)) {
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
  //   setCurrentEditedRow(observationObj.sr_no);

  //   const updatedObservation = {
  //     ...observationObj,
  //     [field]: currentContent,
  //     sr_no: observationObj.sr_no,
  //   };

  //   const existingIndex = editedObservations.findIndex((obs) => obs.sr_no === observationObj.sr_no);
  //   const updatedEdited = [...editedObservations];

  //   if (existingIndex !== -1) {
  //     updatedEdited[existingIndex] = updatedObservation;
  //   } else {
  //     updatedEdited.push(updatedObservation);
  //   }

  //   setEditedObservations(updatedEdited);

  //   const isReverted = (() => {
  //     if (["observation", "recommendations", "is_reference"].includes(field)) {
  //       return e.target.textContent === originalContent;
  //     } else if (["area", "category", "criticality"].includes(field)) {
  //       return e.value === originalContent;
  //     }
  //     return false;
  //   })();

  //   if (isReverted) {
  //     setCurrentEditedRow(-1);
  //     setIsEditing(false);
  //     setEditedObservations([]);
  //     setConfirmationShown(false);
  //   }

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

  const handleChange = (e, name) => {
    setIsSaved(false);
    if (name === "background") {
      setBackgroundBrief(e.target.value);
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
    } else if (name === "intro") {
      setIntroduction(e.target.value);
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

  const handleNext = () => {
    // console.log("dbg", backgroundBrief);
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

  const handleEdit = () => {
    // console.log("bgg", backgroundBrief);
    // console.log("obs",observations)
    //         console.log("selectedobs",selectedObservations);

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

  const handleImageUpload = async (table_type, identifier, area, files) => {
    const selectedObsCopy = [...selectedObservations];
    const obsCopy = [...observations];
    const editedObsCopy = [...editedObservations];

    // Ensure imageUrls is initialized
    selectedObsCopy.forEach((item) => {
      if (!item.imageUrls) item.imageUrls = [];
    });

    obsCopy.forEach((item) => {
      if (!item.imageUrls) item.imageUrls = [];
    });

    editedObsCopy.forEach((item) => {
      if (!item.imageUrls) item.imageUrls = [];
    });

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
          `${config.PATH}/api/upload/image`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const imageUrl = response.data.imageUrl;

        // Update selectedObservations
        const selectedObs = selectedObsCopy.find(
          (item) =>
            item.table_type === table_type &&
            (item.sr_no === identifier || item.id === identifier) &&
            item.area === area
        );
        if (selectedObs && !selectedObs.imageUrls.includes(imageUrl)) {
          selectedObs.imageUrls.push(imageUrl);
        }

        // Update observations
        const obs = obsCopy.find(
          (item) =>
            item.table_type === table_type &&
            (item.sr_no === identifier || item.id === identifier) &&
            item.area === area
        );
        if (obs && !obs.imageUrls.includes(imageUrl)) {
          obs.imageUrls.push(imageUrl);
        }

        // Update editedObservations
        const editedObs = editedObsCopy.find(
          (item) =>
            item.table_type === table_type &&
            (item.sr_no === identifier || item.id === identifier) &&
            item.area === area
        );
        if (editedObs && !editedObs.imageUrls.includes(imageUrl)) {
          editedObs.imageUrls.push(imageUrl);
        }
      }

      setSelectedObservations(selectedObsCopy);
      setObservations(obsCopy);

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

  const handleRemoveImage = (table_type, area, identifier, imageIndex) => {
    // Create deep copies to avoid mutation
    const selectedObsCopy = [...selectedObservations];
    const obsCopy = [...observations];

    // Find the observation with the matching table_type, area, and identifier
    const observationToUpdate = selectedObsCopy.find(
      (obs) =>
        obs.table_type === table_type &&
        obs.area === area &&
        (obs.sr_no === identifier || obs.id === identifier)
    );

    if (observationToUpdate && observationToUpdate.imageUrls) {
      // Remove the image URL at the specified index
      observationToUpdate.imageUrls.splice(imageIndex, 1);

      // If there are no more images in the array, remove the imageUrls property
      if (observationToUpdate.imageUrls.length === 0) {
        delete observationToUpdate.imageUrls;
      }

      // Update the corresponding observation in obsCopy
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

      // Update state
      setSelectedObservations(selectedObsCopy);
      setObservations(obsCopy);
    } else {
      toast.error("Observation not found.");
    }
  };
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedObservation, setSelectedObservation] = useState({ image: null, index: null });
  const handleOpenImageDialog = (index, observation) => {
    setSelectedObservation({ image: observation, index });
    setOpenDialog(true);
  };

  const handleCloseImageDialog = () => {
    setSelectedObservation({ image: null, index: null });
    setOpenDialog(false);
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
    "category",
  ];

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
      let updatedSelectedObservations = [...selectedObservations];
      let updatedAllObservations = [...observations];
      // console.log("updatedSelectedObservations", selectedObservations);
      // console.log("updateAllObservation", updatedAllObservations)

      // Trimming fields in observations and report data
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
      // console.log("updatedSelectedObservationsbefore", selectedObservations);
      // console.log("updateAllObservation", updatedAllObservations)

      requestAnimationFrame(() => {
        setSelectedObservations(updatedSelectedObservations);
        setObservations(updatedAllObservations);
      });

      // Trim fields in reportData
      const reportData = trimFields({
        report_id: ReportUID,
        user_id: userId,
        date_time: selectedDateTime,
        organization: selectedOrganization
          ? selectedOrganization.label
          : selectedOrganization,
        site: selectedSite ? selectedSite.label : selectedSite,
        org_id: selectedOrganization
          ? selectedOrganization.value
          : selectedOrganization,
        area: selectedArea,
        category: selectedCategory,
        background_brief: backgroundBrief,
        contents: contents,
        exe_summary: exeSummary,
        conclusion: conclusion,
        best_practice: bestPractice,
        the_way_forward: theWayForward,
        is_edited: isReportEdited,
        other_details: otherDetails,
        is_saved: 1,
        is_complete: complete === true ? true : false,
        start_date: startDate,
        end_date: endDate,
        sector_type: selectedSector.value,
        introduction: introduction,
      });

      if (module === "cmv") {
        reportData.type = "cmv";
      } else {
        reportData.type = "primary";
      }
    
      const cmvEndPOint = `${config.PATH}/api/save-update-hse-cmv-report`;
      const reportEndPoint = `${config.PATH}/api/save-update-hse-report`;

      if (complete === true) {
        await axios.post(reportEndPoint, reportData);
        await axios.post(cmvEndPOint, reportData);
      }

      await axios.post(reportEndPoint, reportData);
      

      // Trim fields in observationsData
      const observationsData = trimFields({
        report_id: ReportUID,
        all_observations: updatedAllObservations,
        organization: selectedOrganization.label,
        site: selectedSite.label,
        user_id: userId,
      });
      const observationEndpoint =
        complete === true
          ? `${config.PATH}/api/save-update-hse-cmv-observations`
          : `${config.PATH}/api/save-update-hse-observations`;

      await axios.post(observationEndpoint, observationsData);
      // console.log("going dta",observationsData)

      setIsSaved(true);
      setEditedObservations([]);
      setCurrentEditedRow(-1);
      setIsEditing(false);
      setDisableSaveNext(false);
      getAllHseData();
      saveCriticalObservations(complete);
      saveFacilityInfo();
      setLoading(false);
      updateOrgReportStatus();
      updateSiteReportStatus();
      setEditedFields([]);
      setConfirmationShown(false);
      toast.success(
        `${complete === true ? "Report Completed and Saved" : "Report Saved"}`
      );
      // console.log("updatedSelectedObservations after", selectedObservations);
      // console.log("updateAllObservation", updatedAllObservations)
    } catch (error) {
      console.log("Error saving report:", error);
      setLoading(false);
    }
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
        report_id: ReportUID,
      };

      const endpoint =
        complete === true
          ? `${config.PATH}/api/save-critical-hse-cmv-observations`
          : `${config.PATH}/api/save-hse-critical-observations`;

      await axios.post(endpoint, payload);

      // console.log("Critical observations saved successfully.");
    } catch (error) {
      console.error("Error saving critical observations:", error.message);
    }
  };

  const closeReport = () => {
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
    setEndDate(null);
    setStartDate(null);
    generateUniqueId();
    getCurrentDateTime();
    setSelectedSector();
    setSelectedParam();
  };

  const handleClose = () => {
    if (isEditing && screenNumber === 8) {
      toast.warning("Please save changes before closing the report.");
      return;
    } else if (!isSaved) {
      toast.warning("Please save the report before closing.");
    } else {
      closeReport();
    }
  };
  const handleScoreChange = (event, tableType, sr_no, index) => {
    setIsSaved(false);
    const newScore = parseInt(event.target.value, 10);

    if ((newScore >= 0 && newScore <= 5) || event.target.value === "") {
      const newObservations = [...observations];
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

      // 🟡 Start persistence logic like handleCellEdit does
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

      setObservations(newObservations);
      setSelectedObservations(newSelectedObservations);
      setEditedObservations(updatedEdited); // ✅ This ensures persistence
    } else {
      alert("Invalid score. Please enter a value between 0 and 5.");
      const originalObservation = observations.find(
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

    // Generate a unique identifier based on the current timestamp
    const newSrNo = Date.now() % 1000000; // Using timestamp as unique identifier

    // Create a duplicated row with the new unique identifier
    const duplicatedRowForSelected = {
      ...selectedOriginalRow,
      sr_no: newSrNo,
      refIndex: (selectedOriginalRow.refIndex || 0) + 1, // Adjust refIndex or handle it based on your requirement
      imageUrls: selectedOriginalRow.imageUrls
        ? [...selectedOriginalRow.imageUrls]
        : [],
    };

    // Create copies of state arrays
    const updatedAllObservations = [...observations];
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
    setObservations(updatedAllObservations);
    setSelectedObservations(updatedSelectedObservations);

    toast.success("New row added");
  };

  const handleDeleteRow = (table_type, area, identifier) => {
    if (isEditing && currentEditedRow !== -1) {
      toast.warn(
        "Please finish editing the current row before deleting the row."
      );
      return;
    }

    // Create deep copies to avoid mutation
    const updatedSelectedObservations = [...selectedObservations];
    let updatedAllObservations = [...observations]; // Use let instead of const

    // Check if there is only one row left
    if (updatedSelectedObservations.length === 1) {
      toast.warn("Cannot delete the last row.");
      return;
    }

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

    // Find the observation to delete
    const observationToDelete = updatedSelectedObservations[rowIndex];
    const refIndex = observationToDelete.refIndex;

    // Remove the observation from both arrays
    updatedSelectedObservations.splice(rowIndex, 1);
    updatedAllObservations = updatedAllObservations.filter(
      (obs) =>
        !(
          obs.table_type === table_type &&
          obs.area === area &&
          (obs.sr_no === identifier || obs.id === identifier)
        )
    );

    // Adjust refIndex for the remaining observations
    updatedSelectedObservations.forEach(
      (e) => (e.refIndex = e.refIndex > refIndex ? e.refIndex - 1 : e.refIndex)
    );

    setSelectedObservations(updatedSelectedObservations);
    setObservations(updatedAllObservations);
    setIsEditing(false);
    setEditedObservations([]);
    setCurrentEditedRow(-1);
    toast.error("Row deleted");
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

  const handleObservationEdit = (index, e) => {
    // setDisableSaveNext(true);
    // const updatedObservations = [...criticalObservations];
    // updatedObservations[index].observation = e.target.value;
    const updatedObservations = criticalObservations.map((obs, i) =>
      i === index ? { ...obs, observation: e.target.value } : obs
    );
    setCriticalObservations(updatedObservations);
  };

  const updateOrgReportStatus = () => {
    try {
      const org_id = selectedOrganization.value;
      axios.post(`${config.PATH}/api/update-hse-org-report-status/${org_id}`);
    } catch (error) {
      console.log(error.message);
    }
  };

  const updateSiteReportStatus = () => {
    try {
      const org_id = selectedOrganization.value;
      const site_name = selectedSite.value;
      axios.post(
        `${config.PATH}/api/update-hse-site-report-status/${org_id}/${site_name}`
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

  const closeVariantModal = () => {
    setOpenVariantModal(false);
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

  const getObservationVariants = async (observation, index) => {
    try {
      if (isEditing && currentEditedRow !== index) {
        toast.warn("Please finish editing the current row.");
        return;
      }
      setOpenVariantModal(true);
      const payload = {
        observation: observation,
        report: "new",
      };
      const response = await axios.post(
        `${config.PATH}/api/search-hse-data-by-observation`,
        payload
      );
      setObservationVariants(response.data);
    } catch (e) {
      console.log(e);
    }
  };

  const criticalityOptions = [
    { value: "High", label: "High" },
    { value: "Medium", label: "Medium" },
    { value: "Low", label: "Low" },
  ];

  const groupedObservations = selectedObservations.reduce(
    (acc, observation) => {
      if (!acc[observation.table_type]) {
        acc[observation.table_type] = [];
      }
      acc[observation.table_type].push(observation);
      return acc;
    },
    {}
  );

  const saveFacilityInfo = async () => {
    try {
      const payload = {
        report_id: ReportUID,
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

  const handleRemoveField = (key) => {
    if (Object.keys(facilityInfo).length === 1) {
      alert("Cannot remove the last field.");
      return;
    }

    const updatedFacilityInfo = { ...facilityInfo };
    delete updatedFacilityInfo[key];
    setFacilityInfo(updatedFacilityInfo);
  };

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
    const newSrNo = Date.now() % 1000000;
    // const newSrNo = Date.now();

    // Create the new row with a fixed key and unique ID
    const newRow = {
      ...newRowInputs[tableType],
      sr_no: newSrNo,
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
      imageUrls: newRow.imageUrls?.length > 0 ? newRow.imageUrls : [],
    };

    // Validate the area, observation, recommendations, and is_reference fields
    if (
      !updatedRow.area ||
      !updatedRow.observation ||
      !updatedRow.recommendations ||
      !updatedRow.is_reference||
      !updatedRow.system_implementation||
      !updatedRow.compliance_check
    ) {
      alert(
        // "Area, Observation, Recommendation, and IS Reference fields cannot be empty."
        "Fields cannot be empty."
      );
      return;
    }

    setEditedObservations((prevObservations) => [...prevObservations, updatedRow]);
    setIsReportEdited(true);

    // Update the state by pushing the new row into the array
    setSelectedObservations((prev) => [
      ...prev, // Spread the existing rows
      updatedRow, // Add the new row
    ]);

    setObservations((prev) => [
      ...prev, // Spread the existing rows
      updatedRow, // Add the new row
    ]);
    setAllObservations((prev) => [...prev, updatedRow]);
    // console.log("setAllobservation",allObservations)

    // console.log(selectedObservations);
    // console.log(setObservations);
    // console.log(updatedRow)
    // Clear the new row inputs
    initializeNewRowInputs(tableType, selectedSector.value);
  };

  const renderNewRowInputs = (tableType) => (
    <TableRow key={`new-row-${tableType}`}>
      <TableCell>{groupedObservations[tableType]?.length + 1}</TableCell>
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
          styles={{
            ...customSelectStylesCreatable,
            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
          }}
          placeholder="Area"
          options={areaOptions()}
          value={
            newRowInputs[tableType]?.area
              ? { label: newRowInputs[tableType].area, value: newRowInputs[tableType].area }
              : null
          }
          isSearchable
          onChange={(e) => handleChangeNewRowSelect(tableType, e, "area")}
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
      {/* <TableCell className="editable-cell" style={{ height: "100px" }}>
        <textarea
          className="input-field"
          value={newRowInputs[tableType]?.observation || ""}
          onChange={(e) => handleChangeNewRow(tableType, e, "observation")}
          placeholder="Observation"
        />
      </TableCell> */}
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
      {/* <TableCell className="editable-cell" style={{ height: "100px" }}>
        <textarea
          className="input-field"
          value={newRowInputs[tableType]?.criticality || ""}
          onChange={(e) => handleChangeNewRow(tableType, e, "criticality")}
          placeholder="Criticality"
        />
      </TableCell> */}
      <TableCell className="editable-cell" style={{ height: "100px" }}>
        <Select
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
          menuPortalTarget={document.body}
          menuPlacement="auto"
        />
      </TableCell>
      {/* Recommendations */}
      {/* <TableCell className="editable-cell" style={{ height: "100px" }}>
        <textarea
          className="input-field"
          value={newRowInputs[tableType]?.recommendations || ""}
          onChange={(e) => handleChangeNewRow(tableType, e, "recommendations")}
          placeholder="Recommendations"
        />
      </TableCell> */}
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
      {/* <TableCell className="editable-cell" style={{ height: "100px" }}>
        <textarea
          className="input-field"
          value={newRowInputs[tableType]?.is_reference || ""}
          onChange={(e) => handleChangeNewRow(tableType, e, "is_reference")}
          placeholder="IS Reference"
        />
      </TableCell> */}
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
      {/* <TableCell className="editable-cell" style={{ height: "100px" }}>
        <input
          // className="input-field"
          value={newRowInputs[tableType]?.score || ""}
          onChange={(e) => handleChangeNewRow(tableType, e, "score")}
          placeholder="Score"
          type="number"
          style={{ height: "31px", marginTop: "-2%" }}
        />
      </TableCell> */}
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

  // const addObservation = () => {   //it adds a new line of observation in critical observation screen 7 to make it point wise
  //   setCriticalObservations([
  //     ...criticalObservations,
  //     { observation: otherDetails },
  //   ]);
  //   setOtherDetails(""); // Clear the text area after adding
  // };
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
  const editor = useRef(null);
   const contentEditor = useRef(null);
    const introductionEditor = useRef(null);
    const exeSummaryEditor = useRef(null);
    const bestPracticeEditor = useRef(null);
    const wayForwardPlanEditor = useRef(null);
    const conclusionEditor = useRef(null);

  const handleChangeJoditEditor = (newContent) => {
    setBackgroundBrief(newContent);
  };
  const isTyping = useRef(false);
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
  const debouncedSetIntroduction = useRef(
    debounce((value) => {
      setIntroduction(value);
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
  const debouncedSetConclusion = useRef(
    debounce((value) => {
      setConclusion(value);
    }, 2000),
  ).current;
  const debouncedSetGlobalPractice = useRef(
    debounce((value) => {
      setbestPractice(value);
    }, 2000),
  ).current;

  if (screenNumber === 1) {
    return (
      <>
        <Modal open={open} onClose={handleClose}>
          <div className="review-modal-container">
            <div className="review-modal-content">
              <div className="review-modal-header">
                <Typography variant="h5">Preview Report</Typography>
                <button className="custom-close-button" onClick={handleClose}>
                  &#10005; {/* Unicode for 'X' */}
                </button>
              </div>
              <div className="review-modal-body" style={{ overflowY: "auto" }}>


                {/* New cover page with HTML */}
                <div className="hse-report-container">
                  <div className="hse-report-cover">
                    <img src={HSE_Cover_New} alt="Cover" />
                  </div>
                  <div className="hse-report-details">
                    <p>Client: {selectedOrganization.label}</p>
                    <p>Location: {selectedSite.label}</p>
                    <p>Service: HSE Audit</p>
                    <p>
                      Date: {startDate.getTime() === endDate.getTime()
                        ? `${startDate.getDate()}-${startDate.getMonth() + 1}-${startDate.getFullYear()}`
                        : `${startDate.getDate()}-${startDate.getMonth() + 1}-${startDate.getFullYear()} to ${endDate.getDate()}-${endDate.getMonth() + 1}-${endDate.getFullYear()}`}
                    </p>
                    <a href="https://www.momentumindia.in">www.momentumindia.in</a>
                  </div>
                  <div className="hse-report-title">
                    HSE<br />Report
                    <span className="hse-report-year">
                      <span className="line"></span>
                      {new Date().getFullYear()}
                    </span>
                  </div>
                  <div className="hse-report-footer">
                    Prepared by Momentum India
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
  } 
  else if (screenNumber === 2) {
    return (
      <>
        <Modal open={open} onClose={handleClose}>
          <div className="review-modal-container">
            <div className="review-modal-content">
              <div className="review-modal-header">
                <Typography variant="h5">Preview Report</Typography>
                <button className="custom-close-button" onClick={handleClose}>
                  &#10005; {/* Unicode for 'X' */}
                </button>
              </div>
              <div className="review-modal-body" style={{ overflowY: "auto" }}>
                <Typography variant="body1" component="div">
                  <div>
                    <div className="sub-headings">
                      BACKGROUND &#8208; PROJECT BRIEF
                    </div>
                    <JoditEditor
                      ref={editor}
                      placeholder="Enter your text here"
                      value={backgroundBrief}
                      config={config}
                      tabIndex={1}
                      onBlur={(newContent) => setBackgroundBrief(newContent)} // This updates backgroundBrief on blur
                      // onChange={handleChangeJoditEditor} // Updates state on every change
                      onChange={(newContent) => {
                        isTyping.current = true;
                        debouncedChange(newContent)
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
                <Typography variant="h5">Preview Report</Typography>
                <button className="custom-close-button" onClick={handleClose}>
                  &#10005; {/* Unicode for 'X' */}
                </button>
              </div>
              <div className="review-modal-body" style={{ overflowY: "auto" }}>
                <Typography variant="body1" component="div">
                  <div>
                    <div className="sub-headings">
                      UNDERSTANDING OF THE REVIEW REPORT &#8208; CONTENTS.
                    </div>
                    <JoditEditor
                      // ref={editor}
                      ref={contentEditor}
                      placeholder="Enter your text here"
                      value={contents}
                      config={config}
                      tabIndex={1}
                      onBlur={(newContent) => setContents(newContent)} // still update on blur
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
                <Typography variant="h5">Preview Report</Typography>
                <button className="custom-close-button" onClick={handleClose}>
                  &#10005; {/* Unicode for 'X' */}
                </button>
              </div>
              <div className="review-modal-body" style={{ overflowY: "auto" }}>
                <Typography variant="body1" component="div">
                  <div>
                    <div className="sub-headings">INTRODUCTION</div>
                    <JoditEditor
                      // ref={editor}
                      ref={introductionEditor}
                      placeholder="Enter your text here"
                      value={introduction}
                      config={config}
                      tabIndex={1}
                      onBlur={(newContent) => setIntroduction(newContent)} // still update on blur
                      onChange={(newContent) => debouncedSetIntroduction(newContent)} // debounced change
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
  } else if (screenNumber === 5) {
    return (
      <>
        <Modal open={open} onClose={handleClose}>
          <div className="review-modal-container">
            <div className="review-modal-content">
              <div className="review-modal-header">
                <Typography variant="h5">Preview Report</Typography>
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
                      onChange={(newContent) => {
                        debouncedSetExeSummary(newContent)
                      }} // Updates state on every change
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
  } else if (screenNumber === 6) {
    return (

      <Modal open={true} onClose={handleClose}>
        <div className="review-modal-container">
          <div className="review-modal-content">
            <div className="review-modal-header">
              <Typography variant="h5">Preview Report</Typography>
              <button className="custom-close-button" onClick={handleClose}>
                &#10005; {/* Unicode for 'X' */}
              </button>
            </div>
            <div className="review-modal-body" style={{ overflowY: "auto" }}>
              <Typography variant="body1" component="div">
                <div className="sub-headings">ACADEMIC INFORMATION</div>
                <br />
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>FACILITY INFORMATION</TableCell>
                        <TableCell>COMMENTS & NOTES</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {facilityInfo &&
                        Object.entries(facilityInfo).map(([key, value], index) => (
                          <TableRow key={index}>
                            <TableCell>{key}:</TableCell>
                            <TableCell style={{ display: "flex" }}>
                              <TextField
                                value={value}
                                onChange={(e) =>
                                  handleChangeFacilityInfo({
                                    target: { name: key, value: e.target.value },
                                  })
                                }
                                placeholder="Enter your text here"
                                style={{ width: "100%", minHeight: "80px" }}
                              />
                              <IconButton
                                onClick={() => handleRemoveField(key)}
                                style={{ color: "red", marginLeft: "10px" }}
                                aria-label="delete"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}

                      <TableRow>
                        <TableCell>
                          <TextField
                            label="New Field Name"
                            value={newKey}
                            onChange={handleNewKeyChange}
                            variant="outlined"
                            style={{ width: "100%" }}
                          />
                        </TableCell>
                        {/* <TableCell>
                          <div style={{ display: "flex", alignItems: "center" }}>
                            <TextField
                              value={newValue}
                              onChange={(e) =>
                                handleNewValueChange({ target: { value: e.target.value } })
                              }
                              placeholder="Enter your text here"
                              style={{ width: "100%", minHeight: "80px", }}
                            />
                            <button
                              onClick={handleAddNewField}
                              className="button-styles"
                              style={{
                                background: "#efc71d",
                                marginLeft: "10px",
                              }}
                            >
                              Add
                            </button>
                          </div>
                        </TableCell> */}
                        <TableCell style={{ verticalAlign: "middle", padding: "10px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              width: "100%",
                              gap: "10px", // space between TextField and Button
                              padding: "5px 10px", // inner padding inside the cell
                            }}
                          >
                            {/* <TextField
                              value={newValue}
                              onChange={(e) =>
                                handleNewValueChange({ target: { value: e.target.value } })
                              }
                              placeholder="Enter your text here"
                              multiline
                              minRows={2}
                              fullWidth
                              style={{
                                backgroundColor: "#fff",
                              }}
                              InputProps={{
                                sx: {
                                  fontSize: "14px",
                                },
                              }}
                            /> */}
                              <TextField
                                                          value={newValue}
                                                          onChange={(e) =>
                                                            handleNewValueChange({
                                                              target: { value: e.target.value },
                                                            })
                                                          }
                                                          placeholder="Enter your text here"
                                                          style={{ width: "100%", minHeight: "80px" }}
                                                        />
                            <button
                              onClick={handleAddNewField}
                              className="button-styles"
                              style={{
                                background: "#efc71d",
                                padding: "8px 16px",
                                fontWeight: "bold",
                                borderRadius: "6px",
                                boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
                              }}
                            >
                              ADD
                            </button>
                          </div>
                        </TableCell>

                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
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

    );

  } else if (screenNumber === 7) {
    return (
      <>
        <Modal open={open} onClose={handleClose}>
          <div className="review-modal-container">
            <div className="review-modal-content">
              <div className="review-modal-header">
                <Typography variant="h5">Preview Report</Typography>
                <button className="custom-close-button" onClick={handleClose}>
                  &#10005; {/* Unicode for 'X' */}
                </button>
              </div>
              <div className="review-modal-body" style={{ overflowY: "auto" }}>
                <Typography variant="body1" component="div">
                  <div>
                    <div className="sub-headings">CRITICAL OBSERVATIONS</div>
                    <br />
                    <div className="critical-observations-div">
                      {criticalObservations.length === 0 ? (
                        <div className="no-observations">
                          <em>No critical observations</em>
                        </div>
                      ) : (
                        criticalObservations.map((observation, index) => (
                          <div key={index} className="observation-item" style={{ display: "flex", gap: "5px" }}>
                            <textarea
                              onChange={(e) => handleObservationEdit(index, e)}
                              style={{ width: "100%", fontFamily: "inherit", padding: "10px" }}
                              value={observation.observation}
                            />
                            &nbsp;
                            <CancelIcon
                              onClick={() => removeItem(index)}
                              className="cancel-icon"
                            >
                              &#10005;
                            </CancelIcon>
                          </div>
                        ))
                      )}
                    </div>
                    <br />
                    <div className="custom-text-box">
                      <textarea
                        onChange={(e) => handleChange(e, "other details")}
                        value={otherDetails}
                        placeholder="Other Details..."
                        style={{
                          width: "99%",
                          // height: "5vh",
                          fontFamily: "inherit",
                          padding: "10px"
                        }}
                      />
                      <IoAddCircle size={30} className="IoAddCircle" style={{ cursor: "pointer" }} onClick={addObservation} />
                    </div>

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
                  disabled={disableSaveNext}
                  style={{
                    background: disableSaveNext ? "lightgrey" : "#efc71d",
                  }}
                >
                  &#171; Prev
                </button>
                <button
                  className="button-styles"
                  color="primary"
                  onClick={handleNext}
                  disabled={disableSaveNext}
                  style={{
                    background: disableSaveNext ? "lightgrey" : "#efc71d",
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
  } else if (screenNumber === 8) {
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
          <div className="review-modal-container">
            <div className="review-modal-content">
              <div className="review-modal-header">
                <div className="review-modal-subheader">
                  <Typography variant="h6">PREVIEW REPORT : CRITICAL HSE OBSERVATIONS, PHOTOS & RECOMMENDATIONS</Typography>
                </div>

                <button className="custom-close-button" onClick={handleClose}>
                  &#10005; {/* Unicode for 'X' */}
                </button>
              </div>
              {/* <div style={{ fontWeight: "600" }} className="sub-headings">
                CRITICAL HSE OBSERVATIONS, PHOTOS & RECOMMENDATIONS
              </div> */}
              <div style={{ overflowY: "scroll" }} className="review-modal-body">
                <div className="table-container">
                  {Object.keys(groupedObservations).map((tableType) => (
                    <div key={tableType}>
                      <Typography style={{ fontWeight: "500", padding: "10px" }} gutterBottom>
                        {tableType}
                      </Typography>
                      <TableContainer component={Paper} className="table-scroll">
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Sr. No.</TableCell>
                              <TableCell>Areas</TableCell>
                              <TableCell>Check Point</TableCell>
                              <TableCell>Observation</TableCell>
                              <TableCell>Criticality</TableCell>
                              <TableCell>Recommendation</TableCell>
                              <TableCell>IS Reference</TableCell>
                              <TableCell>Score</TableCell>
                              <TableCell>Photo Evidences</TableCell>
                              <TableCell>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {groupedObservations[tableType].map(
                              (observation, index) => (
                                <TableRow
                                  key={`${observation.table_type}-${observation.area}-${observation.sr_no || observation.id}`}
                            //    className={
                            //   (isEditing && currentEditedRow === index ) ||
                            //     !isEditing
                            //     ? "even-row"
                            //     : "odd-row"
                            // }
                             className={
                                    (isEditing &&
                                      currentEditedRow === (observation.sr_no)) ||
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
                                        options={areaOptions()}
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
      ? observation.observation.replace(/\s+/g, " ").trim()
      : ""
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
                                  {/* <TableCell className="editable-cell" style={{ height: "100px" }}>
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
                                        if (currentEditedRow !== -1 && currentEditedRow !== observation.sr_no) {
                                          toast.warning("Please save the current row before editing another.");
                                          return;
                                        }
                                        if (selectedOption) {
                                          // Ensure state updates correctly
                                          const updatedObservations = [...selectedObservations];
                                          updatedObservations[observation.sr_no] = {
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
                                      isDisabled={(isEditing && currentEditedRow !== observation.sr_no) || observation.variant === true}
                                      // menuPortalTarget={document.body} // Moves dropdown outside container for proper placement
                                      menuPlacement="auto" // Automatically adjusts placement to prevent cut-off
                                    />

                                    {!observation.variant && (
                                      <EditOutlinedIcon className="edit-icon" fontSize="small"
                                        onClick={(e) => {
                                          e.stopPropagation(); // Prevents triggering unwanted events
                                          if ((isEditing && currentEditedRow !== observation.sr_no) || observation.variant === true) {
                                            toast.warning("Please save changes in the currently edited row before editing another row.");
                                          }
                                        }} />
                                    )}
                                  </TableCell> */}
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

                                  {/* photop upload  */}
                                  {/* <TableCell>
                                    <div className="image-container">
                                      {observation.imageUrls?.length > 0 ? (
                                        <div className="image-item">
                                          {observation.imageUrls.map((imageUrl, imgIndex) => (
                                            <div style={{ display: "flex" }} key={imgIndex}>
                                              <img
                                                src={imageUrl}
                                                alt={`Image ${imgIndex + 1}`}
                                                className="photo-image-saved"
                                                onClick={() => setSelectedImage(imageUrl)}
                                                style={{ cursor: "pointer" }}
                                              />
                                              <CancelIcon
                                                onClick={() =>
                                                  handleRemoveImage(
                                                    observation.table_type,
                                                    observation.area,
                                                    observation.sr_no || observation.id,
                                                    imgIndex
                                                  )
                                                }
                                                className="cancel-icon"
                                                style={{
                                                  pointerEvents:
                                                    isEditing &&
                                                      currentEditedRow !==
                                                      selectedObservations.findIndex(
                                                        (obs) => obs.sr_no === observation.sr_no
                                                      )
                                                      ? "none"
                                                      : "auto",
                                                }}
                                              />
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        ""
                                      )}
                                    </div>
                                    <div className="upload-container">
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) =>
                                          handleImageUpload(
                                            observation.table_type,
                                            observation.sr_no || observation.id,
                                            observation.area,
                                            e.target.files
                                          )
                                        }
                                        multiple
                                        style={{
                                          color: "transparent",
                                          padding: "5px",
                                          fontSize: "12px",
                                          width: "85px",
                                        }}
                                        disabled={
                                          isEditing &&
                                          currentEditedRow !== (observation.sr_no || observation.id)
                                        }
                                      />
                                      {observation.imageUrls?.length === 0 && (
                                        <div className="no-file-chosen">No file chosen</div>
                                      )}
                                    </div>
                                  </TableCell> */}
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
                                            isEditing && currentEditedRow !== observation.sr_no
                                              ? "not-allowed"
                                              : "pointer",
                                          position: "relative",
                                          background:
                                            isEditing && currentEditedRow !== observation.sr_no
                                              ? "#f0f0f0"
                                              : "white",
                                          opacity:
                                            isEditing && currentEditedRow !== observation.sr_no
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
                                              isEditing && currentEditedRow !== observation.sr_no
                                                ? "not-allowed"
                                                : "pointer",
                                          }}
                                          disabled={
                                            isEditing && currentEditedRow !== observation.sr_no
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
                                                {selectedObservation.image.imageUrls.map((imageUrl, imgIndex) => (
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



                                  <TableCell className="table-actions">
                                    <div style={{
                                      display: "flex",
                                      justifyContent: "center",
                                    }}>
                                      {!observation.variant && <InfoIcon
                                        onClick={() =>
                                          getObservationVariants(observation.observation, observation.sr_no || observation.id)
                                        }
                                        style={{ cursor: "pointer" }}
                                      />}
                                      {!observation.variant && <PlaylistAddCircleIcon
                                        onClick={() =>
                                          handleDuplicateRow(
                                            observation.table_type,
                                            observation.area,
                                            observation.sr_no || observation.id
                                          )
                                        }
                                        style={{ cursor: "pointer" }}
                                      />}
                                      <DeleteForeverIcon
                                        onClick={() =>
                                          handleDeleteRow(
                                            observation.table_type,
                                            observation.area,
                                            observation.sr_no || observation.id
                                          )
                                        }
                                        style={{ cursor: "pointer" }}
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
  } else if (screenNumber === 9) {
    return (
      <>
        <Modal open={open} onClose={handleClose}>
          <div className="review-modal-container">
            <div className="review-modal-content">
              <div className="review-modal-header">
                <Typography variant="h5">Preview Report</Typography>
                <button className="custom-close-button" onClick={handleClose}>
                  &#10005; {/* Unicode for 'X' */}
                </button>
              </div>
              <div className="review-modal-body" style={{ overflowY: "auto" }}>
                <Typography variant="body1" component="div">
                  <div>
                    <div className="sub-headings">GLOBAL BEST PRACTICES</div>
                    <JoditEditor
                      // ref={editor}
                       ref={bestPracticeEditor}
                      placeholder="Enter your text here"
                      value={bestPractice}
                      config={config}
                      tabIndex={1}
                      onBlur={(newContent) => setbestPractice(newContent)} // This updates backgroundBrief on blur
                      onChange={(newContent) => { debouncedSetGlobalPractice(newContent) }} // Updates state on every change
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
  } else if (screenNumber === 10) {
    return (
      <>
        <Modal open={open} onClose={handleClose}>
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
                  &#171;{waitForCharts ? "Wait..." : "Prev"}
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
  } else if (screenNumber === 11) {
    return (
      <>
        <Modal open={open} onClose={handleClose}>
          <div className="review-modal-container">
            <div className="review-modal-content">
              <div className="review-modal-header">
                <Typography variant="h5">Preview Report</Typography>
                <button className="custom-close-button" onClick={handleClose}>
                  &#10005; {/* Unicode for 'X' */}
                </button>
              </div>
              <div className="review-modal-body" style={{ overflowY: "auto" }}>
                <Typography variant="body1" component="div">
                  <div>
                    <div className="sub-headings">THE WAY FORWARD</div>
                    <JoditEditor
                      // ref={editor}
                       ref={wayForwardPlanEditor}
                      placeholder="Enter your text here"
                      value={theWayForward}
                      config={config}
                      tabIndex={1}
                      onBlur={(newContent) => setTheWayForward(newContent)}
                      onChange={(newContent) => { debouncedSetTheWayForward(newContent) }}
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
  } else if (screenNumber === 12) {
    return (
      <>
        <Modal open={open} onClose={handleClose}>
          <div className="review-modal-container">
            <div className="review-modal-content">
              <div className="review-modal-header">
                <Typography variant="h5">Preview Report</Typography>
                <button className="custom-close-button" onClick={handleClose}>
                  &#10005; {/* Unicode for 'X' */}
                </button>
              </div>
              <div className="review-modal-body" style={{ overflowY: "auto" }}>
                <Typography variant="body1"component="div">
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
                <button
                  className="button-styles"
                  onClick={handleComplete}
                  // disabled={isComplete}
                  style={{ background: "#efc71d" }}
                >
                  Complete
                </button>
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
                  reportType="HSE"
                  isSaved={isSaved}
                  chartImage={chartImage}
                  otherDetails={otherDetails}
                  ReportUID={ReportUID}
                  startDate={startDate}
                  endDate={endDate}
                  bestPractice={bestPractice}
                  theWayForward={theWayForward}
                  name={name}
                  facilityInfo={facilityInfo}
                  introduction={introduction}
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
                  isSaved={isSaved}
                  reportType="HSE"
                  otherDetails={otherDetails}
                  ReportUID={ReportUID}
                  bestPractice={bestPractice}
                  theWayForward={theWayForward}
                  facilityInfo={facilityInfo}
                  introduction={introduction}
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
                  isSaved={isSaved}
                  otherDetails={otherDetails}
                  reportType="HSE"
                  chartImage={chartImage}
                  ReportUID={ReportUID}
                  bestPractice={bestPractice}
                  theWayForward={theWayForward}
                  startDate={startDate}
                  endDate={endDate}
                  name={name}
                  facilityInfo={facilityInfo}
                  introduction={introduction}
                />
              </div>
            </div>
          </div>
        </Modal>
      </>
    );
  }
};

export default HsePreviewReportModal;
