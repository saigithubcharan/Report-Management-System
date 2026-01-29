import React, { useState, useEffect } from "react";
import axios from "../../APIs/axios";
import { config } from "../../config";
import Select from "react-select";
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

const CmvElectricalDashboard = ({ allReports }) => {
  const [orgList, setOrgList] = useState([]);
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [siteOptions, setSiteOptions] = useState(null);
  const { userId } = getAccountDetails();
  const [scores, setScores] = useState([
    {
      "Electrical Safety": "Design & Installation",
      "Maximum Score": 0,
      "Score Obtained": 0,
    },
    {
      "Electrical Safety": "Preventive maintenance",
      "Maximum Score": 0,
      "Score Obtained": 0,
    },
    {
      "Electrical Safety": "Training",
      "Maximum Score": 0,
      "Score Obtained": 0,
    },
    {
      "Electrical Safety": "Lock out Tag out",
      "Maximum Score": 0,
      "Score Obtained": 0,
    },
    {
      "Electrical Safety": "Drawings (As- built) /Documents",
      "Maximum Score": 0,
      "Score Obtained": 0,
    },
  ]);
  const [cmvScores, setCmvScores] = useState([
    {
      "Electrical Safety": "Design & Installation",
      "New Obtained Score": 0,
    },
    {
      "Electrical Safety": "Preventive maintenance",
      "New Obtained Score": 0,
    },
    {
      "Electrical Safety": "Training",
      "New Obtained Score": 0,
    },
    {
      "Electrical Safety": "Lock out Tag out",
      "New Obtained Score": 0,
    },
    {
      "Electrical Safety": "Drawings (As- built) /Documents",
      "New Obtained Score": 0,
    },
  ]);
  const [showNewScore, setShowNewScore] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // let params = {user_id:userId, type:"cmv"};
        let params = { user_id: userId };

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

        const resetScores = [
          {
            "Electrical Safety": "Design & Installation",
            "Maximum Score": 0,
            "Score Obtained": 0,
          },
          {
            "Electrical Safety": "Preventive maintenance",
            "Maximum Score": 0,
            "Score Obtained": 0,
          },
          {
            "Electrical Safety": "Training",
            "Maximum Score": 0,
            "Score Obtained": 0,
          },
          {
            "Electrical Safety": "Lock out Tag out",
            "Maximum Score": 0,
            "Score Obtained": 0,
          },
          {
            "Electrical Safety": "Drawings (As- built) /Documents",
            "Maximum Score": 0,
            "Score Obtained": 0,
          },
        ];

        setScores(resetScores);

        const updatedScores = [...resetScores];

        res.data.forEach((report) => {
          report.scores.forEach((score) => {
            const categoryIndex = updatedScores.findIndex(
              (category) =>
                category["Electrical Safety"] === score["Electrical Safety"]
            );

            if (categoryIndex !== -1) {
              updatedScores[categoryIndex]["Maximum Score"] += score["Maximum Score"];
              updatedScores[categoryIndex]["Score Obtained"] +=
                score["Score Obtained"];
            }
          });
        });

        setScores(updatedScores);
      } catch (error) {
        console.error("Error fetching scores:", error.message);
        setScores([
          {
            "Electrical Safety": "Design & Installation",
            "Maximum Score": 0,
            "Score Obtained": 0,
          },
          {
            "Electrical Safety": "Preventive maintenance",
            "Maximum Score": 0,
            "Score Obtained": 0,
          },
          {
            "Electrical Safety": "Training",
            "Maximum Score": 0,
            "Score Obtained": 0,
          },
          {
            "Electrical Safety": "Lock out Tag out",
            "Maximum Score": 0,
            "Score Obtained": 0,
          },
          {
            "Electrical Safety": "Drawings (As- built) /Documents",
            "Maximum Score": 0,
            "Score Obtained": 0,
          },
        ]);
      }
    };

    fetchData();
  }, [selectedOrganization, selectedSite, selectedReportId, userId]);

  useEffect(() => {
    getOrgList();
    const getSitesByOrganization = async (orgId) => {
      try {
        const res = await axios.get(
          `${config.PATH}/api/organizations/${orgId}/sites`
        );
        const response = res.data.filter((e) => e.report_created === true);
        const siteOptions = response.map((site) => ({
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
    const fetchCmvScores = async () => {
      try {
        let params = { user_id: userId };

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
          `${config.PATH}/api/cmv-electrical-dashboard-score`,
          { params }
        );

        if(res.data && res.data.length > 0) {
          setShowNewScore(true);
        } else {
          setShowNewScore(false)
        }

        const resetCmvScores = [
          {
            "Electrical Safety": "Design & Installation",
            "New Obtained Score": 0,
          },
          {
            "Electrical Safety": "Preventive maintenance",
            "New Obtained Score": 0,
          },
          {
            "Electrical Safety": "Training",
            "New Obtained Score": 0,
          },
          {
            "Electrical Safety": "Lock out Tag out",
            "New Obtained Score": 0,
          },
          {
            "Electrical Safety": "Drawings (As- built) /Documents",
            "New Obtained Score": 0,
          },
        ];

        setCmvScores(resetCmvScores);

        const updatedCmvScores = [...resetCmvScores];

        res.data.forEach((report) => {
          report.scores.forEach((score) => {
            const categoryIndex = updatedCmvScores.findIndex(
              (category) =>
                category["Electrical Safety"] === score["Electrical Safety"]
            );

            if (categoryIndex !== -1) {
              updatedCmvScores[categoryIndex]["New Obtained Score"] +=
                score["Score Obtained"];
            }
          });
        });

        setCmvScores(updatedCmvScores);
      } catch (error) {
        console.error("Error fetching CMV scores:", error.message);
        setCmvScores([
          {
            "Electrical Safety": "Design & Installation",
            "New Obtained Score": 0,
          },
          {
            "Electrical Safety": "Preventive maintenance",
            "New Obtained Score": 0,
          },
          {
            "Electrical Safety": "Training",
            "New Obtained Score": 0,
          },
          {
            "Electrical Safety": "Lock out Tag out",
            "New Obtained Score": 0,
          },
          {
            "Electrical Safety": "Drawings (As- built) /Documents",
            "New Obtained Score": 0,
          },
        ]);
        setShowNewScore(false);
      }
    };

    fetchCmvScores();
  }, [selectedOrganization, selectedSite, selectedReportId, userId]);

  const getOrgList = async () => {
    try {
      const response = await axios.get(`${config.PATH}/api/organizations`);
      const cmvDoneOrgs = response.data.filter((e) => e.report_created === 1);
      setOrgList(cmvDoneOrgs);
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
    // console.log(selectedOption)
    setSelectedOrganization(selectedOption);
    setSelectedSite(null);
    setSelectedReportId(null);
  };

  const handleSiteSelection = (selectedOption) => {
    // console.log(selectedOption)
    setSelectedSite(selectedOption);
    setSelectedReportId(null);
  };

  const handleReportIdSelection = async (selectedOption) => {
    setSelectedReportId(selectedOption);
    // console.log(selectedReportId)

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
        {selectedReportId ?
        <></> : <p>Kindly select above parameter ⬆️ to see reports details in below table</p> }
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow style={{ background: "grey" }}>
                <TableCell>Electrical Safety</TableCell>
                <TableCell>Max Score</TableCell>
                <TableCell>Score Obtained</TableCell>
                {showNewScore ? (
                  <TableCell>New Score Obtained</TableCell>
                ) : null}
              </TableRow>
            </TableHead>
            <TableBody>
              {scores.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row["Electrical Safety"]}</TableCell>
                  <TableCell>{row["Maximum Score"]}</TableCell>
                  <TableCell>
                    {row["Score Obtained"] > 0
                      ? row["Score Obtained"].toFixed(2)
                      : 0}
                  </TableCell>
                  {showNewScore ?
                    <TableCell>
                      {cmvScores[index]["New Obtained Score"] > 0
                        ? cmvScores[index]["New Obtained Score"].toFixed(2)
                        : 0}
                    </TableCell>
                    :
                    null
                  }
                </TableRow>
              ))}
              <TableRow style={{ background: "#efc71d" }}>
                <TableCell>Cumulative</TableCell>
                <TableCell style={{ fontWeight: "bold" }}>
                  {scores.reduce(
                    (sum, category) => sum + category["Maximum Score"],
                    0
                  )}
                </TableCell>
                <TableCell style={{ fontWeight: "bold" }}>
                  {scores.reduce(
                    (sum, category) => sum + category["Score Obtained"],
                    0
                  ) > 0
                    ? scores
                      .reduce(
                        (sum, category) => sum + category["Score Obtained"],
                        0
                      )
                      .toFixed(2)
                    : 0}
                </TableCell>
                {showNewScore ? <TableCell style={{ fontWeight: "bold" }}>
                  {cmvScores.reduce(
                    (sum, category) => sum + category["New Obtained Score"],
                    0
                  ) > 0
                    ? cmvScores
                      .reduce(
                        (sum, category) =>
                          sum + category["New Obtained Score"],
                        0
                      )
                      .toFixed(2)
                    : 0}{" "}
                </TableCell> : null}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        
      </div>
    </div>
  );
};

export default CmvElectricalDashboard;
