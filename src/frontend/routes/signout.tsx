import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react';
import { logout } from '../lib/auth';
import { useAuth } from '../lib/hooks';

export const Route = createFileRoute("/signout")({
  component: RouteComponent,
})


function RouteComponent() {
  const navigate = Route.useNavigate();
  const { mutate } = useAuth();
  
  useEffect(() => {
    const fn = async () => {
      const err = await logout();
      if (err !== "OK") {
        // Honestly, if there's an error signing up it is not the user's
        // problem. No need to push it
        //
        // 400 erros are because the user tried to sign out twice (doesn't
        // matter) and 500 errors are a me issue on the server side that is
        // logged there
        console.log(err);
      }
      mutate();

      navigate({
        to: "/auth",
      });
    }
    fn();
  }, [])

  return <div>Signing out...</div>
}
