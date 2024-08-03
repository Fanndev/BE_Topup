import { Request, Response } from "express";
import { PrismaClient, User } from "@prisma/client";
import { StatusCode, ResponseMessage } from "../helpers/statusCode";

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: User;
}

export const addToCart = async (req: AuthenticatedRequest, res: Response) => {
  const { productId, qty } = req.body;

  try {
    // Pastikan userId tidak undefined
    if (!req.user || !req.user.id) {
      return res.status(StatusCode.UNAUTHORIZED).json({
        message: ResponseMessage.Unauthorized,
      });
    }

    // Cek apakah keranjang sudah ada
    const cart = await prisma.cartItem.findFirst({
      where: {
        productId: productId,
        userId: req.user?.id,
      },
    });

    if (cart) {
      // Jika keranjang sudah ada, perbarui qty-nya
      const newQty = parseInt(cart.qty.toString()) + parseInt(qty.toString());
      const updatedCart = await prisma.cartItem.update({
        where: {
          id: cart.id,
        },
        data: {
          qty: newQty,
        },
      });
      res.status(StatusCode.CREATED).json({
        message: ResponseMessage.Added,
        result: updatedCart,
      });
    } else {
      // Jika keranjang belum ada, buat yang baru
      const newCart = await prisma.cartItem.create({
        data: {
          productId: productId,
          userId: req.user?.id,
          qty: parseInt(qty.toString()),
        },
      });
      res.status(StatusCode.CREATED).json({
        message: ResponseMessage.Added,
        result: newCart,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(StatusCode.BAD_REQUEST).json({
      message: ResponseMessage.FailAdded,
    });
  }

};

export const updateCart = async (
  req: AuthenticatedRequest,
  res: Response
) => {

   const userId = req.user?.id;
   const cartItemId = parseInt(req.params.id, 10);
   const { qty } = req.body;

   if (!userId) {
     return res.status(StatusCode.UNAUTHORIZED).json({
       message: ResponseMessage.Unauthorized,
     });
   }

   if (!cartItemId || !qty) {
     return res.status(StatusCode.BAD_REQUEST).json({
       message: ResponseMessage.NotFound,
     });
   }

   try {
     const cartItem = await prisma.cartItem.findFirst({
       where: {
         userId: userId,
         id: cartItemId,
       },
     });

     if (!cartItem) {
       return res.status(StatusCode.NOT_FOUND).json({
         message: ResponseMessage.NotFound,
       });
     }

     if (qty > 0) {
       const updatedCartItem = await prisma.cartItem.update({
         where: {
           id: cartItem.id,
         },
         data: {
           qty: qty,
         },
       });

       return res.status(StatusCode.OK).json({
         message: ResponseMessage.Updated,
         data: updatedCartItem,
       });
     } else {
       await prisma.cartItem.delete({
         where: {
           id: cartItem.id,
         },
       });

       return res.status(StatusCode.OK).json({
         message: ResponseMessage.Removed,
       });
     }
   } catch (error) {
     console.error("Error updating cart item quantity:", error);
     return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
       message: ResponseMessage.FailRemoved,
       error: error,
     });
   }
};

export const deleteCart = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(StatusCode.UNAUTHORIZED).json({
      message: ResponseMessage.Unauthorized,
    });
  }

 try {
    // Periksa apakah item ada di keranjang dengan userId dan id
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: +req.params.id,
        userId: userId,
      },
    });

    if (!cartItem) {
      return res.status(StatusCode.NOT_FOUND).json({
        message: ResponseMessage.NotFound,
      });
    }

    // Hapus item dari keranjang
    const deletedItem = await prisma.cartItem.delete({
      where: {
        id: cartItem.id,
      },
    });

    res.status(StatusCode.OK).json({
      message: ResponseMessage.Removed,
      result: deletedItem,
    });
  } catch (err) {
    console.error("Error deleting cart item:", err);
    res.status(StatusCode.BAD_REQUEST).json({
      message: ResponseMessage.FailRemoved,
    });
  }
};

export const GetCart = async (req: AuthenticatedRequest, res: Response) => {
 try {
   // Pastikan userId tidak undefined
   if (!req.user || !req.user.id) {
     return res.status(StatusCode.UNAUTHORIZED).json({
       message: ResponseMessage.Unauthorized,
     });
   }

   const listCart = await prisma.cartItem.findMany({
     where: {
       userId: req.user?.id,
     },
     include: {
      product: true
     }
   })
    const cartListFormatted = listCart.map((cart) => {
      const subtotal =
        (Number(cart.qty) || 0) * (Number(cart.product.price) || 0);

      return {
        id: cart.id,
        // image: cart.product.image,
        name: cart.product.name,
        price: cart.product.price,
        qty: cart.qty,
        subtotal: subtotal,
        // stock: cart.product.stock,
        createdAt: cart.createdAt,
      };
    });

    return res.status(StatusCode.OK).json({
      message : ResponseMessage.Loaded,
      data : cartListFormatted
    })
 } catch (error) {
  return res.status(StatusCode.BAD_REQUEST).json({
    message: ResponseMessage.FailLoaded
  })
 }
};
