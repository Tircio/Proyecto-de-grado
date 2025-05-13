'use client';

import { useEffect, useState } from 'react';
import { db, storage, app } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

interface Documento {
  id: string;
  nombre: string;
  url: string;
  autor: string;
}

interface Usuario {
  uid: string;
  email: string;
  nombre: string;
  semillero: string;
}

export default function ListaDocumentosEstudiante() {
  const [user, setUser] = useState<Usuario | null>(null);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const { getFirestore, doc, getDoc } = await import('firebase/firestore');
        const db = getFirestore(app);
        const userDoc = doc(db, 'users', currentUser.uid);
        const snap = await getDoc(userDoc);

        if (snap.exists()) {
          const data = snap.data();
          setUser({
            uid: currentUser.uid,
            email: currentUser.email!,
            nombre: data.nombre,
            semillero: data.semillero,
          });
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const cargarDocumentos = async () => {
      if (!user?.semillero) return;

      try {
        const documentosRef = collection(db, `Documentos-${user.semillero}`);
        const querySnapshot = await getDocs(documentosRef);

        const docsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as { nombre: string; url: string; autor: string }),
        }));

        setDocumentos(docsData);
      } catch (error) {
        console.error('Error al cargar documentos:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDocumentos();
  }, [user?.semillero]);

  const eliminarDocumento = async (docId: string, nombreArchivo: string) => {
    const confirmar = confirm('¿Seguro que deseas eliminar este documento?');
    if (!confirmar || !user?.semillero) return;

    try {
      await deleteDoc(doc(db, `Documentos-${user.semillero}`, docId));
      const archivoRef = ref(storage, `documentos/${user.semillero}/${nombreArchivo}`);
      await deleteObject(archivoRef);
      setDocumentos(prev => prev.filter(doc => doc.id !== docId));
      alert('✅ Documento eliminado');
    } catch (error) {
      console.error('Error al eliminar documento:', error);
      alert('❌ Error al eliminar el documento');
    }
  };

  if (loading || !user) return <p className="text-center mt-8">Cargando documentos...</p>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Documentos de {user.semillero}</h1>

      {documentos.length === 0 ? (
        <p className="text-center">No hay documentos subidos aún.</p>
      ) : (
        <ul className="space-y-4">
          {documentos.map((doc) => (
            <li
              key={doc.id}
              className="flex flex-col sm:flex-row items-center justify-between bg-gray-100 p-4 rounded shadow"
            >
              <span className="mb-2 sm:mb-0">{doc.nombre}</span>
              <div className="flex gap-2">
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  Descargar
                </a>

                {doc.autor === user.nombre && (
                  <button
                    onClick={() => eliminarDocumento(doc.id, doc.nombre)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
