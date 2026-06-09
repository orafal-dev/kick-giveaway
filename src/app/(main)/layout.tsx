import type { ReactNode } from "react";
import { AuthSessionProvider } from "@/components/AuthSessionProvider";
import { AppShell } from "@/components/layout/AppShell";
import { ToastProvider } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { VersionProvider } from "@/components/VersionProvider";
import { getVersion } from "@/lib/version";

type MainLayoutProps = {
  children: ReactNode;
};

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <AuthSessionProvider>
      <TooltipProvider>
        <ToastProvider>
          <VersionProvider initialVersion={getVersion(process.env)}>
            <AppShell>{children}</AppShell>
          </VersionProvider>
        </ToastProvider>
      </TooltipProvider>
    </AuthSessionProvider>
  );
};

export default MainLayout;
