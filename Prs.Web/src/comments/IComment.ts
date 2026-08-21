import { IUser } from "../users/IUser";

export interface IComment {
  id?: number;
  body: string;
  requestId: number;
  userId: number;
  createdAt?: string;
  user?: IUser;
}
