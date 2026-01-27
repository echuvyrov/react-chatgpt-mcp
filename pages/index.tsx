import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>React ChatGPT MCP</title>
      </Head>
      <main style={{ fontFamily: "ui-sans-serif, system-ui" }}>
        <h1>React ChatGPT MCP</h1>
        <p>
          The MCP server is available at <code>/mcp</code> once deployed.
        </p>
        <p>
          Build the widget with <code>npm run build:widget</code> before
          starting the server.
        </p>
      </main>
    </>
  );
}
