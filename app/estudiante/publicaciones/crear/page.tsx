'use client';

import { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function CrearPublicacionEstudiante() {
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [imagen, setImagen] = useState<File | null>(null);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = async () => {
    if (!titulo || !contenido) {
      setMensaje('Completa todos los campos obligatorios.');
      return;
    }

    const auth = getAuth();
    const usuario = auth.currentUser;
    if (!usuario) return;

    try {
      const userDocSnap = await (await import('firebase/firestore')).getDocs(
        (await import('firebase/firestore')).query(
          collection(db, 'users'),
          (await import('firebase/firestore')).where('uid', '==', usuario.uid)
        )
      );
      const semillero = userDocSnap.docs[0]?.data()?.semillero;

      let imagenURL = '';
      let archivoURL = '';

      if (imagen) {
        const imagenRef = ref(storage, `imagenes/${Date.now()}_${imagen.name}`);
        await uploadBytes(imagenRef, imagen);
        imagenURL = await getDownloadURL(imagenRef);
      }

      if (archivo) {
        const archivoRef = ref(storage, `archivos/${Date.now()}_${archivo.name}`);
        await uploadBytes(archivoRef, archivo);
        archivoURL = await getDownloadURL(archivoRef);
      }

      await addDoc(collection(db, 'publicaciones'), {
        titulo,
        contenido,
        imagenURL,
        archivoURL,
        timestamp: Timestamp.now(),
        semillero,
      });

      setTitulo('');
      setContenido('');
      setImagen(null);
      setArchivo(null);
      setMensaje('✅ Publicación creada exitosamente.');
    } catch (error) {
      console.error('Error al crear publicación:', error);
      setMensaje('❌ Error al crear publicación.');
    }
  };

  return (
    <div className="min-h-screen px-6 py-10 bg-gradient-to-b from-white via-blue-50 to-blue-100">
      <h1 className="text-2xl font-bold text-center text-blue-900 mb-6">Crear Publicación</h1>

      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
        {mensaje && <p className="mb-4 text-center text-blue-700 font-medium">{mensaje}</p>}

        <input
          type="text"
          placeholder="Título"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="w-full px-4 py-2 border rounded mb-4"
        />

        <textarea
          placeholder="Contenido"
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          className="w-full px-4 py-2 border rounded mb-4"
          rows={5}
        />

        <div className="mb-4">
          <label className="block mb-1 font-medium">Imagen (opcional)</label>
          <input type="file" accept="image/*" onChange={(e) => setImagen(e.target.files?.[0] || null)} />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Archivo adjunto (opcional)</label>
          <input type="file" onChange={(e) => setArchivo(e.target.files?.[0] || null)} />
        </div>

        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 w-full"
        >
          Publicar
        </button>
      </div>
    </div>
  );
}
