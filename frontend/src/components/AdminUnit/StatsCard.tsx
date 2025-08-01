import React from 'react';

interface StatsCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon, color }) => {
  return (
    <div className="bg-white p-4 rounded shadow flex items-center gap-4">
      <div className={`p-2 bg-gray-100 rounded ${color}`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-gray-500 whitespace-nowrap">{label}</p>
      </div>
    </div>
  );
};

export default StatsCard;
