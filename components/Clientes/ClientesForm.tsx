'use client';

import { useEffect, useState } from 'react';
import ClienteTable from './Clientetable';
import ClienteForm from './FormClient';
import { getSocket } from '@/lib/websocket';
import Layout from '../layout/Layout';

export default function ClientesForm({ initialData }: any) {
  const [clientes, setClientes] = useState(initialData);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    const socket = getSocket();

    const handleClienteCriado = (cliente: any) => {
      setClientes((prev: any) => [...prev, cliente]);
    };

    socket.on('clienteCriado', handleClienteCriado);

    return () => {
      socket.off('clienteCriado', handleClienteCriado);
      socket.disconnect();
    };
  }, []);

  return (
    <>
    <Layout title='Clientes' >

    
      <div className="p-6">
        <div className="flex justify-between mb-4">
          <h1 className="text-2xl font-semibold">Clientes</h1>
          <button
            onClick={() => setOpenModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700 transition"
          >
            Novo Cliente
          </button>
        </div>

        <ClienteTable clientes={clientes} />
        {openModal && (
          <ClienteForm
            onClose={() => setOpenModal(false)}
            onCreated={(novo: any) => setClientes((prev: any) => [...prev, novo])}
          />
        )}
      </div>
    </Layout>
    </>

  );
}
