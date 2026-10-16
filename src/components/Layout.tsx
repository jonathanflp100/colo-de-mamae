import React, { useState } from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { WarningSignsModal } from './WarningSignsModal';
import { PWAInstallBanner } from './PWAInstallBanner';
import { useAuth } from '../hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
  withNav?: boolean;
  withHeader?: boolean;
  title?: string;
  subtitle?: string;
  showPwaBanner?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  withNav = true,
  withHeader = true,
  title,
  subtitle,
  showPwaBanner = true,
}) => {
  const { profile } = useAuth();
  const [warningSignsOpen, setWarningSignsOpen] = useState(false);

  const defaultTab = profile?.phase === 'mae' ? 'bebe' : 'gestante';

  return (
    <div className="min-h-screen bg-[#F0E6E1] dark:bg-[#0F0C0B] flex justify-center selection:bg-[#F3D6CB] selection:text-[#8C4A3C]">
      {/* Mobile-first frame */}
      <div className="w-full max-w-md min-h-screen bg-[#FBF3EF] dark:bg-[#1A1514] flex flex-col relative shadow-2xl border-x border-[#F3D6CB]/30 dark:border-[#2C2321]">
        {withHeader && (
          <Header
            title={title}
            subtitle={subtitle}
            onOpenWarningSigns={() => setWarningSignsOpen(true)}
          />
        )}

        {showPwaBanner && <PWAInstallBanner />}

        <main className={`flex-1 flex flex-col ${withNav ? 'pb-20' : ''}`}>
          {children}
        </main>

        {withNav && <BottomNav />}

        <WarningSignsModal
          isOpen={warningSignsOpen}
          onClose={() => setWarningSignsOpen(false)}
          defaultTab={defaultTab}
        />
      </div>
    </div>
  );
};
