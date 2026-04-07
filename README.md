# Anchor: Predictive Churn Protocol v1.0

Anchor is a high-fidelity machine learning system designed to map user telemetry and preemptively identify revenue leakage. By unifying billing cycles and product usage patterns, Anchor calculates churn probabilities with statistical precision, allowing teams to intervene before a customer churns.

## 🚀 Quick Start (Docker)

Ensure you have [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) installed.

```bash
# Build and start all services
docker-compose up --build
```

- **Frontend Console:** [http://localhost:3000](http://localhost:3000)
- **Inference API:** [http://localhost:8000/docs](http://localhost:8000/docs) (Swagger UI)

## 🏗 Architecture

- **Backend:** FastAPI (Python 3.13) serving a LightGBM model.
- **Frontend:** React + Vite + Framer Motion (Styled with Vanilla CSS).
- **Inference:** Sub-second latency with SHAP-based feature importance drivers.
- **Proxy:** Nginx handles production routing and static asset delivery.

## 📁 Project Structure

```text
anchor/
├── frontend/             # React application (Vite)
│   ├── src/              # Component architecture
│   └── nginx.conf        # Production proxy configuration
├── models/               # Trained model artifacts (.pkl)
├── src/
│   ├── serving/          # FastAPI application (app.py)
│   ├── training/         # ML pipeline (train.py, tune.py)
│   └── shared/           # Common utilities
├── Dockerfile            # API container specification
└── docker-compose.yml    # Full stack orchestration
```

## 🛠 Features

- **Algorithmic Precision:** State-of-the-art tree-based models parsing high-dimensional feature spaces.
- **Sub-Second Inference:** Lightweight FastAPI layer for instantaneous strategic directives.
- **Interpretive Drivers:** Fully illuminated SHAP analysis arrays for transparent visibility into churn drivers.
- **Responsive Console:** Modern, minimal interface with real-time feedback and loading overlays.

## 🧪 Development

### Backend (Local)
```bash
poetry install
uvicorn src.serving.app:app --reload
```

### Frontend (Local)
```bash
cd frontend
npm install
npm run dev
```

---
*Anchor v1.0 — Mapping the future of retention.*
