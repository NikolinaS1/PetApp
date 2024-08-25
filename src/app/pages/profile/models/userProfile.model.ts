export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl?: string;
  followers?: Array<{ userId: string; followedAt: Date }>;
  following?: Array<{ userId: string; followedAt: Date }>;
  role?: string;
}
