'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer, Event as RBCEvent } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { parse, startOfWeek, format, getDay } from 'date-fns';
import { es } from 'date-fns/locale/es';
import {
  collection,
  addDoc,
  getDocs,
  Timestamp,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

type Props = {
  semillero: string;
};

const locales = { es };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

type Evento = {
  id?: string;
  title: string;
  start: Date;
  end: Date;
  modalidad?: string;
  enlace?: string;
  lugar?: string;
  cancelado?: boolean;
};

const CalendarioEventos: React.FC<Props> = ({ semillero }) => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [titulo, setTitulo] = useState('');
  const [inicio, setInicio] = useState('');
  const [fin, setFin] = useState('');
  const [modalidad, setModalidad] = useState('');
  const [enlace, setEnlace] = useState('');
  const [lugar, setLugar] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  const obtenerEventos = async () => {
    const q = query(collection(db, 'eventos'), where('semillero', '==', semillero));
    const snapshot = await getDocs(q);
    const data: Evento[] = snapshot.docs.map((doc) => {
      const e = doc.data();
      const isVirtual = e.modalidad === 'virtual';
      const locationInfo = isVirtual ? `\nLink: ${e.enlace}` : `\nLugar: ${e.lugar}`;
      return {
        id: doc.id,
        title: `${e.titulo}${locationInfo}`,
        start: e.fechaInicio.toDate(),
        end: e.fechaFin.toDate(),
        modalidad: e.modalidad,
        enlace: e.enlace,
        lugar: e.lugar,
        cancelado: e.cancelado,
      };
    }).filter(e => !e.cancelado);
    setEventos(data);
  };

  useEffect(() => {
    obtenerEventos();
  }, [semillero]);

  const crearEvento = async () => {
    if (!titulo || !inicio || !fin || !modalidad) {
      setMensaje('Por favor completa todos los campos obligatorios.');
      return;
    }

    try {
      await addDoc(collection(db, 'eventos'), {
        titulo,
        fechaInicio: Timestamp.fromDate(new Date(inicio)),
        fechaFin: Timestamp.fromDate(new Date(fin)),
        fecha: Timestamp.fromDate(new Date(inicio)),
        modalidad,
        enlace: modalidad === 'virtual' ? enlace : '',
        lugar: modalidad === 'presencial' ? lugar : '',
        semillero,
        cancelado: false,
      });

      setTitulo('');
      setInicio('');
      setFin('');
      setModalidad('');
      setEnlace('');
      setLugar('');
      setMensaje('✅ Evento creado correctamente');
      obtenerEventos();
    } catch (error) {
      console.error('Error al crear evento:', error);
      setMensaje('❌ Error al crear evento');
    }
  };

  const handleSelectEvent = (event: RBCEvent) => {
    const seleccionado = eventos.find(
      (e) => e.title === event.title && e.start?.getTime() === event.start?.getTime()
    );
    if (seleccionado) {
      setEventoSeleccionado(seleccionado);
      setMostrarModal(true);
    }
  };

  const guardarCambios = async () => {
    if (!eventoSeleccionado?.id) return;
    try {
      await updateDoc(doc(db, 'eventos', eventoSeleccionado.id), {
        titulo: eventoSeleccionado.title,
        fechaInicio: Timestamp.fromDate(eventoSeleccionado.start),
        fechaFin: Timestamp.fromDate(eventoSeleccionado.end),
        fecha: Timestamp.fromDate(eventoSeleccionado.start),
        modalidad: eventoSeleccionado.modalidad,
        enlace: eventoSeleccionado.enlace,
        lugar: eventoSeleccionado.lugar,
      });
      setMostrarModal(false);
      setMensaje('✅ Evento actualizado');
      obtenerEventos();
    } catch (error) {
      console.error('Error al guardar cambios:', error);
    }
  };

  const cancelarEvento = async () => {
    if (!eventoSeleccionado?.id) return;
    try {
      await deleteDoc(doc(db, 'eventos', eventoSeleccionado.id));
      setMostrarModal(false);
      setMensaje('❌ Evento eliminado');
      obtenerEventos();
    } catch (error) {
      console.error('Error al eliminar evento:', error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Calendario de eventos</h2>

      {mensaje && <div className="mb-4 text-green-600 font-medium">{mensaje}</div>}

      {/* Formulario para crear nuevo evento */}
      <div className="mb-8 border p-4 rounded bg-gray-50 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Crear nuevo evento</h3>

        <input
          type="text"
          placeholder="Título del evento"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="w-full px-3 py-2 mb-2 border rounded"
        />

        <input
          type="datetime-local"
          value={inicio}
          onChange={(e) => setInicio(e.target.value)}
          className="w-full px-3 py-2 mb-2 border rounded"
        />

        <input
          type="datetime-local"
          value={fin}
          onChange={(e) => setFin(e.target.value)}
          className="w-full px-3 py-2 mb-2 border rounded"
        />

        <select
          value={modalidad}
          onChange={(e) => setModalidad(e.target.value)}
          className="w-full px-3 py-2 mb-2 border rounded"
        >
          <option value="">Selecciona modalidad</option>
          <option value="virtual">Virtual</option>
          <option value="presencial">Presencial</option>
        </select>

        {modalidad === 'virtual' && (
          <input
            type="text"
            placeholder="Link de reunión"
            value={enlace}
            onChange={(e) => setEnlace(e.target.value)}
            className="w-full px-3 py-2 mb-2 border rounded"
          />
        )}

        {modalidad === 'presencial' && (
          <input
            type="text"
            placeholder="Lugar del evento"
            value={lugar}
            onChange={(e) => setLugar(e.target.value)}
            className="w-full px-3 py-2 mb-2 border rounded"
          />
        )}

        <button
          onClick={crearEvento}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Crear evento
        </button>
      </div>

      <Calendar
        localizer={localizer}
        events={eventos}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        onSelectEvent={handleSelectEvent}
        messages={{
          next: 'Sig.',
          previous: 'Ant.',
          today: 'Hoy',
          month: 'Mes',
          week: 'Semana',
          day: 'Día',
          agenda: 'Agenda',
          date: 'Fecha',
          time: 'Hora',
          event: 'Evento',
          noEventsInRange: 'No hay eventos en este rango.',
        }}
      />

      {/* Modal de edición */}
      {mostrarModal && eventoSeleccionado && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-[400px] shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Editar evento</h3>
            <input
              type="text"
              value={eventoSeleccionado.title}
              onChange={(e) => setEventoSeleccionado({ ...eventoSeleccionado, title: e.target.value })}
              className="w-full px-3 py-2 mb-2 border rounded"
            />
            <input
              type="datetime-local"
              value={format(eventoSeleccionado.start, 'yyyy-MM-dd\'T\'HH:mm')}
              onChange={(e) => setEventoSeleccionado({ ...eventoSeleccionado, start: new Date(e.target.value) })}
              className="w-full px-3 py-2 mb-2 border rounded"
            />
            <input
              type="datetime-local"
              value={format(eventoSeleccionado.end, 'yyyy-MM-dd\'T\'HH:mm')}
              onChange={(e) => setEventoSeleccionado({ ...eventoSeleccionado, end: new Date(e.target.value) })}
              className="w-full px-3 py-2 mb-2 border rounded"
            />
            <select
              value={eventoSeleccionado.modalidad || ''}
              onChange={(e) => setEventoSeleccionado({ ...eventoSeleccionado, modalidad: e.target.value })}
              className="w-full px-3 py-2 mb-2 border rounded"
            >
              <option value="">Selecciona una opción</option>
              <option value="virtual">Virtual</option>
              <option value="presencial">Presencial</option>
            </select>
            {eventoSeleccionado.modalidad === 'virtual' && (
              <input
                type="text"
                placeholder="Link de reunión"
                value={eventoSeleccionado.enlace || ''}
                onChange={(e) => setEventoSeleccionado({ ...eventoSeleccionado, enlace: e.target.value })}
                className="w-full px-3 py-2 mb-2 border rounded"
              />
            )}
            {eventoSeleccionado.modalidad === 'presencial' && (
              <input
                type="text"
                placeholder="Lugar del evento"
                value={eventoSeleccionado.lugar || ''}
                onChange={(e) => setEventoSeleccionado({ ...eventoSeleccionado, lugar: e.target.value })}
                className="w-full px-3 py-2 mb-2 border rounded"
              />
            )}
            <div className="flex justify-between mt-4">
              <button onClick={guardarCambios} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Guardar
              </button>
              <button onClick={cancelarEvento} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                Eliminar
              </button>
              <button onClick={() => setMostrarModal(false)} className="bg-gray-400 text-white px-4 py-2 rounded">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarioEventos;
