import React, { useEffect, useState } from "react";
import Select from "react-select";
import "./ElectricalDashboard.css"; // Import your CSS file
import axios from "../../APIs/axios";
import { config } from "../../config";
import Chart from "react-apexcharts";
import domtoimage from "dom-to-image";
import jsPDF from "jspdf";
import DownloadIcon from "@mui/icons-material/Download";

const ElectricalDashboard = () => {
  const [orgList, setOrgList] = useState([]);
  const [selectedOrganization, setSelectedOrganization] = useState([]);
  const [selectedSite, setSelectedSite] = useState([]);
  const [siteOptions, setSiteOptions] = useState([]);
  const [scorePercent, setScorePercent] = useState(0);
  const [data, setData] = useState([]);
  const [clickedArea, setClickedArea] = useState(null);
  const [isTableVisible, setIsTableVisible] = useState(false);
  const tableRef = React.createRef();

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

  useEffect(() => {
    const fetchData = async () => {
      const payload = {
        organization: selectedOrganization.label,
        site: selectedSite.label,
      };

      try {
        const res = await axios.get(
          `${config.PATH}/api/electrical-dashboard-data`,
          { params: payload }
        );

        const totalScore =
          res.data.length > 0
            ? res.data
                .map((e) => e.score)
                .reduce((acc, score) => acc + score, 0)
            : 0;

        const percentage = Math.floor(
          (totalScore / (res.data.length * 5)) * 100
        );

        setScorePercent(percentage);
        setData(res.data);
      } catch (error) {
        console.log("Error:", error.response?.data?.error || error.message);
      }
    };

    fetchData(); // Call the fetchData function immediately
  }, [selectedOrganization, selectedSite]); // Add dependencies to the dependency array

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

  const handleOrganizationSelection = async (selectedOption) => {
    setSelectedOrganization(selectedOption);
    setSelectedSite([]);
    setScorePercent(0);
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
    const areaCount = areaCounts[area] || 0;
    return ((areaCount / data.length) * 100).toFixed(1);
  });

  const barOptions = {
    chart: {
      id: "bar-chart",
    },
    colors: ["#005cdb"],
    xaxis: {
      categories: areasForAreaChart.map((area) => {
        // Truncate the area name if it's too long
        const maxChars = 10; // Adjust the maximum characters as needed
        return area.length > maxChars
          ? area.substring(0, maxChars) + "..."
          : area;
      }),
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "50%",
        endingShape: "rounded",
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
        const maxChars = 10; // Adjust the maximum characters as needed
        return area.length > maxChars
          ? area.substring(0, maxChars) + "..."
          : area;
      }),
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "40%",
      },
    },
    colors: ["#FF0000", "#006400", "#005cdb"],
    tooltip: {
      y: {
        formatter: function (value) {
          // Display the full area name on hover
          const area = areas[this.dataPointIndex];
          return `${area}: ${value}`;
        },
      },
    },
  };

  const handleAreaClick = (clickedArea) => {
    setClickedArea(clickedArea);
    setIsTableVisible(true);
  };

  const handleCloseButtonClick = () => {
    setIsTableVisible(false);
    setClickedArea(null);
  };

  const downloadAsPDF = async () => {
    const chartContainer = document.getElementById("chart-container");
  
    if (!chartContainer) {
      console.error("Chart container not found");
      return;
    }
  
    try {
      const dataUrl = await domtoimage.toPng(chartContainer, {
        height: chartContainer.scrollHeight,
        style: {
          height: chartContainer.scrollHeight + "px",
          width: chartContainer.offsetWidth + "px",
        },
        filter: (node) => {
          // Exclude elements with the 'main-clause' or 'download-button' class
          return !(
            node.classList &&
            (node.classList.contains("main-clause") ||
              node.classList.contains("download-button"))
          );
        },
      });
  
      const pdf = new jsPDF();
      const heading = "Charts";
      
      // Add heading to PDF
      pdf.setFontSize(16);
      pdf.text(heading, 105, 10, { align: "center" });
  
      // Add chart image to PDF
      pdf.addImage(dataUrl, "PNG", 10, 20, 190, 100); // Adjust position and dimensions as needed
  
      pdf.save("chart.pdf");
    } catch (error) {
      console.error("Error converting chart to image:", error);
    }
  };
  

  return (
    <div>
      <div className="org-site-container">
        <div className="select-wrapper">
          <label className="select-label">Organization:</label>
          <Select
            options={organizationOptions}
            placeholder="Select Organization"
            onChange={handleOrganizationSelection}
          />
        </div>
        <div className="select-wrapper">
          <label className="select-label">Site:</label>
          <Select
            options={siteOptions}
            placeholder="Select Site"
            onChange={handleSiteSelection}
          />
        </div>
      </div>
      <div className="download-button">
        <DownloadIcon
          style={{ cursor: "pointer" }}
          id="download-button"
          onClick={() => downloadAsPDF()}
        />

      </div>
      <div id="chart-container" className="chart-container">
        <div className="total-serverity-div">
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
                name: "Series 1",
                data: counts,
              },
            ]}
            type="bar"
            height={200}
          />
        </div>
        <div className="severity-chart">
          Severity Chart
          <Chart
            options={severityChartOptions}
            series={seriesData}
            type="bar"
            height={200}
          />
        </div>
        <div className="pie-chart">
          Audit Score
          <Chart
            options={pieOptions}
            series={[scorePercent, 100 - scorePercent]}
            type="pie"
            // width="400"
            height={"250px"}
          />
        </div>
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
            <table>
              <thead>
                <tr>
                  <th>Sr No</th>
                  <th>Area</th>
                  <th>Category</th>
                  <th>Check Point</th>
                  <th>Observation</th>
                  <th>Recommendation</th>
                  <th>Is Reference</th>
                  <th>Score</th>
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
                      <td>{entry.category}</td>
                      <td>{entry.check_points}</td>
                      <td>{entry.observation}</td>
                      <td>{entry.recommendations}</td>
                      <td>{entry.is_reference}</td>
                      <td>{entry.score ? entry.score : "N/A"}</td>
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
};

export default ElectricalDashboard;
