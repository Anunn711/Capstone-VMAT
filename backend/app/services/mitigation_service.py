from app.dao.mitigation_dao import MitigationDAO
from app.models.mitigation import Mitigation

class MitigationService:
    @staticmethod
    def get_all_mitigations(status=None, priority=None, search=None):
        """Get all mitigations with optional filtering"""
        return MitigationDAO.get_all_mitigations(status=status, priority=priority, search=search)
    
    @staticmethod
    def get_mitigation_by_id(mitigation_id):
        """Get a mitigation by ID"""
        return MitigationDAO.get_mitigation_by_id(mitigation_id)
    
    @staticmethod
    def create_mitigation(data):
        """Create a new mitigation"""
        # Set default values for optional fields
        mitigation_data = {
            'title': data['title'],
            'description': data['description'],
            'vulnerability_id': data['vulnerability_id'],
            'impact_category': data.get('impact_category', 'confidentiality'),
            'status': data.get('status', 'pending'),
            'priority': data.get('priority', 'medium'),
            'category': data.get('category', 'General'),
            'type': data.get('type', 'technical'),
            'effort': data.get('effort', 'medium'),
            'cost': data.get('cost', 'medium'),
            'affected_systems': data.get('affected_systems', '[]'),
            'risk_reduction': data.get('risk_reduction', 0),
            'icon': data.get('icon', '🛡️'),
            'due_date': data.get('due_date')
        }
        
        return MitigationDAO.create_mitigation(mitigation_data)
    
    @staticmethod
    def update_mitigation(mitigation_id, data):
        """Update an existing mitigation"""
        return MitigationDAO.update_mitigation(mitigation_id, data)
    
    @staticmethod
    def delete_mitigation(mitigation_id):
        """Delete a mitigation"""
        return MitigationDAO.delete_mitigation(mitigation_id)
    
    @staticmethod
    def get_mitigation_stats():
        """Get mitigation statistics for dashboard"""
        return MitigationDAO.get_mitigation_stats()