export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl?: string;
  following?: string[];
  followers?: string[];
}
