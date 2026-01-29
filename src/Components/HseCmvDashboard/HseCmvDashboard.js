import React, { useEffect, useState } from "react";
import Select from "react-select";
import axios from "../../APIs/axios";
import { config } from "../../config";
import Chart from "react-apexcharts";
// import domtoimage from "dom-to-image";
// import jsPDF from "jspdf";
// import DownloadIcon from "@mui/icons-material/Download";
import { getAccountDetails } from "../Services/localStorage";
import "./HseCmvDashboard.css";

const HseCmvDashboard = ({ allHseReports }) => {
  const [orgList, setOrgList] = useState([]);
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [siteOptions, setSiteOptions] = useState([]);
  const [scorePercent, setScorePercent] = useState(0);
  const [cmvScorePercent, setCmvScorePercent] = useState(0);
  const [data, setData] = useState([]);
  const [cmvData, setCmvData] = useState([]);
  const [clickedArea, setClickedArea] = useState(null);
  const [isTableVisible, setIsTableVisible] = useState(false);
  const tableRef = React.createRef();
  const { userId } = getAccountDetails();
  const [dataType, setDataType] = useState();

  useEffect(() => {
    // Add event listeners for click outside and escape key
    const handleOutsideClick = (e) => {
      if (tableRef.current && !tableRef.current.contains(e.target)) {
        handleCloseButtonClick();
      }
    };

    const handleEscapeKey = (e) => {
      if (e.key === "Escape") {
        handleCloseButtonClick();
      }
    };

    document.addEventListener("click", handleOutsideClick);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      // Cleanup event listeners on component unmount
      document.removeEventListener("click", handleOutsideClick);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  useEffect(() => {
    getOrgList();
    const getSitesByOrganization = async (orgId) => {
      try {
        const res = await axios.get(
          `${config.PATH}/api/hse-organizations/${orgId}/sites`
        );
        const response = res.data.filter(e => e.report_created === true)
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
  }, [selectedOrganization, selectedSite, selectedReportId]);

  useEffect(() => {
    const fetchData = async () => {
      const payload = {
        organization: selectedOrganization ? selectedOrganization.label : null,
        site: selectedSite ? selectedSite.label : null,
        report_id: selectedReportId ? selectedReportId.label : null,
        user_id: userId,
      };

      try {
        const res = await axios.get(`${config.PATH}/api/hse-dashboard-data`, {
          params: payload,
        });

        const totalScore =
          res.data.length > 0
            ? res.data
                .map((e) => e.score)
                .reduce((acc, score) => acc + score, 0)
            : 0;

        const percentage = Math.floor(
          (totalScore / (res.data.length * 5)) * 100
        );

        const cmvRes = await axios.get(
          `${config.PATH}/api/cmv-hse-dashboard-data`,
          { params: payload }
        );

        const cmvTotalScore =
          cmvRes.data.length > 0
            ? cmvRes.data
                .map((e) => e.score)
                .reduce((acc, score) => acc + score, 0)
            : 0;

        const cmvPercentage = Math.floor(
          (cmvTotalScore / (cmvRes.data.length * 5)) * 100
        );

        setScorePercent(isNaN(percentage) ? 0 : percentage);
        setData(res.data);
        setCmvScorePercent(isNaN(cmvPercentage) ? 0 : cmvPercentage);
        setCmvData(cmvRes.data);
      } catch (error) {
        console.log("Error:", error.response?.data?.error || error.message);
      }
    };

    fetchData(); // Call the fetchData function immediately
  }, [selectedOrganization, selectedSite, selectedReportId]); // Add dependencies to the dependency array

  const getOrgList = async () => {
    try {
      const response = await axios.get(`${config.PATH}/api/get-hse-orgs`);
      const cmvDoneOrgs = response.data.filter(e => e.report_created === 1)
      setOrgList(cmvDoneOrgs);
    } catch (error) {
      console.log("Error:", error.response?.data?.error || error.message);
    }
  };

  const organizationOptions = orgList.map((e) => ({
    label: e.org_name,
    value: e.id,
  }));

  const handleOrganizationSelection = async (selectedOption) => {
    setSelectedOrganization(selectedOption);
    setSelectedSite(null);
    setSelectedReportId(null);
    setScorePercent(0);
    setCmvScorePercent(0);
  };

  // const handleSiteSelection = async (selectedOption) => {
  //   setSelectedSite(selectedOption);
  //   const payload = {
  //     organization: selectedOrganization.label,
  //     site: selectedSite.label,
  //   };

  //   try {
  //     const res = await axios.get(`${config.PATH}/api/total-electrical-score`, {
  //       params: payload,
  //     });

  //     // Assuming res.data is an array of scores
  //     const totalScore =
  //       res.data.length > 0
  //         ? res.data.reduce((acc, score) => acc + score, 0)
  //         : 0;
  //     const percentage = Math.floor((totalScore / (res.data.length * 5)) * 100)
  //       ? Math.floor((totalScore / (res.data.length * 5)) * 100)
  //       : 0;

  //     // Do something with the totalScore (e.g., set it in the state)
  //     setScorePercent(percentage);
  //   } catch (error) {
  //     console.log("Error:", error.response?.data?.error || error.message);
  //   }
  // };

  const handleSiteSelection = (selectedOption) => {
    setSelectedSite(selectedOption);
    setSelectedReportId(null);
  };

  const reportIdOptions = allHseReports
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

  const handleReportIdSelection = (selectedOption) => {
    setSelectedReportId(selectedOption);
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
      style: {
        fontSize: 9,
      },
    },
    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: "center",
      fontSize: 12,
      fontWeight: "bold",
      markers: {
        width: 12,
        height: 12,
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

  const cmvPieOptions = {
    labels: [
      `Obtained Score(${cmvScorePercent}%)`,
      `Remaining Score(${100 - cmvScorePercent}%)`,
    ],
    colors: [getScoreColor(cmvScorePercent), "grey"],
    dataLabels: {
      enabled: true,
      style: {
        fontSize: 9,
      },
    },
    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: "center",
      fontSize: 12,
      fontWeight: "bold",
      markers: {
        width: 12,
        height: 12,
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

  const newAreaCounts = cmvData.reduce((counts, entry) => {
    const area = entry.area;
    counts[area] = (counts[area] || 0) + 1;
    return counts;
  }, {});

  const newAreasForAreaChart = Object.keys(newAreaCounts);
  const newCounts = newAreasForAreaChart.map((area) => {
    const areaScore = cmvData
      .filter((entry) => entry.area === area)
      .reduce((acc, entry) => acc + (entry.score || 0), 0);
    const totalPossibleScore =
      cmvData.filter((entry) => entry.area === area).length * 5;
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
    colors: ["#005cdb", "#ff7f0e"],
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
        columnWidth: "40%",
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
        fontSize: "8px",
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
    legend: {
      markers: {
        fillColors: ["#005cdb", "#ff7f0e"], // Set colors for legend markers
      },
      labels: {
        colors: ["#000000"],
        useSeriesColors: false,
        formatter: function (seriesName, opts) {
          return seriesName === "#005cdb" ? "Old" : "New"; // Customize legend labels
        },
      },
    },
  };

  const newBarOptions = {
    chart: {
      id: "bar-chart",
    },
    colors: ["#005cdb", "#ff7f0e"],
    xaxis: {
      categories: newAreasForAreaChart.map((area) => {
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
        columnWidth: "40%",
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
        fontSize: "8px",
        colors: ["#304758"],
      },
    },
    tooltip: {
      y: {
        formatter: function (value, { dataPointIndex }) {
          // Display the full area name on hover
          const area = newAreasForAreaChart[dataPointIndex];
          return `${area}: ${value}%`; // Show area name along with percentage
        },
      },
    },
    legend: {
      markers: {
        fillColors: ["#005cdb", "#ff7f0e"], // Set colors for legend markers
      },
      labels: {
        colors: ["#000000"],
        useSeriesColors: false,
        formatter: function (seriesName, opts) {
          return seriesName === "#005cdb" ? "Old" : "New"; // Customize legend labels
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

  // Group the data by area and severity
  const cmvAreaSeverityData = cmvData.reduce((result, entry) => {
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
  const cmvAreas = Object.keys(cmvAreaSeverityData);
  const severityChartData = Object.keys(areaSeverityData).map((area) => ({
    name: area,
    High: areaSeverityData[area].High,
    Medium: areaSeverityData[area].Medium,
    Low: areaSeverityData[area].Low,
  }));

  const cmvSeverityChartData = Object.keys(cmvAreaSeverityData).map((area) => ({
    name: area,
    High: cmvAreaSeverityData[area].High,
    Medium: cmvAreaSeverityData[area].Medium,
    Low: cmvAreaSeverityData[area].Low,
  }));

  // Transpose the data to match the series structure
  const transposedData = {
    High: [],
    Medium: [],
    Low: [],
  };

  const cmvTransposedData = {
    High: [],
    Medium: [],
    Low: [],
  };

  severityChartData.forEach((area) => {
    transposedData.High.push(area.High);
    transposedData.Medium.push(area.Medium);
    transposedData.Low.push(area.Low);
  });

  cmvSeverityChartData.forEach((area) => {
    cmvTransposedData.High.push(area.High);
    cmvTransposedData.Medium.push(area.Medium);
    cmvTransposedData.Low.push(area.Low);
  });

  // Prepare series data with specific colors for each severity level
  const newSeriesData = [
    { name: "Old High", data: [] },
    { name: "New High", data: [] },
    { name: "Old Medium", data: [] },
    { name: "New Medium", data: [] },
    { name: "Old Low", data: [] },
    { name: "New Low", data: [] },
  ];

  // areas.concat(cmvAreas).forEach((area) => {
  //   // Push old data from areaSeverityData
  //   seriesData[0].data.push(areaSeverityData[area]?.High || 0);
  //   seriesData[2].data.push(areaSeverityData[area]?.Medium || 0);
  //   seriesData[4].data.push(areaSeverityData[area]?.Low || 0);

  //   const cmvAreaData = cmvAreaSeverityData[area];
  //   // Push new data from cmvData
  //   seriesData[1].data.push(cmvAreaData?.High || 0);
  //   seriesData[3].data.push(cmvAreaData?.Medium || 0);
  //   seriesData[5].data.push(cmvAreaData?.Low || 0);
  // });

  const uniqueAreas = new Set([...areas, ...cmvAreas]);

  // Iterate over unique areas and construct seriesData
  uniqueAreas.forEach((area) => {
    // Push old data from areaSeverityData
    newSeriesData[0].data.push(areaSeverityData[area]?.High || 0);
    newSeriesData[2].data.push(areaSeverityData[area]?.Medium || 0);
    newSeriesData[4].data.push(areaSeverityData[area]?.Low || 0);

    const cmvAreaData = cmvAreaSeverityData[area];
    // Push new data from cmvData
    newSeriesData[1].data.push(cmvAreaData?.High || 0);
    newSeriesData[3].data.push(cmvAreaData?.Medium || 0);
    newSeriesData[5].data.push(cmvAreaData?.Low || 0);
  });

  const uniqueAreasArray = Array.from(uniqueAreas);

  // Severity chart options
  const newSeverityChartOptions = {
    chart: {
      id: "severity-chart",
      stacked: false, // Set stacked to false to display bars side by side
    },
    xaxis: {
      categories: uniqueAreasArray.map((area) => {
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
    yaxis: {
      labels: {
        formatter: function (value) {
          return Math.round(value); // Format y-axis labels as whole numbers
        }
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "40%",
        dataLabels: {
          total: {
            enabled: true,
            style: {
              fontSize: "8px", // Adjust the font size for the total data label
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false, // Hide data labels
    },
    colors: ["#FF0000", "#FFA500", "#006400", "#32CD32", "#005cdb", "#87CEEB"],
    tooltip: {
      y: {
        formatter: function (value, { dataPointIndex }) {
          // Display the full area name on hover
          const area = uniqueAreasArray[dataPointIndex];
          return `${area}:${value}`;
        },
      },
    },
  };

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
        return area.length > maxChars ? area.substring(0, maxChars) + "..." : area;
      }),
      labels: {
        style: {
          fontSize: '10px', // Adjust the font size as needed
        },
      },
    },
    yaxis: {
      labels: {
        formatter: function (value) {
          return Math.round(value); // Format y-axis labels as whole numbers
        }
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "40%",
        dataLabels: {
          total: {
            enabled: true,
            style: {
              fontSize: '8px', // Adjust the font size for the total data label
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
        formatter: function (value, {dataPointIndex }) {
          // Display the full area name on hover
          const area = areas[dataPointIndex];
          return `${area}:${value}`;
        },
      },
    },
  };

  const handleAreaClick = (clickedArea, dataType) => {
    setDataType(dataType);
    setClickedArea(clickedArea);
    setIsTableVisible(true);
  };

  const handleCloseButtonClick = () => {
    setIsTableVisible(false);
    setClickedArea(null);
  };
// console.log("data",data)
  if (cmvData.length > 0) {
    return (
      <div>
        <div className="org-site-container">
          <div className="select-wrapper">
            {/* <label className="select-label">Organization:</label> */}
            <Select
              options={organizationOptions}
              placeholder="Select Organization"
              onChange={handleOrganizationSelection}
              isClearable
              value={selectedOrganization}
            />
          </div>
          <div className="select-wrapper">
            {/* <label className="select-label">Site:</label> */}
            <Select
              options={siteOptions}
              placeholder="Select Site"
              onChange={handleSiteSelection}
              isClearable
              isDisabled={!selectedOrganization}
              value={selectedSite}
            />
          </div>
          <div className="select-wrapper">
            {/* <label className="select-label">Report ID:</label> */}
            <Select
              options={reportIdOptions}
              placeholder="Select Report ID"
              onChange={handleReportIdSelection}
              isClearable
              isDisabled={!selectedSite}
              value={selectedReportId}
            />
          </div>
        </div>
        {/* <div className="download-button">
          <DownloadIcon
            style={{ cursor: "pointer" }}
            id="download-button"
            onClick={() => downloadAsPDF()}
          />
  
        </div> */}
        <div id="chart-container" className="chart-container">
          <div className="total-serverity-div">
            <div className="severity-item">
              Old Total Observations
              <br />
              <span>{data.length}</span>
              <hr />
            </div>
            <div style={{ color: "#FF0000" }} className="severity-item">
              High Severity Observations
              <br />
              <span>{data.filter((e) => e.criticality === "High").length}</span>
              <hr />
            </div>
            <div style={{ color: "#006400" }} className="severity-item">
              Medium Severity Observations
              <br />
              <span>{data.filter((e) => e.criticality === "Medium").length}</span>
              <hr />
            </div>
            <div style={{ color: "#005cdb" }} className="severity-item">
              Low Severity Observations
              <br />
              <span>{data.filter((e) => e.criticality === "Low").length}</span>
              <hr />
            </div>
          </div>
          <div className="cmv-total-serverity-div">
            <div className="severity-item">
              New Total Observations
              <br />
              <span>{cmvData.length}</span>
              <hr />
            </div>
            <div style={{ color: "#FF0000" }} className="severity-item">
              High Severity Observations
              <br />
              <span>
                {cmvData.filter((e) => e.criticality === "High").length}
              </span>
              <hr />
            </div>
            <div style={{ color: "#006400" }} className="severity-item">
              Medium Severity Observations
              <br />
              <span>
                {cmvData.filter((e) => e.criticality === "Medium").length}
              </span>
              <hr />
            </div>
            <div style={{ color: "#005cdb" }} className="severity-item">
              Low Severity Observations
              <br />
              <span>{cmvData.filter((e) => e.criticality === "Low").length}</span>
              <hr />
            </div>
          </div>
          {/* <div className="cmv-pie-chart-old">
            Old Audit Score
            <Chart
              options={pieOptions}
              series={[scorePercent, 100 - scorePercent]}
              type="pie"
              // width="400"
              height={"250px"}
            />
          </div> */}
          {/* <div className="cmv-pie-chart-new">
            New Audit Score
            <Chart
              options={cmvPieOptions}
              series={[cmvScorePercent, 100 - cmvScorePercent]}
              type="pie"
              // width="400"
              height={"250px"}
            />
          </div> */}
          <div className="cmv-area-chart">
            Area Chart
            <Chart
              options={newBarOptions}
              series={[
                {
                  name: "Old Percentage",
                  data: counts,
                },
                {
                  name: "New Percentage",
                  data: newCounts,
                },
              ]}
              type="bar"
              height={300}
            />
          </div>
          <div className="cmv-severity-chart">
            Severity Chart
            <Chart
              options={newSeverityChartOptions}
              series={newSeriesData}
              type="bar"
              height={300}
            />
          </div>
          <div className="old-cmv-main-clause">
            Old Main Clause
            {areasForAreaChart.map((area) => (
              <p
                onClick={() => handleAreaClick(area, "old")}
                className="main-clause-item"
              >
                {area}
              </p>
            ))}
          </div>
          <div className="new-cmv-main-clause">
            New Main Clause
            {newAreasForAreaChart.map((area) => (
              <p
                onClick={() => handleAreaClick(area, "new")}
                className="main-clause-item"
              >
                {area}
              </p>
            ))}
          </div>
        </div>
        {isTableVisible && (
          <div className="overlay">
            <div className="chart-table-container" ref={tableRef}>
              <button
                className="table-close-button"
                onClick={handleCloseButtonClick}
              >
                &#171;Back
              </button>
              <table style={{marginTop:"40px"}}>
                <thead>
                  <tr>
                    <th>Sr No</th>
                    <th>Area</th>
                    <th>Category</th>
                    <th>Check Point</th>
                    <th>Observation</th>
                    <th>Recommendations</th>
                    <th>Is Reference</th>
                    <th>Score</th>
                    {/* Add other columns based on your data structure */}
                  </tr>
                </thead>
                <tbody>
                  {/* {data
                    .filter((entry) => entry.area === clickedArea)
                    .map((entry, index) => (
                      <tr
                        key={entry.id}
                        className={index % 2 === 0 ? "even-row" : "odd-row"}
                      >
                        <td>{index + 1}</td>
                        <td>{entry.area}</td>
                        <td>{entry.category}</td>
                        <td>{entry.check_points}</td>
                        <td>{entry.observation}</td>
                        <td>{entry.recommendations}</td>
                        <td>{entry.is_reference}</td>
                        <td>{entry.score ? entry.score : "N/A"}</td>
                      </tr>
                    ))} */}
                  {dataType === "old"
                    ? data
                        .filter((entry) => entry.area === clickedArea)
                        .map((entry, index) => (
                          <tr
                            key={entry.id}
                            className={index % 2 === 0 ? "even-row" : "odd-row"}
                          >
                            <td>{index + 1}</td>
                            <td>{entry.area}</td>
                            <td>{entry.category}</td>
                            <td>{entry.check_points}</td>
                            <td>{entry.observation}</td>
                            <td>{entry.recommendations}</td>
                            <td>{entry.is_reference}</td>
                            <td>{entry.score ? entry.score : "N/A"}</td>                       
                            {/* Add other cells based on your data structure */}
                          </tr>
                        ))
                    : dataType === "new"
                    ? cmvData
                        .filter((entry) => entry.area === clickedArea)
                        .map((entry, index) => (
                          <tr
                            key={entry.id}
                            className={index % 2 === 0 ? "even-row" : "odd-row"}
                          >
                            <td>{index + 1}</td>
                            <td>{entry.area}</td>
                            <td>{entry.category}</td>
                            <td>{entry.check_points}</td>
                            <td>{entry.observation}</td>
                            <td>{entry.recommendations}</td>
                            <td>{entry.is_reference}</td>
                            <td>{entry.score ? entry.score : "N/A"}</td>
                            {/* Add other cells based on your data structure */}
                          </tr>
                        ))
                    : null}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  } else {
    return (
      <div>
        <div className="org-site-container">
          <div className="select-wrapper">
            {/* <label className="select-label">Organization:</label> */}
            <Select
              options={organizationOptions}
              placeholder="Select Organization"
              onChange={handleOrganizationSelection}
              isClearable
              value={selectedOrganization}
            />
          </div>
          <div className="select-wrapper">
            {/* <label className="select-label">Site:</label> */}
            <Select
              options={siteOptions}
              placeholder="Select Site"
              onChange={handleSiteSelection}
              isClearable
              isDisabled={!selectedOrganization}
              value={selectedSite}
            />
          </div>
          <div className="select-wrapper">
            {/* <label className="select-label">Report ID:</label> */}
            <Select
              options={reportIdOptions}
              placeholder="Select Report ID"
              onChange={handleReportIdSelection}
              isClearable
              isDisabled={!selectedSite}
              value={selectedReportId}
            />
          </div>
        </div>
        {/* <div className="download-button">
          <DownloadIcon
            style={{ cursor: "pointer" }}
            id="download-button"
            onClick={() => downloadAsPDF()}
          />
  
        </div> */}
        <div id="chart-container" className="chart-container">
          <div className="total-serverity-div" style={{width:"100%"}}>
            <div className="severity-item">
              Total Observations
              <br />
              <span>{data.length}</span>
              <hr />
            </div>
            <div style={{ color: "#FF0000" }} className="severity-item">
              High Severity Observations
              <br />
              <span>{data.filter((e) => e.criticality === "High").length}</span>
              <hr />
            </div>
            <div style={{ color: "#006400" }} className="severity-item">
              Medium Severity Observations
              <br />
              <span>{data.filter((e) => e.criticality === "Medium").length}</span>
              <hr />
            </div>
            <div style={{ color: "#005cdb" }} className="severity-item">
              Low Severity Observations
              <br />
              <span>{data.filter((e) => e.criticality === "Low").length}</span>
              <hr />
            </div>
          </div>
          <div className="area-chart">
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
          <div className="severity-chart">
            Severity Chart
            <Chart
              options={severityChartOptions}
              series={seriesData}
              type="bar"
              height={300}
            />
          </div>
          {/* <div className="pie-chart">
            Audit Score
            <Chart
              options={pieOptions}
              series={[scorePercent, 100 - scorePercent]}
              type="pie"
              // width="400"
              height={"250px"}
            />
          </div> */}
          <div className="main-clause">
            Main Clause
            {areasForAreaChart.map((area) => (
              <p
                onClick={() => handleAreaClick(area)}
                className="main-clause-item"
              >
                {area}
              </p>
            ))}
          </div>
        </div>
        {isTableVisible && (
          <div className="overlay">
            <div className="chart-table-container" ref={tableRef}>
            <button className="table-close-button" onClick={handleCloseButtonClick} style={{marginTop:"5px",marginBottom:"5px"}}>&#171;Back</button>
              <table style={{marginTop:"40px"}}>
                <thead>
                  <tr>
                    <th>Sr. No.</th>
                    <th>Area / Process</th>
                    {/* <th>Category</th> */}
                    <th>Check Point</th>
                    <th>Observation</th>
                    <th>Criticality</th>
                    <th>Recommendation</th>
                    <th>Legal Reference (if any)</th>
                    <th>Score</th>
                     <th>System Implementation</th>
                    <th>Compliance Check</th>
                    {/* <th>Photo Evidences</th> */}
                    {/* Add other columns based on your data structure */}
                  </tr>
                </thead>
                <tbody>
                  {data
                    .filter((entry) => entry.area === clickedArea)
                    .map((entry, index) => (
                      <tr
                        key={entry.id}
                        className={index % 2 === 0 ? "even-row" : "odd-row"}
                      >
                        <td>{index + 1}</td>
                        <td>{entry.area}</td>
                        {/* <td>{entry.category}</td> */}
                        <td>{entry.check_points}</td>
                        <td>{entry.observation}</td>
                        <td>{entry.criticality}</td>
                        <td>{entry.recommendations}</td>
                        <td>{entry.is_reference}</td>
                        <td>{entry.score ? entry.score : "N/A"}</td>
                         <td>{entry.system_implementation?entry.system_implementation:"N/A"}</td>
                            <td>{entry.compliance_check?entry.compliance_check:"N/A"}</td> 
                            {/* <td>{entry.imageUrls
?entry.imageUrls
:"N/A"}</td>  */}
                        {/* Add other cells based on your data structure */}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

};

export default HseCmvDashboard;
