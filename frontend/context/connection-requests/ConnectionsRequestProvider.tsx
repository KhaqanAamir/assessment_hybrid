"use client";

import { useState } from "react";
import { ConnectionsRequestContext } from "./ConnectionsRequestContext";
import axios from "axios";
import { toast } from "sonner";
import { useUserContext } from "../users/useUser";
import { getCookie } from "cookies-next";

export const ConnectionsRequestProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { fetchAllUsers } = useUserContext();
  const [isActionPressed, setIsActionPressed] = useState(false);

  const handleWithDrawRequest = async (reqId: string) => {
    setIsActionPressed(true);
    try {
      const token = getCookie("token");
      const res = await axios.delete(
        `http://localhost:3005/connection-requests/${reqId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.data.data) {
        toast("Unable to Delete the connection request");
        return;
      }

      toast("Request Deleted Successfully");
      fetchAllUsers();
    } catch (error) {
      toast("Something went wrong");
    } finally {
      setIsActionPressed(false);
    }
  };

  const handleConnect = async (userId: string) => {
    setIsActionPressed(true);
    try {
      const token = getCookie("token");
      const response = await axios.post(
        "http://localhost:3005/connection-requests",
        { receiver_id: userId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        toast("Connection request sent successfully");
        fetchAllUsers();
      } else {
        toast("Error sending connection request");
      }
    } catch (error) {
      toast("Something went wrong");
    } finally {
      setIsActionPressed(false);
    }
  };

  const handleAcceptRequest = async (reqId: string) => {
    setIsActionPressed(true);
    try {
      const token = getCookie("token");
      const res = await axios.put(
        `http://localhost:3005/connection-requests/${reqId}/accept`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.data.data) {
        toast("Unable to Accept the connection request");
        return;
      }
      toast("Request Accepted Successfully");
      fetchAllUsers();
    } catch (error) {
      toast("Something went wrong");
    } finally {
      setIsActionPressed(false);
    }
  };

  return (
    <ConnectionsRequestContext.Provider
      value={{
        isActionPressed,
        handleWithDrawRequest,
        handleConnect,
        handleAcceptRequest,
      }}
    >
      {children}
    </ConnectionsRequestContext.Provider>
  );
};
