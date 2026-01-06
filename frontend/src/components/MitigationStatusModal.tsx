import React from 'react';

interface Mitigation {
  id: number;
  title: string;
  description: string;
  status: 'implemented' | 'in-progress' | 'pending' | 'rejected';
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  type: string;
  impact_category: string;
  effort: string;
  cost: string;
  affected_systems: string;
  risk_reduction: number;
  icon: string;
  due_date: string;
  created_at: string;
  updated_at: string;
  implemented_by?: string;
  implementation_date?: string;
  verification_date?: string;
  implementation_notes?: string;
  vulnerability_id: number;
  vulnerability: any;
}

interface StatusFormData {
  status: string;
  implemented_by: string;
  implementation_date: string;
  verification_date: string;
  notes: string;
  priority: string;
}

interface MitigationStatusModalProps {
  show: boolean;
  mitigation: Mitigation | null;
  formData: StatusFormData;
  onClose: () => void;
  onSubmit: () => void;
  onInputChange: (field: string, value: string) => void;
}

const MitigationStatusModal: React.FC<MitigationStatusModalProps> = ({
  show,
  mitigation,
  formData,
  onClose,
  onSubmit,
  onInputChange
}) => {
  if (!show || !mitigation) return null;

  return (
    <div className="modal show d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Update Mitigation Status</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <div className="modal-body">
            <div className="mb-3">
              <h6 className="text-muted">Updating: {mitigation.title}</h6>
            </div>
            
            <form>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) => onInputChange('status', e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="implemented">Implemented</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Priority</label>
                    <select
                      className="form-select"
                      value={formData.priority}
                      onChange={(e) => onInputChange('priority', e.target.value)}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Implemented By</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.implemented_by}
                  onChange={(e) => onInputChange('implemented_by', e.target.value)}
                  placeholder="Enter name or team responsible"
                />
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Implementation Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.implementation_date}
                      onChange={(e) => onInputChange('implementation_date', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Verification Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.verification_date}
                      onChange={(e) => onInputChange('verification_date', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Implementation Notes</label>
                <textarea
                  className="form-control"
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => onInputChange('notes', e.target.value)}
                  placeholder="Add notes about implementation progress, challenges, or verification results..."
                ></textarea>
              </div>
            </form>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={onSubmit}>
              Update Status
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MitigationStatusModal;