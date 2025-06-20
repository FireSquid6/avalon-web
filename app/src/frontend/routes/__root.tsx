import { createRootRoute, Outlet } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import { Header } from "../components/Header"
import { Footer } from "../components/Footer"
import { ErrorToast } from "../components/ErrorToast"

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <Footer />
      <ErrorToast />
      <TanStackRouterDevtools />
    </div>
  ),
})
