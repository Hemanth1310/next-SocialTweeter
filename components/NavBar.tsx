import React, { Suspense } from 'react'
import UserNav from './UserNav'
import { getCurrentUser } from '@/lib/currentUser'

const NavBar = () => {
   
  return (
    <header className='w-full h-16 p-4 bg-mist-900 text-white flex items-center justify-between'>
        <h1>NextTweet</h1>
        <Suspense fallback={<div aria-hidden="true" className="size-11 rounded-full bg-subtle" />}>
          <UserNav></UserNav>
        </Suspense>
    </header>
  )
}

export default NavBar