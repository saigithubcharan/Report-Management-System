// NewNote.js

import React, { useEffect, useState } from "react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { Modal, Button, TextField, TextareaAutosize } from "@mui/material";
import "./NewNote.css";
import axios from "../../APIs/axios";
import { config } from "../../config";
import { getAccountDetails } from "../Services/localStorage";
import CancelIcon from "@mui/icons-material/Cancel";
import { ToastContainer, toast } from "react-toastify";
import ImageViewerModal from "../ImageViewerModal/ImageViewerModal";
import { width } from "@mui/system";

const NewNote = ({ onClose, open, allData, getAllNotes, hseAllData }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [organization, setOrganization] = useState(null);
  const [site, setSite] = useState(null);
  const [area, setArea] = useState([]);
  const [category, setCategory] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [orgList, setOrgList] = useState([]);
  const [siteOptions, setSiteOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noteType, setNoteType] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedSector, setSelectedSector] = useState(null);
  const [filteredParameters, setFilteredParameters] = useState([]);
  const [selectedParameter, setSelectedParameter] = useState(null);
  const [filteredAreas, setFilteredAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);

  useEffect(() => {
    if (selectedSector) {
      const filteredParams = hseAllData.data.filter(
        (item) => item.sector_type === selectedSector.value
      );
      setFilteredParameters(filteredParams.map((item) => item.table_type));
    }
  }, [selectedSector]);

  useEffect(() => {
    if (selectedParameter) {
      const filteredAreas = hseAllData.data.filter(
        (item) => item.table_type === selectedParameter.value
      );
      setFilteredAreas(filteredAreas.map((item) => item.area));
    }
  }, [selectedParameter]);

  useEffect(() => {
    getOrgList();
    if (organization) {
      getSitesByOrganization(organization.value);
    }
  }, [organization, site, noteType]);

  const getOrgList = async () => {
    try {
      let orgListEndpoint = `${config.PATH}/api/organizations`;

      if (noteType === "hse") {
        // Assuming there is an API endpoint for fetching HSE organizations
        orgListEndpoint = `${config.PATH}/api/get-hse-orgs`;
      }

      const response = await axios.get(orgListEndpoint);
      setOrgList(response.data);
    } catch (error) {
      console.log("Error:", error.response?.data?.error || error.message);
    }
  };

  const getSitesByOrganization = async (orgId) => {
    try {
      let sitesEndpoint = `${config.PATH}/api/organizations/${orgId}/sites`;

      if (noteType === "hse") {
        // Assuming there is an API endpoint for fetching HSE organization sites
        sitesEndpoint = `${config.PATH}/api/hse-organizations/${orgId}/sites`;
      }

      const response = await axios.get(sitesEndpoint);
      const siteOptions = response.data.map((site) => ({
        label: site.site_name,
        value: site.site_name,
      }));
      setSiteOptions(siteOptions);
    } catch (error) {
      console.log("Error:", error.response?.data?.error || error.message);
    }
  };

  const organizationOptions = orgList.map((e) => ({
    label: e.org_name,
    value: e.id,
  }));

  const handleOrganizationSelection = async (selectedOption) => {
    if (selectedOption && selectedOption.__isNew__ === true) {
      // Validate the organization name to allow only '-' and '_'
      const isValidOrganizationName = /^[a-zA-Z0-9_-]+$/.test(
        selectedOption.label
      );

      if (!isValidOrganizationName) {
        toast.error(
          "Invalid organization name. Only hyphens ( - ), underscores ( _ ) and alphanumeric characters are allowed."
        );
        return;
      }
      const payload = {
        org_name: selectedOption.label,
      };
      try {
        let createOrgEndpoint = `${config.PATH}/api/create-organization`;
        if (noteType === "hse") {
          createOrgEndpoint = `${config.PATH}/api/create-hse-org`;
        }
        const response = await axios.post(createOrgEndpoint, payload);
        const newOrganization = response.data; // Assuming the API returns the newly created organization object
        setOrganization({
          label: newOrganization.org_name,
          value: newOrganization.id,
        });
        setSite(null);
      } catch (error) {
        console.log("Failed to create organization:", error);
        return;
      }
    } else {
      setOrganization(selectedOption);
      setSite(null);
      setSiteOptions([]);
    }
  };

  const handleSiteSelection = async (selectedOption) => {
    if (selectedOption && selectedOption.__isNew__ === true) {
      const isValidSiteName = /^[a-zA-Z0-9_-]+$/.test(selectedOption.label);
      if (!isValidSiteName) {
        toast.error(
          "Invalid site name. Only hyphens ( - ), underscores ( _ ) and alphanumeric characters are allowed."
        );
        return;
      }
      const payload = {
        site_name: selectedOption.label,
        org_id: organization.value,
      };
      try {
        let endpoint = `${config.PATH}/api/add-site`;
        if (noteType === "hse") {
          endpoint = `${config.PATH}/api/create-hse-site`;
        }
        await axios.post(endpoint, payload);
      } catch (error) {
        console.log("Failed to create site:", error);
        return;
      }
    }
    setSite(selectedOption);
  };

  const customStyles = {
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
    menuList: (provided) => ({
      ...provided,
      maxHeight: "100px", // Adjust the value as needed
    }),
  };

  const currentData = noteType === "hse" ? hseAllData : allData;

  // const areasOptionsSet = new Set(currentData.data.map((e) => e.area));
  const areasOptionsSet = new Set(
  (currentData?.data || []).map((e) => e.area || "N/A")
);

  const areasOptions = Array.from(areasOptionsSet).map((area) => ({
    label: area,
    value: area,
  }));

  let filteredCategoriesSet = new Set(
    area.length > 0
      ? currentData.data
          .filter((entry) =>
            area.some((selectedArea) => selectedArea.label === entry.area)
          )
          .map((entry) => entry.category)
      : []
  );

  let categoriesOptions = Array.from(filteredCategoriesSet).map((category) => ({
    label: category,
    value: category,
  }));

  const handleSave = async () => {
    if (
      !title ||
      !description ||
      !organization ||
      !site ||
      (noteType === "hse" && (!selectedSector || !selectedParameter || !selectedArea || !noteType)) ||
      (noteType !== "hse" && (area.length === 0 || category.length === 0 || !noteType))
    ) {
      toast.warning("Please fill all the details before saving the note");
      return;
    }

    const newNote = {
      user_id: getAccountDetails().userId,
      title,
      observation: description,
      organization: organization ? organization.label : null,
      org_id: organization ? organization.value : null,
      site: site ? site.label : null,
      area: noteType === "hse" ? selectedArea.value:area[0].value,
      category: noteType === "hse"?"Category":category[0].value,
      imageUrls: imageUrls,
      note_type: noteType,
      sector_type:selectedSector?selectedSector.value:null,
      table_type:selectedParameter?selectedParameter.value:null
    };

    // console.log("payload",newNote)

    await axios.post(`${config.PATH}/api/create-note`, newNote);
    // Close the modal
    onClose();
    getAllNotes();
    resetFormFields();
    setNoteType(null);
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

  const handleImageChange = async (e) => {
    setLoading(true);
    const selectedFiles = e.target.files;

    // Check if files are selected
    if (!selectedFiles || selectedFiles.length === 0) {
      toast.warning("Please select one or more image files.");
      return;
    }

    const newImageUrls = [];

    // Loop through selected files and upload each one
    for (const file of selectedFiles) {
      // Check if the selected file is an image
      if (!file.type.startsWith("image/")) {
        toast.warning("Please select valid image files.");
        setLoading(false);
        return;
      }

      const compressedImage = await compressImage(file);

      // Upload the image to S3 and get the image URL
      const imageUrl = await uploadImage(compressedImage);

      // Add the new image URL to the array
      newImageUrls.push(imageUrl);
    }

    // Update state with the new image URLs
    setImageUrls([...imageUrls, ...newImageUrls]);
    setLoading(false);
  };

  const uploadImage = async (imageFile) => {
    const formData = new FormData();
    formData.append("image", imageFile);

    // Replace 'your-s3-upload-endpoint' with your actual S3 upload endpoint
    const response = await axios.post(
      `${config.PATH}/api/upload/image`,
      formData
    );

    const imageUrl = response.data.imageUrl; // Adjust the property based on your API response

    return imageUrl;
  };

  const resetFormFields = () => {
    setTitle("");
    setDescription("");
    setOrganization(null);
    setSite(null);
    setArea([]);
    setCategory([]);
    setImageUrls([]);
    setSelectedParameter(null)
    setSelectedSector(null)
    setSelectedArea(null)
  };

  const handleClose = () => {
    onClose();
    resetFormFields();
    setNoteType(null);
  };

  const handleRemoveImage = (index) => {
    const updatedImageUrls = [...imageUrls];
    updatedImageUrls.splice(index, 1);
    setImageUrls(updatedImageUrls);
  };

  const handleNoteTypeChange = (noteType) => {
    setNoteType(noteType);
    setOrganization(null);
    setSite(null);
    setArea([]);
    setCategory([]);
  };

  return (
    <>
      <ImageViewerModal
        imageUrl={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
      <Modal open={open} onClose={onClose}>
        <div className="new-note">
          <header>
            <h2>New Note</h2>
          </header>

          <section className="note-type-switch">
            <label>Note Type:</label>
            &nbsp;&nbsp;
            <div>
              <label>
                Electrical
                <input
                  type="radio"
                  value={noteType}
                  checked={noteType === "electrical"}
                  onChange={() => handleNoteTypeChange("electrical")}
                />
              </label>
              &nbsp;&nbsp;
              <label>
                HSE
                <input
                  type="radio"
                  value={noteType}
                  checked={noteType === "hse"}
                  onChange={() => handleNoteTypeChange("hse")}
                />
              </label>
            </div>
          </section>

          <section>
            <TextField
              label="Title"
              variant="outlined"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              margin="normal"
              style={{ background: "white", width: "59vw" }}
              multiline
              rows={4}
            />

            <TextareaAutosize
              aria-label="Description"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              minRows={3}
              style={{
                width: "100%",
                margin: "10px 0",
                height: "100px",
                overflow: "auto",
                fontFamily: "inherit",
              }}
            />
          </section>

          <section className="select-section">
            <div className="note-select-container ">
              <CreatableSelect
                options={organizationOptions}
                value={organization}
                onChange={handleOrganizationSelection}
                placeholder="Select Organization"
                isClearable
                styles={customStyles}
              />
            </div>

            <div className="note-select-container ">
              <CreatableSelect
                options={siteOptions}
                value={site}
                onChange={handleSiteSelection}
                placeholder="Select Site"
                isClearable
                styles={customStyles}
              />
            </div>
          </section>

          {noteType === "hse" ? (
            <section className="select-section" style={{gap:"5px"}}>
              <div className="note-select-container" >
                <Select
                  placeholder="Select Sector"
                  options={Array.from(
                    new Set(
                      hseAllData.data
                        .filter((item) => item.sector_type) // Removes null or undefined sector_type
                        .map((item) => item.sector_type) // Extracts the sector_type values
                    )
                  ).map((sector) => ({ value: sector, label: sector }))}
                  value={selectedSector}
                  onChange={setSelectedSector}
                />
              </div>

              <div className="note-select-container ">
                <Select
                  placeholder="Select Parameter"
                  options={Array.from(
                    new Set(filteredParameters.filter(item => item !== null))
                  ).map(item => ({
                    value: item,
                    label: item,
                  }))}
                  
                  value={selectedParameter}
                  onChange={setSelectedParameter}
                />
              </div>

              <div className="note-select-container ">
                <Select
                  placeholder="Select Area"
                  options={Array.from(new Set(filteredAreas))
                    .map(item => ({
                      value: item,
                      label: item,
                    }))
                  }
                  value={selectedArea}
                  onChange={setSelectedArea}
                />
              </div>
            </section>
          ) : (
            <section className="select-section">
              <div className="note-select-container ">
                <Select
                  options={areasOptions}
                  value={area}
                  onChange={(selectedOption) => {
                    setArea(selectedOption ? [selectedOption] : []); // Change here to handle single selection
                    setCategory([]);
                  }}
                  placeholder="Select Area"
                  isClearable
                  styles={customStyles}
                />
              </div>

              <div className="note-select-container ">
                <Select
                  options={categoriesOptions}
                  value={category}
                  onChange={(selectedOption) =>
                    setCategory(selectedOption ? [selectedOption] : [])
                  }
                  placeholder="Select Category"
                  isClearable
                  styles={customStyles}
                />
              </div>
            </section>
          )}
          {/* <section className="select-section">
            <div className="note-select-container ">
              <Select
                options={areasOptions}
                value={area}
                onChange={(selectedOption) => {
                  setArea(selectedOption ? [selectedOption] : []); // Change here to handle single selection
                  setCategory([]);
                }}
                placeholder="Select Area"
                isClearable
                styles={customStyles}
              />
            </div>

            <div className="note-select-container ">
              <Select
                options={categoriesOptions}
                value={category}
                onChange={(selectedOption) =>
                  setCategory(selectedOption ? [selectedOption] : [])
                }
                placeholder="Select Category"
                isClearable
                styles={customStyles}
              />
            </div>
          </section> */}

          <section className="image-upload-container">
            <label>Images :</label>
            {loading ? (
              <p className="uploading-text">Uploading Images...</p>
            ) : (
              <input
                type="file"
                onChange={handleImageChange}
                style={{ color: "transparent", width: "100px" }}
                multiple // Allow multiple file selection
              />
            )}

            {/* Display uploaded image URLs with remove button */}
            {imageUrls.map((imageUrl, index) => (
              <div key={index} className="uploaded-image">
                <p>{index + 1 + "."}</p>
                <img
                  src={imageUrl}
                  alt={`Uploaded ${index + 1}`}
                  onClick={() => setSelectedImage(imageUrl)} // Set selected image on click
                  style={{ cursor: "pointer" }}
                />
                <CancelIcon
                  style={{ cursor: "pointer" }}
                  onClick={() => handleRemoveImage(index)}
                />
              </div>
            ))}
          </section>

          <footer>
            <Button onClick={handleSave} variant="contained" color="primary">
              Save
            </Button>
            <Button onClick={handleClose} variant="contained" color="secondary">
              Cancel
            </Button>
          </footer>
        </div>
      </Modal>
    </>
  );
};

export default NewNote;
