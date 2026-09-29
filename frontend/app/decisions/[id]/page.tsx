import React from 'react';
import Link from 'next/link';
import WorkspaceClient from './WorkspaceClient';

async function getDecisionData(id: string) {
  const res = await fetch(`http://127.0.0.1:8000/api/v1/decisions/${id}`, {
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    if(res.status === 404) return null;
    throw new Error('Failed to fetch data');
  }
  return res.json();
}

export default async function DecisionWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const decision = await getDecisionData(resolvedParams.id);

  if (!decision) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-primary-text text-sm">
        <div className="text-center">
          <h1 className="font-medium mb-2">Decision Not Found</h1>
          <Link href="/" className="text-secondary-text hover:text-primary-text underline underline-offset-4">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return <WorkspaceClient decision={decision} />;
}
