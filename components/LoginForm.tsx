'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Por favor completa todos los campos.');
      return;
    }

    try {
      // Iniciar sesión
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Buscar el usuario en Firestore
      const q = query(collection(db, 'users'), where('email', '==', user.email));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const userData = snapshot.docs[0].data();

        // Redirigir según el rol
        if (userData.role === 'profesor') {
          router.push('/profesor');
        } else if (userData.role === 'estudiante') {
          router.push('/estudiante');
        } else {
          setError('Rol no válido.');
        }
      } else {
        setError('Usuario no registrado en Firestore.');
      }
    } catch (err: any) {
      console.error('Error al iniciar sesión:', err);
      setError('Credenciales inválidas.');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <input
        type="email"
        placeholder="Correo"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border border-gray-300 p-2 rounded"
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border border-gray-300 p-2 rounded"
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        onClick={handleLogin}
        className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
      >
        Iniciar sesión
      </button>
    </div>
  );
}
