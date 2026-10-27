#!/usr/bin/env python3
"""Local development server for MyVideoPlayer.

Serves this folder at http://localhost:8000 (or the port given as the first
argument). Unlike `python3 -m http.server`, it answers HTTP Range requests
with 206 Partial Content, which Safari requires before it will play <video>.

Usage: python3 dev-server.py [port]
"""
import os
import re
import sys
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
RANGE_RE = re.compile(r"bytes=(\d*)-(\d*)$")
CHUNK = 64 * 1024


class Handler(SimpleHTTPRequestHandler):
    # Bytes left to send for a Range response; None means send the whole file.
    remaining = None

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        # Always fetch fresh files while developing.
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def send_head(self):
        self.remaining = None
        range_header = self.headers.get("Range")
        path = self.translate_path(self.path)
        if not range_header or not os.path.isfile(path):
            return super().send_head()

        match = RANGE_RE.match(range_header.strip())
        if not match or match.groups() == ("", ""):
            return super().send_head()

        try:
            f = open(path, "rb")
        except OSError:
            self.send_error(HTTPStatus.NOT_FOUND)
            return None

        size = os.fstat(f.fileno()).st_size
        first, last = match.groups()
        if first:
            start = int(first)
            end = min(int(last), size - 1) if last else size - 1
        else:
            # "bytes=-N" asks for the last N bytes.
            start = max(size - int(last), 0)
            end = size - 1

        if start >= size or start > end:
            f.close()
            self.send_response(HTTPStatus.REQUESTED_RANGE_NOT_SATISFIABLE)
            self.send_header("Content-Range", f"bytes */{size}")
            self.send_header("Content-Length", "0")
            self.end_headers()
            return None

        f.seek(start)
        self.remaining = end - start + 1
        self.send_response(HTTPStatus.PARTIAL_CONTENT)
        self.send_header("Content-Type", self.guess_type(path))
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        self.send_header("Content-Length", str(self.remaining))
        self.send_header("Last-Modified", self.date_time_string(os.path.getmtime(path)))
        self.end_headers()
        return f

    def copyfile(self, source, outputfile):
        try:
            if self.remaining is None:
                super().copyfile(source, outputfile)
                return
            while self.remaining > 0:
                chunk = source.read(min(CHUNK, self.remaining))
                if not chunk:
                    break
                outputfile.write(chunk)
                self.remaining -= len(chunk)
        except (BrokenPipeError, ConnectionResetError):
            # Browsers drop video connections mid-stream all the time.
            pass


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    server = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    print(f"Serving {ROOT}")
    print(f"Open http://localhost:{port}  (Ctrl+C to stop)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print()
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
