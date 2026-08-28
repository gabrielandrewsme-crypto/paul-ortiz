import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '@/src/lib/db';
import { createSessionToken, setSessionCookie, determineUserRole } from '@/src/lib/auth';

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'sara_core_super_secret_jwt_key_2026',
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      try {
        const normalizedEmail = user.email.toLowerCase().trim();

        let dbUser = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              email: normalizedEmail,
              name: user.name || normalizedEmail.split('@')[0],
              role: determineUserRole(normalizedEmail),
            },
          });
        }

        const token = await createSessionToken({
          userId: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role as 'USER' | 'MANAGER' | 'ADMIN',
        });

        await setSessionCookie(token);
        return true;
      } catch (error) {
        console.error('[NEXTAUTH SIGNIN ERROR]', error);
        return false;
      }
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
