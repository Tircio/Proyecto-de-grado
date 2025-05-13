'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Evento {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: Timestamp;
  enlace?: string;
}

export default function EventosPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);

  useEffect(() => {
    const obtenerEventos = async () => {
      try {
        const q = query(collection(db, 'eventos'), orderBy('fecha', 'asc'));
        const snapshot = await getDocs(q);
        const hoy = new Date();

        const eventosFiltrados = snapshot.docs
          .map((doc) => ({
            ...(doc.data() as Evento),
            id: doc.id,
          }))
          .filter((e) => e.fecha?.toDate() >= hoy);

        setEventos(eventosFiltrados);
      } catch (err) {
        console.error('Error al cargar eventos:', err);
      }
    };

    obtenerEventos();
  }, []);

  return (
    <div className="min-h-screen px-6 py-10 bg-gradient-to-b from-white via-blue-50 to-blue-100 text-gray-800">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-900 mb-8 text-center">
          📅 Próximos eventos
        </h1>

        {eventos.length === 0 ? (
          <p className="text-center text-gray-600 italic">
            No hay eventos próximos registrados.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {eventos.map((evento) => (
              <div
                key={evento.id}
                className="bg-white border border-blue-200 rounded-lg p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-blue-900">{evento.titulo}</h3>
                <p className="text-sm text-gray-500 mb-2">
                  Fecha: {evento.fecha.toDate().toLocaleString()}
                </p>
                <p className="text-gray-700 text-sm mb-2">{evento.descripcion}</p>
                {evento.enlace && (
                  <a
                    href={evento.enlace}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline text-sm"
                  >
                    Ir al evento →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Botón volver */}
        <div className="mt-10 text-center">
          <a
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            ← Volver al inicio
          </a>
        </div>
      </div>
    </div>
  );
}
