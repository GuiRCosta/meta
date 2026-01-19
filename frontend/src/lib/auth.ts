import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { prisma } from './db';
import bcrypt from 'bcryptjs';

// Validation schema for login
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET || 'development-secret-do-not-use-in-production',
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        console.log('Auth attempt with:', credentials?.email);
        
        const email = credentials?.email as string;
        const password = credentials?.password as string;
        
        if (!email || !password) {
          console.log('Missing email or password');
          return null;
        }

        try {
          // Validate input
          const parsed = loginSchema.safeParse({ email, password });
          if (!parsed.success) {
            console.log('Validation failed:', parsed.error);
            return null;
          }

          // Lookup user in database
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            console.log('User not found:', email);
            return null;
          }

          // Verify password with bcrypt
          const isValidPassword = await bcrypt.compare(password, user.password);
          
          if (!isValidPassword) {
            console.log('Invalid password for:', email);
            return null;
          }

          console.log('Login successful!', email);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = !nextUrl.pathname.startsWith('/login');
      
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect to login
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/', nextUrl));
      }
      
      return true;
    },
  },
  session: {
    strategy: 'jwt',
  },
  trustHost: true,
});
