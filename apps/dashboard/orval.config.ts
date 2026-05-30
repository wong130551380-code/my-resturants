import { defineConfig } from "orval";

export default defineConfig({
  restaurantApi: {
    input: {
      target: "../../services/backend/openapi.json",
    },
    output: {
      target: "./src/api/generated",
      client: "react-query",
      mode: "tags-split",
      mock: false,
      clean: true,
      override: {
        mutator: {
          path: "./src/api/custom-instance.ts",
          name: "customInstance",
        },
        query: {
          useQuery: true,
          useMutation: true,
        },
      },
    },
  },
});
