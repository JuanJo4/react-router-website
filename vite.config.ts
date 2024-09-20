import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig, splitVendorChunkPlugin } from "vite";
import { installGlobals } from "@remix-run/node";
import tsconfigPaths from "vite-tsconfig-paths";

installGlobals({ nativeFetch: true });

declare module "@remix-run/node" {
  // or cloudflare, deno, etc.
  interface Future {
    unstable_singleFetch: true;
  }
}

export default defineConfig({
  ssr: {
    noExternal: ["@docsearch/react"],
  },
  server: {
    port: 3000,
  },
  plugins: [
    splitVendorChunkPlugin(),
    remix({
      future: {
        unstable_singleFetch: true,
      },
      routes(defineRoutes) {
        return defineRoutes((route) => {
          route("/__components", "components/_playground/playground.tsx");
          route("/color-scheme", "actions/color-scheme.ts");

          route("/", "pages/home.tsx", { index: true });
          route("/brand", "pages/brand.tsx");
          route("/healthcheck", "pages/healthcheck.tsx");

          // Pre v7 inline API docs
          route(
            "/en/:ref",
            "pages/guides-layout.tsx",
            { id: "v6-guides" },
            () => {
              route("", "pages/guides-index.tsx", {
                index: true,
                id: "v6-index",
              });
              route("*", "pages/guide.tsx", { id: "v6-guide" });
            }
          );

          route(
            "/:ref?/guides",
            "pages/guides-layout.tsx",
            { id: "guides" },
            () => {
              route("", "pages/guides-index.tsx", { index: true });
              route("*", "pages/guide.tsx");
            }
          );

          // TODO: uncomment after v7
          // route("/:ref?/api", "pages/api-redirect.ts");

          route(
            "/:ref?/api/:pkg",
            "pages/api-layout.tsx",
            { id: "api" },
            () => {
              route("", "pages/api-index.tsx", { index: true });
              route("*", "pages/api-doc.tsx");
            }
          );

          route("/*", "pages/notfound.tsx");
        });
      },
    }),
    tsconfigPaths(),
  ],
});
