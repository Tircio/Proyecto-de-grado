'use client';

import { useState, useEffect } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, app } from '@/lib/firebase';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export default function DocumentosEstudiantePage() {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [mensaje, setMensaje] = useState('');
  const [userData, setUserData] = useState<{ semillero: string; nombre: string } | null>(null);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDoc = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userDoc);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserData({
            semillero: data.semillero,
            nombre: data.nombre || '',
          });
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const subirDocumento = async () => {
    if (!archivo || !userData?.semillero) {
      setMensaje('⚠️ Falta archivo o semillero.');
      return;
    }

    try {
      const storageRef = ref(storage, `documentos/${userData.semillero}/${archivo.name}`);
      await uploadBytes(storageRef, archivo);

      const url = await getDownloadURL(storageRef);

      await addDoc(collection(db, `Documentos-${userData.semillero}`), {
        nombre: archivo.name,
        url,
        autor: userData.nombre,
        fecha: new Date().toISOString(),
      });

      setMensaje('✅ Documento subido exitosamente.');
      setArchivo(null);
    } catch (error) {
      console.error('❌ Error al subir:', error);
      setMensaje('❌ Error al subir el documento.');
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Subir Documento {userData?.semillero && `- ${userData.semillero}`}
      </h1>

      <input
        type="file"
        onChange={(e) => setArchivo(e.target.files?.[0] || null)}
        className="mb-4"
      />

      <button
        onClick={subirDocumento}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
      >
        Subir Documento
      </button>

      {mensaje && <p className="mt-4 text-center">{mensaje}</p>}
    </div>
  );
}
