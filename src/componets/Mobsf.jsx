import React, { useState } from "react";
import axios from "axios";
import {
  Button,
  Form,
  Container,
  Card,
  Spinner,
  Alert,
  Row,
  Col,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const API_BASE_URL = "http://localhost:8000/api/v1";
const API_KEY =
  "2af6be67c22c13ce59249819e3fc64b8fe8bfffddb68ccd2a8d20d729f2fee32";

function App() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [report, setReport] = useState(null);
  const [hash, setHash] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to parse and filter necessary data from the report
  const parseRelevantData = (report) => {
    return {
      vulnerabilities: report.vulnerabilities || [],
      permissions: report.permissions || [],
      thirdPartyLibraries: report.third_party_libraries || [],
      recommendations: report.recommendations || [],
    };
  };

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
        method: method,
        headers: {
          Authorization: API_KEY,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: new URLSearchParams(bodyData),
        responseType,
      });

      if (responseType === "blob") {
        // Handle file downloads (PDF, JSON)
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `${endpoint}` + (endpoint.includes("pdf") ? "pdf" : "json")
        );
        document.body.appendChild(link);
        link.click();
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
    if (!file) {
      setError("Please select a file before uploading.");
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

      setHash(response.data.hash); // Assuming hash is returned
      setReport(response.data);
      setStatus("File uploaded successfully!");
    } catch (err) {
      setError("Error uploading file: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <h1 className="text-center text-primary mb-4">APK Scanner</h1>

      <Card className="p-4 shadow-lg">
        <Form onSubmit={handleFileUpload}>
          <Form.Group controlId="fileInput" className="mb-3">
            <Form.Label>Select APK File</Form.Label>
            <Form.Control
              type="file"
              accept=".apk"
              onChange={(e) => setFile(e.target.files[0])}
              required
            />
          </Form.Group>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : "Upload File"}
          </Button>
        </Form>

        {error && (
          <Alert className="mt-3" variant="danger">
            {error}
          </Alert>
        )}
        {status && !error && (
          <Alert className="mt-3" variant="info">
            {status}
          </Alert>
        )}

        {report && (
          <>
            <div className="mt-4">
              <h4>Relevant Findings</h4>
              <pre
                className="bg-light p-3 rounded"
                style={{ whiteSpace: "pre-wrap", overflowX: "auto" }}
              >
                {JSON.stringify(parseRelevantData(report), null, 2)}
              </pre>
            </div>
            <div className="mt-4">
              <h5>Raw Report (Debug View)</h5>
              <pre
                className="bg-light p-3 rounded"
                style={{ whiteSpace: "pre-wrap", overflowX: "auto" }}
              >
                {JSON.stringify(report, null, 2)}
              </pre>
            </div>
          </>
        )}
      </Card>

      {hash && (
        <Row className="mt-4 text-center">
          <Col md={6}>
            <Button
              className="m-2"
              variant="success"
              onClick={() => handleRequest("scan", { hash })}
            >
              Fetch Scan Logs
            </Button>
          </Col>
          <Col md={6}>
            <Button
              className="m-2"
              variant="info"
              onClick={() => handleRequest("scorecard", { hash })}
            >
              Fetch Scorecard
            </Button>
          </Col>
          <Col md={6}>
            <Button
              className="m-2"
              variant="warning"
              onClick={() =>
                handleRequest("search", {
                  query: prompt("Enter search query:"),
                })
              }
            >
              Search Scans
            </Button>
          </Col>
          <Col md={6}>
            <Button
              className="m-2"
              variant="primary"
              onClick={() =>
                handleRequest("download_pdf", { hash }, "POST", "blob")
              }
            >
              Download PDF Report
            </Button>
          </Col>
          <Col md={6}>
            <Button
              className="m-2"
              variant="secondary"
              onClick={() =>
                handleRequest("report_json", { hash }, "POST", "blob")
              }
            >
              Download JSON Report
            </Button>
          </Col>
          <Col md={6}>
            <Button
              className="m-2"
              variant="danger"
              onClick={() => handleRequest("delete_scan", { hash })}
            >
              Delete Scan
            </Button>
          </Col>
        </Row>
      )}
    </Container>
  );
}

export default App;
