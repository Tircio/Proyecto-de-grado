'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { motion } from 'framer-motion';
import {
  PlusCircle,
  CalendarDays,
  Users2,
  BookOpenCheck,
  LogOut,
  MessageCircle, // 👉 se añadió este ícono
} from 'lucide-react';

export default function ProfesorPanel() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const { getFirestore, doc, getDoc } = await import('firebase/firestore');
        const db = getFirestore(app);
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            semillero: userData.semillero || '',
          });
        } else {
          console.warn('El documento del usuario no existe.');
          router.push('/');
        }
      } else {
        router.push('/');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut(getAuth(app));
      router.push('/');
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-8">
      <motion.h1
        className="text-3xl font-bold text-center text-blue-900 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Panel del Profesor
      </motion.h1>

      <motion.div
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card
          title="Crear Evento"
          icon={<CalendarDays className="w-8 h-8 text-white" />}
          onClick={() => handleNavigate('/profesor/crear-evento')}
        />
        <Card
          title="Crear Publicación"
          icon={<PlusCircle className="w-8 h-8 text-white" />}
          onClick={() => handleNavigate('/profesor/publicaciones/crear')}
        />
        <Card
          title="Ver Publicaciones"
          icon={<BookOpenCheck className="w-8 h-8 text-white" />}
          onClick={() => handleNavigate('/profesor/publicaciones')}
        />
        <Card
          title="Información del semillero"
          icon={<Users2 className="w-8 h-8 text-white" />}
          onClick={() => handleNavigate('/profesor/semillero')}
        />
        <Card
          title="Chat del Semillero"
          icon={<MessageCircle className="w-8 h-8 text-white" />} // 👉 Botón de chat
          onClick={() => handleNavigate('/profesor/chat')}
        />
        <Card
          title={loading ? 'Cerrando...' : 'Cerrar sesión'}
          icon={<LogOut className="w-8 h-8 text-white" />}
          onClick={handleLogout}
          bg="bg-red-600 hover:bg-red-700"
        />
      </motion.div>
    </div>
  );
}

function Card({
  title,
  icon,
  onClick,
  bg = 'bg-blue-600 hover:bg-blue-700',
}: {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  bg?: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`cursor-pointer ${bg} text-white rounded-xl shadow-md p-6 flex items-center justify-between transition-all`}
    >
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      {icon}
    </motion.div>
  );
}
