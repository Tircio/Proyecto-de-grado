'use client';

import { useParams } from 'next/navigation';
import ChatSemillero from '@/components/ChatSemillero';

export default function SemilleroChatPage() {
  const params = useParams();
  const semillero = params.semillero as string;

  return (
    <div>
      <ChatSemillero semillero={semillero} />
    </div>
  );
}
