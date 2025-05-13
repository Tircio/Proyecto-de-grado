'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  doc,
  getDoc,
  collection,
  getDocs,
  addDoc,
  Timestamp,
  orderBy,
  query
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { getAuth } from 'firebase/auth';

interface Publicacion {
  id: string;
  titulo: string;
  contenido: string;
  imagenURL?: string;
  archivoURL?: string;
  timestamp: any;
  semillero: string;
}

interface Comentario {
  id: string;
  autor: string;
  contenido: string;
  timestamp: Timestamp;
  respuestas?: Respuesta[];
}

interface Respuesta {
  id: string;
  autor: string;
  contenido: string;
  timestamp: Timestamp;
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

export default function PublicacionDetalle() {
  const { id } = useParams();
  const [publicacion, setPublicacion] = useState<Publicacion | null>(null);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [respuestas, setRespuestas] = useState<Record<string, Respuesta[]>>({});
  const [nuevasRespuestas, setNuevasRespuestas] = useState<Record<string, string>>({});

  useEffect(() => {
    const obtenerPublicacion = async () => {
      if (!id || Array.isArray(id)) return;
      try {
        const docRef = doc(db, 'publicaciones', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as Publicacion;
          setPublicacion({ ...data, id: docSnap.id });
        }
      } catch (err) {
        console.error('Error al cargar la publicación:', err);
      }
    };

    const obtenerComentarios = async () => {
      if (!id || Array.isArray(id)) return;
      try {
        const q = query(collection(db, 'publicaciones', id, 'comentarios'), orderBy('timestamp', 'asc'));
        const snapshot = await getDocs(q);
        const lista = await Promise.all(snapshot.docs.map(async (docSnap) => {
          const comentario = docSnap.data() as Comentario;
          const respuestasSnap = await getDocs(collection(db, 'publicaciones', id, 'comentarios', docSnap.id, 'respuestas'));
          const respuestas = respuestasSnap.docs.map((res) => {
            const { id: _, ...rest } = res.data() as Respuesta;
            return { id: res.id, ...rest };
          });
          return {
            ...comentario,
            respuestas,
          };
        }));
        setComentarios(lista);
      } catch (err) {
        console.error('Error al cargar comentarios:', err);
      }
    };

    obtenerPublicacion();
    obtenerComentarios();
  }, [id]);

  const publicarComentario = async () => {
    if (!id || Array.isArray(id) || !nuevoComentario.trim()) return;
    try {
      const auth = getAuth();
      const usuario = auth.currentUser;
      if (!usuario) return;
      await addDoc(collection(db, 'publicaciones', id, 'comentarios'), {
        autor: usuario.email || 'Anónimo',
        contenido: nuevoComentario,
        timestamp: Timestamp.now(),
      });
      setNuevoComentario('');
      location.reload();
    } catch (err) {
      console.error('Error al publicar comentario:', err);
    }
  };

  const publicarRespuesta = async (comentarioId: string) => {
    if (!nuevasRespuestas[comentarioId]?.trim()) return;
    try {
      const auth = getAuth();
      const usuario = auth.currentUser;
      if (!usuario) return;
      await addDoc(collection(db, 'publicaciones', id as string, 'comentarios', comentarioId, 'respuestas'), {
        autor: usuario.email || 'Anónimo',
        contenido: nuevasRespuestas[comentarioId],
        timestamp: Timestamp.now(),
      });
      setNuevasRespuestas((prev) => ({ ...prev, [comentarioId]: '' }));
      location.reload();
    } catch (err) {
      console.error('Error al publicar respuesta:', err);
    }
  };

  if (!publicacion) {
    return <p className="text-center mt-10">Cargando publicación...</p>;
  }

  return (
    <div className="min-h-screen px-6 py-10 bg-gradient-to-b from-white via-blue-50 to-blue-100 text-gray-800">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-8"
      >
        {publicacion.imagenURL && (
          <img
            src={publicacion.imagenURL}
            alt="Imagen"
            className="w-full h-72 object-cover rounded mb-6"
          />
        )}
        <h1 className="text-3xl font-bold text-blue-900 mb-2">{publicacion.titulo}</h1>
        <p className="text-sm text-gray-500 mb-4">
          {publicacion.timestamp?.toDate().toLocaleString()} | Semillero: {publicacion.semillero}
        </p>
        <p className="text-gray-800 text-lg mb-6 whitespace-pre-line">{publicacion.contenido}</p>

        {publicacion.archivoURL && (
          <div className="mb-4">
            <p className="text-sm text-gray-700 font-medium">
              Archivo adjunto: {extraerNombreArchivo(publicacion.archivoURL)}
            </p>
            <a
              href={publicacion.archivoURL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline text-sm"
            >
              Ver archivo
            </a>
          </div>
        )}

        {/* Comentarios */}
        <div className="mt-10">
          <h3 className="text-xl font-semibold mb-4">💬 Comentarios</h3>
          {comentarios.length === 0 ? (
            <p className="text-sm text-gray-600 italic">Aún no hay comentarios.</p>
          ) : (
            <ul className="space-y-4">
              {comentarios.map((c) => (
                <li key={c.id} className="border border-gray-200 p-4 rounded">
                  <p className="text-sm text-blue-800 font-semibold">{c.autor}</p>
                  <p className="text-gray-800 text-sm mt-1">{c.contenido}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {c.timestamp?.toDate().toLocaleString()}
                  </p>

                  {/* Respuestas */}
                  {(c.respuestas ?? []).length > 0 && (
                    <ul className="ml-4 mt-3 space-y-2">
                      {c.respuestas?.map((r) => (
                        <li key={r.id} className="border-l-2 border-blue-300 pl-3">
                          <p className="text-sm text-blue-700 font-medium">{r.autor}</p>
                          <p className="text-sm text-gray-700">{r.contenido}</p>
                          <p className="text-xs text-gray-500">
                            {r.timestamp?.toDate().toLocaleString()}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Formulario respuesta */}
                  <div className="mt-2">
                    <textarea
                      rows={2}
                      placeholder="Responder..."
                      className="w-full border rounded px-3 py-2"
                      value={nuevasRespuestas[c.id] || ''}
                      onChange={(e) =>
                        setNuevasRespuestas((prev) => ({ ...prev, [c.id]: e.target.value }))
                      }
                    ></textarea>
                    <button
                      onClick={() => publicarRespuesta(c.id)}
                      className="mt-1 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      Responder
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Formulario nuevo comentario */}
          <div className="mt-6">
            <textarea
              rows={3}
              placeholder="Escribe un comentario..."
              className="w-full border rounded px-3 py-2"
              value={nuevoComentario}
              onChange={(e) => setNuevoComentario(e.target.value)}
            ></textarea>
            <button
              onClick={publicarComentario}
              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Publicar
            </button>
          </div>
        </div>

        {/* Botón de volver al inicio */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            ← Volver al inicio
          </a>
        </div>
      </motion.div>
    </div>
  );
}
