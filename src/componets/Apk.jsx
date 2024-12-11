import React, { useState, useRef } from "react";
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
  " 4c2860337ced384f2e8b59651b6c06959f657de202b6f4dfadae22e6337e48a7";

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

  const scanReportRef = useRef(null);
  const scorecardReportRef = useRef(null);

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
  const ReportTable = ({ data, title, ref }) => {
    if (!data) return null;

    const renderNestedValue = (value, indent = 0) => {
      if (value === null || value === undefined) {
        return <span className="text-muted">N/A</span>;
      }

      if (Array.isArray(value)) {
        return (
          <div className="nested-array" style={{ marginLeft: `${indent}px` }}>
            {value.map((item, index) => (
              <div key={index} className="array-item">
                {typeof item === "object"
                  ? renderNestedValue(item, indent + 10)
                  : String(item)}
              </div>
            ))}
          </div>
        );
      }

      if (typeof value === "object") {
        return (
          <Table bordered size="sm" className="nested-table mb-0">
            <tbody>
              {Object.entries(value).map(([key, val]) => (
                <tr key={key}>
                  <td style={{ width: "120px", whiteSpace: "nowrap" }}>
                    {key}
                  </td>
                  <td>{renderNestedValue(val, indent + 10)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        );
      }

      return String(value);
    };

    return (
      <Card className="my-3 report-card" ref={ref}>
        <Card.Header className="cyber-header py-2">
          <h5 className="mb-0">
            <i className="fas fa-shield-alt me-2"></i>
            {title}
          </h5>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table striped bordered hover className="mb-0">
              <thead>
                <tr>
                  <th style={{ width: "120px", whiteSpace: "nowrap" }}>
                    Field
                  </th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(data).map(([key, value]) => (
                  <tr key={key}>
                    <td style={{ whiteSpace: "nowrap" }}>{key}</td>
                    <td style={{ minWidth: "200px" }}>
                      {renderNestedValue(value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
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

      const permissions = jsonData.permissions || {};
      const permissionsStatus = { dangerous: 0, normal: 0 };
      Object.values(permissions).forEach((perm) => {
        if (perm.status === "dangerous") permissionsStatus.dangerous++;
        else permissionsStatus.normal++;
      });

      const malwareData = jsonData.malware_permissions || {
        top_malware_permissions: 0,
        total_other_permissions: 0,
      };

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
      <Card className="my-3">
        <Card.Header className="cyber-header py-2">
          <h5 className="mb-0">Analysis Visualization</h5>
        </Card.Header>
        <Card.Body>
          <Row className="g-3">
            <Col md={6}>
              <Card>
                <Card.Header className="py-2">
                  Permissions Distribution
                </Card.Header>
                <Card.Body>
                  {charts.permissions && (
                    <Bar
                      data={charts.permissions}
                      options={{
                        responsive: true,
                        maintainAspectRatio: true,
                      }}
                    />
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card>
                <Card.Header className="py-2">Malware Permissions</Card.Header>
                <Card.Body>
                  {charts.malware && (
                    <Pie
                      data={charts.malware}
                      options={{
                        responsive: true,
                        maintainAspectRatio: true,
                      }}
                    />
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col md={12}>
              <Card>
                <Card.Header className="py-2">Severity Analysis</Card.Header>
                <Card.Body>
                  {charts.severity && (
                    <Bar
                      data={charts.severity}
                      options={{
                        responsive: true,
                        maintainAspectRatio: true,
                      }}
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

  const handleScanAndScorecard = async () => {
    if (!hash) {
      setError("Please upload a file first");
      return;
    }

    setLoading(true);
    setError(null);
    setStatus("Analyzing APK...");

    try {
      const scanResponse = await axios.post(
        `${API_BASE_URL}/scan`,
        new URLSearchParams({ hash }),
        {
          headers: {
            Authorization: API_KEY,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      setScanReport(filterScanReport(scanResponse.data));
      setStatus("Scan completed, generating scorecard...");

      const scorecardResponse = await axios.post(
        `${API_BASE_URL}/scorecard`,
        new URLSearchParams({ hash }),
        {
          headers: {
            Authorization: API_KEY,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      setScorecardReport(scorecardResponse.data);
      setStatus("Analysis completed!");
      setActiveTab("scan");

      setTimeout(() => {
        scanReportRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      setError(`Analysis failed: ${err.message}`);
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
    <Container fluid className="cyber-container py-3">
      <Card className="cyber-main-card">
        <Card.Header className="cyber-main-header">
          <h1 className="text-center mb-0">
            <i className="fas fa-shield-alt me-3"></i>
            APK Security Scanner
            <i className="fas fa-code ms-3"></i>
          </h1>
        </Card.Header>

        <Card.Body className="cyber-main-body">
          <Form onSubmit={handleFileUpload} className="mb-3">
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
            <ButtonGroup className="d-flex gap-2 mb-3">
              <Button
                variant="cyber-info"
                onClick={handleScanAndScorecard}
                disabled={loading}
                className="cyber-button"
              >
                <i className="fas fa-search me-2"></i>
                Analyze APK
              </Button>
              <Button
                variant="cyber-warning"
                onClick={handleVisualize}
                disabled={loading || !scanReport}
                className="cyber-button"
              >
                <i className="fas fa-chart-pie me-2"></i>
                Visualize Results
              </Button>
            </ButtonGroup>
          )}

          {error && (
            <Alert variant="danger" className="cyber-alert mb-3">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          )}
          {status && !error && (
            <Alert variant="info" className="cyber-alert mb-3">
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
                <ReportTable
                  data={scanReport}
                  title="Scan Report"
                  ref={scanReportRef}
                />
              )}
            </Tab>
            <Tab eventKey="scorecard" title="Scorecard Report">
              {scorecardReport && (
                <ReportTable
                  data={scorecardReport}
                  title="Scorecard Report"
                  ref={scorecardReportRef}
                />
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
