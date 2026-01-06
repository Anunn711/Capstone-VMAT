import React, { useState } from 'react';
import { useMitigations } from '../hooks/useMitigations';
import { useMitigationFilters } from '../hooks/useMitigationFilters';
import MitigationStats from './MitigationStats';
import MitigationFilters from './MitigationFilters';
import MitigationList from './MitigationList';
import MitigationForm from './MitigationForm';
import MitigationStatusModal from './MitigationStatusModal';

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
  affected_systems: string; // JSON string from backend
  risk_reduction: number;
  icon: string;
  due_date: string;
  created_at: string;
  updated_at: string;
  // Implementation tracking fields
  implemented_by?: string;
  implementation_date?: string;
  verification_date?: string;
  implementation_notes?: string;
  vulnerability_id: number;
  vulnerability: Vulnerability;
}

const Mitigations: React.FC = () => {
  const {
    mitigations,
    vulnerabilities,
    loading,
    error,
    createMitigation,
    updateMitigation,
    deleteMitigation
  } = useMitigations();

  const {
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filterPriority,
    setFilterPriority,
    filteredMitigations
  } = useMitigationFilters(mitigations);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [editingMitigation, setEditingMitigation] = useState<Mitigation | null>(null);
  
  // Form state for new/edit mitigation
  const [newMitigation, setNewMitigation] = useState({
    title: '',
    type: '',
    description: '',
    impact_category: '',
    effort: 'medium',
    cost: 'medium',
    affected_systems: '',
    vulnerability_id: ''
  });

  // Form state for status update
  const [statusForm, setStatusForm] = useState({
    status: '',
    implemented_by: '',
    implementation_date: '',
    verification_date: '',
    notes: '',
    priority: ''
  });

  // Helper function to parse affected systems JSON
  const parseAffectedSystems = (affectedSystems: string): string[] => {
    try {
      return JSON.parse(affectedSystems);
    } catch {
      return [];
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setNewMitigation(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStatusInputChange = (field: string, value: string) => {
    setStatusForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateMitigation = async () => {
    try {
      if (!newMitigation.title || !newMitigation.description || !newMitigation.vulnerability_id || !newMitigation.impact_category) {
        alert('Please fill in all required fields');
        return;
      }

      const affectedSystemsArray = newMitigation.affected_systems
        .split(',')
        .map(system => system.trim())
        .filter(system => system.length > 0);

      const mitigationData = {
        ...newMitigation,
        vulnerability_id: parseInt(newMitigation.vulnerability_id),
        affected_systems: JSON.stringify(affectedSystemsArray),
        category: 'General'
      };

      await createMitigation(mitigationData);
      handleCloseModal();
    } catch (err) {
      console.error('Error creating mitigation:', err);
      alert('Failed to create mitigation');
    }
  };

  const handleEditMitigation = (mitigation: Mitigation) => {
    setEditingMitigation(mitigation);
    setNewMitigation({
      title: mitigation.title,
      type: mitigation.type,
      description: mitigation.description,
      impact_category: mitigation.impact_category,
      effort: mitigation.effort,
      cost: mitigation.cost,
      affected_systems: parseAffectedSystems(mitigation.affected_systems).join(', '),
      vulnerability_id: mitigation.vulnerability_id.toString()
    });
    setShowEditModal(true);
  };

  const handleUpdateMitigation = async () => {
    if (!editingMitigation) return;
    
    try {
      const affectedSystemsArray = newMitigation.affected_systems
        .split(',')
        .map(system => system.trim())
        .filter(system => system.length > 0);

      const mitigationData = {
        ...newMitigation,
        vulnerability_id: parseInt(newMitigation.vulnerability_id),
        affected_systems: JSON.stringify(affectedSystemsArray)
      };

      await updateMitigation(editingMitigation.id, mitigationData);
      handleCloseModal();
    } catch (err) {
      console.error('Error updating mitigation:', err);
      alert('Failed to update mitigation');
    }
  };

  const handleEditStatus = (mitigation: Mitigation) => {
    setEditingMitigation(mitigation);
    setStatusForm({
      status: mitigation.status,
      implemented_by: mitigation.implemented_by || '',
      implementation_date: mitigation.implementation_date || mitigation.due_date || '',
      verification_date: mitigation.verification_date || '',
      notes: mitigation.implementation_notes || '',
      priority: mitigation.priority
    });
    setShowStatusModal(true);
  };

  const handleUpdateStatus = async () => {
    if (!editingMitigation) return;
    
    try {
      const updateData = {
        status: statusForm.status,
        priority: statusForm.priority,
        implemented_by: statusForm.implemented_by,
        implementation_date: statusForm.implementation_date || null,
        verification_date: statusForm.verification_date || null,
        implementation_notes: statusForm.notes
      };

      await updateMitigation(editingMitigation.id, updateData);
      handleCloseModal();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    }
  };

  const handleDeleteMitigation = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this mitigation?')) {
      try {
        await deleteMitigation(id);
      } catch (err) {
        console.error('Error deleting mitigation:', err);
        alert('Failed to delete mitigation');
      }
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowStatusModal(false);
    setEditingMitigation(null);
    // Reset forms when closing
    setNewMitigation({
      title: '',
      type: '',
      description: '',
      impact_category: '',
      effort: 'medium',
      cost: 'medium',
      affected_systems: '',
      vulnerability_id: ''
    });
    setStatusForm({
      status: '',
      implemented_by: '',
      implementation_date: '',
      verification_date: '',
      notes: '',
      priority: ''
    });
  };

  // Show a non-blocking error banner instead of replacing the entire view when network/cache errors occur
  const ErrorBanner = error ? (
    <div className="alert alert-danger mb-3">Error loading mitigations: {error}</div>
  ) : null;

  return (
    <div className="container-fluid p-4">
      {ErrorBanner}
      <MitigationFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterPriority={filterPriority}
        setFilterPriority={setFilterPriority}
        onCreateClick={() => setShowCreateModal(true)}
      />

      <MitigationStats mitigations={mitigations} />

      <MitigationList
        mitigations={filteredMitigations}
        loading={loading}
        onEdit={handleEditMitigation}
        onEditStatus={handleEditStatus}
        onDelete={handleDeleteMitigation}
      />

      <MitigationForm
        show={showCreateModal || showEditModal}
        isEditing={showEditModal}
        formData={newMitigation}
        vulnerabilities={vulnerabilities}
        onClose={handleCloseModal}
        onSubmit={showEditModal ? handleUpdateMitigation : handleCreateMitigation}
        onInputChange={handleInputChange}
      />

      <MitigationStatusModal
        show={showStatusModal}
        mitigation={editingMitigation}
        formData={statusForm}
        onClose={handleCloseModal}
        onSubmit={handleUpdateStatus}
        onInputChange={handleStatusInputChange}
      />
    </div>
  );
};

export default Mitigations;