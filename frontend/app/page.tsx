import React from 'react';
import DashboardClient from './DashboardClient';

async function getDashboardData() {
  const res = await fetch('http://127.0.0.1:8000/api/v1/decisions/dashboard', {
    next: { revalidate: 0 },
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function Dashboard() {
  const dashboardData = await getDashboardData();

  if (!dashboardData) {
    return <div className="p-8 text-secondary-text">Error connecting to StratIQ Core API.</div>;
  }

  return <DashboardClient dashboardData={dashboardData} />;
}
