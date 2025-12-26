import ProjectDashboard from '../components/ProjectDashboard';
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="p-4 bg-white border-b flex justify-between items-center">
        <OrganizationSwitcher hidePersonal />
        <UserButton afterSignOutUrl="/" />
      </nav>

      <main>
        {/* This is where your component lives! */}
        <ProjectDashboard />
      </main>
    </div>
  );
}
