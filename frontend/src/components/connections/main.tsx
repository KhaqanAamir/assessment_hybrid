"use client";

import { useEffect, useState } from "react";
import { UserCardConnection } from "./user-connection-card";
import axios from "axios";
import { Spinner } from "../ui/shadcn-io/spinner";
import { getCookie } from "cookies-next";

export function Connections() {
  const [connections, setConnections] = useState([]);

  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    const fetchReceiveRequests = async () => {
      try {
        const token = getCookie("token");
        const res = await axios.get("http://localhost:3005/connections", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        setConnections(res.data.data);
        setIsDataLoaded(true);
      } catch (error) {
        console.error("Failed to fetch sent requests:", error);
      }
    };

    fetchReceiveRequests();
  }, []);

  return (
    <div className="space-y-2">
      {isDataLoaded ? (
        <>
          {connections.length > 0 ? (
            connections.map((connection: any) => (
              <UserCardConnection
                key={connection.id}
                connection={connection}
                user={connection.user}
              />
            ))
          ) : (
            <div className="flex justify-center">
              <h1 className="text-4xl">No Connections to show</h1>
            </div>
          )}
        </>
      ) : (
        <div className="flex justify-center items-center h-screen">
          <Spinner />
        </div>
      )}
    </div>
  );
}
