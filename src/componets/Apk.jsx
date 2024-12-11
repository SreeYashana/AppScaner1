import React, { useState } from "react";
import axios from "axios";
import {
  Button,
  Form,
  Container,
  Card,
  Spinner,
  Alert,
  Table,
  Tabs,
  Tab,
  Row,
  Col,
  ButtonGroup,
} from "react-bootstrap";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const API_BASE_URL = "http://localhost:8000/api/v1";
const API_KEY =
  "4c2860337ced384f2e8b59651b6c06959f657de202b6f4dfadae22e6337e48a7";

function App() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [uploadReport, setUploadReport] = useState(null);
  const [scanReport, setScanReport] = useState(null);
  const [scorecardReport, setScorecardReport] = useState(null);
  const [visualData, setVisualData] = useState(null);
  const [hash, setHash] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("upload");

  const filterScanReport = (report) => {
    const fieldsToRemove = [
      "icon_path",
      "urls",
      "domains",
      "emails",
      "strings",
      "string_code",
      "virus_total",
      "playstore_details",
      "niap_analysis",
      "logs",
      "sbom",
      "behaviour",
    ];
    return Object.fromEntries(
      Object.entries(report).filter(([key]) => !fieldsToRemove.includes(key))
    );
  };

  const ReportTable = ({ data, title }) => {
    if (!data) return null;

    const renderNestedValue = (value, indent = 0) => {
      if (value === null || value === undefined) {
        return <span className="text-muted">N/A</span>;
      }

      if (Array.isArray(value)) {
        return (
          <div className="nested-array">
            {value.map((item, index) => (
              <div
                key={index}
                className="array-item"
                style={{ marginLeft: `${indent}px` }}
              >
                {typeof item === "object"
                  ? renderNestedValue(item, indent + 20)
                  : String(item)}
              </div>
            ))}
          </div>
        );
      }

      if (typeof value === "object") {
        return (
          <Table bordered hover size="sm" className="nested-table">
            <tbody>
              {Object.entries(value).map(([key, val]) => (
                <tr key={key}>
                  <td
                    className="fw-bold"
                    style={{ width: "30%", paddingLeft: `${indent + 10}px` }}
                  >
                    {key}
                  </td>
                  <td>{renderNestedValue(val, indent + 20)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        );
      }

      return String(value);
    };

    return (
      <Card className="my-4 report-card cyber-card">
        <Card.Header className="cyber-header">
          <h5 className="mb-0">
            <i className="fas fa-shield-alt me-2"></i>
            {title}
          </h5>
        </Card.Header>
        <Card.Body className="cyber-body">
          <Table striped bordered hover responsive className="mb-0 cyber-table">
            <thead>
              <tr>
                <th style={{ width: "30%" }}>Field</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data).map(([key, value]) => (
                <tr key={key}>
                  <td className="fw-bold">
                    <span className="cyber-key">{key}</span>
                  </td>
                  <td>{renderNestedValue(value)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    );
  };

  const Visualization = ({ jsonData }) => {
    const [charts, setCharts] = useState({
      permissions: null,
      malware: null,
      severity: null,
    });

    React.useEffect(() => {
      if (!jsonData) return;

      // Permissions Chart
      const permissions = jsonData.permissions || {};
      const permissionsStatus = { dangerous: 0, normal: 0 };
      Object.values(permissions).forEach((perm) => {
        if (perm.status === "dangerous") permissionsStatus.dangerous++;
        else permissionsStatus.normal++;
      });

      // Malware Chart
      const malwareData = jsonData.malware_permissions || {
        top_malware_permissions: 0,
        total_other_permissions: 0,
      };

      // Severity Chart
      const manifestData = jsonData.manifest_analysis?.manifest_summary || {};
      const codeData = jsonData.code_analysis?.summary || {};

      setCharts({
        permissions: {
          labels: ["Dangerous", "Normal"],
          datasets: [
            {
              label: "Permissions Distribution",
              data: [permissionsStatus.dangerous, permissionsStatus.normal],
              backgroundColor: ["#dc3545", "#28a745"],
            },
          ],
        },
        malware: {
          labels: ["Malware-Related", "Other"],
          datasets: [
            {
              data: [
                malwareData.top_malware_permissions,
                malwareData.total_other_permissions,
              ],
              backgroundColor: ["#ff4d4d", "#4d94ff"],
            },
          ],
        },
        severity: {
          labels: ["High", "Warning", "Info"],
          datasets: [
            {
              label: "Manifest Analysis",
              data: [
                manifestData.high || 0,
                manifestData.warning || 0,
                manifestData.info || 0,
              ],
              backgroundColor: "#ff6b6b",
            },
            {
              label: "Code Analysis",
              data: [
                codeData.high || 0,
                codeData.warning || 0,
                codeData.info || 0,
              ],
              backgroundColor: "#4ecdc4",
            },
          ],
        },
      });
    }, [jsonData]);

    if (!jsonData) return null;

    return (
      <Card className="my-4 visualization-card">
        <Card.Header className="cyber-header">
          <h5 className="mb-0">Analysis Visualization</h5>
        </Card.Header>
        <Card.Body>
          <Row className="g-4">
            <Col md={6}>
              <Card className="h-100">
                <Card.Header>Permissions Distribution</Card.Header>
                <Card.Body>
                  {charts.permissions && (
                    <Bar
                      data={charts.permissions}
                      options={{ responsive: true }}
                    />
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="h-100">
                <Card.Header>Malware Permissions</Card.Header>
                <Card.Body>
                  {charts.malware && (
                    <Pie data={charts.malware} options={{ responsive: true }} />
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col md={12}>
              <Card>
                <Card.Header>Severity Analysis</Card.Header>
                <Card.Body>
                  {charts.severity && (
                    <Bar
                      data={charts.severity}
                      options={{ responsive: true }}
                    />
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setLoading(true);
    setError(null);
    setStatus("Uploading APK file...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: { Authorization: API_KEY },
      });

      setHash(response.data.hash);
      setUploadReport(response.data);
      setStatus("File uploaded successfully!");
      setActiveTab("upload");
    } catch (err) {
      setError(`Upload failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async () => {
    if (!hash) {
      setError("Please upload a file first");
      return;
    }

    setLoading(true);
    setError(null);
    setStatus("Scanning APK...");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/scan`,
        new URLSearchParams({ hash }),
        {
          headers: {
            Authorization: API_KEY,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      setScanReport(filterScanReport(response.data));
      setStatus("Scan completed!");
      setActiveTab("scan");
    } catch (err) {
      setError(`Scan failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleScorecard = async () => {
    if (!hash) {
      setError("Please upload and scan the file first");
      return;
    }

    setLoading(true);
    setError(null);
    setStatus("Generating scorecard...");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/scorecard`,
        new URLSearchParams({ hash }),
        {
          headers: {
            Authorization: API_KEY,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      setScorecardReport(response.data);
      setStatus("Scorecard generated!");
      setActiveTab("scorecard");
    } catch (err) {
      setError(`Scorecard generation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVisualize = async () => {
    if (!hash) {
      setError("Please complete the analysis first");
      return;
    }

    setLoading(true);
    setError(null);
    setStatus("Preparing visualization...");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/report_json`,
        new URLSearchParams({ hash }),
        {
          headers: {
            Authorization: API_KEY,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          responseType: "blob",
        }
      );

      const textData = await response.data.text();
      const json = JSON.parse(textData);
      setVisualData(json);
      setStatus("Visualization ready!");
      setActiveTab("visualization");
    } catch (err) {
      setError(`Visualization failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="cyber-container py-5">
      <Card className="cyber-main-card">
        <Card.Header className="cyber-main-header">
          <h1 className="text-center mb-0">
            <i className="fas fa-shield-alt me-3"></i>
            APK Security Scanner
            <i className="fas fa-code ms-3"></i>
          </h1>
        </Card.Header>

        <Card.Body className="cyber-main-body">
          <Form onSubmit={handleFileUpload} className="mb-4">
            <Form.Group controlId="fileInput" className="mb-3">
              <Form.Label className="cyber-label">
                <i className="fas fa-file-code me-2"></i>
                Select APK File
              </Form.Label>
              <Form.Control
                type="file"
                accept=".apk"
                onChange={(e) => setFile(e.target.files[0])}
                required
                className="cyber-input"
              />
            </Form.Group>
            <Button
              variant="cyber-primary"
              type="submit"
              disabled={loading}
              className="w-100 cyber-button"
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" />
                  <span className="ms-2">Processing...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-upload me-2"></i>
                  Upload APK
                </>
              )}
            </Button>
          </Form>

          {hash && (
            <ButtonGroup className="d-flex gap-2 mb-4">
              <Button
                variant="cyber-info"
                onClick={handleScan}
                disabled={loading}
                className="cyber-button"
              >
                <i className="fas fa-search me-2"></i>
                Scan APK
              </Button>
              <Button
                variant="cyber-success"
                onClick={handleScorecard}
                disabled={loading || !scanReport}
                className="cyber-button"
              >
                <i className="fas fa-chart-bar me-2"></i>
                Generate Scorecard
              </Button>
              <Button
                variant="cyber-warning"
                onClick={handleVisualize}
                disabled={loading || !scorecardReport}
                className="cyber-button"
              >
                <i className="fas fa-chart-pie me-2"></i>
                Visualize Results
              </Button>
            </ButtonGroup>
          )}

          {error && (
            <Alert variant="cyber-danger" className="cyber-alert">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          )}
          {status && !error && (
            <Alert variant="cyber-info" className="cyber-alert">
              <i className="fas fa-info-circle me-2"></i>
              {status}
            </Alert>
          )}

          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-3 cyber-tabs"
          >
            <Tab eventKey="upload" title="Upload Report">
              {uploadReport && (
                <ReportTable data={uploadReport} title="Upload Report" />
              )}
            </Tab>
            <Tab eventKey="scan" title="Scan Report">
              {scanReport && (
                <ReportTable data={scanReport} title="Scan Report" />
              )}
            </Tab>
            <Tab eventKey="scorecard" title="Scorecard Report">
              {scorecardReport && (
                <ReportTable data={scorecardReport} title="Scorecard Report" />
              )}
            </Tab>
            <Tab eventKey="visualization" title="Visualization">
              {visualData && <Visualization jsonData={visualData} />}
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default App;
