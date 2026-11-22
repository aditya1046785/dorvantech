"""Private HTTP adapter for a local ClamAV daemon.

Run behind an HTTPS reverse proxy. Keep clamd and this adapter private.
The website sends a PDF to /scan with Authorization: Bearer RESUME_SCAN_TOKEN.
"""
import hmac
import json
import os
import socket
import struct
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

MAX_BYTES = 5 * 1024 * 1024
TOKEN = os.environ.get("RESUME_SCAN_TOKEN", "")


class Scanner(BaseHTTPRequestHandler):
    def log_message(self, *_args):
        pass  # Never log applicant filenames or document contents.

    def respond(self, status, body):
        encoded = json.dumps(body).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(encoded)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(encoded)

    def do_POST(self):
        self.connection.settimeout(35)
        if self.path != "/scan":
            self.respond(404, {"error": "Not found"})
            return
        authorization = self.headers.get("Authorization", "")
        if not hmac.compare_digest(authorization.encode(), ("Bearer " + TOKEN).encode()):
            self.respond(401, {"error": "Unauthorized"})
            return
        if self.headers.get("Content-Type", "").split(";")[0] != "application/pdf":
            self.respond(415, {"error": "PDF required"})
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if not 0 < length <= MAX_BYTES:
                self.respond(413, {"error": "Invalid document size"})
                return
            body = self.rfile.read(length)
            if len(body) != length:
                raise ValueError("Incomplete document")
            with socket.create_connection(
                (os.environ.get("CLAMD_HOST", "127.0.0.1"), int(os.environ.get("CLAMD_PORT", "3310"))),
                timeout=25,
            ) as daemon:
                daemon.sendall(b"zINSTREAM\0")
                for offset in range(0, len(body), 65536):
                    chunk = body[offset : offset + 65536]
                    daemon.sendall(struct.pack("!I", len(chunk)) + chunk)
                daemon.sendall(struct.pack("!I", 0))
                result = b""
                while not result.endswith(b"\0") and len(result) < 4096:
                    chunk = daemon.recv(1024)
                    if not chunk:
                        break
                    result += chunk
                if result == b"stream: OK\0":
                    self.respond(200, {"clean": True})
                elif result.endswith(b" FOUND\0"):
                    self.respond(200, {"clean": False})
                else:
                    self.respond(503, {"error": "Scan unavailable"})
        except (OSError, ValueError):
            self.respond(503, {"error": "Scan unavailable"})


if __name__ == "__main__":
    if len(TOKEN) < 32:
        raise SystemExit("Set RESUME_SCAN_TOKEN to a random secret of at least 32 characters.")
    ThreadingHTTPServer(
        (os.environ.get("SCANNER_BIND", "127.0.0.1"), int(os.environ.get("SCANNER_PORT", "8091"))),
        Scanner,
    ).serve_forever()
