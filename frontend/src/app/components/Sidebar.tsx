import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  AvatarIcon,
  QuestionMarkCircledIcon,
  QuestionMarkIcon,
} from "@radix-ui/react-icons";
import { Home, Icon } from "lucide-react";
import Link from "next/link";
export default function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="px-4 pt-4 text-xl font-semibold">
        Smart Attendance
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>General</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/dashboard">
                  {" "}
                  <Home /> Dashboard
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/students">
                  {" "}
                  <QuestionMarkCircledIcon /> Students
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/attendance">
                  {" "}
                  <AvatarIcon /> Attendance
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
