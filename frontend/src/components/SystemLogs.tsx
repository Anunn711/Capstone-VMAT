import React, { useEffect, useState } from "react";
import { apiFetch } from '../services/api';

type AuditLog = {
  id: number;
  timestamp: string;
  username: string;
  action: string;
};

const SystemLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await apiFetch("/api/system-logs", { method: "GET" });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `HTTP ${res.status}`);
        }

        const data = await res.json();
        setLogs(data);
      } catch (err: any) {
        setError(err.message || "Failed to load logs");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (loading) {
    return <div className="p-4">Loading system logs...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-danger">
        Failed to load system logs: {error}
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="mb-3">System Logging</h2>
      <p className="text-muted mb-3">
        Showing recent sign-ins/outs and changes to vulnerabilities/mitigations.
      </p>
      {logs.length === 0 ? (
        <div className="text-muted">No audit log entries yet.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-sm table-striped align-middle">
            <thead>
              <tr>
                <th scope="col" style={{ width: "220px" }}>Timestamp</th>
                <th scope="col" style={{ width: "180px" }}>Username</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.timestamp).toLocaleString('en-US', { timeZone: 'America/Chicago' })}</td>
                  <td>{log.username}</td>
                  <td>{log.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SystemLogs;
