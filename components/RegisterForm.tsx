'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export default function RegisterForm({ role }: { role: 'profesor' | 'estudiante' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [semillero, setSemillero] = useState('');
  const [error, setError] = useState('');
  const [registroExitoso, setRegistroExitoso] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!email || !password || !semillero) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', cred.user.uid), {
        uid: cred.user.uid,
        email,
        semillero,
        role,
      });

      console.log('✅ Usuario registrado correctamente');
      setRegistroExitoso(true);
      setError('');

    } catch (err: any) {
      console.error('❌ Error en registro:', err.message);
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <input
        type="email"
        placeholder="Correo"
        className="border p-2 rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Contraseña"
        className="border p-2 rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <select
        value={semillero}
        onChange={(e) => setSemillero(e.target.value)}
        className="border p-2 rounded"
      >
        <option value="">Selecciona tu semillero</option>
        <option value="SMART">SMART</option>
        <option value="GYNOSKO">GYNOSKO</option>
        <option value="MAAILAB">MAAILAB</option>
        <option value="KERBEROS">KERBEROS</option>
        <option value="Social TICs">Social TICs</option>
      </select>
      {registroExitoso && (
        <p className="text-green-600 text-sm">✅ Registro exitoso. Ahora puedes iniciar sesión.</p>
      )}
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        onClick={handleRegister}
        className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Registrarme
      </button>
    </div>
  );
}
