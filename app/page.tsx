import Layout from "@/components/layout/Layout";
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Home() {

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        redirect('/login');
    }


  return (
    <Layout title="Home">
      <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
    
      </div>
    </Layout>

  );
}
