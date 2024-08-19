import { IComment } from '../../comments-dialog/models/comments.model';

// Define a new type for Like
export interface ILike {
  userId: string;
  timestamp: Date;
}

// Update IPost model to use ILike
export interface IPost {
  postId: string;
  userId: string;
  text: string;
  imageUrl?: string;
  createdAt: Date;
  firstName: string;
  lastName: string;
  profileImageUrl: string;
  likes: ILike[]; // Updated type
  petNames: string[];
  commentCount?: number;
  comments?: IComment[];
}
