"use client";

import { useState } from "react";
import { UserContext } from "./UserContext";
import axios from "axios";
import { getCookie } from "cookies-next";

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState("khaqanag");

  const [allUsersStats, setAllUsersStats] = useState<any>([]);
  const [isStatsDataFetched, setIsStatsDataFetched] = useState(false);

  const fetchAllUsers = async () => {
    const token = getCookie("token");
    const response = await axios.get("http://localhost:3005/users/stats", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    setAllUsersStats(response.data.data);
    setIsStatsDataFetched(true);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        fetchAllUsers,
        allUsersStats,
        isStatsDataFetched,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
