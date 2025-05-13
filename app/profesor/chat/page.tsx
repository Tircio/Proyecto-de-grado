'use client'

import { useEffect, useState } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { db } from '@/lib/firebase'
import ChatSemillero from '@/components/ChatSemillero'
import { collection, getDocs, query, where } from 'firebase/firestore'

export default function ChatProfesorPage() {
  const [semillero, setSemillero] = useState<string | null>(null)

  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const q = query(collection(db, 'users'), where('uid', '==', user.uid))
        const snap = await getDocs(q)
        const data = snap.docs[0]?.data()
        setSemillero(data?.semillero || null)
      }
    })
    return () => unsubscribe()
  }, [])

  if (!semillero) {
    return <p className="text-center mt-10">Cargando semillero...</p>
  }

  return <ChatSemillero semillero={semillero} />
}
