import { useState, useMemo } from 'react';

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

export const useMitigationFilters = (mitigations: Mitigation[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const filteredMitigations = useMemo(() => {
    return mitigations.filter(mitigation => {
      const matchesSearch = mitigation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           mitigation.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           mitigation.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || mitigation.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || mitigation.priority === filterPriority;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [mitigations, searchTerm, filterStatus, filterPriority]);

  return {
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filterPriority,
    setFilterPriority,
    filteredMitigations
  };
};