export interface User {
  _id: string;
  firstname: string;
  surname: string;
  email: string;
  username: string;
}

export interface Message {
  sender: string;
  receiver: string;
  message: string;
  timestamp: Date;
}

export interface LoaderData {
  user: User;
  friends: User[];
}
export interface FriendRequest {
  _id: string;
  requester: User;
  recipient: User;
  status: "pending" | "accepted" | "declined";
  createdAt: Date;
}
