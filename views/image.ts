import { Req } from "../server/server";

const preset = "pr:sharp"

let allowedDomains = process?.env?.ALLOWED_REMOTE_DOMAINS?.split(",") || ["*"];
let imgproxyUrl = process?.env?.IMGPROXY_URL || "http://imgproxy:8080";
if (process.env.NODE_ENV === "development") {
    imgproxyUrl = "http://localhost:8888"
}
allowedDomains = allowedDomains.map(d => d.trim());

console.log("Allowed domains", allowedDomains)
console.log("Imgproxy URL", imgproxyUrl)


function isAllowedDomain(url: string) {
    if (allowedDomains.includes("*")) {
        return true;
    }
    const domain = new URL(url).hostname;
    return allowedDomains.includes(domain);
}

export default async function(req: Req) {
    const url = decodeURIComponent(req.query.get("u") || "").trim()
    if (!url) {
        return new Response("URL not provided", { status: 400 })
    }
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        return new Response("Invalid URL", { status: 400 })
    }
    if (!isAllowedDomain(url)) {
        return new Response("Domain not allowed", { status: 403 })
    }
    console.log("URL", url)
    const width = req.query.get("width") || 0;
    const height = req.query.get("height") || 0;
    const quality = req.query.get("quality") || 75;
    try {
        const proxyURL = `${imgproxyUrl}/${preset}/resize:fill:${width}:${height}/q:${quality}/plain/${url}`
        const image = await fetch(proxyURL, {
            headers: {
                ...Object.fromEntries(req.headers),
            }
        })
        const headers = new Headers(image.headers);
        headers.set("Server", "Blogkit Image Proxy")
        return new Response(image.body, {
            headers
        })
    } catch (e) {
        console.log(e)
        return new Response("Error resizing image")
    }
}
