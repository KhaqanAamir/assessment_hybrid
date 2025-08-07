import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Spinner } from "../ui/shadcn-io/spinner";
import { UserCardStatsRequestSent } from "../user-suggestions/user-card-stats-requests-sent";

const Users = () => {
  const [allUsersStats, setAllUsersStats] = useState<any>([]);
  const [isStatsDataFetched, setIsStatsDataFetched] = useState(false);

  useEffect(() => {
    const fetchAllUsers = async () => {
      const response = await axios.get("http://localhost:3005/users/stats", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setAllUsersStats(response.data.data);
      setIsStatsDataFetched(true);
    };

    fetchAllUsers();
  }, []);

  const handleWithDrawRequest = (reqId: string) => {};

  return (
    <div className="">
      {isStatsDataFetched ? (
        <>
          {allUsersStats.sentRequests &&
          allUsersStats.sentRequests.length > 0 ? (
            allUsersStats.sentRequests.map((user: any) => (
              <UserCardStatsRequestSent
                key={user.id}
                user={user}
                action1="Withdraw Request"
                onActionClick1={() => handleWithDrawRequest(user.id)}
              />
            ))
          ) : (
            <h1>No Sent Requests found</h1>
          )}

          <div className="flex flex-col items-center">
            {/* {allUsersStats.length > 0 ? (
              allUsersStats.map((request: any) => (
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
            )} */}
          </div>
        </>
      ) : (
        <div className="flex justify-center items-center h-screen">
          <Spinner />
        </div>
      )}
    </div>
  );
};

export default Users;
