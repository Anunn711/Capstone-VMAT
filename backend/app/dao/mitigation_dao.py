from app import db
from app.models.mitigation import Mitigation
from sqlalchemy import or_
from datetime import datetime
import json

class MitigationDAO:
    @staticmethod
    def get_all_mitigations(status=None, priority=None, search=None):
        """Get all mitigations with optional filtering"""
        query = Mitigation.query
        
        # Apply filters
        if status and status != 'all':
            query = query.filter(Mitigation.status == status)
        
        if priority and priority != 'all':
            query = query.filter(Mitigation.priority == priority)
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Mitigation.title.ilike(search_term),
                    Mitigation.description.ilike(search_term),
                    Mitigation.category.ilike(search_term)
                )
            )
        
        return query.all()
    
    @staticmethod
    def get_mitigation_by_id(mitigation_id):
        """Get a mitigation by ID"""
        return Mitigation.query.get(mitigation_id)
    
    @staticmethod
    def create_mitigation(data=None, **kwargs):
        """Create a new mitigation"""
        # Support both dict argument and keyword arguments
        if data is not None:
            mitigation_data = data.copy() if isinstance(data, dict) else data
        else:
            mitigation_data = kwargs
        
        # Normalize enum values to lowercase and replace spaces with dashes
        if 'priority' in mitigation_data and mitigation_data['priority']:
            mitigation_data['priority'] = mitigation_data['priority'].lower()
        if 'status' in mitigation_data and mitigation_data['status']:
            status = mitigation_data['status'].lower().replace(' ', '-')
            if status == 'completed':
                status = 'implemented'
            mitigation_data['status'] = status
        if 'type' in mitigation_data and mitigation_data['type']:
            mitigation_data['type'] = mitigation_data['type'].lower().replace(' ', '-')
        if 'effort' in mitigation_data and mitigation_data['effort']:
            mitigation_data['effort'] = mitigation_data['effort'].lower().replace(' ', '-')
        if 'cost' in mitigation_data and mitigation_data['cost']:
            mitigation_data['cost'] = mitigation_data['cost'].lower().replace(' ', '-')
        if 'impact_category' in mitigation_data and mitigation_data['impact_category']:
            mitigation_data['impact_category'] = mitigation_data['impact_category'].lower().replace(' ', '-')
        
        # Provide defaults for required fields if not present
        if 'category' not in mitigation_data:
            mitigation_data['category'] = 'Security'
        if 'impact_category' not in mitigation_data:
            mitigation_data['impact_category'] = 'confidentiality'
        
        mitigation = Mitigation(**mitigation_data)
        db.session.add(mitigation)
        db.session.commit()
        return mitigation
    
    @staticmethod
    def update_mitigation(mitigation_id, data):
        """Update an existing mitigation"""
        mitigation = Mitigation.query.get(mitigation_id)
        if not mitigation:
            return None
        
        # Normalize enum values to lowercase and replace spaces with dashes
        if 'priority' in data and data['priority']:
            data['priority'] = data['priority'].lower()
        if 'status' in data and data['status']:
            status = data['status'].lower().replace(' ', '-')
            if status == 'completed':
                status = 'implemented'
            data['status'] = status
        if 'type' in data and data['type']:
            data['type'] = data['type'].lower().replace(' ', '-')
        if 'effort' in data and data['effort']:
            data['effort'] = data['effort'].lower().replace(' ', '-')
        if 'cost' in data and data['cost']:
            data['cost'] = data['cost'].lower().replace(' ', '-')
        if 'impact_category' in data and data['impact_category']:
            data['impact_category'] = data['impact_category'].lower().replace(' ', '-')
        
        # Update fields that are provided
        for key, value in data.items():
            if hasattr(mitigation, key):
                setattr(mitigation, key, value)
        
        mitigation.updated_at = datetime.utcnow()
        db.session.commit()
        return mitigation
    
    @staticmethod
    def delete_mitigation(mitigation_id):
        """Delete a mitigation"""
        mitigation = Mitigation.query.get(mitigation_id)
        if not mitigation:
            return False
        
        db.session.delete(mitigation)
        db.session.commit()
        return True
    
    @staticmethod
    def get_mitigation_stats():
        """Get mitigation statistics for dashboard"""
        total_mitigations = Mitigation.query.count()
        implemented = Mitigation.query.filter_by(status='implemented').count()
        in_progress = Mitigation.query.filter_by(status='in-progress').count()
        pending = Mitigation.query.filter_by(status='pending').count()
        critical_priority = Mitigation.query.filter_by(priority='critical').count()
        
        # Calculate average risk reduction
        mitigations = Mitigation.query.all()
        avg_risk_reduction = 0
        if mitigations:
            total_risk = sum(m.risk_reduction for m in mitigations)
            avg_risk_reduction = round(total_risk / len(mitigations))
        
        return {
            'total_mitigations': total_mitigations,
            'implemented': implemented,
            'in_progress': in_progress,
            'pending': pending,
            'critical_priority': critical_priority,
            'avg_risk_reduction': avg_risk_reduction
        }