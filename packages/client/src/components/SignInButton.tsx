import { Link } from "@tanstack/react-router";
import { useAuth } from "../lib/hooks";

export function SignInButton() {
  const authState = useAuth();

  if (authState.type === "unauthenticated") {
    return (
      <Link to="/auth" className="btn btn-primary">
        Sign In
      </Link>
    )
  }

  return (
    <Link to="/" className="btn btn-primary">
      {authState.username}'s Profile
    </Link>
  )

}
