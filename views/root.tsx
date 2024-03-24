import { renderToReadableStream } from "react-dom/server";

function Component() {
  return (
    <body>
      <h1>BlogKit</h1>
      <a href="https://blogkit.org">BlogKit</a>
    </body>
  );
}


export default async function() {
    const stream = await renderToReadableStream(
      <Component />,
    );
    return new Response(stream, {
        headers: {
            "Content-Type": "text/html",
        },
    });
}
