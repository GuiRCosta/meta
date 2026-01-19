import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content area */}
      <div className="pl-64">
        {/* Header */}
        <Header />
        
        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
