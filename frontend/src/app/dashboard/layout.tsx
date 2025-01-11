"use client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ReactNode } from "react";
import FullWidthWrapper from "../components/FullWidthWrapper";
import Navbar from "../components/Navbar";
import AppSidebar from "../components/Sidebar";

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  // const { appData } = useContext(AppContext);
  // if (appData.isLoading) {
  //   return <div>Loading...</div>;
  // }
  // if (!appData.isLoading && !appData.user) {
  //   return redirect("/login");
  // }
  return (
    <div>
      <SidebarProvider>
        <AppSidebar />
        <div className="w-full">
          <Navbar />
          <FullWidthWrapper>{children}</FullWidthWrapper>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default DashboardLayout;
