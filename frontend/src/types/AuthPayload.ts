export interface AuthPayload {
  id: number;
  name: string;
  email: string;
  level: string;
  exp?: number;
  iat?: number;
}
/* iat = issued at 
  exp = expiration
*/