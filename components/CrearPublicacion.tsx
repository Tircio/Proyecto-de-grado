'use client';

import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

interface CrearPublicacionProps {
  semillero: string;
  onPublicacionCreada: () => void;
  mostrarImagen?: boolean;
  mostrarArchivo?: boolean;
}

export default function CrearPublicacion({
  semillero,
  onPublicacionCreada,
  mostrarImagen = true,
  mostrarArchivo = true,
}: CrearPublicacionProps) {
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [imagen, setImagen] = useState<File | null>(null);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCrear = async () => {
    if (!titulo || !contenido) return;

    setLoading(true);
    try {
      let imagenURL = '';
      let archivoURL = '';

      if (imagen) {
        const imageRef = ref(storage, `publicaciones/imagenes/${Date.now()}-${imagen.name}`);
        await uploadBytes(imageRef, imagen);
        imagenURL = await getDownloadURL(imageRef);
      }

      if (archivo) {
        const fileRef = ref(storage, `publicaciones/archivos/${Date.now()}-${archivo.name}`);
        await uploadBytes(fileRef, archivo);
        archivoURL = await getDownloadURL(fileRef);
      }

      await addDoc(collection(db, 'publicaciones'), {
        titulo,
        contenido,
        imagenURL,
        archivoURL,
        semillero,
        timestamp: serverTimestamp(),
      });

      setTitulo('');
      setContenido('');
      setImagen(null);
      setArchivo(null);
      onPublicacionCreada();
    } catch (error) {
      console.error('Error al crear publicación:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-blue-800 mb-4">Nueva Publicación</h2>

      <input
        type="text"
        placeholder="Título"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />

      <textarea
        placeholder="Contenido"
        value={contenido}
        onChange={(e) => setContenido(e.target.value)}
        className="w-full p-2 border rounded mb-4 h-32"
      />

      {mostrarImagen && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Imagen (opcional)</label>
          <input type="file" accept="image/*" onChange={(e) => setImagen(e.target.files?.[0] || null)} />
          {imagen && (
            <img
              src={URL.createObjectURL(imagen)}
              alt="Vista previa"
              className="mt-2 max-h-40 rounded border"
            />
          )}
        </div>
      )}

      {mostrarArchivo && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Archivo adjunto (opcional)</label>
          <input type="file" onChange={(e) => setArchivo(e.target.files?.[0] || null)} />
          {archivo && <p className="text-sm text-gray-700 mt-1">Archivo: {archivo.name}</p>}
        </div>
      )}

      <button
        onClick={handleCrear}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold flex items-center gap-2"
      >
        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : null}
        Crear Publicación
      </button>
    </div>
  );
}
