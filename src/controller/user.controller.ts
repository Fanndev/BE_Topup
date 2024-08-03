import { Request, Response } from "express";
import { PrismaClient, User } from "@prisma/client";
import { StatusCode, ResponseMessage } from "../helpers/statusCode";
import { AddressSchema } from "../schema/users";

const prisma = new PrismaClient()

interface AuthenticatedRequest extends Request {
  user?: User
}

export const addAddress = async (req: AuthenticatedRequest, res: Response) => {
  // Pastikan pengguna sudah login dan ada userId di req.user
  if (!req.user || !req.user.id) {
    return res.status(StatusCode.UNAUTHORIZED).json({
      message: ResponseMessage.Unauthorized,
    });
  }

  // Validasi input menggunakan AddressSchema
  try {
    AddressSchema.parse(req.body);
  } catch (error) {
    return res.status(StatusCode.BAD_REQUEST).json({
      message: ResponseMessage.Notrequired,
      error: error, // Mengirimkan pesan kesalahan validasi
    });
  }

  const userId = req.user.id;

  try {
    // Cek apakah pengguna sudah memiliki alamat
    const existingAddress = await prisma.address.findFirst({
      where: {
        userId: userId,
      },
    });

    if (existingAddress) {
      return res.status(StatusCode.BAD_REQUEST).json({
        message: "You have active address",
      });
    }
    // Tambahkan alamat baru ke pengguna
    const address = await prisma.address.create({
      data: {
        ...req.body,
        userId: userId,
      },
    });

    return res.status(StatusCode.CREATED).json({
      message: ResponseMessage.Added,
      data: address, // Mengirimkan detail alamat yang baru dibuat
    });
  } catch (error) {
    console.error("Error adding address:", error);
    // Jika kesalahan fatal kirim message gagal
    return res.status(StatusCode.BAD_REQUEST).json({
      message: ResponseMessage.FailAdded,
      error: error, // Mengirimkan pesan kesalahan
    });
  }
};

export const updateAddress = async (req: AuthenticatedRequest, res: Response) => {
  // Pastikan pengguna sudah login dan ada userId di req.user
  if (!req.user || !req.user.id) {
    return res.status(StatusCode.UNAUTHORIZED).json({
      message: ResponseMessage.Unauthorized,
    });
  }

  // Validasi input menggunakan AddressSchema
  try {
    AddressSchema.parse(req.body);
  } catch (error) {
    return res.status(StatusCode.BAD_REQUEST).json({
      message: ResponseMessage.Notrequired,
      error: error, // Mengirimkan pesan kesalahan validasi
    });
  }

  const userId = req.user.id;

  try {
    const address = req.body;
    // Periksa apakah alamat yang akan diupdate milik pengguna yang sedang login
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: +req.params.id,
        userId: userId, // Pastikan alamat milik pengguna yang sedang login
      },
    });

    if (!existingAddress) {
      return res.status(StatusCode.NOT_FOUND).json({
        message: ResponseMessage.NotFound,
      });
    }
    // Update alamat baru ke pengguna
    const updateaddress = await prisma.address.update({
      where: {
        id: +req.params.id
      },
      data: address,
    });

    return res.status(StatusCode.OK).json({
      message: ResponseMessage.Updated,
      data: updateaddress, // Mengirimkan detail alamat yang baru diupdate
    });
  } catch (error) {
    console.error("Error adding address:", error);
    // Jika kesalahan fatal kirim message gagal
    return res.status(StatusCode.BAD_REQUEST).json({
      message: ResponseMessage.FailUpdated,
      error: error, // Mengirimkan pesan kesalahan
    });
  }
};

export const deleteAddress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const addressid = req.params.id;
    const deleteAddress = await prisma.address.delete({
      where: {
        id: +addressid,
      },
    });
    return res.status(StatusCode.OK).json({
      message: ResponseMessage.Removed,
    });
  } catch (err) {
    return res.status(StatusCode.NOT_FOUND).json({
      message: ResponseMessage.NotFound,
    });
  }
};

export const listAddress = async (req: AuthenticatedRequest, res: Response) => {
  const address = await prisma.address.findMany({
    where: {
      userId: req.user?.id,
    },
  });
  try {
    return res.status(StatusCode.OK).json({
      message: ResponseMessage.Loaded,
      data: address,
    });
  } catch (error) {
    return res.status(StatusCode.BAD_REQUEST).json({
      message: ResponseMessage.FailLoaded,
    });
  }
};