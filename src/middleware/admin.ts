// src/middleware/adminMiddleware.ts
import { Request, Response, NextFunction } from "express";
import { ResponseMessage, StatusCode } from "../helpers/statusCode";
import { User } from "@prisma/client";

interface AuthenticatedRequest extends Request {
  user?: User;
}

export const adminMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  if (!user || user.role !== "ADMIN") {
    return res.status(StatusCode.UNAUTHORIZED).json({
      message: ResponseMessage.Unauthorized,
    });
  }

  next();
};
