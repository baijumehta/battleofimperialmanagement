export function str(fd: FormData, key: string) {
  return String(fd.get(key) ?? "").trim();
}

export function num(fd: FormData, key: string, fallback = 0) {
  const n = Number(str(fd, key));
  return Number.isFinite(n) ? n : fallback;
}

export function optId(fd: FormData, key: string) {
  const v = str(fd, key);
  return v ? Number(v) : null;
}

export function bool(fd: FormData, key: string) {
  return fd.get(key) === "on" || fd.get(key) === "true";
}
