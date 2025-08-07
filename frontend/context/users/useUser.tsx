import { useContext } from "react";
import { UserContext } from "./UserContext";

export const useUserContext = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("Unable to load the user context");
  }

  return context;
};
