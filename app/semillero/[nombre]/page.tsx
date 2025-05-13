'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query, where, Timestamp } from 'firebase/firestore';
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

interface Evento {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: Timestamp;
  enlace?: string;
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

export default function SemilleroPage() {
  const { nombre } = useParams();
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);

  useEffect(() => {
    const obtenerPublicaciones = async () => {
      try {
        const q = query(
          collection(db, 'publicaciones'),
          where('semillero', '==', nombre),
          orderBy('timestamp', 'desc')
        );
        const snapshot = await getDocs(q);
        const docs = snapshot.docs.map((doc) => ({
          ...(doc.data() as Publicacion),
          id: doc.id
        }));
        setPublicaciones(docs);
      } catch (err) {
        console.error('Error obteniendo publicaciones:', err);
      }
    };

    const obtenerEventos = async () => {
      try {
        const q = query(
          collection(db, 'eventos'),
          where('semillero', '==', nombre),
          orderBy('fecha', 'asc')
        );
        const snapshot = await getDocs(q);
        const hoy = new Date();
        const docs = snapshot.docs
          .map((doc) => ({ ...(doc.data() as Evento), id: doc.id }))
          .filter((e) => e.fecha?.toDate() >= hoy);
        setEventos(docs);
      } catch (err) {
        console.error('Error obteniendo eventos:', err);
      }
    };

    if (nombre) {
      obtenerPublicaciones();
      obtenerEventos();
    }
  }, [nombre]);

  return (
    <div className="min-h-screen bg-gray-50 px-6 pt-6 pb-20">
      <h1 className="text-3xl font-bold text-blue-900 mb-6">
        Semillero: {nombre?.toString().toUpperCase()}
      </h1>

      <h2 className="text-2xl font-semibold text-blue-800 mb-4 flex items-center gap-2">
        📚 Publicaciones
      </h2>

      {publicaciones.length === 0 ? (
        <p className="text-gray-600 italic">No hay publicaciones registradas.</p>
      ) : (
        <div className="space-y-6 mb-12">
          {publicaciones.map((pub) => (
            <motion.div
              key={pub.id}
              className="bg-white border border-gray-300 rounded-lg p-4 shadow hover:shadow-md transition"
              whileHover={{ scale: 1.01 }}
            >
              {pub.imagenURL && (
                <img
                  src={pub.imagenURL}
                  alt="Imagen"
                  className="w-full max-h-60 object-cover rounded mb-3"
                />
              )}
              <h3 className="text-lg font-bold text-blue-900 mb-1">{pub.titulo}</h3>
              <p className="text-sm text-gray-500 mb-2">
                {pub.timestamp?.toDate().toLocaleString()}
              </p>
              <p className="text-gray-800 text-sm line-clamp-5 mb-2">{pub.contenido}</p>

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
                className="text-blue-600 hover:underline text-sm font-semibold"
              >
                Leer más →
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      <h2 className="text-2xl font-semibold text-blue-800 mb-4 flex items-center gap-2">
        📅 Próximos eventos
      </h2>

      {eventos.length === 0 ? (
        <p className="text-gray-600 italic">No hay eventos próximos registrados.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {eventos.map((evento) => (
            <motion.div
              key={evento.id}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow hover:shadow-md"
              whileHover={{ scale: 1.01 }}
            >
              <h3 className="text-lg font-bold text-blue-900 mb-1">{evento.titulo}</h3>
              <p className="text-sm text-gray-600 mb-1">
                Fecha: {evento.fecha.toDate().toLocaleString()}
              </p>
              <p className="text-sm text-gray-800 mb-2">
                {evento.descripcion}
              </p>
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
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
