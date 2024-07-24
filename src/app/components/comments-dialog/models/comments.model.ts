export interface IComment {
  id?: string;
  userId: string;
  text: string;
  createdAt: Date;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  commentId: string;
}
