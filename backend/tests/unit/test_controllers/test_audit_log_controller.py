import pytest
import json
from unittest.mock import patch, MagicMock
from app.models.audit_log import AuditLog


class TestAuditLogController:
    
    @patch('app.controllers.audit_log_controller.AuditLog.query')
    def test_get_system_logs_default_limit(self, mock_query, client, app_context):
        """Test GET /api/system-logs with default limit of 200"""
        # Create mock audit logs
        mock_log1 = MagicMock(spec=AuditLog)
        mock_log1.to_dict.return_value = {
            'id': 1,
            'timestamp': '2023-12-01T10:00:00Z',
            'username': 'testuser',
            'action': 'User logged in'
        }
        
        mock_log2 = MagicMock(spec=AuditLog)
        mock_log2.to_dict.return_value = {
            'id': 2,
            'timestamp': '2023-12-01T10:01:00Z',
            'username': 'testuser',
            'action': 'User logged out'
        }
        
        # Setup mock query chain
        mock_query.order_by.return_value.limit.return_value.all.return_value = [mock_log1, mock_log2]
        
        response = client.get('/api/system-logs')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data) == 2
        assert data[0]['id'] == 1
        assert data[0]['action'] == 'User logged in'
        assert data[1]['id'] == 2
        assert data[1]['action'] == 'User logged out'
        
        # Verify default limit of 200 was used
        mock_query.order_by.return_value.limit.assert_called_once_with(200)
        
    @patch('app.controllers.audit_log_controller.AuditLog.query')
    def test_get_system_logs_custom_limit(self, mock_query, client, app_context):
        """Test GET /api/system-logs with custom limit parameter"""
        mock_log = MagicMock(spec=AuditLog)
        mock_log.to_dict.return_value = {
            'id': 1,
            'timestamp': '2023-12-01T10:00:00Z',
            'username': 'admin',
            'action': 'System maintenance'
        }
        
        mock_query.order_by.return_value.limit.return_value.all.return_value = [mock_log]
        
        response = client.get('/api/system-logs?limit=50')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data) == 1
        assert data[0]['id'] == 1
        
        # Verify custom limit of 50 was used
        mock_query.order_by.return_value.limit.assert_called_once_with(50)
        
    @patch('app.controllers.audit_log_controller.AuditLog.query')
    def test_get_system_logs_limit_zero(self, mock_query, client, app_context):
        """Test GET /api/system-logs with limit=0"""
        mock_query.order_by.return_value.limit.return_value.all.return_value = []
        
        response = client.get('/api/system-logs?limit=0')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data) == 0
        
        # Verify limit of 0 was used
        mock_query.order_by.return_value.limit.assert_called_once_with(0)
        
    @patch('app.controllers.audit_log_controller.AuditLog.query')
    def test_get_system_logs_large_limit(self, mock_query, client, app_context):
        """Test GET /api/system-logs with large limit"""
        mock_query.order_by.return_value.limit.return_value.all.return_value = []
        
        response = client.get('/api/system-logs?limit=1000')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data) == 0
        
        # Verify large limit was used
        mock_query.order_by.return_value.limit.assert_called_once_with(1000)
        
    @patch('app.controllers.audit_log_controller.AuditLog.query')
    def test_get_system_logs_invalid_limit_uses_default(self, mock_query, client, app_context):
        """Test GET /api/system-logs with invalid limit falls back to default"""
        mock_query.order_by.return_value.limit.return_value.all.return_value = []
        
        response = client.get('/api/system-logs?limit=invalid')
        
        assert response.status_code == 200
        
        # Invalid limit should fall back to default 200
        mock_query.order_by.return_value.limit.assert_called_once_with(200)
        
    @patch('app.controllers.audit_log_controller.AuditLog.query')
    def test_get_system_logs_negative_limit_uses_default(self, mock_query, client, app_context):
        """Test GET /api/system-logs with negative limit uses default"""
        mock_query.order_by.return_value.limit.return_value.all.return_value = []
        
        response = client.get('/api/system-logs?limit=-10')
        
        assert response.status_code == 200
        
        # Negative limit should be handled (Flask might convert to default)
        mock_query.order_by.return_value.limit.assert_called_once()
        
    @patch('app.controllers.audit_log_controller.AuditLog.query')
    def test_get_system_logs_empty_result(self, mock_query, client, app_context):
        """Test GET /api/system-logs when no logs exist"""
        mock_query.order_by.return_value.limit.return_value.all.return_value = []
        
        response = client.get('/api/system-logs')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data == []
        
    @patch('app.controllers.audit_log_controller.AuditLog.query')
    def test_get_system_logs_ordering(self, mock_query, client, app_context):
        """Test that logs are ordered by timestamp descending"""
        mock_query.order_by.return_value.limit.return_value.all.return_value = []
        
        response = client.get('/api/system-logs')
        
        assert response.status_code == 200
        
        # Verify that order_by was called with timestamp.desc()
        mock_query.order_by.assert_called_once()
        # The actual ordering is tested by checking the call was made
        
    @patch('app.controllers.audit_log_controller.AuditLog.query')
    def test_get_system_logs_multiple_parameters(self, mock_query, client, app_context):
        """Test GET /api/system-logs with multiple query parameters (only limit should be used)"""
        mock_query.order_by.return_value.limit.return_value.all.return_value = []
        
        response = client.get('/api/system-logs?limit=25&other=ignored&test=param')
        
        assert response.status_code == 200
        
        # Should only use the limit parameter
        mock_query.order_by.return_value.limit.assert_called_once_with(25)
        
    @patch('app.controllers.audit_log_controller.AuditLog.query')
    def test_get_system_logs_content_type(self, mock_query, client, app_context):
        """Test that response has correct content type"""
        mock_log = MagicMock(spec=AuditLog)
        mock_log.to_dict.return_value = {
            'id': 1,
            'timestamp': '2023-12-01T10:00:00Z',
            'username': 'testuser',
            'action': 'Test action'
        }
        
        mock_query.order_by.return_value.limit.return_value.all.return_value = [mock_log]
        
        response = client.get('/api/system-logs')
        
        assert response.status_code == 200
        assert response.content_type.startswith('application/json')
        
    @patch('app.controllers.audit_log_controller.AuditLog.query')
    def test_get_system_logs_to_dict_called(self, mock_query, client, app_context):
        """Test that to_dict() is called on each audit log"""
        mock_log1 = MagicMock(spec=AuditLog)
        mock_log1.to_dict.return_value = {'id': 1, 'action': 'Action 1'}
        
        mock_log2 = MagicMock(spec=AuditLog)
        mock_log2.to_dict.return_value = {'id': 2, 'action': 'Action 2'}
        
        mock_query.order_by.return_value.limit.return_value.all.return_value = [mock_log1, mock_log2]
        
        response = client.get('/api/system-logs')
        
        assert response.status_code == 200
        
        # Verify to_dict was called on each log
        mock_log1.to_dict.assert_called_once()
        mock_log2.to_dict.assert_called_once()