"""
Unit tests for Meta API tools using TDD methodology.

TDD Cycles demonstrated:
1. RED: Write failing test
2. GREEN: Implement minimal code to pass
3. REFACTOR: Improve implementation
4. VERIFY: Check coverage

Run tests:
    pytest backend/tests/test_meta_api.py -v
    pytest backend/tests/test_meta_api.py::test_list_campaigns_success -v

Run with coverage:
    pytest backend/tests/test_meta_api.py --cov=app.tools.meta_api --cov-report=term
"""

import pytest
from unittest.mock import patch, AsyncMock, MagicMock
import httpx

from app.tools.meta_api import (
    list_campaigns,
    get_campaign_insights,
    duplicate_campaign,
    create_campaign,
    update_campaign_status,
    _get_auth_headers,
)


# =============================================================================
# TDD CYCLE 1: list_campaigns() - Basic functionality
# =============================================================================

@pytest.mark.unit
@pytest.mark.asyncio
async def test_list_campaigns_success(
    mock_settings,
    mock_meta_campaigns_response,
    mock_httpx_response,
):
    """
    TDD CYCLE 1 - RED Phase

    Test that list_campaigns returns campaigns successfully from Meta API.

    Expected behavior:
    - Makes GET request to Meta API with correct URL
    - Uses Authorization header (not query params)
    - Returns success=True with campaign data
    - Includes pagination info
    """
    # Arrange: Mock settings and HTTP response
    with patch('app.tools.meta_api.settings', mock_settings):
        with patch('httpx.AsyncClient') as mock_client:
            # Setup mock response
            mock_response = mock_httpx_response(
                json_data=mock_meta_campaigns_response
            )
            mock_async_client = AsyncMock()
            mock_async_client.get.return_value = mock_response
            mock_client.return_value.__aenter__.return_value = mock_async_client

            # Act: Call the function
            result = await list_campaigns()

            # Assert: Verify results
            assert result['success'] is True
            assert 'campaigns' in result
            assert len(result['campaigns']) == 3
            assert result['total'] == 3
            assert result['pages_fetched'] == 1

            # Assert: Verify campaign data
            first_campaign = result['campaigns'][0]
            assert first_campaign['id'] == "123456789"
            assert first_campaign['name'] == "Test Campaign"
            assert first_campaign['status'] == "ACTIVE"

            # Assert: Verify API call was made correctly
            mock_async_client.get.assert_called_once()
            call_args = mock_async_client.get.call_args

            # Verify URL
            assert 'act_123456789/campaigns' in call_args[0][0]

            # Verify headers contain Authorization
            headers = call_args[1]['headers']
            assert 'Authorization' in headers
            assert headers['Authorization'] == 'Bearer test_token_123'


@pytest.mark.unit
@pytest.mark.asyncio
async def test_list_campaigns_with_status_filter(
    mock_settings,
    mock_httpx_response,
):
    """
    TDD CYCLE 1 - GREEN Phase

    Test filtering campaigns by status.
    """
    with patch('app.tools.meta_api.settings', mock_settings):
        with patch('httpx.AsyncClient') as mock_client:
            # Only return ACTIVE campaigns
            active_campaign_response = {
                "data": [
                    {
                        "id": "123",
                        "name": "Active Campaign",
                        "status": "ACTIVE",
                        "effective_status": "ACTIVE",
                        "objective": "OUTCOME_SALES",
                    }
                ]
            }

            mock_response = mock_httpx_response(json_data=active_campaign_response)
            mock_async_client = AsyncMock()
            mock_async_client.get.return_value = mock_response
            mock_client.return_value.__aenter__.return_value = mock_async_client

            # Act
            result = await list_campaigns(status="ACTIVE")

            # Assert
            assert result['success'] is True
            assert len(result['campaigns']) == 1
            assert result['campaigns'][0]['status'] == "ACTIVE"

            # Verify filtering parameter was sent
            call_args = mock_async_client.get.call_args
            params = call_args[1]['params']
            assert 'filtering' in params


@pytest.mark.unit
@pytest.mark.asyncio
async def test_list_campaigns_exclude_drafts(
    mock_settings,
    mock_meta_campaigns_response,
    mock_httpx_response,
):
    """
    TDD CYCLE 1 - REFACTOR Phase

    Test that drafts are excluded when include_drafts=False.
    """
    with patch('app.tools.meta_api.settings', mock_settings):
        with patch('httpx.AsyncClient') as mock_client:
            mock_response = mock_httpx_response(json_data=mock_meta_campaigns_response)
            mock_async_client = AsyncMock()
            mock_async_client.get.return_value = mock_response
            mock_client.return_value.__aenter__.return_value = mock_async_client

            # Act: Request without drafts
            result = await list_campaigns(include_drafts=False)

            # Assert: Draft campaign should be filtered out
            assert result['success'] is True
            assert len(result['campaigns']) == 2  # 3 total - 1 draft = 2

            # Verify no PREVIEW campaigns
            for campaign in result['campaigns']:
                assert campaign.get('effective_status') != 'PREVIEW'


@pytest.mark.unit
@pytest.mark.asyncio
async def test_list_campaigns_rate_limit_error(
    mock_settings,
    mock_meta_rate_limit_error,
    mock_httpx_response,
):
    """
    TDD CYCLE 1 - Edge Case

    Test handling of Meta API rate limit error (code 80004).
    """
    with patch('app.tools.meta_api.settings', mock_settings):
        with patch('httpx.AsyncClient') as mock_client:
            # Return rate limit error
            mock_response = mock_httpx_response(json_data=mock_meta_rate_limit_error)
            mock_async_client = AsyncMock()
            mock_async_client.get.return_value = mock_response
            mock_client.return_value.__aenter__.return_value = mock_async_client

            # Act
            result = await list_campaigns()

            # Assert: Should return error with specific message
            assert result['success'] is False
            assert 'Muitas requisições' in result['error'] or 'too many calls' in result['error'].lower()
            assert result.get('error_code') == 80004
            assert result['campaigns'] == []


@pytest.mark.unit
@pytest.mark.asyncio
async def test_list_campaigns_no_token(no_token_settings):
    """
    TDD CYCLE 1 - Security

    Test that function fails gracefully when Meta API token is not configured.
    """
    with patch('app.tools.meta_api.settings', no_token_settings):
        # Act
        result = await list_campaigns()

        # Assert
        assert result['success'] is False
        assert 'Meta API não configurada' in result['error']
        assert result['campaigns'] == []


@pytest.mark.unit
@pytest.mark.asyncio
async def test_list_campaigns_empty_response(
    mock_settings,
    mock_meta_empty_response,
    mock_httpx_response,
):
    """
    TDD CYCLE 1 - Edge Case

    Test handling of empty campaign list.
    """
    with patch('app.tools.meta_api.settings', mock_settings):
        with patch('httpx.AsyncClient') as mock_client:
            mock_response = mock_httpx_response(json_data=mock_meta_empty_response)
            mock_async_client = AsyncMock()
            mock_async_client.get.return_value = mock_response
            mock_client.return_value.__aenter__.return_value = mock_async_client

            # Act
            result = await list_campaigns()

            # Assert
            assert result['success'] is True
            assert result['campaigns'] == []
            assert result['total'] == 0


@pytest.mark.unit
@pytest.mark.asyncio
async def test_list_campaigns_network_error(mock_settings):
    """
    TDD CYCLE 1 - Error Handling

    Test handling of network/timeout errors.
    """
    with patch('app.tools.meta_api.settings', mock_settings):
        with patch('httpx.AsyncClient') as mock_client:
            # Simulate network error
            mock_async_client = AsyncMock()
            mock_async_client.get.side_effect = httpx.TimeoutException("Timeout")
            mock_client.return_value.__aenter__.return_value = mock_async_client

            # Act
            result = await list_campaigns()

            # Assert
            assert result['success'] is False
            assert 'error' in result
            assert result['campaigns'] == []


# =============================================================================
# TDD CYCLE 2: get_campaign_insights() - Metrics and Analytics
# =============================================================================

@pytest.mark.unit
@pytest.mark.asyncio
async def test_get_insights_success(
    mock_settings,
    mock_meta_insights_response,
    mock_httpx_response,
):
    """
    TDD CYCLE 2 - RED Phase

    Test successful retrieval of campaign insights.
    """
    with patch('app.tools.meta_api.settings', mock_settings):
        with patch('httpx.AsyncClient') as mock_client:
            mock_response = mock_httpx_response(json_data=mock_meta_insights_response)
            mock_async_client = AsyncMock()
            mock_async_client.get.return_value = mock_response
            mock_client.return_value.__aenter__.return_value = mock_async_client

            # Act
            result = await get_campaign_insights(
                campaign_id="123456789",
                date_preset="last_7d"
            )

            # Assert
            assert result['success'] is True
            assert 'insights' in result
            assert result['period'] == "last_7d"

            # Verify metrics
            insights = result['insights']
            assert insights['impressions'] == 10000
            assert insights['clicks'] == 500
            assert insights['spend'] == 250.50
            assert insights['ctr'] == 5.0
            assert insights['conversions'] == 50

            # Verify API call
            call_args = mock_async_client.get.call_args
            assert '123456789/insights' in call_args[0][0]
            assert call_args[1]['params']['date_preset'] == 'last_7d'


@pytest.mark.unit
@pytest.mark.asyncio
async def test_get_insights_different_date_ranges(
    mock_settings,
    mock_meta_insights_response,
    mock_httpx_response,
):
    """
    TDD CYCLE 2 - GREEN Phase

    Test different date range presets.
    """
    date_presets = ["today", "yesterday", "last_30d", "this_month"]

    with patch('app.tools.meta_api.settings', mock_settings):
        with patch('httpx.AsyncClient') as mock_client:
            for preset in date_presets:
                mock_response = mock_httpx_response(json_data=mock_meta_insights_response)
                mock_async_client = AsyncMock()
                mock_async_client.get.return_value = mock_response
                mock_client.return_value.__aenter__.return_value = mock_async_client

                # Act
                result = await get_campaign_insights(
                    campaign_id="123",
                    date_preset=preset
                )

                # Assert
                assert result['success'] is True
                assert result['period'] == preset


@pytest.mark.unit
@pytest.mark.asyncio
async def test_get_insights_empty_data(
    mock_settings,
    mock_httpx_response,
):
    """
    TDD CYCLE 2 - Edge Case

    Test handling of empty insights (new campaign with no data).
    """
    empty_insights = {"data": []}

    with patch('app.tools.meta_api.settings', mock_settings):
        with patch('httpx.AsyncClient') as mock_client:
            mock_response = mock_httpx_response(json_data=empty_insights)
            mock_async_client = AsyncMock()
            mock_async_client.get.return_value = mock_response
            mock_client.return_value.__aenter__.return_value = mock_async_client

            # Act
            result = await get_campaign_insights(campaign_id="123")

            # Assert
            assert result['success'] is True
            # Should return zeros for all metrics
            assert result['insights']['impressions'] == 0
            assert result['insights']['clicks'] == 0
            assert result['insights']['spend'] == 0.0


@pytest.mark.unit
@pytest.mark.asyncio
async def test_get_insights_authorization_header(
    mock_settings,
    mock_meta_insights_response,
    mock_httpx_response,
    assert_authorization_header,
):
    """
    TDD CYCLE 2 - Security

    Test that Authorization header is used (not query params).
    """
    with patch('app.tools.meta_api.settings', mock_settings):
        with patch('httpx.AsyncClient') as mock_client:
            mock_response = mock_httpx_response(json_data=mock_meta_insights_response)
            mock_async_client = AsyncMock()
            mock_async_client.get.return_value = mock_response
            mock_client.return_value.__aenter__.return_value = mock_async_client

            # Act
            await get_campaign_insights(campaign_id="123")

            # Assert
            call_args = mock_async_client.get.call_args
            headers = call_args[1]['headers']
            params = call_args[1]['params']

            # Use assertion helper
            assert_authorization_header(headers, "test_token_123")

            # Ensure token is NOT in params
            assert 'access_token' not in params


# =============================================================================
# TDD CYCLE 3: duplicate_campaign() - Campaign Duplication
# =============================================================================

@pytest.mark.unit
@pytest.mark.asyncio
async def test_duplicate_campaign_success(
    mock_settings,
    mock_meta_duplicate_response,
    mock_httpx_response,
):
    """
    TDD CYCLE 3 - RED Phase

    Test successful campaign duplication using /copies endpoint.
    """
    with patch('app.tools.meta_api.settings', mock_settings):
        with patch('httpx.AsyncClient') as mock_client:
            mock_response = mock_httpx_response(json_data=mock_meta_duplicate_response)
            mock_async_client = AsyncMock()
            mock_async_client.post.return_value = mock_response
            mock_client.return_value.__aenter__.return_value = mock_async_client

            # Act
            result = await duplicate_campaign(
                campaign_id="123456789",
                name_suffix=" - Cópia",
                deep_copy=False,
                status_option="PAUSED"
            )

            # Assert
            assert result['success'] is True
            assert result['campaign_id'] == "new_campaign_123"
            assert 'duplicada com sucesso' in result['message']

            # Verify API call
            call_args = mock_async_client.post.call_args
            assert '123456789/copies' in call_args[0][0]

            # Verify parameters
            data = call_args[1]['data']
            assert data['deep_copy'] == 'false'
            assert data['status_option'] == 'PAUSED'
            assert 'rename_suffix' in data


@pytest.mark.unit
@pytest.mark.asyncio
async def test_duplicate_campaign_deep_copy_true(
    mock_settings,
    mock_meta_duplicate_response,
    mock_httpx_response,
):
    """
    TDD CYCLE 3 - GREEN Phase

    Test duplication with deep_copy=True (copies ad sets and ads).
    """
    with patch('app.tools.meta_api.settings', mock_settings):
        with patch('httpx.AsyncClient') as mock_client:
            mock_response = mock_httpx_response(json_data=mock_meta_duplicate_response)
            mock_async_client = AsyncMock()
            mock_async_client.post.return_value = mock_response
            mock_client.return_value.__aenter__.return_value = mock_async_client

            # Act
            result = await duplicate_campaign(
                campaign_id="123",
                deep_copy=True
            )

            # Assert
            assert result['success'] is True
            assert result['deep_copy'] is True

            # Verify deep_copy parameter
            call_args = mock_async_client.post.call_args
            data = call_args[1]['data']
            assert data['deep_copy'] == 'true'


@pytest.mark.unit
@pytest.mark.asyncio
async def test_duplicate_campaign_error_request_too_large(
    mock_settings,
    mock_meta_duplicate_error_large_request,
    mock_httpx_response,
):
    """
    TDD CYCLE 3 - REFACTOR Phase

    Test handling of "request too large" error (code 100, subcode 1885194).
    """
    with patch('app.tools.meta_api.settings', mock_settings):
        with patch('httpx.AsyncClient') as mock_client:
            mock_response = mock_httpx_response(
                json_data=mock_meta_duplicate_error_large_request
            )
            mock_async_client = AsyncMock()
            mock_async_client.post.return_value = mock_response
            mock_client.return_value.__aenter__.return_value = mock_async_client

            # Act
            result = await duplicate_campaign(
                campaign_id="123",
                deep_copy=True  # Trigger error
            )

            # Assert
            assert result['success'] is False
            assert 'muitos ad sets' in result['error'].lower() or 'too large' in result['error'].lower()
            assert result.get('error_code') == 100
            assert result.get('error_subcode') == 1885194
            assert 'suggestion' in result or 'deep_copy=false' in result['error'].lower()


@pytest.mark.unit
@pytest.mark.asyncio
async def test_duplicate_campaign_timeout(mock_settings):
    """
    TDD CYCLE 3 - Error Handling

    Test handling of timeout during duplication.
    """
    with patch('app.tools.meta_api.settings', mock_settings):
        with patch('httpx.AsyncClient') as mock_client:
            mock_async_client = AsyncMock()
            mock_async_client.post.side_effect = httpx.TimeoutException("Timeout")
            mock_client.return_value.__aenter__.return_value = mock_async_client

            # Act
            result = await duplicate_campaign(campaign_id="123")

            # Assert
            assert result['success'] is False
            assert 'Timeout' in result['error'] or 'timeout' in result['error'].lower()


# =============================================================================
# Helper Function Tests
# =============================================================================

@pytest.mark.unit
def test_get_auth_headers(mock_settings):
    """
    Test _get_auth_headers() returns correct Authorization header.
    """
    with patch('app.tools.meta_api.settings', mock_settings):
        headers = _get_auth_headers()

        assert 'Authorization' in headers
        assert headers['Authorization'] == 'Bearer test_token_123'
        assert len(headers) == 1  # Only Authorization header


# =============================================================================
# Coverage Verification Tests
# =============================================================================

@pytest.mark.unit
@pytest.mark.asyncio
async def test_list_campaigns_pagination(
    mock_settings,
    mock_httpx_response,
):
    """
    Test pagination handling in list_campaigns.

    Verifies that multiple pages are fetched automatically.
    """
    # Page 1 response
    page1_response = {
        "data": [{"id": "1", "name": "Campaign 1", "status": "ACTIVE"}],
        "paging": {
            "next": "https://graph.facebook.com/v24.0/next_page"
        }
    }

    # Page 2 response (final page)
    page2_response = {
        "data": [{"id": "2", "name": "Campaign 2", "status": "ACTIVE"}],
        "paging": {}
    }

    with patch('app.tools.meta_api.settings', mock_settings):
        with patch('httpx.AsyncClient') as mock_client:
            mock_async_client = AsyncMock()

            # First call returns page 1, second call returns page 2
            mock_async_client.get.side_effect = [
                mock_httpx_response(json_data=page1_response),
                mock_httpx_response(json_data=page2_response),
            ]

            mock_client.return_value.__aenter__.return_value = mock_async_client

            # Act
            result = await list_campaigns()

            # Assert
            assert result['success'] is True
            assert len(result['campaigns']) == 2
            assert result['pages_fetched'] == 2
            assert mock_async_client.get.call_count == 2


@pytest.mark.unit
@pytest.mark.asyncio
async def test_create_campaign_success(
    mock_settings,
    mock_httpx_response,
):
    """
    Test successful campaign creation.
    """
    create_response = {
        "id": "new_campaign_123",
    }

    with patch('app.tools.meta_api.settings', mock_settings):
        with patch('httpx.AsyncClient') as mock_client:
            mock_response = mock_httpx_response(json_data=create_response)
            mock_async_client = AsyncMock()
            mock_async_client.post.return_value = mock_response
            mock_client.return_value.__aenter__.return_value = mock_async_client

            # Act
            result = await create_campaign(
                name="Test Campaign",
                objective="OUTCOME_SALES",
                status="PAUSED",
                daily_budget=5000
            )

            # Assert
            assert result['success'] is True
            assert result['campaign_id'] == "new_campaign_123"


@pytest.mark.unit
@pytest.mark.asyncio
async def test_update_campaign_status_success(
    mock_settings,
    mock_httpx_response,
):
    """
    Test successful campaign status update.
    """
    update_response = {"success": True}

    with patch('app.tools.meta_api.settings', mock_settings):
        with patch('httpx.AsyncClient') as mock_client:
            mock_response = mock_httpx_response(json_data=update_response)
            mock_async_client = AsyncMock()
            mock_async_client.post.return_value = mock_response
            mock_client.return_value.__aenter__.return_value = mock_async_client

            # Act
            result = await update_campaign_status(
                campaign_id="123",
                status="ACTIVE"
            )

            # Assert
            assert result['success'] is True
            assert 'ACTIVE' in result['message']
