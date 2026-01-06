from app import db
from datetime import datetime

class Mitigation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    
    # Basic Information
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    
    # Status and Priority
    status = db.Column(db.Enum('implemented', 'in-progress', 'pending', 'rejected'), 
                      default='pending', nullable=False)
    priority = db.Column(db.Enum('critical', 'high', 'medium', 'low'), 
                        default='medium', nullable=False)
    
    # Classification
    category = db.Column(db.String(100), nullable=False)
    type = db.Column(db.Enum('technical', 'administrative', 'physical', 'compensating'), 
                    default='technical', nullable=False)
    impact_category = db.Column(db.Enum('confidentiality', 'integrity', 'availability', 'accountability'), 
                               nullable=False)
    
    # Implementation Details
    effort = db.Column(db.Enum('low', 'medium', 'high', 'very-high'), 
                      default='medium', nullable=False)
    cost = db.Column(db.Enum('low', 'medium', 'high', 'very-high'), 
                    default='medium', nullable=False)
    
    # Systems and Risk
    affected_systems = db.Column(db.Text)  # JSON array stored as text
    risk_reduction = db.Column(db.Integer, default=0)  # Percentage 0-100
    icon = db.Column(db.String(10), default='🛡️')
    
    # Dates
    due_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Implementation Tracking (New Fields)
    implemented_by = db.Column(db.String(255))  # Who is implementing
    implementation_date = db.Column(db.Date)    # When implementation occurred
    verification_date = db.Column(db.Date)      # When verification occurred  
    implementation_notes = db.Column(db.Text)   # Progress notes and updates
    
    # Vulnerability Relationship (Foreign Key)
    vulnerability_id = db.Column(db.Integer, db.ForeignKey('vulnerability.id'), nullable=False)
    
    # Relationship to Vulnerability
    vulnerability = db.relationship('Vulnerability', backref=db.backref('mitigations', lazy=True, cascade="all, delete-orphan"))
    
    def __repr__(self):
        return f"<Mitigation {self.title}>"
    
    def to_dict(self):
        """Convert mitigation to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'status': self.status,
            'priority': self.priority,
            'category': self.category,
            'type': self.type,
            'impact_category': self.impact_category,
            'effort': self.effort,
            'cost': self.cost,
            'affected_systems': self.affected_systems,
            'risk_reduction': self.risk_reduction,
            'icon': self.icon,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            # Implementation tracking fields
            'implemented_by': self.implemented_by,
            'implementation_date': self.implementation_date.isoformat() if self.implementation_date else None,
            'verification_date': self.verification_date.isoformat() if self.verification_date else None,
            'implementation_notes': self.implementation_notes,
            'vulnerability_id': self.vulnerability_id,
            'vulnerability': {
                'id': self.vulnerability.id,
                'cve_id': self.vulnerability.cve_id,
                'software_vendors': self.vulnerability.software_vendors,
                'software_names': self.vulnerability.software_names,
                'software_versions': self.vulnerability.software_versions,
                'os_platforms': self.vulnerability.os_platforms,
                'vulnerability_descriptions': self.vulnerability.vulnerability_descriptions
            } if self.vulnerability else None
        }
