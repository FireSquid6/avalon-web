import { createFileRoute } from "@tanstack/react-router"
import { usePushError, usePushMessage } from "../lib/errors";
import { useState } from "react";
import { treaty } from "../lib/treaty";

export const Route = createFileRoute("/forgot")({
  component: ForgotPage,
})

function ForgotPage() {
  const navigate = Route.useNavigate();
  const pushError = usePushError();
  const pushMessage = usePushMessage();
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState(false);


  const handleSubmit = async () => {
    setLoading(true);

    const { data, error } = await treaty.api.forgotpassword.post({
      email,
    });

    if (error) {
      pushError(new Error(`Error resetting password: ${error.status} - ${error.value}`));
    } else {
      pushMessage(data);
      navigate({
        to: "/auth",
      });
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center mb-6">
            Reset Password
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">

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

            <div className="form-control mt-6">
              <button
                type="button"
                className="btn btn-primary"
                disabled={loading}
                onClick={handleSubmit}
              >
                Send Rest Email
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
