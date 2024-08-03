// routes/api/auth.routes.ts
import { Express, Router } from "express";
import { JWTMiddleware } from "../../middleware/authjwt";
import {
  GetCart,
  addToCart,
  deleteCart,
  updateCart
} from "../../controller/cart.controller";

const cartRoutes: Router = Router();

// Address
cartRoutes.get("/carts", [JWTMiddleware], GetCart);
cartRoutes.post("/cart", [JWTMiddleware], addToCart);
cartRoutes.put("/cart/:id", [JWTMiddleware], updateCart);
cartRoutes.delete("/cart/:id", [JWTMiddleware], deleteCart);

export default cartRoutes;