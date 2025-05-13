'use client';

import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db, app } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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

function extraerNombreArchivo(url: string): string {
  try {
    const partes = url.split('%2F');
    const ultimaParte = partes[partes.length - 1];
    return decodeURIComponent(ultimaParte.split('?')[0]);
  } catch {
    return 'Archivo';
  }
}

export default function PublicacionesProfesor() {
  const [userSemillero, setUserSemillero] = useState('');
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', user.uid)));
        const semillero = userDoc.docs[0]?.data()?.semillero || '';
        setUserSemillero(semillero);

        const publicacionesSnap = await getDocs(
          query(
            collection(db, 'publicaciones'),
            where('semillero', '==', semillero),
            orderBy('timestamp', 'desc')
          )
        );

        const publicacionesList = publicacionesSnap.docs.map((doc) => {
          const { id: _, ...data } = doc.data() as Publicacion; // Exclude 'id' from the spread
          return {
            id: doc.id,
            ...data,
          };
        });

        setPublicaciones(publicacionesList);
      } else {
        router.push('/');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <p className="text-center mt-10">Cargando publicaciones...</p>;
  }

  return (
    <div className="min-h-screen px-6 py-10 bg-gradient-to-b from-white via-blue-50 to-blue-100 text-gray-800">
      <motion.h1
        className="text-3xl font-bold text-center text-blue-900 mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Publicaciones del semillero {userSemillero}
      </motion.h1>

      {publicaciones.length === 0 ? (
        <p className="text-center text-gray-600 italic">Aún no hay publicaciones.</p>
      ) : (
        <div className="space-y-6 max-w-3xl mx-auto">
          {publicaciones.map((pub) => (
            <motion.div
              key={pub.id}
              className="bg-white border border-blue-200 rounded-lg shadow p-4 hover:shadow-md transition"
              whileHover={{ scale: 1.01 }}
            >
              {pub.imagenURL && (
                <img
                  src={pub.imagenURL}
                  alt="Imagen destacada"
                  className="w-full max-h-48 object-cover mb-3 rounded"
                />
              )}
              <h3 className="text-lg font-bold text-blue-900 mb-1">{pub.titulo}</h3>
              <p className="text-xs text-gray-500 mb-2">
                {pub.timestamp?.toDate().toLocaleString()}
              </p>
              <p className="text-gray-700 text-sm mb-2 line-clamp-3">{pub.contenido}</p>

              {pub.archivoURL && (
                <div className="mb-2">
                  <p className="text-sm text-gray-700 font-medium">
                    Archivo adjunto: {extraerNombreArchivo(pub.archivoURL)}
                  </p>
                  <a
                    href={pub.archivoURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline text-sm"
                  >
                    Ver archivo
                  </a>
                </div>
              )}

              <Link
                href={`/publicaciones/${pub.id}`}
                className="inline-block mt-2 text-blue-600 hover:underline text-sm font-semibold"
              >
                Leer más →
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
