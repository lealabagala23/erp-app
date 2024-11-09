export type UserInfo = {
    first_name: string;
    last_name: string;
    user_name: string;
  };

export interface IAuthContext {
  userInfo: UserInfo | null;
  fetchingUserInfo: boolean;
}