import pytest
import json
import uuid
from io import BytesIO
from app.dao.vulnerability_dao import VulnerabilityDAO
from app.dao.user_dao import UserDAO

class TestCSVUploadWorkflow:
    
    @pytest.fixture(autouse=True)
    def setup_auth(self, client, app_context):
        """Setup authenticated user for all tests"""
        self.username = f"testuser_{uuid.uuid4().hex[:8]}"
        UserDAO.create_user(self.username, "password")
        
        # Login
        client.post('/api/login',
                   data=json.dumps({'username': self.username, 'password': 'password'}),
                   content_type='application/json')
    

    
    def test_upload_csv_with_invalid_severity(self, client, app_context):
        """Integration: Test CSV validation with invalid severity values"""
        csv_content = b"""cve_id,description,severity,cvss_score,status
CVE-2024-INVALID,Bad severity,SuperHigh,8.0,Open"""
        
        data = {'file': (BytesIO(csv_content), 'test.csv')}
        
        response = client.post('/api/vulnerabilities/upload',
                             data=data,
                             content_type='multipart/form-data')
        
        assert response.status_code in [400, 422]
    
    def test_upload_csv_with_invalid_cvss_score(self, client, app_context):
        """Integration: Test CSV validation with out-of-range CVSS scores"""
        csv_content = b"""cve_id,description,severity,cvss_score,status
CVE-2024-SCORE,Invalid score,High,15.0,Open"""
        
        data = {'file': (BytesIO(csv_content), 'test.csv')}
        
        response = client.post('/api/vulnerabilities/upload',
                             data=data,
                             content_type='multipart/form-data')
        
        assert response.status_code in [400, 422]
    
    def test_upload_empty_csv_file(self, client, app_context):
        """Integration: Test uploading empty CSV file"""
        csv_content = b"""cve_id,description,severity,cvss_score,status"""
        
        data = {'file': (BytesIO(csv_content), 'test.csv')}
        
        response = client.post('/api/vulnerabilities/upload',
                             data=data,
                             content_type='multipart/form-data')
        
        # Should handle gracefully
        assert response.status_code in [200, 400]
    
    def test_upload_non_csv_file(self, client, app_context):
        """Integration: Test uploading non-CSV file"""
        data = {'file': (BytesIO(b'Not a CSV file'), 'test.txt')}
        
        response = client.post('/api/vulnerabilities/upload',
                             data=data,
                             content_type='multipart/form-data')
        
        assert response.status_code in [400, 415]
    

