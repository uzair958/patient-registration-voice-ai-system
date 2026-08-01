# AI Patient Registration System

A full-stack, AI-powered patient registration and management system. This project integrates a voice-based AI assistant (via Vapi) with a modern web dashboard and a robust backend to seamlessly register, lookup, and manage patient information over the phone.

## 🏗 Architecture Overview

The system is composed of three main services:

1. **Frontend Dashboard (`/frontend/react-app`)**: A React/Vite web application that provides a modern, responsive UI for clinical staff to view, search, and manage registered patients.
2. **Core Backend (`/backend`)**: A Django application backed by a MySQL database. It exposes RESTful APIs to manage patient records securely.
3. **AI Service (`/ai-service`)**: A FastAPI middleware service that acts as the bridge between the external Vapi AI Assistant and the Core Backend. It exposes custom tool endpoints (`/create`, `/lookup`, `/update`) that Vapi uses to interact with the database during active voice calls.

## 🚀 Features

- **Voice AI Registration**: Patients can call a phone number and talk to an AI assistant that seamlessly extracts their details and saves them to the database in real-time.
- **Real-time Dashboard**: A premium, responsive React dashboard to view active patient records, search by demographics, and manage data.
- **Resilient AI Tooling**: The AI service uses robust Pydantic schemas and manual JSON parsing to handle LLM hallucinations and varied data formats perfectly.

---

## 🛠 Prerequisites

Before running the project locally, ensure you have the following installed:
- [Python 3.10+](https://www.python.org/)
- [Node.js 18+](https://nodejs.org/)
- [MySQL Server](https://dev.mysql.com/downloads/)
- [uv](https://github.com/astral-sh/uv) (Extremely fast Python package installer and resolver)
- [ngrok](https://ngrok.com/) (For exposing the AI Service to Vapi)

---

## ⚙️ Setup & Installation

### 1. Environment Configuration
Copy the sample environment file in the root directory and configure it:
```bash
cp .env.example .env
```
Ensure your MySQL database credentials in `.env` are correct.

### 2. Core Backend (Django)
Set up the Django database and run the core API.
```bash
cd backend
uv sync
uv run python manage.py migrate
uv run python manage.py runserver 8000
```
The backend API will be available at `http://127.0.0.1:8000`.

### 3. AI Service (FastAPI)
The AI service needs to be running so the Vapi assistant can make tool calls.
```bash
cd ai-service
uv sync
uv run uvicorn app.main:app --port 8001 --reload
```
The AI service will be available at `http://127.0.0.1:8001`.

**To connect Vapi:**
Since Vapi is an external service, you must expose your local AI service using ngrok:
```bash
ngrok http 8001
```
Copy the forwarding URL (e.g., `https://<your-ngrok-id>.ngrok-free.app`) and configure your Vapi Custom Tools to point to `https://<your-ngrok-id>.ngrok-free.app/tools/patient/create` (and `/lookup`, `/update`).

### 4. Frontend Dashboard (React)
Start the Vite development server for the admin UI.
```bash
cd frontend/react-app
npm install
npm run dev
```
The dashboard will be available at `http://localhost:5173`.

---

## 📞 Vapi AI Configuration

To make the AI voice assistant work:
1. Create an assistant in the [Vapi Dashboard](https://dashboard.vapi.ai/).
2. Add custom tools for `create_patient`, `lookup_patient`, and `update_patient`.
3. Set the tool endpoints to your `ngrok` URL.
4. Ensure the assistant prompt explicitly asks the user for the required fields (First Name, Last Name, DOB, Phone, Address, Sex) before calling the `create_patient` tool.

## 🧪 Testing

The AI service includes a robust pytest suite with mocked backend responses to ensure tool calls work reliably:
```bash
cd ai-service
uv run pytest -v
```
