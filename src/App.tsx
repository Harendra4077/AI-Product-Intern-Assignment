import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from './components/ui/Toast';

// Layouts
import { ClientLayout } from './components/layout/ClientLayout';
import { AdminLayout } from './components/layout/AdminLayout';

// Pages – Client
import { RootPage } from './pages/RootPage';
import { ClientHomePage } from './pages/client/ClientHomePage';
import { BookingPage } from './pages/client/BookingPage';
import { AppointmentsPage } from './pages/client/AppointmentsPage';
import { AppointmentDetailPage } from './pages/client/AppointmentDetailPage';
import { ProfilePage } from './pages/client/ProfilePage';

// Pages – Admin
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminAppointmentsPage } from './pages/admin/AdminAppointmentsPage';
import { AdminCalendarPage } from './pages/admin/AdminCalendarPage';
import { AdminClientsPage } from './pages/admin/AdminClientsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 10_000,
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Root redirect */}
            <Route path="/" element={<RootPage />} />

            {/* Client application */}
            <Route path="/client" element={<ClientLayout />}>
              <Route index element={<ClientHomePage />} />
              <Route path="book" element={<BookingPage />} />
              <Route path="appointments" element={<AppointmentsPage />} />
              <Route path="appointments/:id" element={<AppointmentDetailPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* Nutritionist dashboard */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="appointments" element={<AdminAppointmentsPage />} />
              <Route path="calendar" element={<AdminCalendarPage />} />
              <Route path="clients" element={<AdminClientsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>

            {/* 404 – redirect to client */}
            <Route path="*" element={<Navigate to="/client" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}
