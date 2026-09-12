#!/usr/bin/env python3
"""Export the recovered, unmodified project as a credential-free Qais.zip.

Run: python export_qais.py
Requires only Python's standard library. Does not start any services.
The original project is in project/; this utility is not added to its ZIP.
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
import os
from pathlib import Path, PurePosixPath
import re
import tempfile
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

ROOT = Path(__file__).resolve().parent
SOURCE_DOWNLOAD = "public/downloads/app12-source.zip"
SKIP_DIRS = {".git", "node_modules", "dist", ".vercel", ".cache", "__pycache__"}
SECRET_NAMES = {".npmrc", ".pypirc", ".netrc", "credentials.json", "service-account.json",
                "id_rsa", "id_dsa", "id_ecdsa", "id_ed25519"}
SECRET_SUFFIXES = {".key", ".pem", ".p12", ".pfx", ".keystore", ".jks"}
SENSITIVE_FIELD = re.compile(
    r"(?i)(?:api[_-]?key|secret|password|passwd|credential|private[_-]?key|"
    r"access[_-]?token|auth[_-]?token|service[_-]?role|(?:^|_)token$|(?:^|_)key$)"
)
SECRET_PATTERNS = {
    "private key": rb"-----BEGIN [A-Z ]*PRIVATE KEY-----",
    "provider API key": rb"(?:sk-(?:proj-|ant-)?[A-Za-z0-9_-]{16,}|AIza[0-9A-Za-z_-]{25,}|"
                        rb"(?:AKIA|ASIA)[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{20,}|"
                        rb"github_pat_[A-Za-z0-9_]{20,}|sb_(?:secret|publishable)_[A-Za-z0-9_-]{16,})",
    "JWT": rb"eyJ[A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]{12,}",
    "credential in URL": rb"(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis|https?)://"
                         rb"[^\s/\x22\x27<>:@]+:[^\s/\x22\x27<>@]+@",
    "credential in query": rb"(?i)[?&](?:api[_-]?key|access_token|auth_token|secret|"
                           rb"password|token)=[A-Za-z0-9_%+./=-]{16,}",
    "literal credential": rb'''(?i)["']?(?:api[_-]?key|secret[_-]?key|client[_-]?secret|'''
                          rb'''access[_-]?token|auth[_-]?token|password)["']?\s*[:=]\s*'''
                          rb'''["'][A-Za-z0-9_./+=-]{16,}["']''',
}
REQUIRED = {"package.json", "package-lock.json", "index.html", "vercel.json", "README.md",
            "tsconfig.json", "tsconfig.app.json", "tsconfig.node.json", "vite.config.ts",
            "eslint.config.js", ".vite-source-tags.js", "src/main.tsx", "src/App.tsx",
            "public/favicon.svg"}


def excluded(name: str) -> bool:
    parts = PurePosixPath(name).parts
    return any(
        p.lower() in SKIP_DIRS
        or p.lower() == ".env"
        or p.lower().startswith(".env.")
        or p.lower().startswith(".env_")
        or p.lower().startswith(".env-")
        or p.lower().endswith(".env")
        or p.lower() in SECRET_NAMES
        or PurePosixPath(p).suffix.lower() in SECRET_SUFFIXES
        for p in parts
    )


def scan(name: str, data: bytes, known_secrets: set[bytes], depth: int = 0) -> None:
    """Fail closed on suspect content, including content in nested archives."""
    for label, pattern in SECRET_PATTERNS.items():
        if re.search(pattern, data):
            raise ValueError(f"Refusing to export {name}: detected {label} (value not printed)")
    for value in known_secrets:
        if value in data:
            raise ValueError(f"Refusing to export {name}: contains a removed credential")
    if data.startswith(b"PK\x03\x04"):
        if depth >= 4:
            raise ValueError(f"Too many nested archives: {name}")
        with ZipFile(io.BytesIO(data)) as archive:
            members = archive.infolist()
            if sum(i.file_size for i in members) > 256 * 1024 * 1024:
                raise ValueError(f"Nested archive exceeds safety limit: {name}")
            for item in members:
                p = PurePosixPath(item.filename)
                if p.is_absolute() or ".." in p.parts or "\\" in item.filename:
                    raise ValueError(f"Unsafe path in {name}")
                if excluded(item.filename):
                    raise ValueError(f"Sensitive or excluded file in {name}: {item.filename}")
                if not item.is_dir():
                    scan(f"{name}!{item.filename}", archive.read(item), known_secrets, depth + 1)


def sanitize_vercel(project: Path) -> tuple[list[str], set[bytes]]:
    """Remove credential-valued environment settings, retaining all other config."""
    path = project / "vercel.json"
    config = json.loads(path.read_text(encoding="utf-8"))
    removed: list[str] = []
    known: set[bytes] = set()

    def clean(obj: object, trail: str) -> None:
        if isinstance(obj, dict):
            for key in list(obj):
                value = obj[key]
                if SENSITIVE_FIELD.search(key) and isinstance(value, str) and value:
                    known.add(value.encode())
                    removed.append(f"{trail}{key}")
                    del obj[key]
                else:
                    clean(value, f"{trail}{key}.")
        elif isinstance(obj, list):
            for index, value in enumerate(obj):
                clean(value, f"{trail}{index}.")

    clean(config, "")
    if removed:
        path.write_text(json.dumps(config, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return removed, known


def collect(project: Path) -> dict[str, bytes]:
    files: dict[str, bytes] = {}
    total = 0
    for directory, dirs, names in os.walk(project, followlinks=False):
        base = Path(directory)
        dirs[:] = sorted(d for d in dirs if not excluded((base / d).relative_to(project).as_posix()))
        for d in dirs:
            if (base / d).is_symlink():
                raise ValueError(f"Refusing symlink: {(base / d).relative_to(project)}")
        for filename in sorted(names):
            path = base / filename
            name = path.relative_to(project).as_posix()
            if excluded(name) or name == SOURCE_DOWNLOAD:
                continue
            if path.is_symlink() or not path.is_file():
                raise ValueError(f"Refusing non-regular file: {name}")
            total += path.stat().st_size
            if total > 256 * 1024 * 1024:
                raise ValueError("Project exceeds the 256 MiB export safety limit")
            files[name] = path.read_bytes()
    missing = REQUIRED - files.keys()
    if missing:
        raise ValueError(f"Missing required project files: {', '.join(sorted(missing))}")
    return files


def make_zip(files: dict[str, bytes], prefix: str = "") -> bytes:
    buffer = io.BytesIO()
    with ZipFile(buffer, "w", compression=ZIP_DEFLATED, compresslevel=9) as archive:
        for name, data in sorted(files.items()):
            info = ZipInfo(prefix + name, date_time=(1980, 1, 1, 0, 0, 0))
            info.compress_type = ZIP_DEFLATED
            info.create_system = 3
            info.external_attr = 0o100644 << 16
            archive.writestr(info, data, compress_type=ZIP_DEFLATED, compresslevel=9)
    return buffer.getvalue()


def atomic_write(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(dir=path.parent, prefix=".qais-", delete=False) as handle:
            temporary = Path(handle.name)
            handle.write(data)
        os.replace(temporary, path)
    finally:
        if temporary is not None and temporary.exists():
            temporary.unlink()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project", type=Path, default=ROOT / "project")
    parser.add_argument("--output", type=Path, default=ROOT / "Qais.zip")
    args = parser.parse_args()
    project = args.project.resolve()
    output = args.output.resolve()
    if not project.is_dir():
        raise SystemExit(f"Project directory not found: {project}")
    if output == project or project in output.parents:
        raise SystemExit("Write the export outside the project to avoid archive recursion")

    removed, known = sanitize_vercel(project)
    files = collect(project)
    for name, data in sorted(files.items()):
        scan(name, data, known)

    # Preserve the existing source-download feature without redistributing the
    # original unsafe ZIP. A finite, sanitized snapshot replaces that download.
    nested = make_zip(files, prefix="app12/")
    scan(SOURCE_DOWNLOAD, nested, known)
    atomic_write(project / SOURCE_DOWNLOAD, nested)
    files[SOURCE_DOWNLOAD] = nested
    result = make_zip(files)
    scan(output.name, result, known)
    with ZipFile(io.BytesIO(result)) as archive:
        if archive.testzip() is not None or set(archive.namelist()) != set(files):
            raise ValueError("Archive integrity verification failed")
        for name, original in files.items():
            if archive.read(name) != original:
                raise ValueError(f"Byte-for-byte verification failed for {name}")
    atomic_write(output, result)
    with ZipFile(output) as archive:
        if archive.testzip() is not None:
            raise ValueError("Written archive integrity verification failed")
    print(f"Created {output.name}: {len(files)} project files, {len(result):,} bytes")
    print("Excluded: environment files, credential files, dependencies, build output and caches")
    if removed:
        print("Removed credential settings from vercel.json: " + ", ".join(removed))
    print("Passed: recursive credential scan, ZIP integrity, required-file and byte-for-byte checks")
    print("SHA-256: " + hashlib.sha256(result).hexdigest())


if __name__ == "__main__":
    main()
