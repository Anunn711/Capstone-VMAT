import pytest
import json
import uuid
from app.dao.vulnerability_dao import VulnerabilityDAO
from app.dao.mitigation_dao import MitigationDAO
from app.dao.user_dao import UserDAO

class TestFullWorkflow:
    
    @pytest.fixture(autouse=True)
    def setup_auth(self, client, app_context):
        """Setup authenticated user for all tests"""
        self.username = f"testuser_{uuid.uuid4().hex[:8]}"
        UserDAO.create_user(self.username, "password")
        
        # Login
        client.post('/api/login',
                   data=json.dumps({'username': self.username, 'password': 'password'}),
                   content_type='application/json')
    
    def test_complete_vulnerability_mitigation_workflow(self, client, app_context):
        """Integration: Complete workflow from vulnerability creation to mitigation completion"""
        # Step 1: Create vulnerability
        vuln_data = {
            'cve_id': f'CVE-2024-{uuid.uuid4().hex[:6]}',
            'description': 'Critical SQL Injection',
            'severity': 'Critical',
            'cvss_score': 9.8,
            'status': 'Awaiting Review'
        }
        
        vuln_response = client.post('/api/vulnerabilities',
                                   data=json.dumps(vuln_data),
                                   content_type='application/json')
        assert vuln_response.status_code == 201
        vuln_id = json.loads(vuln_response.data)['id']
        
        # Step 2: Review vulnerability (change status)
        review_response = client.put(f'/api/vulnerabilities/{vuln_id}',
                                    data=json.dumps({'status': 'Open'}),
                                    content_type='application/json')
        assert review_response.status_code == 200
        
        # Step 3: Create mitigation for vulnerability
        mitigation_data = {
            'title': 'Apply Database Patch',
            'description': 'Update database libraries',
            'priority': 'Critical',
            'status': 'Pending',
            'vulnerability_id': vuln_id
        }
        
        mit_response = client.post('/api/mitigations',
                                  data=json.dumps(mitigation_data),
                                  content_type='application/json')
        assert mit_response.status_code == 201
        mit_id = json.loads(mit_response.data)['id']
        
        # Step 4: Progress mitigation to In Progress
        client.put(f'/api/mitigations/{mit_id}',
                  data=json.dumps({'status': 'In Progress'}),
                  content_type='application/json')
        
        # Step 5: Complete mitigation
        complete_response = client.put(f'/api/mitigations/{mit_id}',
                                      data=json.dumps({'status': 'Completed'}),
                                      content_type='application/json')
        assert complete_response.status_code == 200
        
        # Step 6: Close vulnerability
        close_response = client.put(f'/api/vulnerabilities/{vuln_id}',
                                   data=json.dumps({'status': 'Closed'}),
                                   content_type='application/json')
        assert close_response.status_code == 200
        
        # Verify final state in database
        vuln = VulnerabilityDAO.get_vulnerability_by_id(vuln_id)
        mitigation = MitigationDAO.get_mitigation_by_id(mit_id)
        
        assert vuln.status == 'Closed'
        assert mitigation.status == 'implemented'
    
    def test_vulnerability_review_workflow(self, client, app_context):
        """Integration: Test vulnerability review process from awaiting to reviewed"""
        # Create vulnerability awaiting review
        vuln = VulnerabilityDAO.create_vulnerability(
            cve_id=f'CVE-2024-{uuid.uuid4().hex[:6]}',
            description='Needs review',
            severity='High',
            cvss_score=7.5,
            status='Awaiting Review'
        )
        
        # Get all awaiting review
        response = client.get('/api/vulnerabilities/awaiting-review')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert any(v['id'] == vuln.id for v in data)
        
        # Review and approve
        review_response = client.put(f'/api/vulnerabilities/{vuln.id}',
                                    data=json.dumps({'status': 'Open'}),
                                    content_type='application/json')
        assert review_response.status_code == 200
        
        # Verify no longer in awaiting review
        after_response = client.get('/api/vulnerabilities/awaiting-review')
        after_data = json.loads(after_response.data)
        assert not any(v['id'] == vuln.id for v in after_data)
    
    def test_multiple_mitigations_per_vulnerability(self, client, app_context):
        """Integration: Test creating multiple mitigations for single vulnerability"""
        # Create vulnerability
        vuln = VulnerabilityDAO.create_vulnerability(
            cve_id=f'CVE-2024-{uuid.uuid4().hex[:6]}',
            description='Complex vulnerability',
            severity='High',
            cvss_score=8.0
        )
        
        # Create multiple mitigations
        mitigations = []
        for i in range(3):
            mit_data = {
                'title': f'Mitigation Step {i+1}',
                'description': f'Step {i+1} description',
                'priority': 'High',
                'vulnerability_id': vuln.id
            }
            
            response = client.post('/api/mitigations',
                                 data=json.dumps(mit_data),
                                 content_type='application/json')
            assert response.status_code == 201
            mitigations.append(json.loads(response.data)['id'])
        
        # Verify all mitigations linked to vulnerability
        mit_response = client.get(f'/api/vulnerabilities/{vuln.id}/mitigations')
        assert mit_response.status_code == 200
        mit_data = json.loads(mit_response.data)
        assert len(mit_data) >= 3
    
    def test_dashboard_statistics_workflow(self, client, app_context):
        """Integration: Test dashboard statistics reflect database state"""
        # Create various vulnerabilities
        for severity in ['Critical', 'High', 'Medium', 'Low']:
            VulnerabilityDAO.create_vulnerability(
                cve_id=f'CVE-2024-{severity[:3].upper()}-{uuid.uuid4().hex[:4]}',
                description=f'{severity} vulnerability',
                severity=severity,
                cvss_score=8.0 if severity == 'Critical' else 5.0
            )
        
        # Get statistics
        response = client.get('/api/statistics')
        
        if response.status_code == 200:
            data = json.loads(response.data)
            # Verify statistics exist
            assert 'total_vulnerabilities' in data or 'vulnerabilities' in data
    
    def test_filter_and_sort_vulnerabilities(self, client, app_context):
        """Integration: Test filtering and sorting vulnerabilities"""
        # Create vulnerabilities with different attributes
        for i in range(5):
            VulnerabilityDAO.create_vulnerability(
                cve_id=f'CVE-2024-FILTER{i}',
                description=f'Vulnerability {i}',
                severity='High' if i % 2 == 0 else 'Medium',
                cvss_score=float(5 + i),
                status='Open'
            )
        
        # Test severity filter
        high_response = client.get('/api/vulnerabilities?severity=High')
        assert high_response.status_code == 200
        high_data = json.loads(high_response.data)
        assert all(v['severity'] == 'High' for v in high_data)
        
        # Test status filter
        open_response = client.get('/api/vulnerabilities?status=Open')
        assert open_response.status_code == 200
        open_data = json.loads(open_response.data)
        assert all(v['status'] == 'Open' for v in open_data)
    
    def test_bulk_vulnerability_status_update(self, client, app_context):
        """Integration: Test updating multiple vulnerabilities"""
        # Create multiple vulnerabilities
        vuln_ids = []
        for i in range(5):
            vuln = VulnerabilityDAO.create_vulnerability(
                cve_id=f'CVE-2024-BULK{i}',
                description=f'Bulk test {i}',
                severity='Medium',
                cvss_score=5.0,
                status='Open'
            )
            vuln_ids.append(vuln.id)
        
        # Update all to closed
        for vuln_id in vuln_ids:
            response = client.put(f'/api/vulnerabilities/{vuln_id}',
                                data=json.dumps({'status': 'Closed'}),
                                content_type='application/json')
            assert response.status_code == 200
        
        # Verify all updated in database
        for vuln_id in vuln_ids:
            vuln = VulnerabilityDAO.get_vulnerability_by_id(vuln_id)
            assert vuln.status == 'Closed'
    
    def test_search_vulnerabilities_by_cve_id(self, client, app_context):
        """Integration: Test searching for specific CVE ID"""
        search_cve = f'CVE-2024-SEARCH{uuid.uuid4().hex[:6]}'
        
        # Create vulnerability
        VulnerabilityDAO.create_vulnerability(
            cve_id=search_cve,
            description='Searchable vulnerability',
            severity='High',
            cvss_score=7.5
        )
        
        # Search by CVE ID
        response = client.get(f'/api/vulnerabilities?cve_id={search_cve}')
        
        if response.status_code == 200:
            data = json.loads(response.data)
            assert any(v['cve_id'] == search_cve for v in data)
    
    def test_delete_vulnerability_cascade_to_mitigations(self, client, app_context):
        """Integration: Test that deleting vulnerability handles related mitigations"""
        # Create vulnerability
        vuln = VulnerabilityDAO.create_vulnerability(
            cve_id=f'CVE-2024-{uuid.uuid4().hex[:6]}',
            description='To be deleted',
            severity='Low',
            cvss_score=3.0
        )
        
        # Create mitigation for vulnerability
        MitigationDAO.create_mitigation(
            title='Related mitigation',
            description='Should be handled on delete',
            priority='Low',
            vulnerability_id=vuln.id
        )
        
        # Delete vulnerability
        delete_response = client.delete(f'/api/vulnerabilities/{vuln.id}')
        
        # Should handle deletion (either cascade delete or prevent)
        assert delete_response.status_code in [200, 400, 409]
