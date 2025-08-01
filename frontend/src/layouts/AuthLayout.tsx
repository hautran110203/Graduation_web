import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout: React.FC = () => (
  <div>
    <Outlet />
  </div>
);

export default AuthLayout;
