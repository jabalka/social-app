// components/UserDetailsDialog.tsx

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

interface UserDetailsDialogProps {
  userId: string | null;
  open: boolean;
  onClose: () => void;
  onMessageClick: () => void;
}

const UserDetailsDialog: React.FC<UserDetailsDialogProps> = ({ userId, open, onClose, onMessageClick }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId && open) {
      setLoading(true);
      fetch(`/api/user/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          setUser(data);
          setLoading(false);
        });
    }
  }, [userId, open]);

  if (!userId) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>
        {loading ? (
          <p>Loading...</p>
        ) : user ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              {user.image ? (
                <Image
                  src={user.image}
                  alt="Profile Picture"
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-gray-400" />
              )}
              <div>
                <p className="text-lg font-semibold">{user.name || user.email || "Unknown User"}</p>
              </div>
            </div>
            <ul className="space-y-2">
              <li>
                <Link href={`/user/${user.id}/projects`} className="text-blue-600 hover:underline">
                  View Projects
                </Link>
              </li>
              <li>
                {/* <Link href={`/user/${user.id}/comments/received`} className="text-blue-600 hover:underline">
                  Comments Received
                </Link>
              </li>
              <li>
                <Link href={`/user/${user.id}/comments/left`} className="text-blue-600 hover:underline">
                  Comments Left
                </Link> */}
              </li>
            </ul>
            <button
         onClick={onMessageClick}
              className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Message
            </button>
          </div>
        ) : (
          <p>User not found.</p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsDialog;
