<div align="center">
  <h1>🌌 StratIQ</h1>
  <p><strong>Enterprise Decision Intelligence & Monte Carlo Simulation Engine</strong></p>
  
  [![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
  [![Streamlit](https://img.shields.io/badge/Streamlit-1.31-FF4B4B?style=for-the-badge&logo=streamlit)](https://streamlit.io/)
  [![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python)](https://python.org/)
</div>

<br />

StratIQ is a highly polished, executive-grade decision intelligence platform. It allows strategists to model financial decisions, define stochastic uncertainty ranges (Gaussian, Triangular), and instantly run **10,000-iteration Monte Carlo simulations** to generate risk-adjusted expected values. 

The application synthesizes quantitative risk profiling with qualitative AI strategy mental models (inspired by Ray Dalio, Warren Buffett, and Michael Porter).

## ✨ Features
- **Stochastic Simulation Engine**: Core mathematical engine computing 90% confidence intervals and downside probabilities.
- **Max Heavy UI/UX**: An ultra-premium dark mode glassmorphism interface inspired by Linear and Palantir Foundry.
- **AI Strategic Advisor**: Automatically synthesizes the mathematical outcomes into actionable strategic advice.
- **Dual Architecture**: Includes both a full-stack distributed system (Next.js + FastAPI) and a standalone Python monolith (`streamlit_app.py`).

---

## 🚀 Deployment & Configuration

### Option A: The Streamlit Monolith (Easiest)
For instant deployment with zero configuration, use the standalone Streamlit version.
1. Connect this repository to [Streamlit Community Cloud](https://share.streamlit.io/).
2. Set the Main file path to: `streamlit_app.py`
3. Click Deploy. (Dependencies are automatically handled via `requirements.txt`).

### Option B: The Full-Stack Architecture (Advanced)
For the ultimate performance and UI control, deploy the Next.js frontend and FastAPI backend separately.

**1. Backend (Render / Railway)**
- Create a new Web Service pointing to the `backend/` root directory.
- Start Command: `uvicorn app.main:app --host 0.0.0.0 --port 10000`
- Ensure Python 3.11+ is used.

**2. Frontend (Vercel)**
- Create a new Project pointing to the `frontend/` root directory.
- Override the API URL in the code to point to your new Render backend URL.
- Deploy.

---

## 💻 Local Development (VS Code)

To run the full-stack version locally in VS Code:
1. Open the Command Palette (`Ctrl+Shift+P`).
2. Type `Tasks: Run Task` and select **Start StratIQ App**.
3. VS Code will automatically boot both the Next.js UI (`localhost:3000`) and the FastAPI engine (`localhost:8000`).

To run the Streamlit version locally:
```bash
pip install -r requirements.txt
streamlit run streamlit_app.py
```
