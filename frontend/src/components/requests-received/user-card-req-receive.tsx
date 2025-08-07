import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function UserCardRequestReceived({
  request,
  sender,
  action1,
  action2,
  onActionClick1,
  onActionClick2,
}: {
  request: { id: string; status: string };
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  action1: string;
  action2: string;
  onActionClick1: () => void;
  onActionClick2: () => void;
}) {
  return (
    <Card className="w-full max-w-md shadow-sm rounded-2xl border border-gray-200">
      <CardHeader className="flex flex-row items-center space-x-4">
        <Avatar>
          <AvatarImage src={sender.avatar} alt="Avatar from shadcn" />
          <AvatarFallback>
            {sender.firstName[0]}
            {sender.lastName[0]}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col justify-center">
          <CardTitle className="text-base font-semibold">
            {sender.firstName}
          </CardTitle>
          <p className="text-sm text-muted-foreground capitalize">
            Request {request.status.toLowerCase()}
          </p>
        </div>
      </CardHeader>

      <CardContent className="pt-0 flex justify-end">
        <Button variant="destructive" onClick={onActionClick1} className="m-2">
          {action1}
        </Button>
        <Button
          variant="secondary"
          onClick={onActionClick2}
          className="m-2 bg-green-600 hover:bg-green-700 text-white"
        >
          {action2}
        </Button>
      </CardContent>
    </Card>
  );
}
