import { useContext } from "react";
import { ConnectionsRequestContext } from "./ConnectionsRequestContext";

export const useConnectionRequest = () => {
  const context = useContext(ConnectionsRequestContext);

  if (!context) {
    throw new Error("Unable to load the user context");
  }

  return context;
};
