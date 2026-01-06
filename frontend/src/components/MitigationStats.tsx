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

interface MitigationStatsProps {
  mitigations: Mitigation[];
}

const MitigationStats: React.FC<MitigationStatsProps> = ({ mitigations }) => {
  const implementedCount = mitigations.filter(m => m.status === 'implemented').length;
  const inProgressCount = mitigations.filter(m => m.status === 'in-progress').length;
  const pendingCount = mitigations.filter(m => m.status === 'pending').length;
  const criticalCount = mitigations.filter(m => m.priority === 'critical').length;

  return (
    <div className="row mb-4">
      <div className="col-lg-3 col-md-6 mb-3">
        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="card-title text-muted mb-0 small fw-medium">Total Mitigations</h6>
              <i className="bi bi-wrench text-muted"></i>
            </div>
            <div className="h4 mb-1 fw-bold">{mitigations.length}</div>
            <small className="text-muted">Security controls</small>
          </div>
        </div>
      </div>
      
      <div className="col-lg-3 col-md-6 mb-3">
        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="card-title text-muted mb-0 small fw-medium">Implemented</h6>
              <i className="bi bi-check-circle-fill text-success"></i>
            </div>
            <div className="h4 mb-1 fw-bold text-success">{implementedCount}</div>
            <small className="text-muted">Successfully deployed</small>
          </div>
        </div>
      </div>
      
      <div className="col-lg-3 col-md-6 mb-3">
        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="card-title text-muted mb-0 small fw-medium">In Progress</h6>
              <i className="bi bi-clock text-warning"></i>
            </div>
            <div className="h4 mb-1 fw-bold text-warning">{inProgressCount}</div>
            <small className="text-muted">Currently implementing</small>
          </div>
        </div>
      </div>
      
      <div className="col-lg-3 col-md-6 mb-3">
        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="card-title text-muted mb-0 small fw-medium">Critical Priority</h6>
              <i className="bi bi-exclamation-triangle-fill text-danger"></i>
            </div>
            <div className="h4 mb-1 fw-bold text-danger">{criticalCount}</div>
            <small className="text-muted">High-priority items</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MitigationStats;