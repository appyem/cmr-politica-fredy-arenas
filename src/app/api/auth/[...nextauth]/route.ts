// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import { NextAuthOptions } from 'next-auth'

const handler = NextAuth({
  providers: [
    // Aquí puedes agregar Google, Facebook, etc.
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
})

export { handler as GET, handler as POST }