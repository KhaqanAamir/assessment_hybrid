"use client";

import { useEffect, useState } from "react";
import { UserCardRequestSent } from "./user-card-req-sent";
import { toast } from "sonner";
import axios from "axios";
import { Spinner } from "../ui/shadcn-io/spinner";

export function SentRequests() {
  const [sentRequests, setSentRequests] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false); // this state is to show spinner

  useEffect(() => {
    const fetchSentRequests = async () => {
      try {
        const res = await fetch(
          "http://localhost:3005/connection-requests/sent",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const data = await res.json();
        setSentRequests(data.data || []);
        setIsDataLoaded(true);
      } catch (error) {
        console.error("Failed to fetch sent requests:", error);
      }
    };

    fetchSentRequests();
  }, []);

  const handleWithDrawRequest = async (id: string) => {
    const res = await axios.delete(
      `http://localhost:3005/connection-requests/${id}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (!res.data.data) {
      toast("Unable to Delete the connection request");
      return;
    }

    toast("Request Deleted Successfully");
  };

  return (
    <div className="space-y-2">
      {isDataLoaded ? (
        <>
          {sentRequests.length > 0 ? (
            sentRequests.map((request: any) => (
              <UserCardRequestSent
                key={request.id}
                request={request}
                receiver={request.receiver}
                action="With Draw Request"
                onActionClick={() => handleWithDrawRequest(request.id)}
              />
            ))
          ) : (
            <div className="flex justify-center">
              <h1 className="text-4xl">No Requests to show</h1>
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
