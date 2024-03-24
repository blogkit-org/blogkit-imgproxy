import { renderToReadableStream } from "react-dom/server";

function Component(props: { message: string }) {
  return (
    <body>
      <h1>{props.message}</h1>
    </body>
  );
}


export default async function() {
    const stream = await renderToReadableStream(
      <Component message="Hello from server!" />,
    );
    return new Response(stream, {
        headers: {
            "Content-Type": "text/html",
        },
    });
}
