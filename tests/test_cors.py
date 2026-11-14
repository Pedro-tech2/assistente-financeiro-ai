import pytest
from fastapi.testclient import TestClient

from main import app


client = TestClient(app)


@pytest.mark.parametrize(
    "origin",
    ["http://127.0.0.1:5500", "http://localhost:5500"],
)
def test_live_server_origins_are_allowed(origin):
    response = client.options(
        "/analise",
        headers={
            "Origin": origin,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == origin


def test_unlisted_origin_is_not_allowed():
    response = client.options(
        "/analise",
        headers={
            "Origin": "http://example.com",
            "Access-Control-Request-Method": "POST",
        },
    )

    assert response.status_code == 400
    assert "access-control-allow-origin" not in response.headers
