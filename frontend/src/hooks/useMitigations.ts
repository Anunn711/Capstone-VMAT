import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../services/api';
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

export const useMitigations = () => {
  const [mitigations, setMitigations] = useState<Mitigation[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMitigations = useCallback(async () => {
    try {
  const response = await apiFetch('/api/mitigations');
      if (!response.ok) throw new Error('Failed to fetch mitigations');
      const data = await response.json();
      setMitigations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  const fetchVulnerabilities = useCallback(async () => {
    try {
  const response = await apiFetch('/api/vulnerabilities');
      if (!response.ok) throw new Error('Failed to fetch vulnerabilities');
      const data = await response.json();
      setVulnerabilities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  const createMitigation = useCallback(async (mitigationData: any) => {
    try {
      const response = await apiFetch('/api/mitigations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mitigationData)
      });

      if (!response.ok) throw new Error('Failed to create mitigation');
      
      const newMitigation = await response.json();
      setMitigations(prev => [...prev, newMitigation]);
      return newMitigation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  }, []);

  const updateMitigation = useCallback(async (id: number, mitigationData: any) => {
    try {
      const response = await apiFetch(`/api/mitigations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mitigationData)
      });

      if (!response.ok) throw new Error('Failed to update mitigation');
      
      const updatedMitigation = await response.json();
      setMitigations(prev => prev.map(m => m.id === id ? updatedMitigation : m));
      return updatedMitigation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  }, []);

  const deleteMitigation = useCallback(async (id: number) => {
    try {
      const response = await apiFetch(`/api/mitigations/${id}`, { method: 'DELETE' });

      if (!response.ok) throw new Error('Failed to delete mitigation');
      
      setMitigations(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchMitigations(), fetchVulnerabilities()]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchMitigations, fetchVulnerabilities]);

  return {
    mitigations,
    vulnerabilities,
    loading,
    error,
    createMitigation,
    updateMitigation,
    deleteMitigation,
    refetch: () => {
      fetchMitigations();
      fetchVulnerabilities();
    }
  };
};