import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/toast";
import { VersionProvider } from "@/components/VersionProvider";
import { getVersion } from "@/lib/version";

type MainLayoutProps = {
  children: ReactNode;
};

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <ToastProvider>
      <VersionProvider initialVersion={getVersion(process.env)}>
        {children}
      </VersionProvider>
    </ToastProvider>
  );
};

export default MainLayout;
