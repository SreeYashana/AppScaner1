import React, { useState, useEffect } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2"; // For pie chart visualization
import { Chart as ChartJS } from "chart.js/auto"; // Import chart.js

const API_BASE_URL = "http://localhost:8000/api/v1";
const API_KEY =
  "9bd61cdebb93e5e038050e99fe2cd389bd993367c2478173117217103f42c5dd";

function Mobsf() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [report, setReport] = useState(null);
  const [hash, setHash] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permissionsData, setPermissionsData] = useState([]);
  const [vulnerabilitiesData, setVulnerabilitiesData] = useState([]);

  // Generic API request handler
  const handleRequest = async (
    endpoint,
    bodyData = {},
    method = "POST",
    responseType = "json"
  ) => {
    setLoading(true);
    setError(null);
    setStatus(`Processing ${endpoint}...`);

    try {
      const response = await axios({
        url: `${API_BASE_URL}/${endpoint}`,
        method,
        headers: {
          Authorization: API_KEY,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: new URLSearchParams(bodyData),
        responseType,
      });

      if (responseType === "blob") {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `${endpoint}.${endpoint.includes("pdf") ? "pdf" : "json"}`
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
        setStatus(`${endpoint} file downloaded successfully!`);
      } else {
        setReport(response.data);
        setStatus(`${endpoint} request successful!`);
      }
    } catch (err) {
      setError(`Error with ${endpoint}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // File upload handler
  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file || file.type !== "application/vnd.android.package-archive") {
      setError("Please select a valid APK file.");
      return;
    }

    setLoading(true);
    setError(null);
    setStatus("Uploading file...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: { Authorization: API_KEY },
      });

      setPermissionsData(response.data.permissions || []);
      setVulnerabilitiesData(response.data.vulnerabilities || []);
      setHash(response.data.hash);
      setReport(response.data);
      setStatus("File uploaded successfully!");
    } catch (err) {
      setError(`Error uploading file: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Table rendering for permissions
  const renderPermissionsTable = (permissions) => (
    <table>
      <thead>
        <tr>
          <th>Permission</th>
          <th>Status</th>
          <th>Info</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(permissions).map(([permission, details]) => (
          <tr key={permission}>
            <td>{permission}</td>
            <td>{details.status}</td>
            <td>{details.info}</td>
            <td>{details.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  // Table rendering for vulnerabilities
  const renderVulnerabilitiesTable = (vulnerabilities) => (
    <table>
      <thead>
        <tr>
          <th>Vulnerability</th>
          <th>Severity</th>
          <th>Details</th>
        </tr>
      </thead>
      <tbody>
        {vulnerabilities.map((vul, idx) => (
          <tr key={idx}>
            <td>{vul.name}</td>
            <td>{vul.severity}</td>
            <td>{vul.details}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  // Pie Chart for Vulnerabilities Severity Distribution
  const renderVulnerabilitiesChart = () => {
    const severityCounts = { Low: 0, Medium: 0, High: 0 };

    vulnerabilitiesData.forEach((vul) => {
      severityCounts[vul.severity] += 1;
    });

    const data = {
      labels: ["Low", "Medium", "High"],
      datasets: [
        {
          label: "Vulnerabilities Severity",
          data: [
            severityCounts.Low,
            severityCounts.Medium,
            severityCounts.High,
          ],
          backgroundColor: ["#28a745", "#ffc107", "#dc3545"],
        },
      ],
    };

    return (
      <div>
        <h4>Vulnerabilities Severity Distribution</h4>
        <Pie data={data} />
      </div>
    );
  };

  useEffect(() => {
    if (vulnerabilitiesData.length > 0) {
      console.log("Vulnerabilities Data: ", vulnerabilitiesData);
    }
  }, [vulnerabilitiesData]);

  return (
    <div>
      <h1>APK Scanner</h1>

      <form onSubmit={handleFileUpload}>
        <label>
          Select APK File:
          <input
            type="file"
            accept=".apk"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Upload File"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {status && !error && <p>{status}</p>}

      {report && (
        <>
          {report.permissions && (
            <div>
              <h4>Permissions</h4>
              {renderPermissionsTable(report.permissions)}
            </div>
          )}
          {report.vulnerabilities && (
            <div>
              <h4>Vulnerabilities</h4>
              {renderVulnerabilitiesTable(report.vulnerabilities)}
            </div>
          )}
          {vulnerabilitiesData.length > 0 && renderVulnerabilitiesChart()}
        </>
      )}

      {hash && (
        <div>
          {[
            { label: "Fetch Scan Logs", action: "scan" },
            { label: "Fetch Scorecard", action: "scorecard" },
            { label: "Search Scans", action: "search", prompt: true },
            {
              label: "Download PDF Report",
              action: "download_pdf",
              type: "blob",
            },
            {
              label: "Download JSON Report",
              action: "report_json",
              type: "blob",
            },
            { label: "Delete Scan", action: "delete_scan" },
          ].map(({ label, action, type = "json", prompt = false }) => (
            <button
              key={action}
              onClick={() =>
                handleRequest(
                  action,
                  prompt
                    ? { query: window.prompt("Enter search query:") }
                    : { hash },
                  "POST",
                  type
                )
              }
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default Mobsf;
