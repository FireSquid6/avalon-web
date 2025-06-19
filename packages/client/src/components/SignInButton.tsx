import { Link } from "@tanstack/react-router";
import { useAuth } from "../lib/hooks";

export function SignInButton() {
  const { state } = useAuth();

  if (state.type === "unauthenticated") {
    return (
      <Link to="/auth" className="btn btn-primary">
        Sign In
      </Link>
    )
  }

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-primary">
        {state.username}
      </div>
      <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
        <li>
          <Link to="/" className="justify-start">
            My Profile
          </Link>
        </li>
        <li>
          <Link to="/" className="justify-start">
            My Games
          </Link>
        </li>
        <li>
          <Link to="/signout" className="justify-start">
            Sign Out
          </Link>
        </li>
      </ul>
    </div>
  )

}
