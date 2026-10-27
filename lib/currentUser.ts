import { cache } from "react";
import { getSession } from "./auth";
import db from "./db";

export type CurrentUser = {
    handle: string;
    id: string;
    username: string;
    avatarUrl: string | null;
}

export const getCurrentUser=cache(async():Promise<CurrentUser|null>=>{
    const session =await getSession()
    if(!session) return null

   return db.user.findUnique({
    where: { id: session.userId },
    select: { id: true, username: true, handle: true, avatarUrl: true },
  });
})