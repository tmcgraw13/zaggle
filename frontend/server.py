import http.server
import socketserver
import os

PORT = 8080
DIRECTORY = "/app"

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.path = '/zaggle.html'
        return http.server.SimpleHTTPRequestHandler.do_GET(self)

    def list_directory(self, path):
        self.send_error(403, "Directory listing is forbidden")
        return None

os.chdir(DIRECTORY)

Handler = CustomHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving HTTP on port {PORT}")
    httpd.serve_forever()
