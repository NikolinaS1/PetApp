export interface IPost {
  id: string;
  text?: string;
  imageUrl?: string;
  createdAt?: Date;
  userId?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  likes?: string[];
}
