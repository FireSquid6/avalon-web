import { Link } from "@tanstack/react-router"
import { SignInButton } from "./SignInButton"

export function Header() {
  return (
    <header className="navbar bg-base-100 shadow-lg">
      <div className="navbar-start">
        <Link to="/" className="btn btn-ghost text-xl font-bold">
          Play
        </Link>
      </div>
      <div className="navbar-end">
        <SignInButton />
      </div>
    </header>
  )
}
