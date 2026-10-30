from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os

os.chdir(Path(__file__).resolve().parent)
class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        routes = ['/', '/solucoes', '/solucoes/design', '/solucoes/motion', '/solucoes/sistemas', '/projetos', '/sobre', '/contato']
        urlpath = self.path.split('?',1)[0].split('#',1)[0].rstrip('/') or '/'
        if urlpath in routes:
            self.path = '/index.html'
        super().do_GET()

if __name__ == '__main__':
    HTTPServer(('127.0.0.1', 3000), Handler).serve_forever()
