import { clerkMiddleware, getAuth } from "@clerk/express";
import { Request, Response, NextFunction } from "express";

export const requireAuth = clerkMiddleware();

export const protect = (req: Request, res: Response, next: NextFunction) => {
  const auth = getAuth(req);

  if (!auth.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  next();
};

