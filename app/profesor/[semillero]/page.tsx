'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

interface Estudiante {
  id: string;
  codigo: string;
  nombre: string;
  email: string;
}

interface Publicacion {
  id: string;
  titulo: string;
  timestamp: any;
}

export default function InformacionSemillero() {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [semillero, setSemillero] = useState('');

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const userDocSnap = await getDocs(query(collection(db, 'users'), where('uid', '==', user.uid)));
      const data = userDocSnap.docs[0]?.data();
      const semilleroNombre = data?.semillero;
      setSemillero(semilleroNombre);

      // Obtener estudiantes
      const estudiantesSnap = await getDocs(query(collection(db, 'users'), where('semillero', '==', semilleroNombre)));
      const estudiantesList = estudiantesSnap.docs
        .filter((doc) => doc.data().role === 'estudiante')
        .map((doc) => ({
          id: doc.id,
          codigo: doc.data().codigo || 'N/A',
          nombre: doc.data().nombre || 'Sin nombre',
          email: doc.data().email,
        }));
      setEstudiantes(estudiantesList);

      // Obtener publicaciones
      const publicacionesSnap = await getDocs(query(collection(db, 'publicaciones'), where('semillero', '==', semilleroNombre)));
      const publicacionesList = publicacionesSnap.docs.map((doc) => ({
        id: doc.id,
        titulo: doc.data().titulo || 'Sin título',
        timestamp: doc.data().timestamp,
      }));
      setPublicaciones(publicacionesList);
    });

    return () => unsubscribe();
  }, []);

  const removerEstudiante = async (id: string) => {
    await deleteDoc(doc(db, 'users', id));
    setEstudiantes(estudiantes.filter((e) => e.id !== id));
  };

  const eliminarPublicacion = async (id: string) => {
    await deleteDoc(doc(db, 'publicaciones', id));
    setPublicaciones(publicaciones.filter((p) => p.id !== id));
  };

  return (
    <div className="min-h-screen px-6 py-10 bg-gradient-to-b from-white via-blue-50 to-blue-100 text-gray-800">
      <h1 className="text-3xl font-bold text-center text-blue-900 mb-8">
        Información del semillero: {semillero}
      </h1>

      <div className="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold text-blue-800 mb-4">Estudiantes ({estudiantes.length})</h2>
        {estudiantes.length === 0 ? (
          <p className="text-gray-600 italic">No hay estudiantes registrados.</p>
        ) : (
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-blue-100">
                <th className="border px-4 py-2 text-left">Código</th>
                <th className="border px-4 py-2 text-left">Correo</th>
                <th className="border px-4 py-2 text-left">Nombre</th>
                <th className="border px-4 py-2 text-left">Acción</th>
              </tr>
            </thead>
            <tbody>
              {estudiantes.map((e) => (
                <tr key={e.id}>
                  <td className="border px-4 py-2">{e.codigo}</td>
                  <td className="border px-4 py-2">{e.email}</td>
                  <td className="border px-4 py-2">{e.nombre}</td>
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => removerEstudiante(e.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="mt-10">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">
            Publicaciones realizadas: {publicaciones.length}
          </h2>
          {publicaciones.length > 0 && (
            <ul className="space-y-2">
              {publicaciones.map((p) => (
                <li key={p.id} className="border rounded px-4 py-2 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-blue-900">{p.titulo}</p>
                    <p className="text-xs text-gray-500">{p.timestamp?.toDate().toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => eliminarPublicacion(p.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
