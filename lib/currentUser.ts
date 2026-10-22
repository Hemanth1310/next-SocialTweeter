import { getSession } from "./auth";
import db from "./db";



export async function getCurrentUser(){
    const session =await getSession()
    if(!session) return null

   return db.user.findUnique({
    where: { id: session.userId },
    select: { id: true, username: true, handle: true, avatarUrl: true },
  });
}