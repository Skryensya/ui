import { handle, type Env } from "./handler";

/* The Worker's entry: everything it does is `handle`, which the tests call directly. */
export default {
  fetch(request: Request, env: Env): Promise<Response> {
    return handle(request, env);
  },
};
