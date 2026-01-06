// Shared mapping between backend enum values and frontend UI labels
export type UiStatus = 'New' | 'Under Review' | 'Mitigated' | 'Accepted';

export const mapBackendStatus = (backendStatus?: string | null): UiStatus => {
  if (!backendStatus) return 'Accepted';
  const statusMap: Record<string, UiStatus> = {
    Ongoing: 'New',
    Accepted: 'Accepted',
    Closed: 'Mitigated',
    Mitigated: 'Mitigated',
  } as const;
  return (statusMap as Record<string, UiStatus>)[backendStatus] || 'New';
};

export default mapBackendStatus;
