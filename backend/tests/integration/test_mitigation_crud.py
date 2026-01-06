import pytest
import json
import uuid
from app.models.mitigation import Mitigation
from app.dao.mitigation_dao import MitigationDAO
from app.dao.user_dao import UserDAO
from app.dao.vulnerability_dao import VulnerabilityDAO

class TestMitigationCRUD:
    
    @pytest.fixture(autouse=True)
    def setup_auth_and_data(self, client, app_context):
        """Setup authenticated user and test vulnerability"""
        self.username = f"testuser_{uuid.uuid4().hex[:8]}"
        UserDAO.create_user(self.username, "password")
        
        # Login
        client.post('/api/login',
                   data=json.dumps({'username': self.username, 'password': 'password'}),
                   content_type='application/json')
        
        # Create test vulnerability for mitigation association
        self.test_vuln = VulnerabilityDAO.create_vulnerability(
            cve_id=f'CVE-2024-{uuid.uuid4().hex[:6]}',
            description='Test vulnerability for mitigation',
            severity='High',
            cvss_score=7.5
        )
    
    def test_create_mitigation_via_api(self, client, app_context):
        """Integration: Create mitigation through API and verify in DB"""
        mitigation_data = {
            'title': 'Apply Security Patch',
            'description': 'Update to version 2.0',
            'priority': 'High',
            'status': 'Pending',
            'vulnerability_id': self.test_vuln.id
        }
        
        response = client.post('/api/mitigations',
                             data=json.dumps(mitigation_data),
                             content_type='application/json')
        
        assert response.status_code == 201
        data = json.loads(response.data)
        mitigation_id = data.get('id')
        
        # Verify in database
        mitigation = MitigationDAO.get_mitigation_by_id(mitigation_id)
        assert mitigation is not None
        assert mitigation.title == 'Apply Security Patch'
        assert mitigation.priority == 'high'
    
    def test_get_all_mitigations_via_api(self, client, app_context):
        """Integration: Retrieve all mitigations from API"""
        # Create test mitigations in DB
        for i in range(3):
            MitigationDAO.create_mitigation(
                title=f'Mitigation {i}',
                description=f'Description {i}',
                priority='Medium',
                vulnerability_id=self.test_vuln.id
            )
        
        response = client.get('/api/mitigations')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data) >= 3
    
    def test_get_mitigation_by_id_via_api(self, client, app_context):
        """Integration: Get specific mitigation by ID"""
        # Create mitigation in DB
        mitigation = MitigationDAO.create_mitigation(
            title='Test Mitigation',
            description='Test description',
            priority='Critical',
            vulnerability_id=self.test_vuln.id
        )
        
        response = client.get(f'/api/mitigations/{mitigation.id}')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['title'] == 'Test Mitigation'
        assert data['priority'] == 'critical'
    
    def test_update_mitigation_via_api(self, client, app_context):
        """Integration: Update mitigation through API and verify in DB"""
        # Create mitigation
        mitigation = MitigationDAO.create_mitigation(
            title='Original Title',
            description='Original description',
            priority='Low',
            status='Pending',
            vulnerability_id=self.test_vuln.id
        )
        
        # Update via API
        update_data = {
            'title': 'Updated Title',
            'priority': 'High',
            'status': 'In Progress'
        }
        
        response = client.put(f'/api/mitigations/{mitigation.id}',
                            data=json.dumps(update_data),
                            content_type='application/json')
        
        assert response.status_code == 200
        
        # Verify in database
        updated = MitigationDAO.get_mitigation_by_id(mitigation.id)
        assert updated.title == 'Updated Title'
        assert updated.priority == 'high'
        assert updated.status == 'in-progress'
    
    def test_delete_mitigation_via_api(self, client, app_context):
        """Integration: Delete mitigation through API and verify in DB"""
        # Create mitigation
        mitigation = MitigationDAO.create_mitigation(
            title='To be deleted',
            description='Delete this',
            priority='Low',
            vulnerability_id=self.test_vuln.id
        )
        mitigation_id = mitigation.id
        
        # Delete via API
        response = client.delete(f'/api/mitigations/{mitigation_id}')
        
        assert response.status_code == 200
        
        # Verify deleted from database
        deleted = MitigationDAO.get_mitigation_by_id(mitigation_id)
        assert deleted is None
    
    def test_filter_mitigations_by_priority(self, client, app_context):
        """Integration: Filter mitigations by priority"""
        # Create mitigations with different priorities
        MitigationDAO.create_mitigation(
            title='High Priority Task', description='Important',
            priority='High', vulnerability_id=self.test_vuln.id
        )
        MitigationDAO.create_mitigation(
            title='Low Priority Task', description='Not urgent',
            priority='Low', vulnerability_id=self.test_vuln.id
        )
        
        response = client.get('/api/mitigations?priority=High')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert all(m['priority'] == 'High' for m in data)
    
    def test_filter_mitigations_by_status(self, client, app_context):
        """Integration: Filter mitigations by status"""
        # Create mitigations with different statuses
        MitigationDAO.create_mitigation(
            title='Pending Task', description='Not started',
            priority='Medium', status='Pending',
            vulnerability_id=self.test_vuln.id
        )
        MitigationDAO.create_mitigation(
            title='Completed Task', description='Finished',
            priority='Medium', status='Completed',
            vulnerability_id=self.test_vuln.id
        )
        
        response = client.get('/api/mitigations?status=Completed')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert all(m['status'] == 'Completed' for m in data)
    
    def test_get_mitigations_for_vulnerability(self, client, app_context):
        """Integration: Get all mitigations for specific vulnerability"""
        # Create multiple mitigations for the vulnerability
        for i in range(3):
            MitigationDAO.create_mitigation(
                title=f'Mitigation {i}',
                description=f'For vulnerability {self.test_vuln.cve_id}',
                priority='Medium',
                vulnerability_id=self.test_vuln.id
            )
        
        response = client.get(f'/api/vulnerabilities/{self.test_vuln.id}/mitigations')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data) >= 3
        assert all(m['vulnerability_id'] == self.test_vuln.id for m in data)
    
    def test_create_mitigation_with_invalid_data(self, client, app_context):
        """Integration: Test API validation with invalid mitigation data"""
        invalid_data = {
            'title': '',  # Empty title
            'priority': 'InvalidPriority',
            'vulnerability_id': 99999  # Non-existent
        }
        
        response = client.post('/api/mitigations',
                             data=json.dumps(invalid_data),
                             content_type='application/json')
        
        assert response.status_code in [400, 422, 404]
    
    def test_update_mitigation_status_workflow(self, client, app_context):
        """Integration: Test mitigation status progression workflow"""
        # Create mitigation
        mitigation = MitigationDAO.create_mitigation(
            title='Patch Application',
            description='Apply security patch',
            priority='High',
            status='Pending',
            vulnerability_id=self.test_vuln.id
        )
        
        # Progress through statuses
        statuses = ['In Progress', 'Implemented']
        for status in statuses:
            response = client.put(f'/api/mitigations/{mitigation.id}',
                                data=json.dumps({'status': status}),
                                content_type='application/json')
            assert response.status_code == 200
            
            # Verify in DB
            updated = MitigationDAO.get_mitigation_by_id(mitigation.id)
            assert updated.status == status.lower().replace(' ', '-')
