import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { usePushError } from "../lib/errors"
import { login, createUser } from "../lib/auth"
import { useAuth } from "../lib/hooks"

export const Route = createFileRoute("/auth")({
  component: AuthPage,
})

function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false);
  const pushError = usePushError();
  const { mutate } = useAuth();
  const navigate = Route.useNavigate();

  const signIn = async (email: string, password: string): Promise<"OK" | "Bad"> => {
    const err = await login(email, password); 

    if (err !== "OK") {
      pushError(err);
      return "Bad";
    }

    return "OK";
  }

  const signUp = async (username: string, email: string, password: string): Promise<"OK" | "Bad"> => {
    const createErr = await createUser(username, email, password);
    if (createErr !== "OK") {
      pushError(createErr);
      return "Bad";
    }

    const signInErr = await login(email, password);
    if (signInErr !== "OK") {
      pushError(signInErr);
      return "Bad";
    }

    return "OK"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true);
    
    let status: "OK" | "Bad" = "Bad";
    if (isSignUp) {
      status = await signUp(username, email, password)
    } else {
      status = await signIn(email, password)
    }

    if (status === "OK") {
      mutate();
      navigate({
        to: "/",
      });
    }

    setUsername("");
    setPassword("");
    setEmail("");
    setLoading(false);
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
            disabled={loading}
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
          </button>
          <button className="mt-8 text-primary font-semibold">
            Forgot Password?
          </button>
        </div>
      </div>
    </div>
  )
}
