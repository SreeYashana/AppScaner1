import { useLocation } from "react-router-dom";

function Results() {
  const { state } = useLocation();
  const { scanResults } = state || {};

  return (
    <div className="container mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">Scan Results</h1>
      {scanResults ? (
        <div className="p-4 bg-gray-100 rounded shadow">
          <p>
            <strong>File Name:</strong> {scanResults.file_name}
          </p>
          <p>
            <strong>Status:</strong> {scanResults.status}
          </p>
          <p>
            <strong>Issues Detected:</strong> {scanResults.issues_detected}
          </p>
          {scanResults.vulnerabilities.length > 0 && (
            <ul>
              {scanResults.vulnerabilities.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <p>No results to display.</p>
      )}
    </div>
  );
}

export default Results;
