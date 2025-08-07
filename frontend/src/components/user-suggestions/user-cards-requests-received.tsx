import { Button } from "@/components/ui/button";

export function UserCardStatsRequestReceived({
  user,
  mutualCount,
  action1,
  onActionClick1,
  action2,
  onActionClick2,
}: {
  user: { id: string; firstName: string; lastName: string; avatar?: string };
  mutualCount: number | null;
  action1: string;
  onActionClick1: () => void;
  action2: string;
  onActionClick2: () => void;
}) {
  return (
    <div className="border rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <img
          src={user.avatar || "/default-avatar.png"}
          alt="Avatar"
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <p className="font-medium">
            {user.firstName} {user.lastName}
          </p>
        </div>
        {mutualCount !== null && (
          <p className="text-base font-semibold bg-green-400 p-2 rounded-lg text-white">
            {mutualCount} mutual connection{mutualCount !== 1 ? "s" : ""}
          </p>
        )}
      </div>
      <div className="flex">
        <Button
          variant="destructive"
          className="bg-green-500 mx-2 hover:bg-green-600"
          onClick={onActionClick1}
        >
          {action1}
        </Button>
        <Button variant="destructive" onClick={onActionClick2}>
          {action2}
        </Button>
      </div>
    </div>
  );
}
