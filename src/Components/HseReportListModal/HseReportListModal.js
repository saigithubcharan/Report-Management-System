import React, { useState, useEffect } from "react";
import { Modal, Typography, IconButton, Menu, MenuItem } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Select from "react-select";
import axios from "../../APIs/axios";
import { config } from "../../config";
import HseSavedReportModal from "../HseSavedReportModal/HseSavedReportModal";
import ViewHseReportDetails from "../ViewHseReportDetails/ViewHseReportDetails";
import { toast, ToastContainer } from "react-toastify";
import "./HseReportListModal.css";

const HseReportListModal = ({
  setOpenReportList,
  allReports,
  allData,
  openReportList,
  getAllHseData,
  getAllHseReports,
  module,
}) => {
  const [selectedFilters, setSelectedFilters] = useState({
    organization: null,
    site: null,
    reportId: null,
  });
  const [selectedReportData, setSelectedReportData] = useState({});
  const [openSavedReport, setOpenSavedReport] = useState(false);
  const [openViewReport, setOpenViewReport] = useState(false);
  const [reportHeader, setReportHeaders] = useState();
  const [anchorEl, setAnchorEl] = useState(null);
  const [optionsMenuReportId, setOptionsMenuReportId] = useState(null);
  const [reportOptions, setReportOptions] = useState([]);
  const [exp, setExp] = useState(false)

  useEffect(() => {
    const getReportHeaders = async () => {
      try {
        const response = await axios.get(`${config.PATH}/api/get-hse-headers`);
        setReportHeaders(response.data);
      } catch (err) {
        console.log(err);
      }
    };
    getReportHeaders();
  }, []);

  useEffect(() => {
    filterReportOptions();
  }, [
    selectedFilters.organization,
    selectedFilters.site,
    selectedFilters.reportId,
  ]);

  // const filterReportOptions = () => {
  //   let filteredOptions = allReports;
  //   if (selectedFilters.organization) {
  //     filteredOptions = filteredOptions.filter(
  //       (report) => report.organization === selectedFilters.organization.value
  //     );
  //   }
  //   if (selectedFilters.site) {
  //     filteredOptions = filteredOptions.filter(
  //       (report) => report.site === selectedFilters.site.value
  //     );
  //   }
  //   if (selectedFilters.reportId) {
  //     filteredOptions = filteredOptions.filter(
  //       (report) => report.report_id === selectedFilters.reportId.value
  //     );
  //   }

  //   setReportOptions(
  //     filteredOptions.map((report) => ({
  //       value: report.report_id,
  //       label: report.report_id,
  //     }))
  //   );
  // };

  const filterReportOptions = () => {
    let filteredOptions = allReports;
    if (selectedFilters.organization) {
      filteredOptions = filteredOptions.filter(
        (report) => report.organization === selectedFilters.organization.value
      );
    }
    if (selectedFilters.site) {
      filteredOptions = filteredOptions.filter(
        (report) => report.site === selectedFilters.site.value
      );
    }
    if (selectedFilters.reportId) {
      filteredOptions = filteredOptions.filter(
        (report) => report.report_id === selectedFilters.reportId.value
      );
    }

    // Sort filteredOptions by date_time field
    filteredOptions.sort(
      (a, b) => new Date(b.date_time) - new Date(a.date_time)
    );

    setReportOptions(
      filteredOptions.map((report) => ({
        value: report.report_id,
        label: report.report_id,
      }))
    );
  };

  const handleClose = () => {
    setOpenReportList(false);
  };

  const handleFilterChange = (selectedOption, filterName) => {
    setSelectedFilters((prevFilters) => ({
      ...prevFilters,
      [filterName]: selectedOption,
    }));
  };

  const handleOpenOptionsMenu = (event, report_id) => {
    setAnchorEl(event.currentTarget);
    setOptionsMenuReportId(report_id);
  };

  const handleCloseOptionsMenu = () => {
    setAnchorEl(null);
    setOptionsMenuReportId(null);
  };

  const handleGetReportById = async (report_id, exp) => {
    try {
      // setLoading(true)
      const endpoint =
        module === "cmv"
          ? `${config.PATH}/api/hse-cmv-report/${report_id}`
          : `${config.PATH}/api/hse-report/${report_id}`;
      const report = await axios.get(endpoint);
      setSelectedReportData(report.data);
      //  console.log("selecyed data",report.data.AllObservations)
      setOpenSavedReport(true);
      setExp(exp)
      // setLoading(false)
    } catch (err) {
      console.log(err);
    }
  };

  const handleViewReport = async (report_id) => {
    try {
      const endpoint =
        module === "cmv"
          ? `${config.PATH}/api/hse-cmv-report/${report_id}`
          : `${config.PATH}/api/hse-report/${report_id}`;
      const report = await axios.get(endpoint);
      setSelectedReportData(report.data);
      setOpenViewReport(true);
    } catch (err) {
      console.log(err);
    }
  };

  const searchAndUpdateOrgAndSiteReportCreatedStatus = async (org_id, site) => {
    try {
      await axios.post(`${config.PATH}/api/search-update-hse-org-report-status/${org_id}`)
      await axios.post(`${config.PATH}/api/search-update-hse-site-report-status/${org_id}/${site}`)
    } catch (error) {
      console.log(error.message)
    }
  }

  const deleteReport = async (report_id, org_id, site) => {
    try {
      const userConfirmed = window.confirm(
        "Are you sure you want to delete this report? This action cannot be undone."
      );

      if (!userConfirmed) {
        return;
      }

      const endpoint =
        module === "cmv"
          ? `${config.PATH}/api/delete-hse-cmv-report/${report_id}`
          : `${config.PATH}/api/delete-hse-report/${report_id}`;

      const response = await axios.delete(endpoint);

      if (module==="cmv") {
        await axios.post(`${config.PATH}/api/update-hse-report-complete-status/${report_id}`)
      }

      setReportOptions((prevOptions) =>
        prevOptions.filter((option) => option.value !== report_id)
      );
      searchAndUpdateOrgAndSiteReportCreatedStatus(org_id, site)
      getAllHseReports();
      toast.warning("Report Deleted Successfully.");
    } catch (err) {
      console.error("Error deleting report:", err);
    }
  };

  return (
    <div>
      <Modal open={openReportList} onClose={handleClose}>
        <div className="report-list-container">
          <div className="report-list-content">
            <div className="report-list-header" style={{color:"#efc71d"}}>
              <Typography variant="h5">{module==="cmv"?"HSE CMV Report List":"HSE Report List"}</Typography>
              <IconButton
                size="small"
                onClick={handleClose}
                className="close-icon"
                style={{backgroundColor:"#efc71d"}}
              >
                <CloseIcon style={{color:"#307248"}} />
              </IconButton>
            </div>
            <div className="report-list-filter">
              <div >
                <Select
                  options={[
                    ...new Set(allReports.map((report) => report.organization)),
                  ].map((organization) => ({
                    value: organization,
                    label: organization,
                  }))}
                  value={selectedFilters.organization}
                  onChange={(selectedOption) =>
                    handleFilterChange(selectedOption, "organization")
                  }
                  placeholder="Search by Organization..."
                  isClearable={true}
                />
              </div>
              <div >
                <Select
                  options={
                    selectedFilters.organization
                      ? allReports
                          .filter(
                            (report) =>
                              report.organization ===
                              selectedFilters.organization.value
                          )
                          .map((report) => report.site)
                          .filter(
                            (site, index, self) => self.indexOf(site) === index
                          )
                          .map((site) => ({ value: site, label: site }))
                      : allReports
                          .map((report) => report.site)
                          .filter(
                            (site, index, self) => self.indexOf(site) === index
                          )
                          .map((site) => ({ value: site, label: site }))
                  }
                  value={selectedFilters.site}
                  onChange={(selectedOption) =>
                    handleFilterChange(selectedOption, "site")
                  }
                  placeholder="Search by Site..."
                  isClearable={true}
                />
              </div>
              <div >
                <Select
                  options={reportOptions}
                  value={selectedFilters.reportId}
                  onChange={(selectedOption) =>
                    handleFilterChange(selectedOption, "reportId")
                  }
                  placeholder="Search by Report ID..."
                  isClearable={true}
                />
              </div>
            </div>
            <br />
            <div className="report-list-body">
              {reportOptions.length === 0 ? (
                <div className="no-saved-reports">No Reports Found</div>
              ) : (
                reportOptions.map((report) => {
                  const currentReport = allReports.find(
                    (r) => r.report_id === report.value
                  );
                  if (currentReport && currentReport.is_complete !== 1 || module==="cmv") {
                    return (
                      <div key={report.value} className="report-item-box">
                        <div className="">
                          <span>
                            Organization: {currentReport.organization}
                          </span>
                          <br />
                          <span>Site: {currentReport.site}</span>
                          <br />
                          <span>Report ID: {report.label}</span>
                        </div>
                        <div>
                          <IconButton
                            aria-label="more"
                            aria-controls="long-menu"
                            aria-haspopup="true"
                            onClick={(e) =>
                              handleOpenOptionsMenu(e, report.value)
                            }
                            className="view-report-button"
                            // style={{ background: "#efc71d", color: "black" }}
                          >
                            <MoreVertIcon />
                          </IconButton>
                          <Menu
                            id="long-menu"
                            anchorEl={anchorEl}
                            keepMounted
                            open={Boolean(
                              anchorEl && optionsMenuReportId === report.value
                            )}
                            onClose={handleCloseOptionsMenu}
                          >
                            {module!=="cmv"?<MenuItem
                              onClick={() => handleViewReport(report.value)}
                            >
                              View
                            </MenuItem>:null}
                            <MenuItem
                              onClick={() =>
                                handleGetReportById(report.value)
                              }
                            >
                              {`${module==="cmv"?"ReAudit":"Edit"}`}
                            </MenuItem>
                            <MenuItem
                              onClick={() => deleteReport(report.value, currentReport.org_id, currentReport.site)}
                            >
                              Delete
                            </MenuItem>
                          </Menu>
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div key={report.value} className="report-item-box">
                        <div >
                          <span>
                            Organization: {currentReport.organization}
                          </span>
                          <br />
                          <span>Site: {currentReport.site}</span>
                          <br />
                          <span>Report ID: {report.label}</span>
                        </div>
                        <div>
                          <IconButton
                            aria-label="more"
                            aria-controls="long-menu"
                            aria-haspopup="true"
                            onClick={(e) =>
                              handleOpenOptionsMenu(e, report.value)
                            }
                            className="view-report-button"
                            // style={{ background: "#efc71d", color: "black" }}
                          >
                            <MoreVertIcon />
                          </IconButton>
                          <Menu
                            id="long-menu"
                            anchorEl={anchorEl}
                            keepMounted
                            open={Boolean(
                              anchorEl && optionsMenuReportId === report.value
                            )}
                            onClose={handleCloseOptionsMenu}
                          >
                            <MenuItem
                              onClick={() => handleViewReport(report.value)}
                            >
                              View
                            </MenuItem>
                            {/* <MenuItem
                               onClick={() =>
                                handleGetReportById(report.value, true)
                              }
                            >
                              Export
                            </MenuItem> */}
                          </Menu>
                        </div>
                      </div>
                    );
                  }
                })
              )}
            </div>
          </div>
        </div>
      </Modal>
      {openSavedReport && (
        <HseSavedReportModal
          selectedReportData={selectedReportData}
          setOpenSavedReport={setOpenSavedReport}
          allData={allData}
          setOpenReportList={setOpenReportList}
          reportHeader={reportHeader}
          handleGetReportById={handleGetReportById}
          getAllHseData={getAllHseData}
          module={module}
          getAllHseReports={getAllHseReports}
          exp = {exp}
        />
      )}
      {openViewReport && (
        <ViewHseReportDetails
          selectedReportData={selectedReportData}
          setOpenViewReport={setOpenViewReport}
          reportHeader={reportHeader}
        />
      )}
    </div>
  );
};

export default HseReportListModal;
