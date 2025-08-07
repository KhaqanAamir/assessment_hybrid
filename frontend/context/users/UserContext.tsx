"use client";

import { createContext } from "react";

interface UserContextInterface {
  user: string;
  setUser: (user: string) => void;
  fetchAllUsers: () => void;
  allUsersStats: any;
  isStatsDataFetched: boolean;
}

export const UserContext = createContext<UserContextInterface | null>(null);
