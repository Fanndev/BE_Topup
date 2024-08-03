import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { StatusCode, ResponseMessage } from "../helpers/statusCode";
import { RegisterSchema } from "../schema/users";
import { z } from "zod";

const prisma = new PrismaClient({
  log: ["query"],
}).$extends({
  query: {
    user: {
      create({ args, query }) {
        args.data = RegisterSchema.parse(args.data);
        return query(args);
      },
    },
  },
});

export const createProduct = async (req: Request, res: Response) => {
  const product = await prisma.product.create({
    data: {
      ...req.body,
      tags: req.body.tags.join(","),
    },
  });
  return res.status(StatusCode.CREATED).json({
    message: ResponseMessage.Added,
  });
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const product = req.body;
    if (product.tags) {
      product.tags = product.tags.join(",");
    }
    const updateProduct = await prisma.product.update({
      where: {
        id: +req.params.id,
      },
      data: product,
    });
    return res.status(StatusCode.OK).json({
      message: ResponseMessage.Updated,
      data: updateProduct,
    });
  } catch (err) {
    return res.status(StatusCode.NOT_FOUND).json({
      message: ResponseMessage.NotFound,
    });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const productid = req.params.id;
    const deleteProduct = await prisma.product.delete({
      where: {
        id: +productid,
      }
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

export const listProduct = async (req: Request, res: Response) => {
  try {
    let { page, pageLimit } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limit = parseInt(pageLimit as string) || 10;
    const offset = (pageNum - 1) * limit;

    // filter
    const filter: any = {}; // Empty filter to fetch all products

    const total_product = await prisma.product.count({
      where: filter,
    });

    const listProduct = await prisma.product.findMany({
      where: filter,
      skip: offset,
      take: limit,
    });

    res.status(StatusCode.OK).json({
      message: ResponseMessage.Loaded,
      listProduct,
      data: {
        total_product,
        currentPage: pageNum,
        totalPages: Math.ceil(total_product / limit),
        pageLimit: limit,
      },
    });
  } catch (error) {
    if (StatusCode.NOT_FOUND) {
      return res.status(StatusCode.NOT_FOUND).json({
        message: ResponseMessage.NotFound,
      });
    } else {
      res.status(500).json({
        message: "Internal server error",
      });
    }
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findFirstOrThrow({
      where: {
        id: +req.params.id
      }
    })

    return res.status(StatusCode.OK).json({
      message: ResponseMessage.Loaded,
      data : product
    })
  } catch (error) {
    return res.status(StatusCode.NOT_FOUND).json({
      message: ResponseMessage.NotFound
    })
  }
};
