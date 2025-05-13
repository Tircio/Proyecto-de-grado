'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
} from 'firebase/firestore';
import { motion } from 'framer-motion';
import ModalAuth from '@/components/ModalAuth';
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
  semillero?: string;
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

export default function HomePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [eventosProximos, setEventosProximos] = useState<Evento[]>([]);

  useEffect(() => {
    const obtenerPublicaciones = async () => {
      try {
        const q = query(collection(db, 'publicaciones'), orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(q);
        const docs = snapshot.docs.map((doc) => ({
          ...(doc.data() as Publicacion),
          id: doc.id,
        }));
        setPublicaciones(docs);
      } catch (err) {
        console.error('Error obteniendo publicaciones:', err);
      }
    };

    const obtenerEventos = async () => {
      try {
        const q = query(collection(db, 'eventos'), orderBy('fecha', 'asc'));
        const snapshot = await getDocs(q);
        const hoy = new Date();

        const eventos = snapshot.docs
          .map((doc) => ({
            ...(doc.data() as Evento),
            id: doc.id,
          }))
          .filter((e) => e.fecha?.toDate() >= hoy);

        setEventosProximos(eventos);
      } catch (err) {
        console.error('Error obteniendo eventos:', err);
      }
    };

    obtenerPublicaciones();
    obtenerEventos();
  }, []);

  const publicacionesPorSemillero = publicaciones.reduce((acc: Record<string, Publicacion[]>, pub) => {
    if (!acc[pub.semillero]) acc[pub.semillero] = [];
    acc[pub.semillero].push(pub);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100 text-gray-800 px-4 sm:px-6 pt-4 pb-16">
      <div className="flex justify-end">
        <button
          onClick={() => setModalOpen(true)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-4 sm:px-6 py-2 rounded shadow transition"
        >
          Iniciar sesión / Registrarme
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mt-8"
      >
        <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-900">
          Semilleros - Universidad Católica de Colombia
        </h1>
        <p className="text-base sm:text-lg mt-2 text-blue-800 font-medium">
          Explora investigaciones, eventos y publicaciones de los semilleros.
        </p>
      </motion.div>

      <div className="mt-16">
        <h2 className="text-2xl font-bold text-blue-800 mb-6">
          📅 Próximos eventos
        </h2>

        {eventosProximos.length === 0 ? (
          <p className="text-gray-600 text-center italic">No hay eventos próximos registrados.</p>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {eventosProximos.map((evento) => (
                <div
                  key={evento.id}
                  className="bg-white border border-blue-200 rounded-lg p-6 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">{evento.titulo}</h3>
                    <p className="text-sm text-gray-500 mb-1">
                      Fecha: {evento.fecha.toDate().toLocaleString()}
                    </p>
                    {evento.semillero && (
                      <p className="text-sm text-gray-500 mb-1">
                        Semillero: <span className="font-medium">{evento.semillero}</span>
                      </p>
                    )}
                    <p className="text-gray-700 text-sm mb-2 line-clamp-3">{evento.descripcion}</p>
                  </div>
                  {evento.enlace && (
                    <a
                      href={evento.enlace}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline text-sm mt-2"
                    >
                      Ir al evento →
                    </a>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/eventos"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
              >
                Ver todos los eventos →
              </Link>
            </div>
          </>
        )}
      </div>

      <div className="mt-20 space-y-16">
        {Object.keys(publicacionesPorSemillero).map((semillero) => (
          <section key={semillero}>
            <Link
              href={`/semillero/${semillero}`}
              className="text-2xl font-bold text-blue-800 mb-4 hover:underline block"
            >
              🧪 Publicaciones del semillero: {semillero}
            </Link>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicacionesPorSemillero[semillero].map((pub) => (
                <motion.div
                  key={pub.id}
                  className="bg-white border border-blue-200 rounded-lg shadow p-4 hover:shadow-md transition flex flex-col"
                  whileHover={{ scale: 1.01 }}
                >
                  {pub.imagenURL && (
                    <img
                      src={pub.imagenURL}
                      alt="Imagen destacada"
                      className="w-full h-40 object-cover mb-3 rounded"
                    />
                  )}
                  <h3 className="text-lg font-bold text-blue-900 mb-1 line-clamp-2">{pub.titulo}</h3>
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
                    className="mt-auto inline-block text-blue-600 hover:underline text-sm font-semibold"
                  >
                    Leer más →
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {modalOpen && <ModalAuth onClose={() => setModalOpen(false)} />}
    </div>
  );
}
