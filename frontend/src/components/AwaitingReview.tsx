import React, { useEffect, useState } from 'react';
import { VulnerabilityAPI } from '../services/api';
import ReviewModal from './ReviewModal';

interface Vulnerability {
  id: number;
  cve_id: string;
  software_vendors: string[];
  software_names: string[];
  software_versions: string[];
  os_platforms: string[];
  vulnerability_descriptions: string;
  published_dates: string[];
  discovered_dates: string[];
  cvss_v3_vector?: string[];
  epss_score?: number;
  status?: string;
  reviewed?: boolean;
  severity?: string;
}

const AwaitingReview: React.FC = () => {
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVulnerability, setSelectedVulnerability] = useState<Vulnerability | null>(null);

  useEffect(() => {
    fetchVulnerabilities();
  }, []);

  const fetchVulnerabilities = async () => {
    try {
      const data = await VulnerabilityAPI.getAwaitingReview();
      setVulnerabilities(data);
    } catch (err) {
      setError('Failed to fetch vulnerabilities');
    } finally {
      setLoading(false);
    }
  };

  function normalizeListField(value: any) {
    if (Array.isArray(value)) return value.join(', ');
    if (value == null) return '—';
    if (typeof value === 'string') {
      const s = value.trim();
      try {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed)) return parsed.join(', ');
      } catch (e) {}
      if (s.startsWith('[') && s.endsWith(']')) {
        const inner = s.slice(1, -1).trim();
        const parts = inner.split(',').map((p: string) => p.replace(/^['\"]+|['\"]+$/g, '').trim()).filter(Boolean);
        if (parts.length) return parts.join(', ');
      }
      return s || '—';
    }
    return String(value);
  }

  const openReviewModal = (vulnerability: Vulnerability) => {
    setSelectedVulnerability(vulnerability);
  };

  const closeReviewModal = () => {
    setSelectedVulnerability(null);
  };

  const handleSaveReview = async (reviewData: any) => {
    if (!selectedVulnerability) return;
    try {
      console.log('Saving review:', reviewData);

      // Mark as reviewed if status is Closed or Mitigated (not Ongoing or Accepted)
      const shouldMarkReviewed = !['Ongoing', 'Accepted'].includes(reviewData.status);

      // Prepare the data to match the backend API expectations
      const updateData = {
        status: reviewData.status,
        severity: reviewData.severity,
        reviewed: shouldMarkReviewed,
        analyst_notes: reviewData.reviewNotes,
        ticket_link: reviewData.ticketId,
        review_date: new Date().toISOString()
      };

      // Update the vulnerability — return boolean success so caller (modal) can decide to close
      try {
        await VulnerabilityAPI.updateVulnerability(selectedVulnerability.id, updateData);
      } catch (err) {
        console.error('Error updating vulnerability:', err);
        setError('Failed to save review');
        return false;
      }

      // Refresh the list
      await fetchVulnerabilities();

      console.log('Review saved successfully');
      return true;
    } catch (err) {
      console.error('Unexpected error saving review:', err);
      setError('Failed to save review');
      return false;
    }
  };

  const getSeverityBadgeClass = (severity: string) => {
    const severityVariantMap: Record<string, string> = {
      'critical': 'danger',
      'high': 'danger',
      'medium': 'warning',
      'low': 'secondary',
      'unknown': 'secondary'
    };
    return `bg-${severityVariantMap[severity.toLowerCase()] || 'secondary'}`;
  };

  if (loading) return (
    <div className="container-fluid">
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>
  );
  
  // Show a non-blocking error banner instead of replacing the entire view when network/cache errors occur
  const ErrorBanner = error ? (
    <div className="container-fluid">
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    </div>
  ) : null;

  return (
    <>
      <div className="container-fluid">
        {ErrorBanner}
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mt-4 mb-2">
          <div>
            <h2>
              <i className="bi bi-clock" style={{ color: 'black' }}></i>{' '}
              Awaiting Review
            </h2>
            <p>{vulnerabilities.length} vulnerabilities need assessment and review</p>
          </div>
        </div>

        {/* Vulnerability List */}
        {vulnerabilities.map(vuln => (
          <div className="card mb-3" key={vuln.id}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div className="me-3" style={{ flex: 1 }}>
                  {/* Badges and title */}
                  <div>
                    <span className="badge bg-secondary me-2">{vuln.cve_id}</span>
                    <span className={`badge ${getSeverityBadgeClass(vuln.severity || 'Unknown')} me-2`}>
                      {vuln.severity ? vuln.severity.charAt(0).toUpperCase() + vuln.severity.slice(1).toLowerCase() : 'Unknown'}
                    </span>
                    {vuln.status && <span className="badge bg-dark me-2">{vuln.status}</span>}
                  </div>
                  <h5 className="card-title mt-2 mb-1">{vuln.cve_id}</h5>
                </div>
                <div className="ms-3">
                  <button 
                    className="btn btn-outline-primary"
                    onClick={() => openReviewModal(vuln)}
                  >
                    Review
                  </button>
                </div>
              </div>

              <p className="card-text text-muted small mb-3">{vuln.vulnerability_descriptions}</p>
              
              {/* Labels above values in columns */}
              <div className="row mb-2 align-items-start">
                <div className="col-6 col-md-2 mb-2">
                  <div className="text-muted small">EPSS</div>
                  <div>{typeof vuln.epss_score !== 'undefined' && vuln.epss_score !== null ? `${(Number(vuln.epss_score) * 100).toFixed(2)}%` : '—'}</div>
                </div>
                <div className="col-6 col-md-2 mb-2">
                  <div className="text-muted small">Published</div>
                  <div>{vuln.published_dates[0]?.replace(/(?:T|\s)00:00:00(?:\.0+)?$/, '').trim() || '—'}</div>
                </div>
                <div className="col-6 col-md-2 mb-2">
                  <div className="text-muted small">Vendor</div>
                  <div>{normalizeListField(vuln.software_vendors)}</div>
                </div>
                <div className="col-6 col-md-2 mb-2">
                  <div className="text-muted small">Product</div>
                  <div>{normalizeListField(vuln.software_names)}</div>
                </div>
                <div className="col-12 col-md-4 mb-2">
                  <div className="text-muted small">Systems</div>
                  <div>{normalizeListField(vuln.os_platforms)}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Review Modal */}
      {selectedVulnerability && (
        <ReviewModal
          vulnerability={selectedVulnerability}
          onClose={closeReviewModal}
          onSave={handleSaveReview}
        />
      )}

    </>
  );
};

export default AwaitingReview;
