import pytest
import json
from unittest.mock import patch, MagicMock
from app.models.mitigation import Mitigation
from app.models.vulnerability import Vulnerability


class TestMitigationController:
    
    @patch('app.controllers.mitigation_controller.MitigationService.get_all_mitigations')
    def test_get_mitigations_success(self, mock_get_all, client, app_context):
        """Test GET /api/mitigations returns all mitigations"""
        # Mock mitigation objects
        mock_mitigation = MagicMock(spec=Mitigation)
        mock_mitigation.to_dict.return_value = {
            'id': 1,
            'title': 'Test Mitigation',
            'description': 'Test description',
            'status': 'pending',
            'priority': 'medium',
            'vulnerability_id': 1
        }
        mock_get_all.return_value = [mock_mitigation]
        
        response = client.get('/api/mitigations')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data) == 1
        assert data[0]['title'] == 'Test Mitigation'
        mock_get_all.assert_called_once_with(status=None, priority=None, search=None)

    @patch('app.controllers.mitigation_controller.MitigationService.get_all_mitigations')
    def test_get_mitigations_with_filters(self, mock_get_all, client, app_context):
        """Test GET /api/mitigations with query parameters"""
        mock_get_all.return_value = []
        
        response = client.get('/api/mitigations?status=pending&priority=high&search=test')
        
        assert response.status_code == 200
        mock_get_all.assert_called_once_with(status='pending', priority='high', search='test')

    @patch('app.controllers.mitigation_controller.MitigationService.get_all_mitigations')
    def test_get_mitigations_error(self, mock_get_all, client, app_context):
        """Test GET /api/mitigations handles service errors"""
        mock_get_all.side_effect = Exception("Database error")
        
        response = client.get('/api/mitigations')
        
        assert response.status_code == 500
        data = json.loads(response.data)
        assert 'error' in data
        assert data['error'] == 'Database error'

    @patch('app.controllers.mitigation_controller.MitigationService.get_mitigation_by_id')
    def test_get_mitigation_by_id_success(self, mock_get_by_id, client, app_context):
        """Test GET /api/mitigations/<id> returns specific mitigation"""
        mock_mitigation = MagicMock(spec=Mitigation)
        mock_mitigation.to_dict.return_value = {
            'id': 1,
            'title': 'Test Mitigation',
            'status': 'pending'
        }
        mock_get_by_id.return_value = mock_mitigation
        
        response = client.get('/api/mitigations/1')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['title'] == 'Test Mitigation'
        mock_get_by_id.assert_called_once_with(1)

    @patch('app.controllers.mitigation_controller.MitigationService.get_mitigation_by_id')
    def test_get_mitigation_by_id_not_found(self, mock_get_by_id, client, app_context):
        """Test GET /api/mitigations/<id> returns 404 when not found"""
        mock_get_by_id.return_value = None
        
        response = client.get('/api/mitigations/999')
        
        assert response.status_code == 404
        data = json.loads(response.data)
        assert data['error'] == 'Mitigation not found'

    @patch('app.controllers.mitigation_controller.MitigationService.get_mitigation_by_id')
    def test_get_mitigation_by_id_error(self, mock_get_by_id, client, app_context):
        """Test GET /api/mitigations/<id> handles service errors"""
        mock_get_by_id.side_effect = Exception("Database error")
        
        response = client.get('/api/mitigations/1')
        
        assert response.status_code == 500
        data = json.loads(response.data)
        assert data['error'] == 'Database error'

    @patch('app.controllers.mitigation_controller.log_action')
    @patch('app.controllers.mitigation_controller.Vulnerability')
    @patch('app.controllers.mitigation_controller.MitigationService.create_mitigation')
    def test_create_mitigation_success(self, mock_create, mock_vulnerability, mock_log, client, app_context):
        """Test POST /api/mitigations creates new mitigation"""
        # Mock created mitigation
        mock_mitigation = MagicMock(spec=Mitigation)
        mock_mitigation.id = 1
        mock_mitigation.vulnerability_id = 1
        mock_mitigation.to_dict.return_value = {
            'id': 1,
            'title': 'New Mitigation',
            'description': 'New description',
            'vulnerability_id': 1,
            'impact_category': 'confidentiality'
        }
        mock_create.return_value = mock_mitigation
        
        # Mock vulnerability query
        mock_vuln = MagicMock()
        mock_vuln.cve_id = 'CVE-2023-1234'
        mock_vulnerability.query.get.return_value = mock_vuln
        
        mitigation_data = {
            'title': 'New Mitigation',
            'description': 'New description',
            'vulnerability_id': 1,
            'impact_category': 'confidentiality'
        }
        
        response = client.post('/api/mitigations',
                             data=json.dumps(mitigation_data),
                             content_type='application/json')
        
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['title'] == 'New Mitigation'
        mock_create.assert_called_once_with(mitigation_data)
        mock_log.assert_called_once()

    @patch('app.controllers.mitigation_controller.MitigationService.create_mitigation')
    def test_create_mitigation_missing_fields(self, mock_create, client, app_context):
        """Test POST /api/mitigations validates required fields"""
        incomplete_data = {
            'title': 'New Mitigation'
            # Missing required fields: description, vulnerability_id, impact_category
        }
        
        response = client.post('/api/mitigations',
                             data=json.dumps(incomplete_data),
                             content_type='application/json')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'Missing required field' in data['error']
        mock_create.assert_not_called()

    @patch('app.controllers.mitigation_controller.MitigationService.create_mitigation')
    def test_create_mitigation_error(self, mock_create, client, app_context):
        """Test POST /api/mitigations handles service errors"""
        mock_create.side_effect = Exception("Database error")
        
        mitigation_data = {
            'title': 'New Mitigation',
            'description': 'New description',
            'vulnerability_id': 1,
            'impact_category': 'confidentiality'
        }
        
        response = client.post('/api/mitigations',
                             data=json.dumps(mitigation_data),
                             content_type='application/json')
        
        assert response.status_code == 500
        data = json.loads(response.data)
        assert data['error'] == 'Database error'

    @patch('app.controllers.mitigation_controller.log_action')
    @patch('app.controllers.mitigation_controller.Vulnerability')
    @patch('app.controllers.mitigation_controller.MitigationService.update_mitigation')
    def test_update_mitigation_success(self, mock_update, mock_vulnerability, mock_log, client, app_context):
        """Test PUT /api/mitigations/<id> updates existing mitigation"""
        # Mock updated mitigation
        mock_mitigation = MagicMock(spec=Mitigation)
        mock_mitigation.vulnerability_id = 1
        mock_mitigation.to_dict.return_value = {
            'id': 1,
            'title': 'Updated Mitigation',
            'status': 'in-progress'
        }
        mock_update.return_value = mock_mitigation
        
        # Mock vulnerability query
        mock_vuln = MagicMock()
        mock_vuln.cve_id = 'CVE-2023-1234'
        mock_vulnerability.query.get.return_value = mock_vuln
        
        update_data = {'title': 'Updated Mitigation', 'status': 'in-progress'}
        
        response = client.put('/api/mitigations/1',
                            data=json.dumps(update_data),
                            content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['title'] == 'Updated Mitigation'
        mock_update.assert_called_once_with(1, update_data)
        mock_log.assert_called_once()

    @patch('app.controllers.mitigation_controller.MitigationService.update_mitigation')
    def test_update_mitigation_not_found(self, mock_update, client, app_context):
        """Test PUT /api/mitigations/<id> returns 404 when not found"""
        mock_update.return_value = None
        
        update_data = {'title': 'Updated Mitigation'}
        
        response = client.put('/api/mitigations/999',
                            data=json.dumps(update_data),
                            content_type='application/json')
        
        assert response.status_code == 404
        data = json.loads(response.data)
        assert data['error'] == 'Mitigation not found'

    @patch('app.controllers.mitigation_controller.MitigationService.update_mitigation')
    def test_update_mitigation_error(self, mock_update, client, app_context):
        """Test PUT /api/mitigations/<id> handles service errors"""
        mock_update.side_effect = Exception("Database error")
        
        update_data = {'title': 'Updated Mitigation'}
        
        response = client.put('/api/mitigations/1',
                            data=json.dumps(update_data),
                            content_type='application/json')
        
        assert response.status_code == 500
        data = json.loads(response.data)
        assert data['error'] == 'Database error'

    @patch('app.controllers.mitigation_controller.log_action')
    @patch('app.controllers.mitigation_controller.MitigationService.delete_mitigation')
    def test_delete_mitigation_success(self, mock_delete, mock_log, client, app_context):
        """Test DELETE /api/mitigations/<id> deletes mitigation"""
        mock_delete.return_value = True
        
        response = client.delete('/api/mitigations/1')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['message'] == 'Mitigation deleted successfully'
        mock_delete.assert_called_once_with(1)
        mock_log.assert_called_once()

    @patch('app.controllers.mitigation_controller.MitigationService.delete_mitigation')
    def test_delete_mitigation_not_found(self, mock_delete, client, app_context):
        """Test DELETE /api/mitigations/<id> returns 404 when not found"""
        mock_delete.return_value = False
        
        response = client.delete('/api/mitigations/999')
        
        assert response.status_code == 404
        data = json.loads(response.data)
        assert data['error'] == 'Mitigation not found'

    @patch('app.controllers.mitigation_controller.MitigationService.delete_mitigation')
    def test_delete_mitigation_error(self, mock_delete, client, app_context):
        """Test DELETE /api/mitigations/<id> handles service errors"""
        mock_delete.side_effect = Exception("Database error")
        
        response = client.delete('/api/mitigations/1')
        
        assert response.status_code == 500
        data = json.loads(response.data)
        assert data['error'] == 'Database error'

    @patch('app.controllers.mitigation_controller.MitigationService.get_mitigation_stats')
    def test_get_mitigation_stats_success(self, mock_get_stats, client, app_context):
        """Test GET /api/mitigations/stats returns statistics"""
        mock_stats = {
            'total': 50,
            'pending': 20,
            'in_progress': 15,
            'implemented': 10,
            'rejected': 5
        }
        mock_get_stats.return_value = mock_stats
        
        response = client.get('/api/mitigations/stats')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data == mock_stats
        mock_get_stats.assert_called_once()

    @patch('app.controllers.mitigation_controller.MitigationService.get_mitigation_stats')
    def test_get_mitigation_stats_error(self, mock_get_stats, client, app_context):
        """Test GET /api/mitigations/stats handles service errors"""
        mock_get_stats.side_effect = Exception("Database error")
        
        response = client.get('/api/mitigations/stats')
        
        assert response.status_code == 500
        data = json.loads(response.data)
        assert data['error'] == 'Database error'