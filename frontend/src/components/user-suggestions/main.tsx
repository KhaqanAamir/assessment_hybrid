import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Spinner } from "../ui/shadcn-io/spinner";
import { UserCardStatsRequestSent } from "../user-suggestions/user-card-stats-requests-sent";
import { UserCardStatsRequestReceived } from "./user-cards-requests-received";
import { UserCardStatsUnconnected } from "./user-card-stats-unconnected";
import { useRouter } from "next/navigation";
import { deleteCookie } from "cookies-next";
import { useUserContext } from "../../../context/users/useUser";
import { useConnectionRequest } from "../../../context/connection-requests/useConnectionRequest";

const UserSuggestions = () => {
  const router = useRouter();
  const { fetchAllUsers, allUsersStats, isStatsDataFetched } = useUserContext();
  const {
    handleWithDrawRequest,
    isActionPressed,
    handleConnect,
    handleAcceptRequest,
  } = useConnectionRequest();

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const handleLogout = () => {
    deleteCookie("token");
    router.push("/");
  };
  return (
    <div className="">
      {/* <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 absolute top-4 right-4"
      >
        Logout
      </button> */}
      {isActionPressed && (
        <div className="fixed top-0 left-0 w-full h-full z-50 flex justify-center items-center bg-opacity-40 backdrop-blur-sm pointer-events-auto">
          <Spinner className="w-20 h-20" />
        </div>
      )}
      {isStatsDataFetched ? (
        <>
          {allUsersStats.sentRequests &&
          allUsersStats.sentRequests.length > 0 ? (
            allUsersStats.sentRequests.map((request: any) => (
              <UserCardStatsRequestSent
                key={request.id}
                user={request.receiver}
                mutualCount={request.mutualUsers}
                action1="Withdraw Request"
                onActionClick1={() => handleWithDrawRequest(request.id)}
              />
            ))
          ) : (
            <></>
          )}

          {allUsersStats.receivedRequests &&
          allUsersStats.receivedRequests.length > 0 ? (
            allUsersStats.receivedRequests.map((request: any) => (
              <UserCardStatsRequestReceived
                key={request.id}
                user={request.sender}
                mutualCount={request.mutualUsers}
                action1="Accept"
                onActionClick1={() => handleAcceptRequest(request.id)}
                action2="Withdraw Request"
                onActionClick2={() => handleWithDrawRequest(request.id)}
              />
            ))
          ) : (
            <></>
          )}

          {allUsersStats.unconnectedUsers &&
          allUsersStats.unconnectedUsers.length > 0 ? (
            allUsersStats.unconnectedUsers.map((user: any) => (
              <UserCardStatsUnconnected
                key={user.id}
                user={user}
                mutualCount={user.mutualUsers}
                action1="Connect"
                onActionClick1={() => handleConnect(user.id)}
              />
            ))
          ) : (
            <></>
          )}
        </>
      ) : (
        <div className="flex justify-center items-center h-screen">
          <Spinner />
        </div>
      )}
    </div>
  );
};

export default UserSuggestions;
