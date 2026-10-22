import { cookies } from "next/headers";
import z from "zod";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { connection } from "next/server";

const sessionSchema = z.object({
    userId: z.string().min(1),
  handle: z.string().min(1),
})

export type SessionPayload = z.infer<typeof sessionSchema>

export const SESSION_COOKIE = 'session'
export const SESSON_TTL_SECONDS = 24*7*60*60
export const BCRYPT_ROUNDS=12

function getSecret(){
    const JwtSecret = process.env.JWT_SECRET

    if(!JwtSecret || JwtSecret.length<32){
        throw new Error("JWT_SECRET must be set and at least 32 characters long")
    }
    return JwtSecret
}

export function verifyPassword(password:string, hashPassword:string){
    return bcrypt.compare(password,hashPassword)
}

export function hashPassword(password:string){
    return bcrypt.hash(password,BCRYPT_ROUNDS)
}

export function signSessionToken(payload:SessionPayload){
    const token = jwt.sign(payload,getSecret(),{
        algorithm:'HS256',
        expiresIn:SESSON_TTL_SECONDS
    })
    
    return token
}


export async function createSession(payload:SessionPayload){
    const cookieStore = await cookies()

    cookieStore.set(SESSION_COOKIE, signSessionToken(payload),{
        httpOnly:true,
        secure:process.env.NODE_ENV==='production',
        sameSite:'lax',
        path:'/',
        maxAge:SESSON_TTL_SECONDS
    })
}

export async function deleteSession(){
    const cookieStore = await cookies()
    cookieStore.delete(SESSION_COOKIE)
}

export function verifyToken(token:string){
     if (!token) return null;
     try{
                const payload = jwt.verify(token, getSecret(),{algorithms:['HS256']})
            const parsed = sessionSchema.safeParse(payload)

            if(!parsed.success){
                return null
            }

            return parsed.data
     }catch{
        return null
     }
  
}

export async function getSession(){
    const cookieStore = await cookies()

    const token = cookieStore.get(SESSION_COOKIE)?.value

    if(!token){
        return null
    }

    await connection()

    return verifyToken(token)
}