import CalendarioEventos from '@/components/CalendarioEventos';

export default function CrearEventoPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Crear Evento</h1>
      <CalendarioEventos semillero="SMART" />  {/* Aquí pones el semillero o permites elegirlo */}
    </div>
  );
}
