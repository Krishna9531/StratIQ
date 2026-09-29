# StratIQ: Enterprise Decision Intelligence Platform

A minimalist, high-density platform for executive decision modeling, scenario analysis, and risk intelligence. Built with Next.js, Tailwind CSS, FastAPI, and SQLite.

## UI/UX Philosophy
Inspired by Palantir Foundry, Linear, and Bloomberg Terminals.
- Extreme minimalism, high data density.
- Typography-first hierarchy using Inter.
- Very subtle borders, no decorative charts, monochromatic emphasis.

## How to Run Locally

You can launch both the frontend and backend servers instantly using the provided PowerShell script:

```powershell
.\start_servers.ps1
```

Once running:
- **Frontend (UI)**: [http://localhost:3000](http://localhost:3000)
- **Backend (API)**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### Features Built
1. **Executive Launchpad**: A dashboard summarizing the decision portfolio and tracking system activity.
2. **Decision Workspace**: The heart of the application. A detailed drill-down for a single decision model.
3. **Monte Carlo Engine**: A Python-based simulation engine capable of running 10,000 statistical iterations based on Normal, Triangular, and Fixed distributions.
4. **Assumptions Editor**: An interactive side-drawer allowing analysts to alter variables dynamically and immediately re-run the simulation.
5. **Scenario Comparison**: Side-by-side analysis of Base Case vs. Conservative vs. Aggressive trajectories.

## Project Structure
- `/frontend`: Next.js 16 App Router application. Uses React Server Components for data fetching and highly interactive Client Components for the workspace workflows.
- `/backend`: Python FastAPI application. Uses SQLAlchemy to connect to a local SQLite database (`stratiq.db`), holding the decision schemas and handling the math engine.
