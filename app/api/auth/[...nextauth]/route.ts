import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { supabaseAdmin } from '@/lib/supabase';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      // Upsert user profile — preserve existing role, only set 'user' for new profiles
      const { data: existing } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const { error } = await supabaseAdmin.from('profiles').upsert({
        id: user.id,
        email: user.email,
        full_name: user.name || '',
        avatar_url: user.image || '',
        role: existing?.role || 'user',
      }, { onConflict: 'id' });

      if (error) console.error('Supabase upsert error:', error);
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        // Fetch role from profiles on first login
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('role')
          .eq('email', user.email!)
          .single();
        token.role = profile?.role || 'user';
        token.uid = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.uid || token.sub;
        (session.user as any).role = token.role || 'user';
      }
      return session;
    },
  },
  pages: {
    signIn: '/ar/login',
    error: '/ar/login',
  },
});

export { handler as GET, handler as POST };
