import pytest
from fastapi.testclient import TestClient

from main import app


client = TestClient(app)


@pytest.mark.parametrize(
    ("path", "page_heading"),
    [
        ("/perguntas", "Perguntas Frequentes"),
        ("/sobre", "Sobre o Projeto"),
    ],
)
def test_informational_pages_are_served(path, page_heading):
    response = client.get(path)

    assert response.status_code == 200
    assert page_heading in response.text


def test_homepage_links_to_informational_pages_without_contact_link():
    response = client.get("/")

    assert response.status_code == 200
    assert 'href="/perguntas"' in response.text
    assert 'href="/sobre"' in response.text
    assert ">Contato</a>" not in response.text
