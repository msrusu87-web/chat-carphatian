/**
 * NextAuth Type Extensions
 * 
 * Extends the default NextAuth types to include our custom user properties.
 * 
 * Built by Carphatian
 */

import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: 'admin' | 'client' | 'freelancer'
      emailVerified: boolean
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    role: 'admin' | 'client' | 'freelancer'
    emailVerified: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: 'admin' | 'client' | 'freelancer'
    emailVerified: boolean
  }
}
