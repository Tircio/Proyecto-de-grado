'use client';

import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        console.log('✅ Sesión cerrada');
        router.push('/login');
      })
      .catch((error) => {
        console.error('❌ Error al cerrar sesión:', error);
      });
  };

  return (
    <nav className="bg-[#002147] text-white px-6 py-4 flex justify-between items-center shadow-md sticky top-0 z-50">
      
      {/* Logo + Nombre */}
      <div className="flex items-center gap-4">
        <Image
          src="/universidad-catolica.png"
          alt="Logo Universidad Católica"
          width={40}
          height={40}
        />
        <Link href="/" className="font-bold text-lg hidden sm:block">
          Semilleros - Universidad Católica de Colombia
        </Link>
      </div>

      {/* Menú */}
      <div className="flex gap-6 items-center text-sm">
        <Link href="/estudiante/semillero" className="hover:underline">
          Chat
        </Link>
        <Link href="/estudiante/publicaciones" className="hover:underline">
          Publicaciones
        </Link>
        <Link href="/estudiante/calendario" className="hover:underline">
          Calendario
        </Link>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-700 text-white px-4 py-1 rounded text-sm"
        >
          Cerrar sesión
        </button>
      </div>

    </nav>
  );
}
