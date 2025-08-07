"use client";

import { Connections } from "@/components/connections/main";
import { ReceivedRequests } from "@/components/requests-received/main";
import { SentRequests } from "@/components/requests-sent/main";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserSuggestions from "@/components/user-suggestions/main";
import Users from "@/components/users/main";
import { ConnectionsRequestProvider } from "../../../context/connection-requests/ConnectionsRequestProvider";

export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Social Connections Challenge</h1>

      <Tabs defaultValue="suggestions" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions">
          <ConnectionsRequestProvider>
            <UserSuggestions />
          </ConnectionsRequestProvider>
        </TabsContent>

        <TabsContent value="connections">
          <Connections />
        </TabsContent>
      </Tabs>
    </div>
  );
}
