import React, { useEffect, useState } from 'react';

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
  ticket_link?: string;
  analyst_notes?: string;
}

interface Props {
  vulnerability: Vulnerability;
  onClose: () => void;
  // onSave may return a boolean or a promise resolving to boolean to indicate success (true)
  // or failure (false). If omitted, the modal will simply close.
  onSave?: (reviewData: any) => Promise<boolean | void> | boolean | void;
}

const ReviewModal: React.FC<Props> = ({ vulnerability, onClose, onSave }) => {
  const [reviewData, setReviewData] = useState({
    status: vulnerability.status || 'Ongoing',
    ticketId: vulnerability.ticket_link || `VULN-${new Date().getFullYear()}-${String(vulnerability.id).padStart(3, '0')}`,
    severity: vulnerability.severity || 'Critical',
    reviewNotes: vulnerability.analyst_notes || ''
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    // Prevent background scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const handleSave = async () => {
    if (!onSave) {
      onClose();
      return;
    }

    setSaveError(null);
    try {
      setSaving(true);
      const result = await onSave(reviewData);
      // If the onSave handler returns false, treat as failure
      if (result === false) {
        setSaveError('Save failed. Please try again when the server is available.');
        return;
      }
      // success — close modal
      onClose();
    } catch (err) {
      console.error('Error saving review:', err);
      setSaveError('Save failed. Please try again when the server is available.');
      return;
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              Review Vulnerability: {vulnerability.cve_id}
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
            ></button>
          </div>
          
          <div className="modal-body">
            {saveError && (
              <div className="alert alert-danger" role="alert">
                {saveError}
              </div>
            )}
            <p className="text-muted">Update vulnerability status, severity, and review notes</p>
            
            {/* Status */}
            <div className="mb-3">
              <label className="form-label">Status</label>
              <select 
                value={reviewData.status}
                onChange={(e) => setReviewData({...reviewData, status: e.target.value})}
                className="form-select"
              >
                <option value="Ongoing">Ongoing</option>
                <option value="Accepted">Accepted</option>
                <option value="Closed">Closed</option>
                <option value="Mitigated">Mitigated</option>
              </select>
            </div>

            {/* Ticket ID and Severity */}
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Ticket ID</label>
                <input 
                  value={reviewData.ticketId}
                  onChange={(e) => setReviewData({...reviewData, ticketId: e.target.value})}
                  className="form-control"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Severity</label>
                <select 
                  value={reviewData.severity}
                  onChange={(e) => setReviewData({...reviewData, severity: e.target.value})}
                  className="form-select"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            {/* Review Notes */}
            <div className="mb-3">
              <label className="form-label">Review Notes</label>
              <textarea 
                value={reviewData.reviewNotes}
                onChange={(e) => setReviewData({...reviewData, reviewNotes: e.target.value})}
                placeholder="Add your assessment notes..."
                rows={5}
                className="form-control"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-primary" 
              disabled={saving}
              onClick={handleSave}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;