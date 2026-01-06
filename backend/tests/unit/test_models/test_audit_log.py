import pytest
from datetime import datetime, timezone
from app.models.audit_log import AuditLog


class TestAuditLogModel:
    
    def test_audit_log_creation(self, app_context):
        """Test creating an audit log instance"""
        timestamp = datetime.now(timezone.utc)
        audit_log = AuditLog(
            timestamp=timestamp,
            username='testuser',
            action='User logged in'
        )
        
        assert audit_log.timestamp == timestamp
        assert audit_log.username == 'testuser'
        assert audit_log.action == 'User logged in'
        assert audit_log.id is None  # Not saved yet
        
    def test_audit_log_to_dict_with_utc_timestamp(self, app_context):
        """Test to_dict method with UTC timestamp"""
        timestamp = datetime(2023, 12, 1, 10, 30, 45, tzinfo=timezone.utc)
        audit_log = AuditLog(
            id=123,
            timestamp=timestamp,
            username='testuser',
            action='Test action'
        )
        
        result = audit_log.to_dict()
        
        assert result == {
            'id': 123,
            'timestamp': '2023-12-01T10:30:45+00:00',
            'username': 'testuser',
            'action': 'Test action'
        }
        
    def test_audit_log_to_dict_with_naive_timestamp(self, app_context):
        """Test to_dict method with naive datetime (no timezone)"""
        timestamp = datetime(2023, 12, 1, 10, 30, 45)  # Naive datetime
        audit_log = AuditLog(
            id=456,
            timestamp=timestamp,
            username='admin',
            action='System maintenance'
        )
        
        result = audit_log.to_dict()
        
        # Should add UTC timezone to naive datetime
        assert result == {
            'id': 456,
            'timestamp': '2023-12-01T10:30:45+00:00',
            'username': 'admin',
            'action': 'System maintenance'
        }
        
    def test_audit_log_to_dict_with_none_timestamp(self, app_context):
        """Test to_dict method with None timestamp"""
        audit_log = AuditLog(
            id=789,
            timestamp=None,
            username='testuser',
            action='No timestamp test'
        )
        
        result = audit_log.to_dict()
        
        assert result == {
            'id': 789,
            'timestamp': None,
            'username': 'testuser',
            'action': 'No timestamp test'
        }
        
    def test_audit_log_to_dict_with_different_timezone(self, app_context):
        """Test to_dict method preserves existing timezone"""
        # Create timestamp with different timezone (EST = UTC-5)
        from datetime import timedelta
        est = timezone(timedelta(hours=-5))
        timestamp = datetime(2023, 12, 1, 10, 30, 45, tzinfo=est)
        
        audit_log = AuditLog(
            id=999,
            timestamp=timestamp,
            username='timezone_user',
            action='Timezone test'
        )
        
        result = audit_log.to_dict()
        
        # Should preserve the original timezone
        assert result == {
            'id': 999,
            'timestamp': '2023-12-01T10:30:45-05:00',
            'username': 'timezone_user',
            'action': 'Timezone test'
        }
        
    def test_audit_log_to_dict_with_microseconds(self, app_context):
        """Test to_dict method with microseconds in timestamp"""
        timestamp = datetime(2023, 12, 1, 10, 30, 45, 123456, tzinfo=timezone.utc)
        audit_log = AuditLog(
            id=111,
            timestamp=timestamp,
            username='micro_user',
            action='Microseconds test'
        )
        
        result = audit_log.to_dict()
        
        assert result == {
            'id': 111,
            'timestamp': '2023-12-01T10:30:45.123456+00:00',
            'username': 'micro_user',
            'action': 'Microseconds test'
        }
        
    def test_audit_log_to_dict_with_none_id(self, app_context):
        """Test to_dict method with None id (unsaved instance)"""
        timestamp = datetime.now(timezone.utc)
        audit_log = AuditLog(
            timestamp=timestamp,
            username='new_user',
            action='Not saved yet'
        )
        
        result = audit_log.to_dict()
        
        assert result['id'] is None
        assert result['username'] == 'new_user'
        assert result['action'] == 'Not saved yet'
        assert result['timestamp'] is not None
        
    def test_audit_log_to_dict_with_empty_strings(self, app_context):
        """Test to_dict method with empty strings"""
        timestamp = datetime.now(timezone.utc)
        audit_log = AuditLog(
            id=222,
            timestamp=timestamp,
            username='',
            action=''
        )
        
        result = audit_log.to_dict()
        
        assert result['id'] == 222
        assert result['username'] == ''
        assert result['action'] == ''
        assert result['timestamp'] is not None
        
    def test_audit_log_to_dict_with_long_text(self, app_context):
        """Test to_dict method with long text fields"""
        timestamp = datetime.now(timezone.utc)
        long_username = 'a' * 250  # Near the 255 limit
        long_action = 'This is a very long action description that goes on and on ' * 20
        
        audit_log = AuditLog(
            id=333,
            timestamp=timestamp,
            username=long_username,
            action=long_action
        )
        
        result = audit_log.to_dict()
        
        assert result['id'] == 333
        assert result['username'] == long_username
        assert result['action'] == long_action
        assert len(result['username']) == 250
        
    def test_audit_log_tablename(self, app_context):
        """Test that the table name is correctly set"""
        assert AuditLog.__tablename__ == 'audit_log'
        
    def test_audit_log_repr_method(self, app_context):
        """Test the string representation of AuditLog if it exists"""
        timestamp = datetime.now(timezone.utc)
        audit_log = AuditLog(
            id=444,
            timestamp=timestamp,
            username='repr_user',
            action='Repr test'
        )
        
        # Test that it can be converted to string (basic check)
        str_repr = str(audit_log)
        assert isinstance(str_repr, str)
        
    def test_audit_log_timezone_edge_cases(self, app_context):
        """Test timezone handling edge cases"""
        # Test with UTC+0
        utc_time = datetime(2023, 1, 1, 12, 0, 0, tzinfo=timezone.utc)
        audit_log_utc = AuditLog(id=1, timestamp=utc_time, username='utc', action='UTC test')
        
        result_utc = audit_log_utc.to_dict()
        assert '+00:00' in result_utc['timestamp']
        
        # Test with positive timezone offset
        from datetime import timedelta
        plus_5 = timezone(timedelta(hours=5))
        plus_time = datetime(2023, 1, 1, 12, 0, 0, tzinfo=plus_5)
        audit_log_plus = AuditLog(id=2, timestamp=plus_time, username='plus', action='Plus test')
        
        result_plus = audit_log_plus.to_dict()
        assert '+05:00' in result_plus['timestamp']