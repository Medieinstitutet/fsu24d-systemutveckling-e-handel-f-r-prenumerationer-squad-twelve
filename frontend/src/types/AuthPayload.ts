export interface AuthPayload {
  id: number;
  name: string;
  email: string;
  level: string;
  role: string;
  subscription_status: string;
  exp?: number;
  iat?: number;
}
/* 
  iat = issued at 
  exp = expiration
*/
