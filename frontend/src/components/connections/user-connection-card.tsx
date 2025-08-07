import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function UserCardConnection({
  user,
}: {
  connection: { id: string; createdAt: string };
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}) {
  console.log(user);
  return (
    <Card className="w-full max-w-md shadow-sm rounded-2xl border border-gray-200">
      <CardHeader className="flex flex-row items-center space-x-4">
        <Avatar>
          <AvatarImage src={user.avatar} alt="Avatar from shadcn" />
          <AvatarFallback>
            {user.firstName[0]}
            {user.lastName[0]}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col justify-center">
          <CardTitle className="text-base font-semibold">
            {user.firstName}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="pt-0 flex justify-between">
        <h1 className="font-bold text-xl">Connected</h1>
      </CardContent>
    </Card>
  );
}
