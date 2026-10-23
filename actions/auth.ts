import { createSession, deleteSession, hashPassword, verifyPassword } from "@/lib/auth";
import db from "@/lib/db";
import { loginSchema, registerSchema } from "@/lib/validations/auth";
import { redirect } from "next/navigation";

import z from "zod";

export type AuthFormState = {
  message?: string;
  errors?: Partial<Record<"username" | "handle" | "email" | "password", string[]>>;
  /** Echoed back so the form can repopulate non-secret fields after an error. */
  fields?: Partial<Record<"username" | "handle" | "email", string>>;
};

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function loginAction(_prevState:AuthFormState, formData:FormData){
    const raw={ email:field(formData,"email"),password :field(formData,"password")}
    const fields = {email:raw.email}

    const parsed = loginSchema.safeParse(raw)

    if(!parsed.success){
        return {errors:z.flattenError(parsed.error).fieldErrors,fields}
    }

    const {email, password} = parsed.data
    const user  = await db.user.findUnique({
        where:{email},
    })

    if(!user){
        return {errors:{email:"User not found"},fields}
    }

    const passwordMatch = verifyPassword(password,user.passwordHash)

    if(!passwordMatch){
        return {errors:{password:"Password in incorrect"},fields}
    }

    await createSession({userId:user.id,handle:user.handle})

    redirect('/')

}

export async function logoutAction(){
    await deleteSession()
    redirect('/login')
} 

export async function registerAction(_prev:AuthFormState, formData:FormData){
    const raw = {
        email:field(formData,"email"),
        password :field(formData,"password"),
        handle:field(formData,"handle"),
        username:field(formData,"username")
    }
    const {password,...fields} = raw

    const parsed = registerSchema.safeParse(raw)

    if(!parsed.success){
        return {
            errors:z.flattenError(parsed.error).fieldErrors,
            fields
        }
    }
    const {username, email, handle} = parsed.data
    const passwordHash =await hashPassword(password)
    await db.user.create({
        data:{
            email,
            username,
            handle,
            passwordHash
        }
    })
    
}