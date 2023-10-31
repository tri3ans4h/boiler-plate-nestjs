export interface IUsersProfileProps {
  id?: number;
  user_id: number;
  email: string;
  firstName: string;
  lastName: string;
  photo: string;
  birthDate: Date;
  address: string;
  phone: string;
  created_at: Date;
  updated_at: Date;
}
