import { createContext, ReactNode, useEffect, useState } from 'react';
import { api } from '../services/api';

type User = {
  id: string,
  name: string,
  login: string,
  avatar_url: string,
}

type AuthContextData = {
  user: User | null,
  signInUrl: string,
  signOut: () => void,
}

/** Bear in mind to initialize the context as an empty object with the right type */
export const AuthContext = createContext({} as AuthContextData);

type AuthProvider = {
  children: ReactNode,
}

type AuthResponse = {
  token: string,
  user: {
    id: string,
    avatar_url: string,
    name: string,
    login: string,
  }
}

export function AuthProvider(props: AuthProvider) {
  const [user, setUser] = useState<User | null>(null);

  const clientId = "d88f76f2ba5de93f8a35";
  const signInUrl = `https://github.com/login/oauth/authorize?scope=user&client_id=${clientId}`;

  async function signIn(code: string) {
    const response = await api.post<AuthResponse>('authenticate', { code });

    const { token, user } = response.data;

    localStorage.setItem('@dowhile:token', token);

    /** From now on, all requests will carry this info in their headers */
    api.defaults.headers.common.authorization = `Bearer ${token}`;

    setUser(user);
  }

  function signOut() {
    setUser(null);
    localStorage.removeItem('@dowhile:token');
  }

  useEffect(() => {
    const token = localStorage.getItem('@dowhile:token');

    if (token) {
      /** From now on, all requests will carry this info in their headers */
      api.defaults.headers.common.authorization = `Bearer ${token}`;

      api.get<User>('profile')
        .then(response => {
          setUser(response.data);
        });
    }
  }, [])

  useEffect(() => {
    const url = window.location.href;
    const hasGithubCode = url.includes('?code=');

    if (hasGithubCode) {
      const [urlWithoutCode, githubCode] = url.split('?code=');

      window.history.pushState({}, '', urlWithoutCode);

      signIn(githubCode);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ signInUrl, user, signOut }}>
      {props.children}
    </AuthContext.Provider >
  );
}