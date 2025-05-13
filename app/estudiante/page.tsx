'use client';

import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { CalendarDays, MessageCircle, FilePlus2, FileText } from 'lucide-react';

interface Publicacion {
  id: string;
  titulo: string;
  contenido: string;
  imagenURL?: string;
  timestamp?: any;
}

interface Evento {
  id: string;
  titulo: string;
  fecha: any;
  descripcion: string;
  enlace?: string;
}

export default function EstudiantePanel() {
  const [semillero, setSemillero] = useState('');
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [evento, setEvento] = useState<Evento | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userSnap = await getDocs(query(collection(db, 'users'), where('uid', '==', user.uid)));
        const data = userSnap.docs[0]?.data();
        const sem = data?.semillero || '';
        setSemillero(sem);

        const pubSnap = await getDocs(
          query(collection(db, 'publicaciones'), where('semillero', '==', sem), orderBy('timestamp', 'desc'))
        );
        setPublicaciones(pubSnap.docs.slice(0, 2).map(doc => {
          const { id: _, ...data } = doc.data() as Publicacion;
          return { id: doc.id, ...data };
        }));

        const eventoSnap = await getDocs(
          query(collection(db, 'eventos'), where('semillero', '==', sem), orderBy('fecha', 'asc'))
        );
        const hoy = new Date();
        const eventos = eventoSnap.docs.map(doc => {
          const { id: _, ...data } = doc.data() as Evento;
          return { id: doc.id, ...data };
        });
        const proximo = eventos.find(e => e.fecha.toDate() >= hoy);
        if (proximo) setEvento(proximo);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen px-6 py-10 bg-gradient-to-b from-white via-blue-50 to-blue-100">
      <h1 className="text-3xl font-bold text-blue-900 text-center mb-8">
        Bienvenido al panel del estudiante - {semillero}
      </h1>

      <div className="grid gap-6 sm:grid-cols-2 max-w-5xl mx-auto">
        <Link href="/estudiante/chat" className="bg-white shadow-md p-6 rounded-lg hover:shadow-lg transition border border-blue-200 flex items-center justify-between">
          <span className="text-lg font-semibold text-blue-800">Chat del semillero</span>
          <MessageCircle className="text-blue-600 w-6 h-6" />
        </Link>

        <Link href="/estudiante/calendario" className="bg-white shadow-md p-6 rounded-lg hover:shadow-lg transition border border-blue-200 flex items-center justify-between">
          <span className="text-lg font-semibold text-blue-800">Calendario de eventos</span>
          <CalendarDays className="text-blue-600 w-6 h-6" />
        </Link>

        <Link href="/estudiante/publicaciones/crear" className="bg-white shadow-md p-6 rounded-lg hover:shadow-lg transition border border-blue-200 flex items-center justify-between">
          <span className="text-lg font-semibold text-blue-800">Crear publicación</span>
          <FilePlus2 className="text-blue-600 w-6 h-6" />
        </Link>

        <Link href="/estudiante/publicaciones" className="bg-white shadow-md p-6 rounded-lg hover:shadow-lg transition border border-blue-200 flex items-center justify-between">
          <span className="text-lg font-semibold text-blue-800">Ver publicaciones</span>
          <FileText className="text-blue-600 w-6 h-6" />
        </Link>
      </div>

      <div className="max-w-5xl mx-auto mt-12">
        <h2 className="text-xl font-bold text-blue-800 mb-4">📄 Últimas publicaciones</h2>
        {publicaciones.length === 0 ? (
          <p className="text-gray-600 italic">No hay publicaciones recientes.</p>
        ) : (
          <ul className="space-y-4">
            {publicaciones.map(pub => (
              <li key={pub.id} className="bg-white border border-blue-200 rounded p-4 shadow-sm">
                <h3 className="text-blue-900 font-semibold text-lg">{pub.titulo}</h3>
                <p className="text-sm text-gray-600">{pub.timestamp?.toDate().toLocaleString()}</p>
                <p className="text-gray-700 text-sm mt-1 line-clamp-2">{pub.contenido}</p>
                <Link href={`/publicaciones/${pub.id}`} className="text-blue-600 text-sm font-medium hover:underline mt-1 inline-block">
                  Leer más →
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 text-right">
          <Link href="/estudiante/publicaciones" className="text-blue-600 hover:underline text-sm">
            Ver todas las publicaciones
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-12">
        <h2 className="text-xl font-bold text-blue-800 mb-4">📅 Próximo evento</h2>
        {!evento ? (
          <p className="text-gray-600 italic">No hay eventos próximos.</p>
        ) : (
          <div className="bg-white border border-blue-200 rounded p-4 shadow-sm">
            <h3 className="text-blue-900 font-semibold text-lg">{evento.titulo}</h3>
            <p className="text-sm text-gray-600">{evento.fecha.toDate().toLocaleString()}</p>
            <p className="text-gray-700 text-sm mt-1">{evento.descripcion}</p>
            {evento.enlace && (
              <a
                href={evento.enlace}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 text-sm font-medium hover:underline mt-2 inline-block"
              >
                Ir al evento →
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
