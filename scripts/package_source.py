"""Build a clean, portable source ZIP for the in-app developer download."""
from pathlib import Path
import zipfile
root = Path(__file__).resolve().parents[1]
destination = root / 'public' / 'cognitive-lab-source.zip'
destination.parent.mkdir(exist_ok=True)
excluded = {'node_modules', '.git', '.openai', '.sites-runtime', 'dist', 'test-results', 'playwright-report', '__pycache__'}
with zipfile.ZipFile(destination, 'w', zipfile.ZIP_DEFLATED) as archive:
    for path in sorted(root.rglob('*')):
        rel = path.relative_to(root)
        if not path.is_file() or any(part in excluded for part in rel.parts):
            continue
        if path == destination or path.name.startswith('__qa') or path.name.startswith('__axe') or path.suffix == '.tsbuildinfo':
            continue
        archive.write(path, Path('cognitive-lab') / rel)
print(destination)
