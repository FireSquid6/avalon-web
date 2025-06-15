import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

export const Route = createFileRoute("/auth")({
  component: AuthPage,
})

async function signIn(email: string, password: string) {
  // TODO: Implement sign in logic
  console.log("Sign in:", { email, password })
}

async function signUp(username: string, email: string, password: string) {
  // TODO: Implement sign up logic
  console.log("Sign up:", { username, email, password })
}

function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSignUp) {
      await signUp(username, email, password)
    } else {
      await signIn(email, password)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center mb-6">
            {isSignUp ? "Sign Up" : "Sign In"}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Username</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter your username"
                  className="input input-bordered"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            )}
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className="input input-bordered"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                className="input input-bordered"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="form-control mt-6">
              <button type="submit" className="btn btn-primary">
                {isSignUp ? "Sign Up" : "Sign In"}
              </button>
            </div>
          </form>
          
          <div className="divider">OR</div>
          
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  )
}