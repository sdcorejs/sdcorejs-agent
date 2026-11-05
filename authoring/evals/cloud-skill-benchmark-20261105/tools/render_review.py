"""Render with pinned upstream skill-creator, then remove unused online assets."""
import argparse
import re
import subprocess
import sys
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('skill_path', type=Path)
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
output = root / 'review.html'
subprocess.run([
    sys.executable, str(args.skill_path / 'eval-viewer/generate_review.py'),
    str(root / 'iteration-1'), '--skill-name', 'sdcorejs-agent-review-followup',
    '--benchmark', str(root / 'iteration-1/benchmark.json'), '--static', str(output)
], check=True)
html = output.read_text()
html, fonts = re.subn(r'<link[^>]+href="https://fonts\.(?:googleapis|gstatic)\.com[^>]*>\s*', '', html)
html, spreadsheets = re.subn(r'<script src="https://cdn\.sheetjs\.com/[^>]*></script>\s*', '', html)
if (fonts, spreadsheets) != (3, 1):
    raise ValueError('Unexpected upstream assets; inspect before adapting')
html = html.replace('<head>', '<head>\n<link rel="icon" href="data:,">', 1)
html = html.replace('paste into Claude Code', 'paste into the Codex conversation')
html = html.replace('runs per configuration', 'runs per eval and configuration')
output.write_text('\n'.join(line.rstrip() for line in html.splitlines()) + '\n')
