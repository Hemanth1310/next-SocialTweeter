import { getCurrentUser } from '@/lib/currentUser';
import Link from 'next/link';
import React from 'react'

export type UserNavUser = {
    handle: string;
    id: string;
    username: string;
    avatarUrl: string | null;
}

const UserNav = async() => {
    const user = await getCurrentUser()
    if(!user){
        return (<div className='space-x-3'>
            <Link href='/login'>Login</Link>
             <Link href='/register'>Register</Link>
        </div>)
    }
  return (
    <div>UserNav</div>
  )
}

export default UserNav