'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { app } from '@/lib/firebase';
import CrearPublicacion from '@/components/CrearPublicacion';

export default function CrearPublicacionPage() {
  const router = useRouter();
  const [semillero, setSemillero] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const db = getFirestore(app);
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setSemillero(data.semillero || '');
        } else {
          router.push('/');
        }
      } else {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (semillero === null) return <p className="text-center mt-10">Cargando...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto mt-10">
      <CrearPublicacion
        semillero={semillero}
        onPublicacionCreada={() => {
          alert('Publicación creada con éxito');
          router.push('/profesor');
        }}
      />
    </div>
  );
}
