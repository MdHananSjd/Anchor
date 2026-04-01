# 1. Use an official Python runtime as a parent image
FROM python:3.13-slim

# 2. Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV POETRY_VERSION=1.8.2

# 3. Set work directory
WORKDIR /app

# 4. Install system dependencies (needed for LightGBM and Poetry)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 5. Install Poetry
RUN curl -sSL https://install.python-poetry.org | python3 -
ENV PATH="/root/.local/bin:$PATH"

# 6. Copy only dependency files first (for better caching)
COPY pyproject.toml poetry.lock* /app/

# 7. Project configuration: Don't create a virtualenv inside the container
RUN poetry config virtualenvs.create false \
    && poetry install --no-interaction --no-ansi --no-root

# 8. Copy the rest of the application
# This includes the models/ folder and src/ code
COPY . /app/

# 9. Final installation of the project itself
RUN poetry install --no-interaction --no-ansi

# 10. Expose the port FastAPI runs on
EXPOSE 8000

# 11. Command to run the application
CMD ["uvicorn", "src.serving.app:app", "--host", "0.0.0.0", "--port", "8000"]