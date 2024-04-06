

export default async function() {
    const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>BlogKit Image Worker</title>
  </head>
  <body>
    <h1>Blogkit Image Worker</h1>
    <p>Deployed with <a href="https://blogkit.org">Blogkit</a></p>
  </body>
</html>
    `
    return new Response(html, {
        headers: {
            'Content-Type': 'text/html',
        },
    })
}
