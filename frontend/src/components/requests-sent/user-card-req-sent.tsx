import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function UserCardRequestSent({
  request,
  receiver,
  action,
  onActionClick,
}: {
  request: { id: string; status: string };
  receiver: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  action: string;
  onActionClick: () => void;
}) {
  return (
    <Card className="w-full max-w-md shadow-sm rounded-2xl border border-gray-200">
      <CardHeader className="flex flex-row items-center space-x-4">
        <Avatar>
          <AvatarImage src={receiver.avatar} alt="Avatar from shadcn" />
          <AvatarFallback>
            {receiver.firstName[0]}
            {receiver.lastName[0]}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col justify-center">
          <CardTitle className="text-base font-semibold">
            {receiver.firstName}
          </CardTitle>
          <p className="text-sm text-muted-foreground capitalize">
            Request {request.status.toLowerCase()}
          </p>
        </div>
      </CardHeader>

      <CardContent className="pt-0 flex justify-end">
        <Button variant="destructive" onClick={onActionClick}>
          {action}
        </Button>
      </CardContent>
    </Card>
  );
}
