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
  vulnerability: Vulnerability;
}

interface MitigationListProps {
  mitigations: Mitigation[];
  loading: boolean;
  onEdit: (mitigation: Mitigation) => void;
  onEditStatus: (mitigation: Mitigation) => void;
  onDelete: (id: number) => void;
}

const MitigationList: React.FC<MitigationListProps> = ({
  mitigations,
  loading,
  onEdit,
  onEditStatus,
  onDelete
}) => {
  const parseAffectedSystems = (affectedSystems: string): string[] => {
    try {
      return JSON.parse(affectedSystems);
    } catch {
      return [];
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'implemented': return 'badge bg-success';
      case 'in-progress': return 'badge bg-warning text-dark';
      case 'pending': return 'badge bg-secondary';
      case 'rejected': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'critical': return 'badge bg-danger';
      case 'high': return 'badge bg-warning text-dark';
      case 'medium': return 'badge bg-info';
      case 'low': return 'badge bg-light text-dark';
      default: return 'badge bg-secondary';
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (mitigations.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-search display-4 text-muted mb-3"></i>
        <h4 className="text-muted">No mitigations found</h4>
        <p className="text-muted">Try adjusting your search or filter criteria</p>
      </div>
    );
  }

  return (
    <div className="row">
      {mitigations.map((mitigation) => (
        <div key={mitigation.id} className="col-lg-6 col-xl-4 mb-4">
          <div className="card border-0 shadow-sm rounded-3 h-100">
            {/* Card Header */}
            <div className="card-header bg-white border-0 px-4 py-3">
              <div className="d-flex align-items-start justify-content-between">
                <div className="d-flex flex-wrap gap-2 align-items-center flex-1">
                  <span className="fs-4 me-1">{mitigation.icon}</span>
                  <span className={`badge ${getStatusBadgeClass(mitigation.status)} text-uppercase small fw-medium`}>
                    {mitigation.status.replace('-', ' ')}
                  </span>
                  <span className="badge bg-light text-dark small">{mitigation.type}</span>
                  <span className={`badge ${getPriorityBadgeClass(mitigation.priority)} text-uppercase small fw-medium`}>
                    {mitigation.priority} Impact
                  </span>
                </div>
                <div className="dropdown">
                  <button className="btn btn-sm btn-outline-secondary border-0" type="button" data-bs-toggle="dropdown">
                    <i className="bi bi-three-dots"></i>
                  </button>
                  <ul className="dropdown-menu">
                    <li>
                      <button 
                        className="dropdown-item" 
                        onClick={() => onEdit(mitigation)}
                      >
                        <i className="bi bi-pencil me-2"></i>Edit Details
                      </button>
                    </li>
                    <li>
                      <button 
                        className="dropdown-item" 
                        onClick={() => onEditStatus(mitigation)}
                      >
                        <i className="bi bi-arrow-repeat me-2"></i>Edit Status
                      </button>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button 
                        className="dropdown-item text-danger" 
                        onClick={() => onDelete(mitigation.id)}
                      >
                        <i className="bi bi-trash me-2"></i>Delete
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
              <h5 className="card-title mt-2 mb-2 fw-bold">{mitigation.title}</h5>
              <p className="card-text text-muted small mb-0">{mitigation.description}</p>
            </div>

            {/* Card Body */}
            <div className="card-body px-4 py-3">
              {/* Risk Reduction Progress */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="small text-muted">Risk Reduction</span>
                  <span className="small fw-bold">{mitigation.risk_reduction}%</span>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div 
                    className={`progress-bar ${mitigation.risk_reduction >= 80 ? 'bg-success' : mitigation.risk_reduction >= 60 ? 'bg-warning' : 'bg-danger'}`}
                    role="progressbar" 
                    style={{ width: `${mitigation.risk_reduction}%` }}
                    aria-valuenow={mitigation.risk_reduction} 
                    aria-valuemin={0} 
                    aria-valuemax={100}
                  ></div>
                </div>
              </div>

              {/* Effort, Cost, Systems Grid */}
              <div className="row g-3 mb-4">
                <div className="col-4">
                  <div className="text-center">
                    <small className="text-muted d-block">Effort:</small>
                    <small className="fw-medium">{mitigation.effort}</small>
                  </div>
                </div>
                <div className="col-4">
                  <div className="text-center">
                    <small className="text-muted d-block">Cost:</small>
                    <small className="fw-medium">{mitigation.cost}</small>
                  </div>
                </div>
                <div className="col-4">
                  <div className="text-center">
                    <small className="text-muted d-block">Systems:</small>
                    <small className="fw-medium">{parseAffectedSystems(mitigation.affected_systems).length}</small>
                  </div>
                </div>
              </div>

              {/* Implementation Details */}
              <div className="mb-3">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <i className="bi bi-person-circle text-muted" style={{ fontSize: '12px' }}></i>
                  <small className="text-muted">Category: {mitigation.category}</small>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-calendar text-muted" style={{ fontSize: '12px' }}></i>
                  <small className="text-muted">Due: {mitigation.due_date ? new Date(mitigation.due_date).toLocaleDateString() : 'Not set'}</small>
                </div>
              </div>

              {/* Related CVEs */}
              <div className="mb-3">
                <small className="text-muted d-block mb-2">Related Vulnerability:</small>
                <div className="d-flex flex-wrap gap-1">
                  {mitigation.vulnerability && (
                    <span className="badge bg-light text-dark small border">
                      {mitigation.vulnerability.cve_id}
                    </span>
                  )}
                </div>
              </div>

              {/* Affected Systems */}
              <div>
                <small className="text-muted d-block mb-2">Affected Systems:</small>
                <div className="d-flex flex-wrap gap-1">
                  {parseAffectedSystems(mitigation.affected_systems).slice(0, 3).map((system, index) => (
                    <span key={index} className="badge bg-secondary bg-opacity-10 text-dark small">
                      {system}
                    </span>
                  ))}
                  {parseAffectedSystems(mitigation.affected_systems).length > 3 && (
                    <span className="badge bg-secondary bg-opacity-10 text-dark small">
                      +{parseAffectedSystems(mitigation.affected_systems).length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MitigationList;