import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { supabaseAdmin } from './supabase-admin'

// تعريف أنواع الجلسة لـ TypeScript
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      email: string
      name: string
      image?: string
    }
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false
      
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', user.email)
        .maybeSingle()

      if (!profile) {
        const { error } = await supabaseAdmin
          .from('profiles')
          .insert({
            email: user.email,
            full_name: user.name,
            avatar_url: user.image,
            role: 'user'
          })
        
        if (error) {
          console.error('Error creating profile:', error)
          return false
        }
      }
      return true
    },
    async session({ session, token }: any) {
      if (session.user && token.email) {
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('id, role')
          .eq('email', token.email)
          .single()

        if (profile) {
          session.user.id = profile.id
          session.user.role = profile.role
        }
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email
      }
      return token
    }
  },
  pages: {
    signIn: '/ar/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
})
