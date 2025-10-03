'use client';

import React from 'react';

export type AdminCardProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export default function AdminCard({ title, subtitle, children }: AdminCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 space-y-2">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      <div className="pt-2">{children}</div>
    </div>
  );
}
