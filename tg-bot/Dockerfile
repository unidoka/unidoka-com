FROM python:3.11-slim

WORKDIR /app

# Install runtime deps first (cached).
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Dev deps are optional; if requirements-dev.txt exists in the build
# context, install it too. Prod images built from a clean context that
# only ships requirements.txt skip this step.
COPY requirements-dev.txt* ./
RUN if [ -f requirements-dev.txt ]; then \
      pip install --no-cache-dir -r requirements-dev.txt; \
    fi

COPY . .

CMD ["python", "app/bot.py"]
