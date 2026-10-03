# Times Tables Practice App

A touch-friendly multiplication practice app. It uses plain HTML, CSS, and
JavaScript, and stores no practice results or preferences.

## Run locally

Serve this folder over HTTP, for example:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000`. Service workers require HTTPS when hosted
online (localhost is also supported). After the first successful load, the
app shell is cached so it can be reopened offline.