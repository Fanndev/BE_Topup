import { query, Request, Response } from "express";
import { PrismaClient, User } from "@prisma/client";
import { hashSync, compareSync } from "bcrypt";
import * as jwt from 'jsonwebtoken';
import { _JWTSECRET, _serviceAccount } from "../secret";
import { StatusCode, ResponseMessage } from '../helpers/statusCode';
import { RegisterSchema } from "../schema/users";
import { z } from "zod";
import adminFirebase  from "../middleware/authFirebase";

interface AuthenticatedRequest extends Request {
  user?: User;
}

const prisma = new PrismaClient({
    log: ['query']
}).$extends({
    query: {
        user: {
            create({ args, query }){
                args.data = RegisterSchema.parse(args.data)
                return query(args)
            }
        }
    }
})

// Register
export const register = async (req: Request, res: Response) => {
 try {
   RegisterSchema.parse(req.body);
   const { email, password, name, no_telp } = req.body;

   // Validasi apakah email sudah terdaftar di Firebase
   let isEmailUsed;
   try {
     isEmailUsed = await adminFirebase.auth().getUserByEmail(email);
   } catch (firebaseErr) {
     // Jika email tidak ditemukan di Firebase, isEmailUsed akan bernilai null
   }

   if (isEmailUsed) {
     return res.status(StatusCode.BAD_REQUEST).json({
       message: "Email sudah terdaftar, gunakan email lain.",
     });
   }

   // Validasi apakah email sudah terdaftar di Prisma
   const userExists = await prisma.user.findFirst({
     where: { email },
   });

   if (userExists) {
     return res.status(StatusCode.CONFLICT).json({
       message: ResponseMessage.EmailAlreadyExist,
     });
   }

   // Buat pengguna baru di Firebase Authentication
   const userRecord = await adminFirebase.auth().createUser({
     email,
     password,
     displayName: name,
   });

   // Simpan pengguna baru ke database Prisma
   const newUser = await prisma.user.create({
     data: {
       uid: userRecord.uid,
       name,
       no_telp,
       email,
       password: hashSync(password, 10), // Hash password sebelum disimpan
     },
   });

   return res.status(StatusCode.CREATED).json({
     message: ResponseMessage.SuksesRegistered,
     data: newUser,
   });
 } catch (err) {
   // Tangani kesalahan dari Zod (validasi input)
   if (err instanceof z.ZodError) {
     const formattedErrors = err.errors.map((error) => ({
       path: error.path.join("."),
       message: error.message,
     }));

     return res.status(StatusCode.BAD_REQUEST).json({
       message: ResponseMessage.FailRegistered,
       errors: formattedErrors,
     });
   }

   // Tangani kesalahan lainnya
   console.error("Error registering user:", err);
   return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
     message: ResponseMessage.FailRegistered,
   });
 }
};

// Login
export const login = async (req: Request, res: Response) => {

    try {
         const { email, password } = req.body;

         let user = await prisma.user.findFirst({
           where: {
             email,
           },
         });
         if (!user) {
           return res.status(StatusCode.NOT_FOUND).json({
             message: ResponseMessage.UserNotFound,
           });
         }
         if (!compareSync(password, user.password)) {
           return res.status(StatusCode.UNAUTHORIZED).json({
             message: ResponseMessage.Wrongpass,
           });
         }

         const token = jwt.sign(
           {
             userId: user.id,
           },
           _JWTSECRET,
           { expiresIn: '1d' }
         );

         return res.status(StatusCode.OK).json({
           message: ResponseMessage.LoginSuccess,
           token,
         });
    } catch (err) {
        return res.status(StatusCode.BAD_REQUEST).json({
            message: ResponseMessage.Somethingwrong
        })
    }
};

// Login Oauth
export const GoogleValidate = async (req: AuthenticatedRequest, res: Response) => {
  const { uid, fcm_token } = req.body;

   console.log(`Received uid: ${uid}, fcm_token: ${fcm_token}`);

  try {
    const userRecord = await adminFirebase.auth().getUser(uid);
     console.log(`Fetched user data from Firebase:`, userRecord);

    const data = userRecord.providerData[0];

    const existingUser = await prisma.user.findUnique({ where: { uid } });

    if (!existingUser) {
      const newUser = await prisma.user.create({
        data: {
          uid,
          fcm_token: fcm_token || null,
          name: data.displayName || "",
          email: data.email,
          role: "CUSTOMER",
          photo: data.photoURL || "",
          no_telp: data.phoneNumber || "",
          password: "GOOGLE_AUTH",
        },
      });

      // Generate JWT token
      const token = jwt.sign({ id: newUser.id }, _JWTSECRET, {
        expiresIn: "30d",
      });

      return res.status(StatusCode.OK).json({
        message: ResponseMessage.LoginSuccess,
        token,
        data,
      });
    } else {
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          fcm_token: fcm_token || null,
        },
      });

      // Generate JWT token
      const token = jwt.sign({ id: existingUser.id }, "", {
        expiresIn: "30d",
      });

      return res.status(StatusCode.OK).json({
        message: ResponseMessage.LoginSuccess,
        token,
        data,
      });
    }
  } catch (error) {
    console.error("Error validating Google user:", error);
    return res.status(StatusCode.BAD_REQUEST).json({
      message: ResponseMessage.LoginFailed,
    });
  }
};

export const profile = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  try {
    
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
     const user = await prisma.user.findUnique({
       where: { id: userId },
      //  include: {
      //    addresses: true,
      //    payments: true,
      //  },
       select: {
         id: true,
         uid: true,
         fcm_token: true,
         name: true,
         email: true,
         photo: true,
         addresses: true,
         payments: true,
       },
     });

     if (!user) {
       return res.status(StatusCode.NOT_FOUND).json({
         message: ResponseMessage.NotFound,
       });
     }

     return res.status(StatusCode.OK).json({
       message: ResponseMessage.Loaded,
       data: user,
     });
   } catch (error) {
     console.error("Error fetching user profile:", error);
     return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
       message: ResponseMessage.Somethingwrong,
       error: error,
     });
   }
};