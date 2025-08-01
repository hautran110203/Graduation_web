import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import type{ ReactNode } from 'react';

import DefaultLayout from './layouts/DefaultLayout';
import AuthLayout from './layouts/AuthLayout';
import HomePage from './pages/HomePage';
import EventPage from './pages/EventPage';
import EventDetailsPage from './pages/EventDetailsPage';
import RegisterPage from './pages/RegisterPage';
import SignUpPage from './pages/SignUpPage';
import MyRegistrationsPage from './pages/MyRegistrationsPage';
import AdminUnitLayout from './layouts/AdminUnitLayout';
import EventListAdminUnit from './components/AdminUnit/EventListAdminUnit';
import GraduationPage from './pages/AdminUnit/GraduationPage';
import RegistrationListPage from './pages/AdminUnit/RegistrationListPage';
import AdminOverviewPage from './pages/AdminUnit/AdminOverviewPage';
import EventPresentationUI from './pages/AdminUnit/EventPresentationUI';
import PresentationRoute from './routes/PresentationRoute';
import AdminLayout from './layouts/AdminLayout';
import TrainingUnitPage from './pages/Admin/TrainingUnitPage';
import AdminUnitAccountPage from './pages/Admin/AdminUnitAccountPage';
import EventStatisticsPage from './pages/Admin/EventStatisticsPage';
import LocationListPage from './pages/Admin/LocationListPage';
import AdminDashboardPage from './pages/Admin/AdminDashboardPage';
import PresentationWindow from './components/ppt/PresentationWindow';
const token = localStorage.getItem("token");
if (token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

const RequireAuth = ({ children }: { children: ReactNode }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};


function App() {

  return (
    <Router>
      <Routes>
        {/* ✅ Redirect root path đến login nếu chưa có token */}
        <Route path="/" element={<Navigate to="/login" />} />
        {/* Layout không có Header/Footer (dùng cho login và trình chiếu) */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<SignUpPage />} />
          <Route path="/presentation" element={<PresentationWindow />} />
        </Route>

        {/* Các trang cần xác thực */}
        <Route element={<RequireAuth><DefaultLayout/></RequireAuth>}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/events" element={<EventPage />} />
          <Route path="/events/:unit_code/:event_id" element={<EventDetailsPage />} />
          <Route path="/events/confirm" element={<RegisterPage />} />
          <Route path="/myevent" element={<MyRegistrationsPage />} />

          {/* Admin Unit */}
          <Route path="/adminunit/event" element={<AdminUnitLayout><EventListAdminUnit /></AdminUnitLayout>} />
          <Route path="/adminunit/graduation" element={<AdminUnitLayout><GraduationPage /></AdminUnitLayout>} />
          <Route path="/adminunit/form" element={<AdminUnitLayout><RegistrationListPage /></AdminUnitLayout>} />
          <Route path="/adminunit" element={<AdminUnitLayout><AdminOverviewPage /></AdminUnitLayout>} />
          <Route path="/adminunit/ppt" element={<AdminUnitLayout><EventPresentationUI /></AdminUnitLayout>} />

          {/* Admin */}
          <Route path="/admin" element={<AdminLayout><AdminDashboardPage /></AdminLayout>} />
          <Route path="/admin/acc" element={<AdminLayout><AdminUnitAccountPage /></AdminLayout>} />
          <Route path="/admin/unit" element={<AdminLayout><TrainingUnitPage /></AdminLayout>} />
          <Route path="/admin/event-summary" element={<AdminLayout><EventStatisticsPage /></AdminLayout>} />
          <Route path="/admin/locations" element={<AdminLayout><LocationListPage /></AdminLayout>} />
        </Route>
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
}

export default App;
