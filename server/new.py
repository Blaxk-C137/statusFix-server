from pathlib import Path

p = Path("/root/status/server/server.js")
s = p.read_text()

old = 'const ffprobePath = require("ffprobe-static").path;'
new = 'const ffprobePath = "/usr/bin/ffprobe";'

if s.count(old) != 1:
    raise SystemExit("Expected declaration not found exactly once; no changes made.")

p.write_text(s.replace(old, new, 1))

print("FFprobe path updated successfully!")
