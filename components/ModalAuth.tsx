'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface ModalAuthProps {
  onClose: () => void;
}

export default function ModalAuth({ onClose }: ModalAuthProps) {
  const [role, setRole] = useState<'estudiante' | 'profesor'>('estudiante');
  const [view, setView] = useState<'login' | 'register'>('login');

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="sr-only">Autenticación</DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Tabs value={role} onValueChange={(v) => setRole(v as 'estudiante' | 'profesor')}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="estudiante">Estudiante</TabsTrigger>
              <TabsTrigger value="profesor">Profesor</TabsTrigger>
            </TabsList>

            <TabsContent value={role}>
              <div className="mb-4 flex justify-center gap-4">
                <button
                  onClick={() => setView('login')}
                  className={`px-4 py-1 rounded ${
                    view === 'login' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                  }`}
                >
                  Iniciar sesión
                </button>
                <button
                  onClick={() => setView('register')}
                  className={`px-4 py-1 rounded ${
                    view === 'register' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                  }`}
                >
                  Registrarme
                </button>
              </div>

              {view === 'login' ? (
                <LoginForm />
              ) : (
                <RegisterForm role={role} />
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
