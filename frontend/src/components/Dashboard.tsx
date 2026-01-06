import React, { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../services/api";
import {
  Shield,
  AlertTriangle,
  Clock,
  CheckCircle,
  TrendingUp,
  FileText,
  Printer,
} from "lucide-react";
import { ReportGenerator } from "./ReportGenerator";
import { mapBackendStatus } from "../utils/statusMapper";
import { useMitigations } from "../hooks/useMitigations";

// ---------- Types ----------
type UiVuln = {
  id: number;
  cveId: string;
  title: string;
  description: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  status: "New" | "Under Review" | "Mitigated" | "Accepted";
  cvssScore?: number;
  publishedDate?: string;
  affectedSystems: string[];
};

type ApiVuln = {
  id: number;
  cve_id: string;
  software_names?: string | string[];
  software_versions?: string | string[];
  os_platforms?: string | string[];
  vulnerability_descriptions?: string | string[];
  published_dates?: string | string[];
  status?: string;
  severity?: string;
};

// ---------- Local mock so UI always renders ----------
const mockCVEs: UiVuln[] = [
  {
    id: 1,
    cveId: "CVE-2025-0001",
    title: "WidgetService < 2.1.0",
    description: "Unauthenticated RCE.",
    severity: "Critical",
    status: "New",
    cvssScore: 9.8,
    publishedDate: "2025-10-01",
    affectedSystems: ["host-01", "db-01"],
  },
  {
    id: 2,
    cveId: "CVE-2025-0023",
    title: "AgentX",
    description: "Local privilege escalation.",
    severity: "High",
    status: "Under Review",
    cvssScore: 8.1,
    publishedDate: "2025-09-28",
    affectedSystems: ["host-03"],
  },
  {
    id: 3,
    cveId: "CVE-2024-9099",
    title: "Filesvc",
    description: "Directory traversal allows reading files.",
    severity: "Medium",
    status: "Mitigated",
    cvssScore: 6.5,
    publishedDate: "2025-09-15",
    affectedSystems: ["files-02", "files-05"],
  },
  {
    id: 4,
    cveId: "CVE-2024-7001",
    title: "WebPortal",
    description: "Reflected XSS in search.",
    severity: "Low",
    status: "Accepted",
    cvssScore: 3.7,
    publishedDate: "2025-08-30",
    affectedSystems: ["portal-01"],
  },
  {
    id: 5,
    cveId: "CVE-2025-0110",
    title: "API Gateway",
    description: "DoS via crafted requests.",
    severity: "High",
    status: "Under Review",
    cvssScore: 7.5,
    publishedDate: "2025-10-12",
    affectedSystems: ["api-02", "api-04", "api-05"],
  },
];

const guessSeverity = (desc: string): UiVuln["severity"] => {
  const d = (desc || "").toLowerCase();
  if (d.includes("rce") || d.includes("remote code")) return "Critical";
  if (d.includes("privilege") || d.includes("dos")) return "High";
  if (d.includes("xss") || d.includes("traversal")) return "Medium";
  return "Low";
};

// Using shared status mapper from utils/statusMapper

// ---------- Component ----------
function Dashboard() {
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [vulns, setVulns] = useState<UiVuln[]>([]);
  const [loading, setLoading] = useState(true);
  // Pull mitigations so the dashboard 'Mitigated' KPI can reflect implemented mitigations
  const { mitigations, loading: mitigationsLoading } = useMitigations();
  

  // Fetch data from API with safe fallback
  useEffect(() => {
    let cancelled = false;

    const fetchVulns = async () => {
      try {
        const res = await apiFetch('/api/vulnerabilities');
        if (cancelled) return;
        const payload: ApiVuln[] = await res.json().catch(() => ([] as ApiVuln[]));
        const normalized: UiVuln[] = (payload || []).map((v, i) => {
          const desc = Array.isArray(v.vulnerability_descriptions)
            ? v.vulnerability_descriptions.join(' ')
            : v.vulnerability_descriptions || '';
          
          // Handle both array and string formats for fields
          const getSoftwareNames = () => {
            if (Array.isArray(v.software_names)) {
              return v.software_names.join(' ');
            }
            return v.software_names || '';
          };
          
          const getSoftwareVersions = () => {
            if (Array.isArray(v.software_versions)) {
              return v.software_versions.join(' ');
            }
            return v.software_versions || '';
          };
          
          const getAffectedSystems = () => {
            if (Array.isArray(v.os_platforms)) {
              return v.os_platforms;
            }
            if (typeof v.os_platforms === 'string') {
              return v.os_platforms.split(',').map(s => s.trim()).filter(Boolean);
            }
            return [];
          };
          
          // Prefer backend-provided severity when available
          const normalizeSeverity = (s?: string) => {
            if (!s) return null;
            const t = s.toString().trim().toLowerCase();
            if (t.startsWith('crit')) return 'Critical';
            if (t.startsWith('high')) return 'High';
            if (t.startsWith('med') || t.startsWith('moder')) return 'Medium';
            if (t.startsWith('low')) return 'Low';
            return null;
          };

          const backendSeverity = normalizeSeverity(v.severity as string | undefined);

          return {
            id: v.id,
            cveId: v.cve_id,
            title: getSoftwareNames()
              ? `${getSoftwareNames()} ${getSoftwareVersions()}`.trim()
              : v.cve_id,
            description: desc,
            severity: backendSeverity || guessSeverity(desc),
            status: mapBackendStatus(v.status),
            publishedDate: Array.isArray(v.published_dates)
              ? v.published_dates[0]
              : v.published_dates || undefined,
            affectedSystems: getAffectedSystems(),
          };
        });
        // Use real API data as-is. If API returns an empty array, show empty state.
        setVulns(normalized);
      } catch (err) {
        console.error('Dashboard fetch failed:', err);
        // On error, clear the list so the UI shows the empty state and prompts upload.
        setVulns([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    // initial fetch
    fetchVulns();

    // listen for global change events so the dashboard can refresh when data is imported elsewhere
    const onChange = () => {
      fetchVulns();
    };
    window.addEventListener('vulnerabilities:changed', onChange as EventListener);

    return () => {
      cancelled = true;
      window.removeEventListener('vulnerabilities:changed', onChange as EventListener);
    };
  }, []);

  // KPIs
  const totalVulnerabilities = vulns.length;
  const criticalHigh = vulns.filter((v) =>
    ["Critical", "High"].includes(v.severity)
  ).length;
  const awaitingReview = vulns.filter((v) =>
    ["New", "Under Review"].includes(v.status)
  ).length;
  // Prefer the source-of-truth from the Mitigations page when available.
  // If mitigations are still loading, fall back to counting vulns marked 'Mitigated'.
  const mitigated = !mitigationsLoading
    ? mitigations.filter((m) => m.status === "implemented").length
    : vulns.filter((v) => v.status === "Mitigated").length;

  // Distribution data
  const severityData = useMemo(
    () => [
      {
        name: "Critical",
        value: vulns.filter((v) => v.severity === "Critical").length,
        colorClass: "bg-danger",
      },
      {
        name: "High",
        value: vulns.filter((v) => v.severity === "High").length,
        colorClass: "bg-warning",
      },
      {
        name: "Medium",
        value: vulns.filter((v) => v.severity === "Medium").length,
        colorClass: "bg-info",
      },
      {
        name: "Low",
        value: vulns.filter((v) => v.severity === "Low").length,
        colorClass: "bg-success",
      },
    ],
    [vulns]
  );

  const statusData = useMemo(
    () => [
      {
        name: "New",
        value: vulns.filter((v) => v.status === "New").length,
      },
      {
        name: "Under Review",
        value: vulns.filter((v) => v.status === "Under Review").length,
      },
      {
        name: "Mitigated",
        value: vulns.filter((v) => v.status === "Mitigated").length,
      },
      {
        name: "Accepted",
        value: vulns.filter((v) => v.status === "Accepted").length,
      },
    ],
    [vulns]
  );

  // Build trend data (weekly) from vulnerabilities in the catalog
  const trendData = useMemo(() => {
    // Helper: get week-start (Monday) key YYYY-MM-DD from a date string
    const weekKey = (dateStr?: string) => {
      if (!dateStr) return null;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return null;
      const day = d.getDay(); // 0 (Sun) - 6
      const diffToMonday = (day + 6) % 7; // Monday = 0
      const wkStart = new Date(d);
      wkStart.setDate(d.getDate() - diffToMonday);
      // Normalize to YYYY-MM-DD
      return wkStart.toISOString().slice(0, 10);
    };

    const discovered: Record<string, number> = {};
    const mitigated: Record<string, number> = {};

    // Count per week based on publishedDate and status
    vulns.forEach((v) => {
      const wk = weekKey(v.publishedDate as string);
      if (!wk) return;
      discovered[wk] = (discovered[wk] || 0) + 1;
      if (v.status === 'Mitigated') {
        // approximate mitigation week by published week (no mitigated_date available)
        mitigated[wk] = (mitigated[wk] || 0) + 1;
      }
    });

    // Build a sorted list of the last 8 weeks (including current)
    const weeks: string[] = [];
    const today = new Date();
    const curDay = today.getDay();
    const curDiff = (curDay + 6) % 7; // Monday offset
    const curMonday = new Date(today);
    curMonday.setDate(today.getDate() - curDiff);
    for (let i = 7; i >= 0; i--) {
      const dt = new Date(curMonday);
      dt.setDate(curMonday.getDate() - i * 7);
      weeks.push(dt.toISOString().slice(0, 10));
    }

    return weeks.map((wk) => ({
      week: wk,
      discovered: discovered[wk] || 0,
      mitigated: mitigated[wk] || 0,
    }));
  }, [vulns]);

  const recentCVEs = useMemo(() => {
    const parseDate = (s?: string | undefined) => {
      if (!s) return null;
      const tryIso = new Date(s);
      if (!isNaN(tryIso.getTime())) return tryIso;
      // fallback: strip time portion
      const dateOnly = s.split('T')[0].split(' ')[0];
      const try2 = new Date(dateOnly);
      return isNaN(try2.getTime()) ? null : try2;
    };

    return [...vulns]
      .sort((a, b) => {
        const da = parseDate(a.publishedDate) ?? new Date(0);
        const db = parseDate(b.publishedDate) ?? new Date(0);
        return db.getTime() - da.getTime();
      })
      .slice(0, 5);
  }, [vulns]);
  const sevBadge = (s: UiVuln["severity"]) =>
    s === "Critical" || s === "High"
      ? "danger"
      : s === "Medium"
      ? "secondary"
      : "success";

  

  // ---------- Export: Print / Save-as-PDF ----------
  const printDashboard = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="p-4">
        <h5 className="mb-0">Loading dashboard…</h5>
      </div>
    );
  }

  // If there are no vulnerabilities in the DB, show an instructional empty state
  if (!loading && vulns.length === 0) {
    return (
      <div className="p-4">
        <div className="text-center py-5">
          <i className="bi bi-search display-4 text-muted mb-3"></i>
          <h4 className="text-muted">No vulnerabilities found</h4>
          <p className="text-muted">Please upload a CVE on the Vulnerability Catalog page to populate the dashboard.</p>
          <div className="mt-3">
            <a href="/vulnerability-catalog" className="btn btn-primary">Go to Vulnerability Catalog</a>
          </div>
        </div>
      </div>
    );
  }

  // totals for percentages
  const maxSeverity = Math.max(
    1,
    severityData.reduce((acc, s) => acc + s.value, 0)
  );
  const maxStatus = Math.max(
    1,
    statusData.reduce((acc, s) => acc + s.value, 0)
  );

  return (
    <div className="p-4" id="dashboard-export">
      {/* Header + buttons */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h1 className="h3 mb-1">Vulnerability Dashboard</h1>
          <div className="text-muted">
            Overview of your organization&apos;s security posture
          </div>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-primary"
            onClick={() => setIsReportDialogOpen(true)}
          >
            <FileText size={18} className="me-2" />
            Create Report
          </button>
          <button
            className="btn btn-outline-primary"
            onClick={printDashboard}
            title="Print / Save as PDF"
          >
            <Printer size={18} />
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div className="text-muted small">Total Vulnerabilities</div>
                <Shield size={18} />
              </div>
              <div className="fs-3 fw-bold">{totalVulnerabilities}</div>
              <div className="text-muted small">Across all systems</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div className="text-muted small">Critical &amp; High</div>
                <AlertTriangle size={18} className="text-danger" />
              </div>
              <div className="fs-3 fw-bold text-danger">{criticalHigh}</div>
              <div className="text-muted small">Require immediate attention</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div className="text-muted small">Awaiting Review</div>
                <Clock size={18} />
              </div>
              <div className="fs-3 fw-bold">{awaitingReview}</div>
              <div className="text-muted small">Need assessment</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div className="text-muted small">Mitigated</div>
                <CheckCircle size={18} className="text-success" />
              </div>
              <div className="fs-3 fw-bold text-success">{mitigated}</div>
              <div className="text-muted small">Successfully addressed</div>
            </div>
          </div>
        </div>
      </div>

      {/* “Charts” row – progress-based visualizations */}
      <div className="row g-3 mb-3">
        {/* Severity */}
        <div className="col-12 col-lg-6">
          <div className="card h-100">
            <div className="card-body">
              <div className="fw-semibold mb-1">
                Vulnerability Severity Distribution
              </div>
              <div className="text-muted small mb-2">
                Breakdown by risk level
              </div>
              <div className="d-flex flex-column gap-2">
                {severityData.map((s) => {
                  const pct = Math.round((s.value / maxSeverity) * 100);
                  return (
                    <div key={s.name}>
                      <div className="d-flex justify-content-between small mb-1">
                        <span>{s.name}</span>
                        <span>
                          {s.value} ({pct}%)
                        </span>
                      </div>
                      <div className="progress" style={{ height: 8 }}>
                        <div
                          className={`progress-bar ${s.colorClass}`}
                          role="progressbar"
                          style={{ width: `${pct}%` }}
                          aria-valuenow={pct}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="col-12 col-lg-6">
          <div className="card h-100">
            <div className="card-body">
              <div className="fw-semibold mb-1">Vulnerability Status</div>
              <div className="text-muted small mb-2">
                Current processing state
              </div>
              <div className="d-flex flex-column gap-2">
                {statusData.map((s) => {
                  const pct = Math.round((s.value / maxStatus) * 100);
                  return (
                    <div key={s.name}>
                      <div className="d-flex justify-content-between small mb-1">
                        <span>{s.name}</span>
                        <span>
                          {s.value} ({pct}%)
                        </span>
                      </div>
                      <div className="progress" style={{ height: 8 }}>
                        <div
                          className="progress-bar bg-primary"
                          role="progressbar"
                          style={{ width: `${pct}%` }}
                          aria-valuenow={pct}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trend “chart” – simple table */}
      <div className="card mb-3">
        <div className="card-body">
          <div className="d-flex align-items-center gap-2 mb-2">
            <TrendingUp size={20} />
            <div className="fw-semibold">Vulnerability Trends</div>
          </div>
          <div className="text-muted small mb-2">
            Discovery vs mitigation over time
          </div>
          <div className="table-responsive">
            <table className="table table-sm align-middle mb-0">
              <thead>
                <tr>
                  <th>Week</th>
                  <th>Discovered</th>
                  <th>Mitigated</th>
                  <th>Net</th>
                </tr>
              </thead>
              <tbody>
                {trendData.map((t) => {
                  const net = t.discovered - t.mitigated;
                  return (
                    <tr key={t.week}>
                      <td>{t.week}</td>
                      <td>{t.discovered}</td>
                      <td>{t.mitigated}</td>
                      <td>
                        {net > 0 && (
                          <span className="badge text-bg-danger">
                            +{net} backlog
                          </span>
                        )}
                        {net < 0 && (
                          <span className="badge text-bg-success">
                            {Math.abs(net)} improvement
                          </span>
                        )}
                        {net === 0 && (
                          <span className="badge text-bg-secondary">Stable</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent CVEs */}
      <div className="card">
        <div className="card-body">
          <div className="fw-semibold mb-1">Recent Vulnerabilities</div>
          <div className="text-muted small mb-3">
            Latest security issues requiring attention
          </div>
          <div className="d-flex flex-column gap-3">
            {recentCVEs.map((cve) => (
              <div key={cve.id} className="p-3 border rounded">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="badge text-bg-light text-dark">
                    {cve.cveId}
                  </span>
                  <span className={`badge text-bg-${sevBadge(cve.severity)}`}>
                    {cve.severity}
                  </span>
                  <span className="badge text-bg-light text-dark">
                    {cve.status}
                  </span>
                </div>
                <div className="fw-medium mb-1">{cve.title}</div>
                <div className="text-muted small mb-2">
                  {cve.description || "No description available."}
                </div>
                <div className="d-flex flex-wrap gap-3 text-muted small">
                  {cve.cvssScore != null && (
                    <span>CVSS: {cve.cvssScore}</span>
                  )}
                  {cve.publishedDate && (
                    <span>Published: {cve.publishedDate}</span>
                  )}
                  <span>Systems: {cve.affectedSystems.length}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Report dialog */}
      <ReportGenerator
        isOpen={isReportDialogOpen}
        onClose={() => setIsReportDialogOpen(false)}
        dashboardData={{
          totalVulnerabilities,
          criticalHigh,
          awaitingReview,
          mitigated,
          severityData,
          statusData,
          trendData,
          recentCVEs,
        }}
      />
    </div>
  );
}

export default Dashboard;