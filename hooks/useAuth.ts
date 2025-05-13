// hooks/useAuth.ts
'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export function useLogin() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const q = query(collection(db, 'users'), where('uid', '==', user.uid));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setError('El usuario no tiene rol asignado en Firestore.');
        return { success: false };
      }

      const data = snapshot.docs[0].data();
      return { success: true, role: data.role, semillero: data.semillero };

    } catch (err: any) {
      console.error('Error en login:', err);
      setError('Correo o contraseña incorrectos.');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return { login, error, loading };
}
