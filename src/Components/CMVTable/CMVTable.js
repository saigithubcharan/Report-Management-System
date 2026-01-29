import React, { useEffect, useState } from "react";
import {
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Button,
  TextField,
} from "@material-ui/core";
import InfoIcon from "@material-ui/icons/Info";
import PlaylistAddCircleIcon from "@mui/icons-material/PlaylistAddCircle";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
import CancelIcon from "@material-ui/icons/Cancel";
import CreatableSelect from "react-select/creatable";
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";
import Select from "react-select";
import { config } from "../../config";
import axios from "../../APIs/axios";
import "./CMVTable.css"; // Import your CSS file
import { useParams } from "react-router-dom";

const CMVTable = ({
  isEditing,
  currentEditedRow,
  handleCellEdit,
  handleImageUpload,
  handleRemoveImage,
  getObservationVariants,
  handleDuplicateRow,
  handleDeleteRow,
  saveChanges,
}) => {
  const [data, setData] = useState([]);
  const { report_id } = useParams();
  const areaOptions = [
    { value: "Area 1", label: "Area 1" },
    { value: "Area 2", label: "Area 2" },
  ];

  const categoryOptions = [
    { value: "Category A", label: "Category A" },
    { value: "Category B", label: "Category B" },
  ];

  const statusOptions = [
    { value: "Open", label: "Open" },
    { value: "In Progress", label: "In Progress" },
    { value: "Closed", label: "Closed" },
  ];

  const criticalityOptions = [
    { value: "High", label: "High" },
    { value: "Medium", label: "Medium" },
    { value: "Low", label: "Low" },
  ];

  const getObservationDetails = async () => {
    console.log(report_id);
    try {
      const report = await axios.get(
        `${config.PATH}/api/cmv-report/${report_id}`
      );
      setData(report.data.AllObservations);
    } catch (err) {
      console.log(err.message);
    }
  };

  useEffect(() => {
    getObservationDetails();
  }, []);

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

  return (
    <div className="cmv-table-container">
      <TableContainer component={Paper} className="cmv-table-scroll">
        <Table className="cmv-table">
          <TableHead>
            <TableRow>
              <TableCell>Sr. No.</TableCell>
              <TableCell> Key Areas</TableCell>
              <TableCell>Observation</TableCell>
              <TableCell>Recommendation</TableCell>
              <TableCell>Before Photos</TableCell>
              <TableCell>After Photos</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Status as on</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((observation, index) => (
              <TableRow
                key={index}
                className={
                  (isEditing && currentEditedRow === index) || !isEditing
                    ? "cmv-even-row"
                    : "cmv-odd-row"
                }
                style={
                  observation.variant === true
                    ? { backgroundColor: "#f2f2f2" }
                    : {}
                }
              >
                <TableCell>{index + 1}</TableCell>
                <TableCell
                  className="cmv-editable-cell"
                  style={{ height: "100px" }}
                >
                  <div className="cell-content">
                    <CreatableSelect
                      placeholder="Area"
                      options={areaOptions}
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
                        (isEditing && currentEditedRow !== index) ||
                        observation.variant === true
                      }
                      styles={customSelectStylesCreatable}
                    />
                  </div>
                  {/* {!observation.variant && (
                    <EditOutlinedIcon
                      className="cmv-edit-icon"
                      fontSize="small"
                    />
                  )} */}
                </TableCell>

                <TableCell
                  className="cmv-editable-cell"
                  style={{ height: "100px" }}
                >
                  <div className="cell-content">
                    <span
                      contentEditable={
                        !observation.variant &&
                        ((isEditing && currentEditedRow === index) ||
                          !isEditing)
                      }
                      onInput={(e) =>
                        handleCellEdit(
                          e,
                          index,
                          "observation",
                          observation.observation,
                          observation
                        )
                      }
                    >
                      {observation.observation}
                    </span>
                  </div>
                  {/* {!observation.variant && (
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
                      className="cmv-edit-icon"
                      fontSize="small"
                    />
                  )} */}
                </TableCell>

                <TableCell className="cmv-editable-cell">
                  <div className="cell-content">
                    <span
                      contentEditable={
                        !observation.variant &&
                        ((isEditing && currentEditedRow === index) ||
                          !isEditing)
                      }
                      onInput={(e) =>
                        handleCellEdit(
                          e,
                          index,
                          "recommendations",
                          observation.recommendations,
                          observation
                        )
                      }
                    >
                      {observation.recommendations}
                    </span>
                  </div>
                  {/* {!observation.variant && (
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
                      className="cmv-edit-icon"
                      fontSize="small"
                    />
                  )} */}
                </TableCell>

                <TableCell>
                  <div className="cmv-image-container">
                    {observation.imageUrls?.length > 0 ? (
                      <div className="image-item">
                        {observation.imageUrls.map((imageUrl, imgIndex) => (
                          <div style={{ display: "flex" }} key={imgIndex}>
                            <img
                              src={imageUrl}
                              alt={`Image ${imgIndex + 1}`}
                              className="cmv-photo-image-saved"
                              // onClick={() => setSelectedImage(imageUrl)} // Set selected image on click
                              style={{ cursor: "pointer" }}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="upload-container">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleImageUpload(index, e.target.files)
                          }
                          multiple
                          style={{ color: "transparent" }}
                          disabled={isEditing && currentEditedRow !== index}
                        />
                        {observation.imageUrls?.length === 0 && (
                          <div className="no-file-chosen">No file chosen</div>
                        )}
                      </div>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="cmv-image-container">
                    {observation.imageUrls?.length > 0 ? (
                      <div className="image-item">
                        {observation.imageUrls.map((imageUrl, imgIndex) => (
                          <div style={{ display: "flex" }} key={imgIndex}>
                            <img
                              src={imageUrl}
                              alt={`Image ${imgIndex + 1}`}
                              className="cmv-photo-image-saved"
                              // onClick={() => setSelectedImage(imageUrl)} // Set selected image on click
                              style={{ cursor: "pointer" }}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="upload-container">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleImageUpload(index, e.target.files)
                          }
                          multiple
                          style={{ color: "transparent" }}
                          disabled={isEditing && currentEditedRow !== index}
                        />
                        {observation.imageUrls?.length === 0 && (
                          <div className="no-file-chosen">No file chosen</div>
                        )}
                      </div>
                    )}
                  </div>
                </TableCell>

                <TableCell className="cmv-editable-cell">
                  <div className="cell-content">
                    <TextField
                      type="date"
                      onChange={(e) =>
                        handleCellEdit(
                          e,
                          index,
                          "date",
                          e.target.value,
                          observation
                        )
                      }
                      disabled={
                        (isEditing && currentEditedRow !== index) ||
                        observation.variant === true
                      }
                      className="cmv-date-input"
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </div>
                  {/* {!observation.variant && (
                    <EditOutlinedIcon
                      onClick={(e) =>
                        isEditing
                          ? handleCellEdit(
                              e,
                              index,
                              "date",
                              observation.date,
                              observation
                            )
                          : null
                      }
                      className="cmv-edit-icon"
                      fontSize="small"
                    />
                  )} */}
                </TableCell>

                <TableCell
                  className="cmv-editable-cell"
                  style={{ height: "100px" }}
                >
                  <Select
                    placeholder="Status"
                    options={statusOptions}
                    onChange={(e) =>
                      handleCellEdit(
                        e,
                        index,
                        "status",
                        observation.status,
                        observation
                      )
                    }
                    isDisabled={
                      (isEditing && currentEditedRow !== index) ||
                      observation.variant === true
                    }
                    styles={customSelectStylesCreatable}
                  />
                  {/* {!observation.variant && (
                    <EditOutlinedIcon
                      className="cmv-edit-icon"
                      fontSize="small"
                    />
                  )} */}
                </TableCell>

                <TableCell>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    {!observation.variant && (
                      <PlaylistAddCircleIcon
                        onClick={() => handleDuplicateRow(index)}
                        className="cmv-action-icon"
                      />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <div className="cmv-footer">
        <Button
          variant="contained"
          color="primary"
          onClick={saveChanges}
          disabled={!isEditing}
        >
          Save
        </Button>
      </div>
    </div>
  );
};

export default CMVTable;
