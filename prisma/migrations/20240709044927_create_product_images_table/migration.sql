/*
  Warnings:

  - Added the required column `image` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stock` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fcm_token` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `no_telp` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `photo` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uid` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "products" ADD COLUMN     "image" TEXT NOT NULL,
ADD COLUMN     "stock" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "fcm_token" TEXT NOT NULL,
ADD COLUMN     "no_telp" TEXT NOT NULL,
ADD COLUMN     "photo" TEXT NOT NULL,
ADD COLUMN     "uid" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "productimages" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "filename" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "productimages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "productimages" ADD CONSTRAINT "productimages_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
