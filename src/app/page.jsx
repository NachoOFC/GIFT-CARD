import { redirect } from 'next/navigation';

export default function Page() {
  // Redirige la raíz a la página de login para que sea lo primero que vea el usuario
  redirect('/login');
}
