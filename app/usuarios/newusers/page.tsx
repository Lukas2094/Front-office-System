import api from '@/lib/api';
import UserForm from '@/components/UserForm/UserForm';
import Image from 'next/image';

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
    <div className="flex min-h-screen">
      {/* Coluna esquerda */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-white px-8 py-12 md:px-16 shadow-2xl relative z-10">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-2">
          Cadastro de Usuário
        </h2>
        <p className="text-gray-500 mb-10 text-center">
          Preencha os dados para criar um novo usuário
        </p>

        <div className="w-full max-w-md">
          <UserForm cargos={cargos} />
        </div>

        {/* <div className="mt-10 text-sm text-gray-500 text-center w-full">
          © {new Date().getFullYear()} OficinaTech — Todos os direitos reservados
        </div> */}
      </div>

      {/* Coluna direita - Logo */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 justify-center items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-yellow-500/5 backdrop-blur-[2px]"></div>
        <div className="text-center z-10">
          <Image
            src="https://i.ibb.co/R4TcWGWz/logo.png"
            alt="Logo Oficina"
            width={180}
            height={180}
            quality={80}
            className="mx-auto mb-6 drop-shadow-lg"
          />
          <h1 className="text-3xl font-bold text-yellow-500 tracking-wide drop-shadow">
            System Office
          </h1>
          <p className="text-gray-300 mt-3">
            Sistema de Gestão de Oficina Mecânica
          </p>
        </div>
      </div>
    </div>
  );
}
