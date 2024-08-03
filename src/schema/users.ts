import {nullable, z} from "zod"

export const RegisterSchema = z.object({
  name: z.string().nonempty("name is required"),
  no_telp: z.string(),
  email: z.string().email("invalid email addres"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const AddressSchema = z.object({
  lineOne: z.string().nonempty("address is required"),
  lineTwo: z.string(),
  pincode: z.string(),
  country: z.string(),
  city: z.string(),
});