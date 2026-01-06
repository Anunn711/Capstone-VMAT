import React from 'react';

interface Vulnerability {
  id: number;
  cve_id: string;
  software_vendors: string;
  software_names: string;
  software_versions: string;
  os_platforms: string;
  vulnerability_descriptions: string;
}

interface MitigationFormData {
  title: string;
  type: string;
  description: string;
  impact_category: string;
  effort: string;
  cost: string;
  affected_systems: string;
  vulnerability_id: string;
}

interface MitigationFormProps {
  show: boolean;
  isEditing: boolean;
  formData: MitigationFormData;
  vulnerabilities: Vulnerability[];
  onClose: () => void;
  onSubmit: () => void;
  onInputChange: (field: string, value: string) => void;
}

const MitigationForm: React.FC<MitigationFormProps> = ({
  show,
  isEditing,
  formData,
  vulnerabilities,
  onClose,
  onSubmit,
  onInputChange
}) => {
  if (!show) return null;

  return (
    <div className="modal show d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {isEditing ? 'Edit Mitigation' : 'Create New Mitigation'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <div className="modal-body">
            <form>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.title}
                      onChange={(e) => onInputChange('title', e.target.value)}
                      placeholder="Enter mitigation title"
                    />
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Type *</label>
                    <select
                      className="form-select"
                      value={formData.type}
                      onChange={(e) => onInputChange('type', e.target.value)}
                    >
                      <option value="">Select Type</option>
                      <option value="technical">Technical</option>
                      <option value="administrative">Administrative</option>
                      <option value="physical">Physical</option>
                      <option value="compensating">Compensating</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Description *</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => onInputChange('description', e.target.value)}
                  placeholder="Describe the mitigation strategy"
                ></textarea>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Impact Category *</label>
                    <select
                      className="form-select"
                      value={formData.impact_category}
                      onChange={(e) => onInputChange('impact_category', e.target.value)}
                    >
                      <option value="">Select Impact Category</option>
                      <option value="confidentiality">Confidentiality</option>
                      <option value="integrity">Integrity</option>
                      <option value="availability">Availability</option>
                      <option value="accountability">Accountability</option>
                    </select>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Vulnerability *</label>
                    <select
                      className="form-select"
                      value={formData.vulnerability_id}
                      onChange={(e) => onInputChange('vulnerability_id', e.target.value)}
                    >
                      <option value="">Select Vulnerability</option>
                      {vulnerabilities.map((vuln) => (
                        <option key={vuln.id} value={vuln.id}>
                          {vuln.cve_id} - {vuln.software_names}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Implementation Effort</label>
                    <select
                      className="form-select"
                      value={formData.effort}
                      onChange={(e) => onInputChange('effort', e.target.value)}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="very-high">Very High</option>
                    </select>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Implementation Cost</label>
                    <select
                      className="form-select"
                      value={formData.cost}
                      onChange={(e) => onInputChange('cost', e.target.value)}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="very-high">Very High</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Affected Systems</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.affected_systems}
                  onChange={(e) => onInputChange('affected_systems', e.target.value)}
                  placeholder="Enter systems affected (comma-separated)"
                />
              </div>
            </form>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={onSubmit}>
              {isEditing ? 'Update' : 'Create'} Mitigation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MitigationForm;