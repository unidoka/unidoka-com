FROM python:3.12-slim

WORKDIR /app

# Only the source tree and packaging metadata — no test suite, no
# compose files, no README (slim build context, see .dockerignore).
COPY pyproject.toml ./
COPY unidoka_events_mcp ./unidoka_events_mcp

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir .

EXPOSE 8001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8001/health')"

CMD ["uvicorn", "unidoka_events_mcp.http_server:app", "--host", "0.0.0.0", "--port", "8001"]
