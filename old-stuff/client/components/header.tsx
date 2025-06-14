import { Link } from "@tanstack/react-router";


export function Header() {
  return (
    <div className="navbar bg-base-200 shadow-md">
      <div className="flex-1">
        <Link to="/" className="text-xl ml-2 font-bold">
          Railgun
        </Link>
      </div>

      <div className="flex flex-row gap-4">
        <div className="hidden md:flex items-center gap-6 mr-4">
          <Link to="/" className="link link-hover">
            Store
          </Link>
          <Link to="/" className="link link-hover">
            My Courses
          </Link>
        </div>
      </div>
    </div>
  )
}




