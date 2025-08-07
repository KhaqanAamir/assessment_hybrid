"use client";

import { useEffect, useState } from "react";
import { UserCardRequestReceived } from "./user-card-req-receive";
import axios from "axios";
import { toast } from "sonner";
import { Spinner } from "../ui/shadcn-io/spinner";

export function ReceivedRequests() {
  const [receiveRequests, setReceiveRequests] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false); // this state is to show spinner

  useEffect(() => {
    const fetchReceiveRequests = async () => {
      try {
        const res = await fetch(
          "http://localhost:3005/connection-requests/received",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const data = await res.json();
        setReceiveRequests(data.data || []);
        setIsDataLoaded(true);
      } catch (error) {
        console.error("Failed to fetch sent requests:", error);
      }
    };

    fetchReceiveRequests();
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

  const handleAcceptRequest = async (id: string) => {
    const res = await axios.put(
      `http://localhost:3005/connection-requests/${id}/accept`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (!res.data.data) {
      toast("Unable to Accept the connection request");
      return;
    }

    toast("Request Accepted Successfully");
  };

  return (
    <div className="space-y-2">
      {isDataLoaded ? (
        <>
          {receiveRequests.length > 0 ? (
            receiveRequests.map((request: any) => (
              <UserCardRequestReceived
                key={request.id}
                request={request}
                sender={request.sender}
                action1="WithDraw"
                action2="Accept"
                onActionClick1={() => handleWithDrawRequest(request.id)}
                onActionClick2={() => handleAcceptRequest(request.id)}
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
