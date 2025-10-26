'use client';

import { useEffect, useRef, useState } from 'react';
import api from '@/lib/api';
import VeiculoTable from './VeiculoTable';
import VeiculoForm from './VeiculoForm';
import { getSocket } from '@/lib/websocket';
import EditVeiculoForm from './EditVeiculoForm';

export default function VeiculosModal({ cliente, onClose }: any) {
  const [veiculos, setVeiculos] = useState<any[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [editingVeiculo, setEditingVeiculo] = useState(null);
  const didFetch = useRef(false);

  const loadVeiculos = async () => {
    const res = await api.get(`/clientes/${cliente.id}/veiculos`);
    setVeiculos(res.data);
  };

  useEffect(() => {
     if (didFetch.current) return;   
     didFetch.current = true;
     
    loadVeiculos();
    const socket = getSocket();
    
    // Listener para quando um veículo é criado
    socket.on('veiculoCriado', (v) => {
      if (v.cliente.id === cliente.id) {
        setVeiculos((prev) => [...prev, v]);
      }
    });

    // Listener para quando um veículo é atualizado
    socket.on('veiculoAtualizado', (veiculoAtualizado) => {
      if (veiculoAtualizado.cliente.id === cliente.id) {
        setVeiculos(prev => 
          prev.map(v => v.id === veiculoAtualizado.id ? veiculoAtualizado : v)
        );
      }
    });

    // Listener específico para atualização de lista do cliente
    socket.on('atualizarListaVeiculosCliente', (data) => {
      if (data.clienteId === cliente.id) {
        setVeiculos(prev => 
          prev.map(v => v.id === data.veiculo.id ? data.veiculo : v)
        );
      }
    });

    // Listener para quando um veículo é removido
    socket.on('veiculoRemovido', (veiculoId) => {
      setVeiculos(prev => prev.filter(v => v.id !== veiculoId));
    });

    return () => {
      socket.off('veiculoCriado');
      socket.off('veiculoAtualizado');
      socket.off('atualizarListaVeiculosCliente');
      socket.off('veiculoRemovido');
      socket.disconnect();
    };
  }, [cliente.id]);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white w-[1000px] max-h-[90vh] p-6 rounded-lg shadow-lg flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Veículos de {cliente.nome}
          </h2>
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors"
            onClick={() => setOpenForm(true)}
          >
            Novo Veículo
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          <VeiculoTable veiculos={veiculos} onEdit={setEditingVeiculo} />
        </div>

        <div className="flex justify-end mt-4 pt-4 border-t border-gray-200">
          <button
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg cursor-pointer transition-colors"
            onClick={onClose}
          >
            Fechar
          </button>
        </div>

        {openForm && (
          <VeiculoForm
            clienteId={cliente.id}
            onCreated={() => {
              setOpenForm(false);
              loadVeiculos(); // Força o reload como fallback
            }}
            onClose={() => setOpenForm(false)}
          />
        )}

        {editingVeiculo && (
          <EditVeiculoForm
            veiculo={editingVeiculo}
            onUpdated={() => {
              setEditingVeiculo(null);
              loadVeiculos(); // Força o reload como fallback
            }}
            onClose={() => setEditingVeiculo(null)}
          />
        )}
      </div>
    </div>
  );
}