"use client";

import { useEffect, useState } from "react";
import { getFirestore, collection, query, orderBy, onSnapshot, addDoc, Timestamp } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db, app } from "@/lib/firebase";

interface Mensaje {
  id: string;
  texto: string;
  autor: string;
  timestamp: Timestamp;
}

interface ChatSemilleroProps {
  semillero: string;
}

export default function ChatSemillero({ semillero }: ChatSemilleroProps) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [autor, setAutor] = useState<string>("");

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribeAuth = onAuthStateChanged(auth, (usuario) => {
      if (usuario) {
        setAutor(usuario.email || "");
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!semillero) return;

    const mensajesRef = collection(db, "chats", semillero, "mensajes");
    const q = query(mensajesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const nuevosMensajes: Mensaje[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Mensaje, "id">),
      }));
      setMensajes(nuevosMensajes);
    });

    return () => unsubscribe();
  }, [semillero]);

  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim()) return;

    const mensajesRef = collection(db, "chats", semillero, "mensajes");
    await addDoc(mensajesRef, {
      texto: nuevoMensaje,
      autor,
      timestamp: Timestamp.now(),
    });
    setNuevoMensaje("");
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 bg-white rounded shadow p-4">
      <h2 className="text-xl font-semibold mb-4 text-blue-800">Chat del Semillero</h2>
      <div className="space-y-2 h-64 overflow-y-auto border p-2 mb-4">
        {mensajes.map((msg) => (
          <div
            key={msg.id}
            className={`p-2 rounded-lg max-w-xs break-words ${msg.autor === autor ? "bg-blue-100 ml-auto text-right" : "bg-gray-200"}`}
          >
            <p className="text-sm">{msg.texto}</p>
            <p className="text-xs text-gray-500">
              {msg.autor} • {msg.timestamp.toDate().toLocaleString()}
            </p>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={nuevoMensaje}
          onChange={(e) => setNuevoMensaje(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 border rounded px-3 py-2"
        />
        <button
          onClick={enviarMensaje}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
