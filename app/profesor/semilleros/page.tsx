'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface Usuario {
  uid: string;
  nombre: string;
  correo: string;
  semillero: string;
  rol: 'estudiante' | 'profesor';
}

export default function AdministrarSemilleroProfesor() {
  const [semillero, setSemillero] = useState('');
  const [estudiantes, setEstudiantes] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerDatos = async () => {
      const user = auth.currentUser;
      if (!user) return;

      // Obtener semillero del profesor
      const qProf = query(collection(db, 'users'), where('uid', '==', user.uid));
      const snapProf = await getDocs(qProf);
      const dataProf = snapProf.docs[0]?.data() as Usuario;
      const semilleroProf = dataProf?.semillero;

      if (!semilleroProf) {
        setCargando(false);
        return;
      }

      setSemillero(semilleroProf);

      // Obtener estudiantes del mismo semillero
      const qEst = query(
        collection(db, 'users'),
        where('rol', '==', 'estudiante'),
        where('semillero', '==', semilleroProf)
      );
      const snapEst = await getDocs(qEst);
      const lista = snapEst.docs.map((doc) => doc.data() as Usuario);
      setEstudiantes(lista);
      setCargando(false);
    };

    obtenerDatos();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-10 text-gray-800">
      <h1 className="text-3xl font-bold text-center text-blue-900 mb-8">
        Administrar Semillero
      </h1>

      {cargando ? (
        <p className="text-center text-gray-600">Cargando información...</p>
      ) : semillero ? (
        <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">
            Semillero: {semillero}
          </h2>

          {estudiantes.length === 0 ? (
            <p className="text-gray-600">Aún no hay estudiantes en este semillero.</p>
          ) : (
            <ul className="list-disc pl-6 space-y-1">
              {estudiantes.map((est) => (
                <li key={est.uid} className="text-sm">
                  <strong>{est.nombre}</strong> — {est.correo}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <p className="text-center text-gray-600">
          No se encontró un semillero asignado al profesor.
        </p>
      )}
    </div>
  );
}
