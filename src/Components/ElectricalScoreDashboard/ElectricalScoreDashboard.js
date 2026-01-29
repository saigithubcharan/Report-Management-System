import React, { useState, useEffect } from "react";
import axios from "../../APIs/axios";
import { config } from "../../config";
import Select from "react-select";
import "./ElectricalScoreDashboard.css";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

import { getAccountDetails } from "../Services/localStorage";

const ElectricalScoreDashboard = ({ allReports }) => {
  const [orgList, setOrgList] = useState([]);
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [siteOptions, setSiteOptions] = useState(null);
  const {userId} = getAccountDetails();
  const [scores, setScores] = useState([
    {
      "Electrical Safety": "Design & Installation",
      "Max Score": 0,
      "Score Obtained": 0,
    },
    {
      "Electrical Safety": "Preventive maintenance",
      "Max Score": 0,
      "Score Obtained": 0,
    },
    {
      "Electrical Safety": "Competency/Training",
      "Max Score": 0,
      "Score Obtained": 0,
    },
    {
      "Electrical Safety": "Lock out-Tag out",
      "Max Score": 0,
      "Score Obtained": 0,
    },
    {
      "Electrical Safety": "Drawings (As built) / Documents",
      "Max Score": 0,
      "Score Obtained": 0,
    },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let params = {user_id:userId};

        if (selectedOrganization) {
          params.organization = selectedOrganization.label;
        }

        if (selectedSite) {
          params.site = selectedSite.label;
        }

        if (selectedReportId) {
          params.report_id = selectedReportId.label;
        }

        const res = await axios.get(
          `${config.PATH}/api/electrical-dashboard-score`,
          { params }
        );

        // Reset the scores before updating them
        const resetScores = [
          {
            "Electrical Safety": "Design & Installation",
            "Max Score": 0,
            "Score Obtained": 0,
          },
          {
            "Electrical Safety": "Preventive maintenance",
            "Max Score": 0,
            "Score Obtained": 0,
          },
          {
            "Electrical Safety": "Competency/Training",
            "Max Score": 0,
            "Score Obtained": 0,
          },
          {
            "Electrical Safety": "Lock out-Tag out",
            "Max Score": 0,
            "Score Obtained": 0,
          },
          {
            "Electrical Safety": "Drawings (As built) / Documents",
            "Max Score": 0,
            "Score Obtained": 0,
          },
        ];

        setScores(resetScores);

        // Update the scores state by adding all max scores and obtained scores
        const updatedScores = [...resetScores]; // Make a copy of the resetScores to avoid mutating it

        res.data.forEach((report) => {
          report.scores.forEach((score) => {
            const categoryIndex = updatedScores.findIndex(
              (category) => category["Electrical Safety"] === score["Electrical Safety"]
            );

            if (categoryIndex !== -1) {
              updatedScores[categoryIndex]["Max Score"] += score["Max Score"];
              updatedScores[categoryIndex]["Score Obtained"] += score["Score Obtained"];
            }
          });
        });

        setScores(updatedScores);
      } catch (error) {
        console.error("Error fetching scores:", error.message);
        setScores([
          {
            "Electrical Safety": "Design & Installation",
            "Max Score": 0,
            "Score Obtained": 0,
          },
          {
            "Electrical Safety": "Preventive maintenance",
            "Max Score": 0,
            "Score Obtained": 0,
          },
          {
            "Electrical Safety": "Competency/Training",
            "Max Score": 0,
            "Score Obtained": 0,
          },
          {
            "Electrical Safety": "Lock out-Tag out",
            "Max Score": 0,
            "Score Obtained": 0,
          },
          {
            "Electrical Safety": "Drawings (As built) / Documents",
            "Max Score": 0,
            "Score Obtained": 0,
          },
        ]);
      }
    };

    fetchData();
  }, [selectedOrganization, selectedSite, selectedReportId,userId]);

  useEffect(() => {
    getOrgList();
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

  const getOrgList = async () => {
    try {
      const response = await axios.get(`${config.PATH}/api/organizations`);
      setOrgList(response.data);
    } catch (error) {
      console.log("Error:", error.response?.data?.error || error.message);
    }
  };

  const organizationOptions = orgList.map((e) => ({
    label: e.org_name,
    value: e.id,
  }));

    const reportIdOptions = allReports
    .filter((report) => {
      // Filter reports based on selected organization and site
      return (
        (!selectedOrganization ||
          report.org_id === selectedOrganization.value) &&
        (!selectedSite || report.site === selectedSite.value)
      );
    })
    .map((e) => ({
      label: e.report_id,
      value: e.report_id,
    }));

  const handleOrganizationSelection = async (selectedOption) => {
    setSelectedOrganization(selectedOption);
    setSelectedSite(null);
    setSelectedReportId(null);
  };

  const handleSiteSelection = (selectedOption) => {
    setSelectedSite(selectedOption);
    setSelectedReportId(null);
  };

  const handleReportIdSelection = async (selectedOption) => {
    setSelectedReportId(selectedOption);
  };

  return (
    <div>
      <div className="electrical-org-site-container">
        <div className="electrical-select-wrapper">
          <Select
            options={organizationOptions}
            placeholder="Select Organization"
            onChange={handleOrganizationSelection}
            isClearable
          />
        </div>
        <div className="electrical-select-wrapper">
          <Select
            options={siteOptions}
            placeholder="Select Site"
            onChange={handleSiteSelection}
            value={selectedSite}
            isClearable
            isDisabled={!selectedOrganization}
          />
        </div>
        <div className="electrical-select-wrapper">
          <Select
            options={reportIdOptions}
            placeholder="Report ID"
            onChange={handleReportIdSelection}
            value={selectedReportId}
            isClearable
            isDisabled={!selectedSite}
          />
        </div>
      </div>
      <div className="dashboard-table-container">
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow style={{backgroundColor:"red"}}>
                <TableCell>Electrical Safety</TableCell>
                <TableCell>Max Score</TableCell>
                <TableCell>Score Obtained</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {scores.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row["Electrical Safety"]}</TableCell>
                  <TableCell>{row["Max Score"]}</TableCell>
                  <TableCell>{row["Score Obtained"]>0?row["Score Obtained"].toFixed(2):0}</TableCell>
                </TableRow>
              ))}
              <TableRow style={{ background: "#efc71d" }}>
                <TableCell>Cumulative</TableCell>
                <TableCell style={{ fontWeight: "bold" }}>
                  {scores.reduce((sum, category) => sum + category["Max Score"], 0)}
                </TableCell>
                <TableCell style={{ fontWeight: "bold" }}>
                  {scores.reduce((sum, category) => sum + category["Score Obtained"], 0)>0?scores.reduce((sum, category) => sum + category["Score Obtained"], 0).toFixed(2):0}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
};

export default ElectricalScoreDashboard;

