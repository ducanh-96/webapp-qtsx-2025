import { ReportsPageContent } from './ReportsPageContent';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function ReportsPage() {
  return (
    <ProtectedRoute>
      <ReportsPageContent />
    </ProtectedRoute>
  );
}
