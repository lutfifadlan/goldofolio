import { NextApiRequest, NextApiResponse } from 'next';
import { parse as parseCookie, serialize } from 'cookie';
import { Session, User, supabase } from '@/utils/supabaseClient';
import { Provider } from '@/types';
import jwt from 'jsonwebtoken';

const GOOGLE_REDIRECT_URL = process.env.NEXT_PUBLIC_REDIRECT_URL;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const action = req.body.action;

  if (req.method === 'POST') {
    switch (action) {
      case 'sessionListener':
        return sessionListener(req, res);
      case 'signInWithPassword':
        return signInWithPassword(req, res);
      case 'signInWithProvider':
        return signInWithProvider(req, res);
      case 'signOut':
        return signOut(req, res);
      case 'signUp':
        return signUp(req, res);
      default:
        return res.status(400).json({ error: 'Unknown action' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

const sessionListener = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.body.access_token && req.body.refresh_token) {    
    try {
      jwt.verify(req.body.access_token, process.env.JWT_SECRET_SUPABASE as string);
    } catch (e) {
      res.status(401).json({ message: (e as Error).message, error: 'JWT verification is failing' });
      return;
    }
  }

  const cookies = parseCookie(req.headers.cookie || '');
  const accessToken = cookies['sb:access_token'] || req.body.access_token;
  const refreshToken = cookies['sb:refresh_token'] || req.body.refresh_token;
  
  // First, try using the existing access token if it's available
  if (accessToken) {
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });
    const { data, error } = await supabase.auth.getSession();

    res.setHeader('Set-Cookie', [
      serialize('sb:access_token', accessToken, {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 1 week
      }),
      serialize('sb:refresh_token', refreshToken, {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      })
    ]);

    if (!error && data && data.session) {
      // Access token is still valid
      res.status(200).json({ authenticated: true, user: data.session?.user as User });
    } else {
      res.status(200).json({ authenticated: false });
    }
  }

  // If the access token is not valid or not present, try to refresh it
  if (refreshToken) {
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken
    });
    if (error) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    // Update cookies with new tokens
    res.setHeader('Set-Cookie', [
      serialize('sb:access_token', data.session?.access_token as string, {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 1 week
      }),
      serialize('sb:refresh_token', data.session?.refresh_token as string, {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      })
    ]);

    supabase.auth.setSession({
      access_token: data.session?.access_token as string,
      refresh_token: data.session?.refresh_token as string
    });
    res.status(200).json({ authenticated: true, user: data.user });
  } else {
    res.status(401).json({ message: 'No access token and refresh token - Authentication required' });
  }
}

const signInWithPassword = async (req: NextApiRequest, res: NextApiResponse) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Attempt to log in with email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw error;
    }

    // Set session token in HTTP-only cookies
    res.setHeader('Set-Cookie', [
      serialize('sb:access_token', data.session.access_token, {
        path: '/',
        httpOnly: true,
        secure: true, // Use secure cookies in production
        sameSite: 'lax', // Adjust according to your requirements
        maxAge: 60 * 60 * 24 * 7 // 1 week in seconds
      }),
      serialize('sb:refresh_token', data.session.refresh_token, {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      })        
    ]);

    // If login is successful, you might want to return the user and session information
    res.status(200).json({
      message: 'Login successful',
      user: data.user,
      session: data.session
    });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'message' in error) {
      return res.status(401).json({ message: error.message as string, error: 'User login failure' });
    }

    return res.status(401).json({ message: 'Login failed', error: (error as Error).message });
  }
}

const signInWithProvider = async (req: NextApiRequest, res: NextApiResponse) => {
  const { provider } = req.body;

  if (typeof provider !== 'string' || !provider) {
    return res.status(400).json({ message: 'Provider is required and must be a string' });
  }

  try {
    // Redirect to the provider's OAuth login URL
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as Provider,
      options: {
        redirectTo: GOOGLE_REDIRECT_URL
      },
    });

    if (error) throw error;

    return res.status(200).json({
      message: 'Redirect to provider',
      url: data.url
    });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'message' in error) {
      const typedError = error as { message: string };
      return res.status(401).json({ message: 'Authentication failed', error: typedError.message });
    }

    return res.status(500).json({ message: 'Internal server error', error: 'Unexpected error occurred' });
  }
}

const signOut = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    res.setHeader('Set-Cookie', [
      serialize('sb:access_token', '', {
        path: '/',
        expires: new Date(0),
        httpOnly: true,
        secure: true,
        sameSite: 'lax'
      }),
      serialize('sb:refresh_token', '', {
        path: '/',
        expires: new Date(0),
        httpOnly: true,
        secure: true,
        sameSite: 'lax'
      })
    ]);

    return res.status(200).json({ message: 'Sign out successful' });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'message' in error) {
      const typedError = error as { message: string };
      return res.status(500).json({ message: 'Failed to sign out', error: typedError.message });
    }

    return res.status(500).json({ message: 'Internal server error', error: 'Unexpected error occurred' });
  }
}

const signUp = async (req: NextApiRequest, res: NextApiResponse) => {
  // Extract email and password from the request body
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Use Supabase's signUp method to create a new user
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) throw error;

    // Optionally, handle the session or perform further actions, like sending a confirmation email
    return res.status(201).json({
      message: 'User registered successfully',
      user: data.user as User,
      session: data.session as Session
    });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'message' in error) {
      return res.status(401).json({ message: error.message as string, error: 'User registration failure' });
    }

    return res.status(500).json({ message: 'Internal server error', error: 'Unexpected error occurred' });
  }
}