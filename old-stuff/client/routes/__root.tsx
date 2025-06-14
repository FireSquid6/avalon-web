import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Header } from '../components/header'
import { Footer } from '../components/footer'

export const Route = createRootRoute({
  component: () => (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="m-4 flex-1">
        <Outlet />
      </main>
      <Footer />
      <TanStackRouterDevtools />
    </div>
  ),
})
