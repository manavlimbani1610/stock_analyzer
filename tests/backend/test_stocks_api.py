"""
Stocks API Tests
"""
import pytest

class TestStocksAPI:
    """Test stocks endpoints"""

    def test_get_quote(self, api_base_url, sample_ticker):
        """Test GET /api/v1/stocks/quote/{ticker}"""
        # TODO: Implement
        pass

    def test_get_profile(self, api_base_url, sample_ticker):
        """Test GET /api/v1/stocks/profile/{ticker}"""
        # TODO: Implement
        pass

    def test_search_stocks(self, api_base_url):
        """Test GET /api/v1/stocks/search"""
        # TODO: Implement
        pass
