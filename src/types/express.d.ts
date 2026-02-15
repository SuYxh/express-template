export interface TokenPayload {
  userId: number;
  email: string;
  roles: string[];
  permissions: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}
