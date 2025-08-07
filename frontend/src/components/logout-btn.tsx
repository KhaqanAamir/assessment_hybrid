"use client";

import { deleteCookie } from "cookies-next";
import { usePathname, useRouter } from "next/navigation";

export const LogoutButton = () => {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === "/" || pathname === "/register") return null;

  const handleLogout = () => {
    deleteCookie("token");
    router.push("/");
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 absolute top-4 right-4"
    >
      Logout
    </button>
  );
};
