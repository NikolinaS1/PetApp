export interface AppNotification {
  userId: string;
  profileImageUrl: string;
  firstName: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  postId?: string;
  commentId?: string;
}
