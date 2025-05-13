'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  Timestamp,
  query,
  where,
  doc,
  getDoc,
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db, app } from '@/lib/firebase';

interface Evento {
  id?: string;
  titulo: string;
  fechaInicio: Date;
  fechaFin: Date;
  modalidad?: string;
  enlace?: string;
  lugar?: string;
}

export default function CalendarioEstudiantePage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [semillero, setSemillero] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          const userSemillero = data.semillero;
          setSemillero(userSemillero);

          const q = query(
            collection(db, 'eventos'),
            where('semillero', '==', userSemillero),
            where('cancelado', '==', false)
          );
          const snapshot = await getDocs(q);
          const eventosData: Evento[] = snapshot.docs.map((doc) => {
            const e = doc.data();
            return {
              id: doc.id,
              titulo: e.titulo,
              fechaInicio: (e.fechaInicio as Timestamp).toDate(),
              fechaFin: (e.fechaFin as Timestamp).toDate(),
              modalidad: e.modalidad,
              enlace: e.enlace,
              lugar: e.lugar,
            };
          });
          setEventos(eventosData);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🗓️ Próximos eventos del semillero</h1>

      {loading ? (
        <p className="text-gray-600">Cargando eventos...</p>
      ) : eventos.length === 0 ? (
        <p className="text-gray-600">No hay eventos próximos registrados.</p>
      ) : (
        <ul className="space-y-4">
          {eventos.map((evento) => (
            <li key={evento.id} className="bg-white border rounded p-4 shadow">
              <h2 className="text-xl font-semibold mb-1">{evento.titulo}</h2>
              <p className="text-sm text-gray-500 mb-2">
                Fecha: {evento.fechaInicio.toLocaleString()} -{' '}
                {evento.fechaFin.toLocaleTimeString()}
              </p>
              <p className="text-sm text-gray-600">
                Modalidad: {evento.modalidad?.toUpperCase()}
              </p>
              {evento.modalidad === 'virtual' && evento.enlace && (
                <p className="text-blue-600 text-sm mt-1">
                  <a href={evento.enlace} target="_blank" rel="noopener noreferrer">
                    Enlace de reunión
                  </a>
                </p>
              )}
              {evento.modalidad === 'presencial' && evento.lugar && (
                <p className="text-sm mt-1">Lugar: {evento.lugar}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
