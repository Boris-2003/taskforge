// 扩展 Express 的 Request 类型，挂载经过认证的用户信息

declare namespace Express {
  interface Request {
    user?: {
      id: string;
      email: string;
    };
  }
}
