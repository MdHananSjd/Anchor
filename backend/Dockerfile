# Use an official Python runtime as a parent image
FROM python:3.13-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV POETRY_VERSION=2.0.1

# Set work directory
WORKDIR /app

# Install system dependencies (needed for LightGBM and Poetry)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN curl -sSL https://install.python-poetry.org | python3 - --version $POETRY_VERSION
ENV PATH="/root/.local/bin:$PATH"

# Copy only dependency files first (for better caching)
COPY pyproject.toml poetry.lock* /app/

# Project configuration: Don't create a virtualenv inside the container
RUN poetry config virtualenvs.create false \
    && poetry install --no-interaction --no-ansi --no-root

# Copy the rest of the application
# This includes the models/ folder and src/ code
COPY . /app/

# Final installation of the project itself
RUN poetry install --no-interaction --no-ansi --no-root

# Expose the port FastAPI runs on. Hugging face defaults port 7860
EXPOSE 7860

#Command to run the application
CMD ["uvicorn", "src.serving.app:app", "--host", "0.0.0.0", "--port", "7860"]