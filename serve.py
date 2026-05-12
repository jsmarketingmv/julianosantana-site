#!/usr/bin/env python3
import os, http.server, socketserver

port = int(os.environ.get('PORT', 3456))
dir  = os.path.dirname(os.path.abspath(__file__))

handler = http.server.SimpleHTTPRequestHandler
handler.extensions_map.update({'.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript'})

os.chdir(dir)
with socketserver.TCPServer(('', port), handler) as httpd:
    print(f'Serving on http://localhost:{port}')
    httpd.serve_forever()
