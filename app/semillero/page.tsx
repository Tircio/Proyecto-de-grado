'use client';
import { useParams } from 'next/navigation';

export default function EstudianteSemilleroPage() {
  const params = useParams();
  const semillero = params.semillero;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Semillero {semillero}</h1>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">Chat del Semillero</h2>
        <p>Interacción en tiempo real entre integrantes del semillero.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">Carga de Documentos</h2>
        <p>Sube tus investigaciones y archivos importantes.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">Investigaciones del Semillero</h2>
        <p>Listado de investigaciones compartidas por los miembros.</p>
      </section>
    </div>
  );
}