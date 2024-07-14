import { JwtHeader, JwtPayload, jwtDecode } from 'jwt-decode';

export const decodeJwt = (
  token: string,
): { header: JwtHeader; payload: JwtPayload } => {
  const header = jwtDecode(token, { header: true });
  const payload = jwtDecode(token);
  return { header, payload };
};
