// src/components/DashboardCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';

export interface DashboardCardProps {
  to: string;
  title: string;
  description: string;
  icon: string;
  color?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ to, title, description, icon, color }) => {
  return (
    <Link
      to={to}
      className="block p-5 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition bg-white"
    >
      <div className={`text-3xl mb-2 ${color || 'text-gray-800'}`}>{icon}</div>
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <p className="text-sm text-gray-600 mt-1">{description}</p>
    </Link>
  );
};

export default DashboardCard;
