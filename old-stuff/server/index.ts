import { api } from "./api"

export function startServer() {
  api.listen(4320, () => {
    console.log("Server started on port 4320");
  });
}
