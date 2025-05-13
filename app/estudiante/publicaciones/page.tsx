'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import Link from 'next/link';

interface Publicacion {
  id: string;
  titulo: string;
  contenido: string;
  imagenURL?: string;
  archivoURL?: string;
  timestamp: any;
  semillero: string;
}

export default function PublicacionesEstudiante() {
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [semillero, setSemillero] = useState('');

  useEffect(() => {
    const cargarDatos = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const qUser = query(collection(db, 'users'), where('uid', '==', user.uid));
      const snapUser = await getDocs(qUser);
      const dataUser = snapUser.docs[0]?.data();
      const semilleroUsuario = dataUser?.semillero || '';
      setSemillero(semilleroUsuario);

      const qPub = query(
        collection(db, 'publicaciones'),
        where('semillero', '==', semilleroUsuario),
        orderBy('timestamp', 'desc')
      );
      const snapPub = await getDocs(qPub);
      const pubs = snapPub.docs.map((doc) => ({
        ...(doc.data() as Publicacion),
        id: doc.id,
      }));
      setPublicaciones(pubs);
    };

    cargarDatos();
  }, []);

  return (
    <div className="min-h-screen px-6 py-10 bg-gradient-to-b from-white via-blue-50 to-blue-100 text-gray-800">
      <h1 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-2">
        📚 Publicaciones del semillero: {semillero}
      </h1>

      {publicaciones.length === 0 ? (
        <p className="italic text-gray-600">No hay publicaciones aún.</p>
      ) : (
        <div className="space-y-4">
          {publicaciones.map((pub) => (
            <div key={pub.id} className="bg-white border border-blue-200 rounded p-4 shadow-sm">
              <h3 className="text-blue-900 font-semibold text-lg">{pub.titulo}</h3>
              <p className="text-sm text-gray-600">{pub.timestamp?.toDate().toLocaleString()}</p>
              <p className="text-gray-800 text-sm mt-1">{pub.contenido}</p>
              {pub.imagenURL && (
                <img src={pub.imagenURL} alt="Imagen" className="max-h-48 mt-2 rounded" />
              )}
              {pub.archivoURL && (
                <a
                  href={pub.archivoURL}
                  target="_blank"
                  className="text-blue-600 underline text-sm mt-2 inline-block"
                >
                  Ver archivo adjunto
                </a>
              )}
              <Link
                href={`/publicaciones/${pub.id}`}
                className="inline-block mt-2 text-blue-600 hover:underline text-sm font-semibold"
              >
                Leer más →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

