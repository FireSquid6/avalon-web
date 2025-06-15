import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { usePushError } from "../lib/errors"
import { login, createUser } from "../lib/auth"

export const Route = createFileRoute("/auth")({
  component: AuthPage,
})

function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const pushError = usePushError();

  const signIn = async (email: string, password: string) => {
    const err = await login(email, password); 

    if (err !== "OK") {
      pushError(err);
      return;
    }

  }

  const signUp = async (username: string, email: string, password: string) => {
    const createErr = await createUser(username, email, password);
    if (createErr !== "OK") {
      pushError(createErr);
      return;
    }

    const signInErr = await login(email, password);
    if (signInErr !== "OK") {
      pushError(signInErr);
      return;
    }

  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSignUp) {
      await signUp(username, email, password)
    } else {
      await signIn(email, password)
    }

    setUsername("");
    setPassword("");
    setEmail("");
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
