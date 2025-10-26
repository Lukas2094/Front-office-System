import api from '@/lib/api';
import UserForm from '@/components/UserForm/UserForm';
import Image from 'next/image';
import { FaUserPlus } from 'react-icons/fa';

export const dynamic = 'force-dynamic';

export default async function NewUserPage() {
  let cargos: any[] = [];
  try {
    const res = await api.get('/cargos');
    cargos = res.data;
  } catch (error) {
    console.error('Erro ao carregar cargos:', error);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-start md:items-center justify-center p-4 py-8 md:py-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row my-auto">
        {/* Coluna Esquerda - Formulário */}
        <div className="w-full md:w-1/2 p-6 md:p-8 lg:p-12 flex flex-col justify-center">
          <div className="text-center mb-6 md:mb-8 w-full max-w-sm mx-auto">
            <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-lg mb-3 md:mb-4">
              <FaUserPlus className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              Cadastro de Usuário
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              Preencha os dados para criar um novo usuário no sistema
            </p>
          </div>

          <div className="w-full max-w-sm mx-auto">
            <UserForm cargos={cargos} />
          </div>
        </div>

        {/* Coluna Direita - Banner */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]"></div>
          <div className="relative z-10 flex flex-col items-center justify-center text-center text-white p-6 lg:p-8 h-full w-full">
            <div className="flex flex-col items-center justify-center h-full max-w-xs">
              <div className="mb-6 lg:mb-8">
                <Image
                  src="https://i.ibb.co/R4TcWGWz/logo.png"
                  alt="Logo Oficina"
                  width={100}
                  height={100}
                  quality={100}
                  className="mx-auto mb-3 lg:mb-4 drop-shadow-xl"
                />
              </div>
              
              <h2 className="text-2xl lg:text-3xl font-bold mb-3 drop-shadow">
                System Office
              </h2>
              <p className="text-blue-100 text-sm lg:text-base mb-6">
                Sistema de gestão para oficinas mecânicas
              </p>
            </div>
          </div>

          {/* Elementos decorativos */}
          <div className="absolute top-0 right-0 w-24 h-24 lg:w-32 lg:h-32 bg-white/10 rounded-full -translate-y-12 lg:-translate-y-16 translate-x-12 lg:translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 lg:w-24 lg:h-24 bg-white/10 rounded-full translate-y-8 lg:translate-y-12 -translate-x-8 lg:-translate-x-12"></div>
          <div className="absolute top-1/2 left-1/4 w-12 h-12 lg:w-16 lg:h-16 bg-white/5 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}