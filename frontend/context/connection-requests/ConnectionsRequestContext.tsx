import { createContext } from "react";

export interface ConnectionsRequestInterface {
  isActionPressed: boolean;
  handleWithDrawRequest: (a: string) => void;
  handleConnect: (a: string) => void;
  handleAcceptRequest: (a: string) => void;
}

export const ConnectionsRequestContext =
  createContext<ConnectionsRequestInterface | null>(null);
