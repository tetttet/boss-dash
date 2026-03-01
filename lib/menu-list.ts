import {
  LayoutDashboard,
  Users,
  Settings,
  Package,
  ShieldCheck,
  FileText,
  LucideIcon,
} from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active?: boolean;
};

type Menu = {
  href: string;
  label: string;
  active?: boolean;
  icon: LucideIcon;
  submenus?: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Contents",
      menus: [
        {
          href: "",
          label: "Users",
          icon: Users,
          submenus: [
            {
              href: "/users",
              label: "All Users",
            },
            {
              href: "/orders",
              label: "Orders",
            }
          ],
        },
        {
          href: "",
          label: "Products",
          icon: Package,
          submenus: [
            {
              href: "/products",
              label: "Product List",
            },
            {
              href: "/products/create",
              label: "Create Product",
            },
          ],
        },
        {
          href: "",
          label: "Settings",
          icon: Settings,
          submenus: [
            {
              href: "/settings",
              label: "Settings",
            },
            {
              href: "/account",
              label: "Account",
            },
          ],
        },
      ],
    },
    {
      groupLabel: "Default",
      menus: [
        {
          href: "/privacy-policy",
          label: "Privacy Policy",
          icon: ShieldCheck,
        },
        {
          href: "/terms-of-service",
          label: "Terms of Service",
          icon: FileText,
        },
      ],
    },
  ];
}
