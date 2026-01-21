"""
Pytest configuration and shared fixtures for backend tests.

This file is automatically loaded by pytest and provides:
- Shared fixtures for all tests
- Mock objects for external dependencies
- Test utilities and helpers
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from typing import Dict, Any, List
import httpx


# =============================================================================
# Configuration Fixtures
# =============================================================================

@pytest.fixture
def mock_settings():
    """
    Mock app.config.settings with valid test configuration.

    Usage:
        def test_something(mock_settings):
            assert mock_settings.meta_access_token == "test_token_123"
    """
    settings = MagicMock()
    settings.meta_access_token = "test_token_123"
    settings.meta_ad_account_id = "act_123456789"
    settings.meta_app_id = "test_app_id"
    settings.meta_app_secret = "test_app_secret"
    settings.openai_api_key = "test_openai_key"
    settings.database_url = "postgresql://test:test@localhost:5432/test_db"
    settings.frontend_url = "http://localhost:3000"
    return settings


@pytest.fixture
def no_token_settings():
    """
    Mock settings with missing Meta API token.

    Used to test error handling when API is not configured.
    """
    settings = MagicMock()
    settings.meta_access_token = ""
    settings.meta_ad_account_id = ""
    return settings


# =============================================================================
# Meta API Response Fixtures
# =============================================================================

@pytest.fixture
def mock_meta_campaign():
    """Single campaign object from Meta API."""
    return {
        "id": "123456789",
        "name": "Test Campaign",
        "status": "ACTIVE",
        "effective_status": "ACTIVE",
        "objective": "OUTCOME_SALES",
        "daily_budget": 5000,  # In cents
        "lifetime_budget": None,
        "special_ad_categories": [],
        "created_time": "2024-01-01T00:00:00+0000",
        "updated_time": "2024-01-15T12:00:00+0000",
    }


@pytest.fixture
def mock_meta_campaigns_response(mock_meta_campaign):
    """
    Mock successful Meta API response for list_campaigns.

    Returns a paginated response with 3 campaigns.
    """
    return {
        "data": [
            mock_meta_campaign,
            {
                **mock_meta_campaign,
                "id": "987654321",
                "name": "Test Campaign 2",
                "status": "PAUSED",
                "effective_status": "PAUSED",
            },
            {
                **mock_meta_campaign,
                "id": "555666777",
                "name": "Draft Campaign",
                "status": "PAUSED",
                "effective_status": "PREVIEW",  # Draft campaign
            },
        ],
        "paging": {
            "cursors": {
                "before": "before_cursor",
                "after": "after_cursor",
            }
        },
    }


@pytest.fixture
def mock_meta_empty_response():
    """Mock empty Meta API response (no campaigns)."""
    return {
        "data": [],
    }


@pytest.fixture
def mock_meta_error_response():
    """Mock Meta API error response (generic error)."""
    return {
        "error": {
            "message": "Invalid OAuth access token",
            "type": "OAuthException",
            "code": 190,
            "fbtrace_id": "test_trace_id",
        }
    }


@pytest.fixture
def mock_meta_rate_limit_error():
    """Mock Meta API rate limit error (code 80004)."""
    return {
        "error": {
            "message": "Application request limit reached",
            "type": "OAuthException",
            "code": 80004,
            "fbtrace_id": "test_trace_id",
        }
    }


@pytest.fixture
def mock_meta_insights_response():
    """Mock Meta API insights/metrics response."""
    return {
        "data": [
            {
                "impressions": "10000",
                "clicks": "500",
                "spend": "250.50",
                "cpc": "0.50",
                "cpm": "25.05",
                "ctr": "5.0",
                "reach": "8000",
                "conversions": "50",
                "cost_per_conversion": "5.01",
            }
        ]
    }


@pytest.fixture
def mock_meta_duplicate_response():
    """Mock Meta API response for campaign duplication."""
    return {
        "copied_campaign_id": "new_campaign_123",
        "id": "new_campaign_123",
        "success": True,
    }


@pytest.fixture
def mock_meta_duplicate_error_large_request():
    """Mock Meta API error for 'request too large' during duplication."""
    return {
        "error": {
            "message": "The copy request is too large",
            "type": "FacebookApiException",
            "code": 100,
            "error_subcode": 1885194,
            "fbtrace_id": "test_trace_id",
        }
    }


# =============================================================================
# HTTP Client Fixtures
# =============================================================================

@pytest.fixture
def mock_httpx_response():
    """
    Factory fixture for creating mock httpx.Response objects.

    Usage:
        def test_something(mock_httpx_response):
            response = mock_httpx_response(json_data={"data": []})
            assert response.status_code == 200
    """
    def _create_response(
        json_data: Dict[str, Any] = None,
        status_code: int = 200,
        text: str = None,
    ):
        response = MagicMock(spec=httpx.Response)
        response.status_code = status_code
        response.json.return_value = json_data if json_data is not None else {}
        response.text = text if text is not None else ""
        response.is_error = status_code >= 400
        return response

    return _create_response


@pytest.fixture
def mock_httpx_client(mock_httpx_response):
    """
    Mock httpx.AsyncClient for testing HTTP requests.

    Automatically returns successful responses by default.
    Can be customized for specific test cases.

    Usage:
        @patch('httpx.AsyncClient')
        async def test_something(mock_client, mock_httpx_client):
            mock_client.return_value.__aenter__.return_value = mock_httpx_client
            # Test code here
    """
    client = AsyncMock(spec=httpx.AsyncClient)

    # Default successful response
    default_response = mock_httpx_response(json_data={"data": []})
    client.get.return_value = default_response
    client.post.return_value = default_response
    client.patch.return_value = default_response
    client.delete.return_value = default_response

    return client


# =============================================================================
# Test Utilities
# =============================================================================

@pytest.fixture
def assert_authorization_header():
    """
    Utility fixture to assert Authorization header is used correctly.

    Usage:
        def test_something(assert_authorization_header):
            headers = {"Authorization": "Bearer token"}
            assert_authorization_header(headers, "token")
    """
    def _assert(headers: Dict[str, str], expected_token: str):
        assert "Authorization" in headers, "Authorization header missing"
        assert headers["Authorization"] == f"Bearer {expected_token}", \
            f"Expected 'Bearer {expected_token}', got '{headers['Authorization']}'"
        # Ensure token is NOT in query params
        assert "access_token" not in headers.get("params", {}), \
            "Token should be in header, not query params (security)"

    return _assert


@pytest.fixture
def assert_no_sensitive_data():
    """
    Utility to assert no sensitive data is leaked in responses/logs.

    Usage:
        def test_something(assert_no_sensitive_data):
            response = {"error": "Invalid token"}
            assert_no_sensitive_data(response)
    """
    def _assert(data: Any):
        data_str = str(data).lower()
        sensitive_patterns = [
            "test_token_123",  # Test tokens
            "password",
            "secret",
        ]

        for pattern in sensitive_patterns:
            assert pattern not in data_str, \
                f"Sensitive data '{pattern}' found in: {data}"

    return _assert


# =============================================================================
# Async Test Helpers
# =============================================================================

@pytest.fixture
def async_mock():
    """
    Factory for creating AsyncMock objects.

    Usage:
        def test_something(async_mock):
            mock_func = async_mock(return_value={"success": True})
            result = await mock_func()
    """
    def _create(return_value=None, side_effect=None):
        mock = AsyncMock()
        if return_value is not None:
            mock.return_value = return_value
        if side_effect is not None:
            mock.side_effect = side_effect
        return mock

    return _create


# =============================================================================
# Database Fixtures (for future use)
# =============================================================================

@pytest.fixture
def mock_db_session():
    """
    Mock database session for testing.

    Future use: When adding database tests.
    """
    session = MagicMock()
    session.execute = AsyncMock()
    session.commit = AsyncMock()
    session.rollback = AsyncMock()
    session.close = AsyncMock()
    return session


# =============================================================================
# Pytest Configuration Hooks
# =============================================================================

def pytest_configure(config):
    """Configure pytest with custom settings."""
    # Register custom markers
    config.addinivalue_line(
        "markers", "unit: Unit tests (fast, isolated)"
    )
    config.addinivalue_line(
        "markers", "integration: Integration tests (requires external services)"
    )
    config.addinivalue_line(
        "markers", "slow: Slow tests (> 1 second)"
    )
    config.addinivalue_line(
        "markers", "meta_api: Tests that interact with Meta API"
    )
    config.addinivalue_line(
        "markers", "database: Tests that require database connection"
    )


def pytest_collection_modifyitems(config, items):
    """
    Modify test collection to add markers automatically.

    - Tests in test_integration_*.py get @pytest.mark.integration
    - Tests with 'slow' in name get @pytest.mark.slow
    """
    for item in items:
        # Add integration marker to integration tests
        if "test_integration" in str(item.fspath):
            item.add_marker(pytest.mark.integration)

        # Add slow marker to slow tests
        if "slow" in item.name.lower():
            item.add_marker(pytest.mark.slow)
