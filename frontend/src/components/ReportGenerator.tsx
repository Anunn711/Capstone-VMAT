import React from 'react';

type SeverityDatum = { name: string; value: number; colorClass?: string };

type UiVuln = {
  id: number;
  cveId: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  cvssScore?: number;
  publishedDate?: string;
  affectedSystems: string[];
};

type DashboardData = {
  totalVulnerabilities: number;
  criticalHigh: number;
  awaitingReview: number;
  mitigated: number;
  severityData: SeverityDatum[];
  statusData: { name: string; value: number }[];
  trendData: any[];
  recentCVEs: UiVuln[];
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  dashboardData: DashboardData;
};

const ReportGenerator: React.FC<Props> = ({ isOpen, onClose, dashboardData }) => {
  if (!isOpen) return null;

  const {
    totalVulnerabilities,
    criticalHigh,
    awaitingReview,
    mitigated,
    severityData,
    recentCVEs,
  } = dashboardData;

  return (
    <div className="modal d-block" tabIndex={-1} role="dialog" style={{ background: 'rgba(0,0,0,0.35)' }}>
      <div className="modal-dialog modal-lg" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Create Report</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">
            <p>Use this dialog to generate or print a dashboard report.</p>

            <h6>Summary</h6>
            <ul>
              <li>Total vulnerabilities: {totalVulnerabilities}</li>
              <li>Critical & High: {criticalHigh}</li>
              <li>Awaiting review: {awaitingReview}</li>
              <li>Mitigated: {mitigated}</li>
            </ul>

            <h6>Severity distribution</h6>
            <div className="d-flex gap-2 mb-3">
              {severityData.map((s) => (
                <div key={s.name} className="text-center">
                  <div className={`badge ${s.colorClass || 'bg-secondary'}`}>{s.name}</div>
                  <div>{s.value}</div>
                </div>
              ))}
            </div>

            <h6>Recent CVEs</h6>
            <ul>
              {recentCVEs.map((c) => (
                <li key={c.id}>
                  <strong>{c.cveId}</strong> — {c.title}
                </li>
              ))}
            </ul>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
            <button className="btn btn-primary" onClick={() => window.print()}>Print / Save as PDF</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;
export { ReportGenerator };
