// routes/index.ts
import { Router } from "express";
import authRoutes from "./api/auth.routes";
import productRoutes from "./api/product.routes";
import userRoutes from "./api/user.routes";
import cartRoutes from "./api/cart.routes";

const rootRoutes: Router = Router();

rootRoutes.use('/auth', authRoutes);
rootRoutes.use('/marketplace', productRoutes);
rootRoutes.use('/user', userRoutes);
rootRoutes.use('/user', cartRoutes);

export default rootRoutes