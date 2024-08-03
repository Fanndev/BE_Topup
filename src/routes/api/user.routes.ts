// routes/api/auth.routes.ts
import { Express, Router } from "express";
import { profile } from "../../controller/auth.controller";
import { JWTMiddleware } from "../../middleware/authjwt";
import {
  addAddress,
  deleteAddress,
  listAddress,
  updateAddress
} from "../../controller/user.controller";

const userRoutes: Router = Router();

// profile
userRoutes.get("/profile", [JWTMiddleware], profile);

// Address
userRoutes.get("/addresses", [JWTMiddleware], listAddress);
userRoutes.post("/address", [JWTMiddleware], addAddress);
userRoutes.put("/address/:id", [JWTMiddleware], updateAddress);
userRoutes.delete("/address/:id", [JWTMiddleware], deleteAddress);

export default userRoutes;