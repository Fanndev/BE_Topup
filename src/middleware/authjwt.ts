// src/middleware/authjwt.ts
import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { _JWTSECRET } from "../secret";
import { PrismaClient, User } from "@prisma/client";

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: User;
}

export const JWTMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  let token = req.headers.authorization;

  if (!token) {
    return res.status(403).send({
      message: "No token provided!",
    });
  }

  try {
    const decoded = jwt.verify(token, _JWTSECRET) as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(401).send({
        message: "Unauthorized!",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    return res.status(403).json({
      message: "Incorrect credential",
    });
  }
};
