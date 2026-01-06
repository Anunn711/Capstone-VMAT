import pytest
from datetime import datetime, date
from app.dao.mitigation_dao import MitigationDAO
from app.models.mitigation import Mitigation
from app.models.vulnerability import Vulnerability
from app.dao.vulnerability_dao import add_vulnerability


class TestMitigationDAO:
    
    def test_create_mitigation(self, app_context):
        """Test creating a new mitigation"""
        # First create a vulnerability to link to
        vuln_data = {
            'cve_id': 'CVE-2023-1234',
            'software_vendors': 'Test Vendor',
            'software_names': 'Test Software',
            'software_versions': '1.0.0',
            'os_platforms': 'Linux',
            'vulnerability_descriptions': 'Test vulnerability description',
            'review_status': 'pending',
            'last_updated': datetime.utcnow()
        }
        vuln = add_vulnerability(vuln_data)
        
        mitigation_data = {
            'title': 'Test Mitigation',
            'description': 'Test mitigation description',
            'vulnerability_id': vuln.id,
            'impact_category': 'confidentiality',
            'status': 'pending',
            'priority': 'medium',
            'category': 'Security',
            'type': 'technical',
            'effort': 'medium',
            'cost': 'low',
            'risk_reduction': 75
        }
        
        mitigation = MitigationDAO.create_mitigation(mitigation_data)
        
        assert mitigation is not None
        assert mitigation.id is not None
        assert mitigation.title == 'Test Mitigation'
        assert mitigation.description == 'Test mitigation description'
        assert mitigation.vulnerability_id == vuln.id
        assert mitigation.impact_category == 'confidentiality'
        assert mitigation.status == 'pending'
        assert mitigation.priority == 'medium'
        assert mitigation.risk_reduction == 75
        assert mitigation.created_at is not None

    def test_get_mitigation_by_id(self, app_context):
        """Test retrieving a mitigation by ID"""
        # Create test vulnerability
        vuln_data = {
            'cve_id': 'CVE-2023-5678',
            'software_vendors': 'Test Vendor',
            'software_names': 'Test Software',
            'software_versions': '2.0.0',
            'os_platforms': 'Windows',
            'vulnerability_descriptions': 'Test vulnerability for DAO test',
            'review_status': 'pending',
            'last_updated': datetime.utcnow()
        }
        vuln = add_vulnerability(vuln_data)
        
        # Create test mitigation
        mitigation_data = {
            'title': 'Retrievable Mitigation',
            'description': 'Test description for retrieval',
            'vulnerability_id': vuln.id,
            'impact_category': 'integrity',
            'status': 'in-progress',
            'priority': 'high',
            'category': 'Security'
        }
        created_mitigation = MitigationDAO.create_mitigation(mitigation_data)
        
        # Retrieve the mitigation
        retrieved_mitigation = MitigationDAO.get_mitigation_by_id(created_mitigation.id)
        
        assert retrieved_mitigation is not None
        assert retrieved_mitigation.id == created_mitigation.id
        assert retrieved_mitigation.title == 'Retrievable Mitigation'
        assert retrieved_mitigation.status == 'in-progress'
        assert retrieved_mitigation.priority == 'high'

    def test_get_mitigation_by_id_not_found(self, app_context):
        """Test retrieving a non-existent mitigation"""
        result = MitigationDAO.get_mitigation_by_id(99999)
        assert result is None

    def test_update_mitigation(self, app_context):
        """Test updating an existing mitigation"""
        # Create test vulnerability
        vuln_data = {
            'cve_id': 'CVE-2023-9999',
            'software_vendors': 'Update Test Vendor',
            'software_names': 'Update Test Software',
            'software_versions': '1.5.0',
            'os_platforms': 'Linux',
            'vulnerability_descriptions': 'Test vulnerability for update test',
            'review_status': 'pending',
            'last_updated': datetime.utcnow()
        }
        vuln = add_vulnerability(vuln_data)
        
        # Create test mitigation
        mitigation_data = {
            'title': 'Original Title',
            'description': 'Original description',
            'vulnerability_id': vuln.id,
            'impact_category': 'availability',
            'status': 'pending',
            'priority': 'low',
            'category': 'General'
        }
        mitigation = MitigationDAO.create_mitigation(mitigation_data)
        original_updated_at = mitigation.updated_at
        
        # Update the mitigation
        update_data = {
            'title': 'Updated Title',
            'status': 'implemented',
            'priority': 'critical',
            'risk_reduction': 90
        }
        updated_mitigation = MitigationDAO.update_mitigation(mitigation.id, update_data)
        
        assert updated_mitigation is not None
        assert updated_mitigation.id == mitigation.id
        assert updated_mitigation.title == 'Updated Title'
        assert updated_mitigation.description == 'Original description'  # Unchanged
        assert updated_mitigation.status == 'implemented'
        assert updated_mitigation.priority == 'critical'
        assert updated_mitigation.risk_reduction == 90
        assert updated_mitigation.updated_at > original_updated_at

    def test_update_mitigation_not_found(self, app_context):
        """Test updating a non-existent mitigation"""
        update_data = {'title': 'Updated Title'}
        result = MitigationDAO.update_mitigation(99999, update_data)
        assert result is None

    def test_update_mitigation_invalid_field(self, app_context):
        """Test updating a mitigation with invalid field (should be ignored)"""
        # Create test vulnerability
        vuln_data = {
            'cve_id': 'CVE-2023-INVALID',
            'software_vendors': 'Invalid Test Vendor',
            'software_names': 'Invalid Test Software',
            'software_versions': '1.0.0',
            'os_platforms': 'Linux',
            'vulnerability_descriptions': 'Test vulnerability for invalid field test',
            'review_status': 'pending',
            'last_updated': datetime.utcnow()
        }
        vuln = add_vulnerability(vuln_data)
        
        # Create test mitigation
        mitigation_data = {
            'title': 'Invalid Field Test',
            'description': 'Testing invalid field update',
            'vulnerability_id': vuln.id,
            'impact_category': 'confidentiality',
            'category': 'Testing'
        }
        mitigation = MitigationDAO.create_mitigation(mitigation_data)
        
        # Try to update with invalid field
        update_data = {
            'title': 'Valid Update',
            'nonexistent_field': 'Should be ignored'
        }
        updated_mitigation = MitigationDAO.update_mitigation(mitigation.id, update_data)
        
        assert updated_mitigation is not None
        assert updated_mitigation.title == 'Valid Update'
        assert not hasattr(updated_mitigation, 'nonexistent_field')

    def test_delete_mitigation(self, app_context):
        """Test deleting a mitigation"""
        # Create test vulnerability
        vuln_data = {
            'cve_id': 'CVE-2023-DELETE',
            'software_vendors': 'Delete Test Vendor',
            'software_names': 'Delete Test Software',
            'software_versions': '1.0.0',
            'os_platforms': 'Linux',
            'vulnerability_descriptions': 'Test vulnerability for delete test',
            'review_status': 'pending',
            'last_updated': datetime.utcnow()
        }
        vuln = add_vulnerability(vuln_data)
        
        # Create test mitigation
        mitigation_data = {
            'title': 'To Be Deleted',
            'description': 'This mitigation will be deleted',
            'vulnerability_id': vuln.id,
            'impact_category': 'accountability',
            'category': 'Deletion Test'
        }
        mitigation = MitigationDAO.create_mitigation(mitigation_data)
        mitigation_id = mitigation.id
        
        # Delete the mitigation
        result = MitigationDAO.delete_mitigation(mitigation_id)
        
        assert result is True
        
        # Verify it's deleted
        deleted_mitigation = MitigationDAO.get_mitigation_by_id(mitigation_id)
        assert deleted_mitigation is None

    def test_delete_mitigation_not_found(self, app_context):
        """Test deleting a non-existent mitigation"""
        result = MitigationDAO.delete_mitigation(99999)
        assert result is False

    def test_get_all_mitigations_no_filters(self, app_context):
        """Test retrieving all mitigations without filters"""
        # Create test vulnerability
        vuln_data = {
            'cve_id': 'CVE-2023-ALL',
            'software_vendors': 'All Test Vendor',
            'software_names': 'All Test Software',
            'software_versions': '1.0.0',
            'os_platforms': 'Linux',
            'vulnerability_descriptions': 'Test vulnerability for get all test',
            'review_status': 'pending',
            'last_updated': datetime.utcnow()
        }
        vuln = add_vulnerability(vuln_data)
        
        # Create multiple test mitigations
        mitigations_data = [
            {
                'title': 'Mitigation 1',
                'description': 'First test mitigation',
                'vulnerability_id': vuln.id,
                'impact_category': 'confidentiality',
                'status': 'pending',
                'priority': 'low',
                'category': 'First Category'
            },
            {
                'title': 'Mitigation 2',
                'description': 'Second test mitigation',
                'vulnerability_id': vuln.id,
                'impact_category': 'integrity',
                'status': 'implemented',
                'priority': 'high',
                'category': 'Second Category'
            }
        ]
        
        for data in mitigations_data:
            MitigationDAO.create_mitigation(data)
        
        # Retrieve all mitigations
        mitigations = MitigationDAO.get_all_mitigations()
        
        # Should include at least our test mitigations (there might be others from previous tests)
        assert len(mitigations) >= 2
        
        # Check that our specific mitigations are in the results
        titles = [m.title for m in mitigations]
        assert 'Mitigation 1' in titles
        assert 'Mitigation 2' in titles

    def test_get_all_mitigations_with_status_filter(self, app_context):
        """Test retrieving mitigations filtered by status"""
        # Create test vulnerability
        vuln_data = {
            'cve_id': 'CVE-2023-STATUS',
            'software_vendors': 'Status Test Vendor',
            'software_names': 'Status Test Software',
            'software_versions': '1.0.0',
            'os_platforms': 'Linux',
            'vulnerability_descriptions': 'Test vulnerability for status filter test',
            'review_status': 'pending',
            'last_updated': datetime.utcnow()
        }
        vuln = add_vulnerability(vuln_data)
        
        # Create mitigations with different statuses
        MitigationDAO.create_mitigation({
            'title': 'Pending Mitigation',
            'description': 'Pending status test',
            'vulnerability_id': vuln.id,
            'impact_category': 'confidentiality',
            'status': 'pending',
            'priority': 'medium',
            'category': 'Status Test'
        })
        
        MitigationDAO.create_mitigation({
            'title': 'Implemented Mitigation',
            'description': 'Implemented status test',
            'vulnerability_id': vuln.id,
            'impact_category': 'integrity',
            'status': 'implemented',
            'priority': 'high',
            'category': 'Status Test'
        })
        
        # Filter by pending status
        pending_mitigations = MitigationDAO.get_all_mitigations(status='pending')
        pending_titles = [m.title for m in pending_mitigations]
        
        # Should include our pending mitigation but not the implemented one
        assert 'Pending Mitigation' in pending_titles
        
        # Filter by implemented status
        implemented_mitigations = MitigationDAO.get_all_mitigations(status='implemented')
        implemented_titles = [m.title for m in implemented_mitigations]
        
        assert 'Implemented Mitigation' in implemented_titles

    def test_get_all_mitigations_with_priority_filter(self, app_context):
        """Test retrieving mitigations filtered by priority"""
        # Create test vulnerability
        vuln_data = {
            'cve_id': 'CVE-2023-PRIORITY',
            'software_vendors': 'Priority Test Vendor',
            'software_names': 'Priority Test Software',
            'software_versions': '1.0.0',
            'os_platforms': 'Linux',
            'vulnerability_descriptions': 'Test vulnerability for priority filter test',
            'review_status': 'pending',
            'last_updated': datetime.utcnow()
        }
        vuln = add_vulnerability(vuln_data)
        
        # Create mitigations with different priorities
        MitigationDAO.create_mitigation({
            'title': 'Critical Mitigation',
            'description': 'Critical priority test',
            'vulnerability_id': vuln.id,
            'impact_category': 'availability',
            'status': 'pending',
            'priority': 'critical',
            'category': 'Priority Test'
        })
        
        MitigationDAO.create_mitigation({
            'title': 'Low Priority Mitigation',
            'description': 'Low priority test',
            'vulnerability_id': vuln.id,
            'impact_category': 'accountability',
            'status': 'pending',
            'priority': 'low',
            'category': 'Priority Test'
        })
        
        # Filter by critical priority
        critical_mitigations = MitigationDAO.get_all_mitigations(priority='critical')
        critical_titles = [m.title for m in critical_mitigations]
        
        assert 'Critical Mitigation' in critical_titles

    def test_get_all_mitigations_with_search_filter(self, app_context):
        """Test retrieving mitigations with search filter"""
        # Create test vulnerability
        vuln_data = {
            'cve_id': 'CVE-2023-SEARCH',
            'software_vendors': 'Search Test Vendor',
            'software_names': 'Search Test Software',
            'software_versions': '1.0.0',
            'os_platforms': 'Linux',
            'vulnerability_descriptions': 'Test vulnerability for search filter test',
            'review_status': 'pending',
            'last_updated': datetime.utcnow()
        }
        vuln = add_vulnerability(vuln_data)
        
        # Create mitigation with unique searchable content
        unique_title = f"Searchable Mitigation {datetime.now().microsecond}"
        MitigationDAO.create_mitigation({
            'title': unique_title,
            'description': 'Contains searchable keyword UNIQUETEST123',
            'vulnerability_id': vuln.id,
            'impact_category': 'confidentiality',
            'category': 'Network Security'
        })
        
        # Search by title
        title_results = MitigationDAO.get_all_mitigations(search='Searchable')
        title_matches = [m.title for m in title_results]
        assert unique_title in title_matches
        
        # Search by description
        desc_results = MitigationDAO.get_all_mitigations(search='UNIQUETEST123')
        desc_matches = [m.title for m in desc_results]
        assert unique_title in desc_matches
        
        # Search by category
        category_results = MitigationDAO.get_all_mitigations(search='Network')
        category_matches = [m.title for m in category_results]
        assert unique_title in category_matches

    def test_get_mitigation_stats(self, app_context):
        """Test retrieving mitigation statistics"""
        # Create test vulnerability
        vuln_data = {
            'cve_id': 'CVE-2023-STATS',
            'software_vendors': 'Stats Test Vendor',
            'software_names': 'Stats Test Software',
            'software_versions': '1.0.0',
            'os_platforms': 'Linux',
            'vulnerability_descriptions': 'Test vulnerability for stats test',
            'review_status': 'pending',
            'last_updated': datetime.utcnow()
        }
        vuln = add_vulnerability(vuln_data)
        
        # Create mitigations with known stats
        test_mitigations = [
            {
                'title': 'Stats Test 1',
                'description': 'Stats test mitigation 1',
                'vulnerability_id': vuln.id,
                'impact_category': 'confidentiality',
                'status': 'implemented',
                'priority': 'critical',
                'risk_reduction': 80,
                'category': 'Stats Testing'
            },
            {
                'title': 'Stats Test 2',
                'description': 'Stats test mitigation 2',
                'vulnerability_id': vuln.id,
                'impact_category': 'integrity',
                'status': 'pending',
                'priority': 'medium',
                'risk_reduction': 60,
                'category': 'Stats Testing'
            },
            {
                'title': 'Stats Test 3',
                'description': 'Stats test mitigation 3',
                'vulnerability_id': vuln.id,
                'impact_category': 'availability',
                'status': 'in-progress',
                'priority': 'high',
                'risk_reduction': 40,
                'category': 'Stats Testing'
            }
        ]
        
        for mitigation_data in test_mitigations:
            MitigationDAO.create_mitigation(mitigation_data)
        
        stats = MitigationDAO.get_mitigation_stats()
        
        assert 'total_mitigations' in stats
        assert 'implemented' in stats
        assert 'in_progress' in stats
        assert 'pending' in stats
        assert 'critical_priority' in stats
        assert 'avg_risk_reduction' in stats
        
        # Verify stats are reasonable (we created 3 mitigations but there might be others)
        assert stats['total_mitigations'] >= 3
        assert isinstance(stats['implemented'], int)
        assert isinstance(stats['in_progress'], int)
        assert isinstance(stats['pending'], int)
        assert isinstance(stats['critical_priority'], int)
        assert isinstance(stats['avg_risk_reduction'], int)
        assert 0 <= stats['avg_risk_reduction'] <= 100