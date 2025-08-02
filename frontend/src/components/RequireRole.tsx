// components/RequireRole.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';

interface RequireRoleProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

const RequireRole: React.FC<RequireRoleProps> = ({ allowedRoles, children }) => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const role = user?.role;

  if (!allowedRoles.includes(role)) {
  console.warn('Người dùng không có quyền truy cập:', role);
  return <Navigate to="/login" replace />;
}

  return <>{children}</>;
};

export default RequireRole;
