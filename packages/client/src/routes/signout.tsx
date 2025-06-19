import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react';
import { logout } from '../lib/auth';
import { usePushError } from '../lib/errors';
import { useAuth } from '../lib/hooks';

export const Route = createFileRoute("/signout")({
  component: RouteComponent,
})


function RouteComponent() {
  const navigate = Route.useNavigate();
  const pushError = usePushError();
  const { mutate } = useAuth();
  
  useEffect(() => {
    const fn = async () => {
      const err = await logout();
      if (err !== "OK") {
        pushError(err);
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
