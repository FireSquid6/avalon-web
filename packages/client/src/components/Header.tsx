import { Link } from "@tanstack/react-router"

export function Header() {
  return (
    <header className="navbar bg-base-100 shadow-lg">
      <div className="navbar-start">
        <Link to="/" className="btn btn-ghost text-xl font-bold">
          Play
        </Link>
      </div>
      <div className="navbar-end">
        <Link to="/auth" className="btn btn-primary">
          Sign In
        </Link>
      </div>
    </header>
  )
}