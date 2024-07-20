export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl?: string;
  following?: string[];
  followers?: string[];
}
