import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "./ui/sidebar";
import {
  IconLayoutDashboard,
  IconChartBar,
  IconWallet,
  IconSettings,
  IconLogout,
  IconUserPlus,
  IconLogin,
  IconMoon,
  IconSun
} from "@tabler/icons-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from '../context/themeContext';
import { useAuth } from '../context/AuthContext';


export function AppSidebar() {
  const [open, setOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { isAuthenticated ,logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      logout(); 
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const authenticatedLinks = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <IconLayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    },
    {
      label: "Analytics",
      href: "/analytics",
      icon: <IconChartBar className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    },
    {
      label: "Portfolio",
      href: "/portfolio",
      icon: <IconWallet className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    },
    {
      label: "Settings",
      href: "/settings",
      icon: <IconSettings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    },
    {
      label: "Logout",
      href: "#",
      icon: <IconLogout className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
      onClick: handleLogout
    }
  ];

  const unauthenticatedLinks = [
    {
      label: "Login",
      href: "/login",
      icon: <IconLogin className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    },
    {
      label: "Signup",
      href: "/signup",
      icon: <IconUserPlus className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    }
  ];

  const navigationLinks = isAuthenticated ? authenticatedLinks : unauthenticatedLinks;
  return (
    <aside className="h-screen">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="flex flex-col justify-between h-full">
          <div className="flex flex-col flex-1">
            {open ? <Logo /> : <LogoIcon />}
            <nav className="mt-8 flex flex-col gap-2">
              {navigationLinks.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </nav>
          </div>
          <div className="mt-auto flex flex-col gap-2">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isDark ? (
                <IconSun className="text-neutral-700 dark:text-neutral-200 h-5 w-5" />
              ) : (
                <IconMoon className="text-neutral-700 dark:text-neutral-200 h-5 w-5" />
              )}
              {open && (
                <span className="text-sm text-neutral-700 dark:text-neutral-200">
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </span>
              )}
            </button>
            {isAuthenticated && (
              <SidebarLink
                link={{
                  label: "User Profile",
                  href: "/profile",
                  icon: (
                    <img
                      src="/profile-avatar.png"
                      className="h-7 w-7 flex-shrink-0 rounded-full"
                      alt="Profile"
                    />
                  ),
                }}
              />
            )}
          </div>
        </SidebarBody>
      </Sidebar>
    </aside>
  );
}

const Logo = () => (
  <Link
    to="/"
    className="flex items-center space-x-2 text-sm font-medium text-black dark:text-white py-1"
  >
    <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm" />
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="whitespace-pre"
    >
      FinTech AI
    </motion.span>
  </Link>
);

const LogoIcon = () => (
  <Link
    to="/"
    className="flex items-center text-sm py-1"
  >
    <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm" />
  </Link>
);