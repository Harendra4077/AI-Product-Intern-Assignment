import { Navigate } from 'react-router-dom';

export function RootPage() {
  return <Navigate to="/client" replace />;
}
