import { createFileRoute } from "@tanstack/react-router"
import { usePushError, usePushMessage } from "../lib/errors";
import { useState } from "react";
import { treaty } from "../lib/treaty";

export const Route = createFileRoute("/reset")({
  component: ResetPage,
})

function ResetPage() {
  const query = Route.useSearch() as Record<"code", string | undefined>;
  const navigate = Route.useNavigate();
  const pushError = usePushError();
  const pushMessage = usePushMessage();
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState(false);


  const handleSubmit = async () => {
    if (!query.code) {
      pushError(new Error("No passowrd reset code provided"));
      return;
    }

    setLoading(true);

    const { error } = await treaty.api.passwordreset.post({
      token: query.code,
      newPassword: password,
    });

    if (error) {
      pushError(new Error(`Error resetting password: ${error.status} - ${error.value}`));
    } else {
      pushMessage("Successfully reset password.")
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
          <form onSubmit={handleSubmit} className="space-y-4">

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
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                Reset Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
