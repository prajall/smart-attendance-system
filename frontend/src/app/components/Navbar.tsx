"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import React, { useEffect, useState } from "react";
import FullWidthWrapper from "./FullWidthWrapper";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const links = {
    dashboard: "Dashboard",
    attendance: "Attendance",
    students: "Students",
    settings: "Settings",
  };

  const pathname = usePathname();
  const [currentPath, setCurrentPath] = useState("");

  useEffect(() => {
    if (pathname) {
      const firstPathSegment = pathname.split("/")[1];
      setCurrentPath(firstPathSegment);
    }
  }, [pathname]);

  return (
    <div className="border-b border-border h-14 flex items-center">
      <div className="md:hidden p-1">
        <SidebarTrigger />
      </div>
      <FullWidthWrapper className="flex items-center justify-between pt-0 pl-0 md:pl-4">
        <div>
          <h1 className="text-xl font-semibold ">
            {links[currentPath as keyof typeof links] || "Dashboard"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="details text-right">
            <p className="text-sm font-medium">Satya Bahadur</p>
            <p className="text-xs text-muted-foreground">Teacher</p>
          </div>
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
      </FullWidthWrapper>
    </div>
  );
};

export default Navbar;
