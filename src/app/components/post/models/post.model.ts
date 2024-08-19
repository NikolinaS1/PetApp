import { IComment } from '../../comments-dialog/models/comments.model';

export interface ILike {
  userId: string;
  timestamp: Date;
}

export interface IPost {
  postId: string;
  userId: string;
  text: string;
  imageUrl?: string;
  createdAt: Date;
  firstName: string;
  lastName: string;
  profileImageUrl: string;
  likes: ILike[];
  petNames: string[];
  commentCount?: number;
  comments?: IComment[];
}
