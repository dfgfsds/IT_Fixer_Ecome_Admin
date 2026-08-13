import { Outlet } from 'react-router-dom';
import StoreNav from '../../components/store/StoreNav';

export default function StoreLayout() {
  return (
    <div className="flex flex-col md:flex-row h-full w-full overflow-hidden bg-gray-50">
      {/* Fixed Left Sidebar Navigation & Mobile Top Header */}
      <StoreNav />

      {/* Independent Scrollable Right Main Content Area */}
      <main className="flex-1 w-full min-w-0 h-full overflow-y-auto p-4 sm:p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}