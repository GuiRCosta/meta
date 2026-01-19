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
      {/* Sidebar - Fixed */}
      <Sidebar />
      
      {/* Main content area - Offset by sidebar width (256px = w-64) */}
      <div className="ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <Header />
        
        {/* Page content - Scrollable */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
