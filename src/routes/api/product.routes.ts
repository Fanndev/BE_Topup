// routes/api/auth.routes.ts
import { Express, Router } from "express";
import {
  createProduct,
  listProduct,
  deleteProduct,
  getProductById,
  updateProduct,
} from "../../controller/product.controller";
import { JWTMiddleware } from "../../middleware/authjwt";
import { adminMiddleware } from "../../middleware/admin";

const productRoutes: Router = Router();

// product
productRoutes.get("/products", listProduct);
productRoutes.get("/product/:id", getProductById);
productRoutes.post("/product", [JWTMiddleware, adminMiddleware], createProduct);
productRoutes.put("/product/:id", [JWTMiddleware, adminMiddleware], updateProduct);
productRoutes.delete("/product/:id", [JWTMiddleware, adminMiddleware], deleteProduct);

export default productRoutes;
