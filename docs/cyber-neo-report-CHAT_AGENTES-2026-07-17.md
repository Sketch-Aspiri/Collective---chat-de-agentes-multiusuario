# 🛡️ Cyber Neo — Security Audit Report

**Project:** CHAT_AGENTES (agentes-chat)
**Scan date:** 2026-07-17
**Scope:** DevOps sprint changes (`main...staging-devops`) + project-wide config/infra
**Scanner:** Cyber Neo (Claude-native; npm audit + bundled secret/lockfile scanners)

---

## 1. Executive Summary

| | |
|---|---|
| **Risk Score** | **6 / 100 — Low Risk** |
| Critical | 0 |
| High | 0 |
| Medium | 1 |
| Low | 3 |
| Info | 3 |

**Overall:** The DevOps changes are solid from a security standpoint. No leaked secrets, no vulnerable dependencies, no injection vectors, and several controls were *added* this sprint (CORS lockdown, log redaction, rate limiting, security headers). The only real hardening gap is that **Docker containers run as root**.

### Top 3 priority actions
1. **Add a non-root `USER` to both Dockerfiles** (CN-001) — containers currently run as root.
2. **Add explicit least-privilege `permissions:` to GitHub Actions workflows** (CN-002).
3. **Apply the server-level security headers inside the nginx `/assets/` location** (CN-004) — they're currently dropped there.

---

## 2. Medium Findings

### CN-001 — Container images run as root
- **Severity:** Medium
- **CWE:** CWE-250 (Execution with Unnecessary Privileges)
- **OWASP:** A05:2025 — Security Misconfiguration
- **File:** `infra/docker/Dockerfile.backend`, `infra/docker/Dockerfile.frontend`
- **Description:** No `USER` directive in any stage, so the app (and the Vite dev server / node process) runs as UID 0. A container-escape or RCE in the app then starts with root inside the container.
- **Evidence:** `FROM node:20-alpine AS development` … `CMD ["npm","run","dev"]` — no `USER` before `CMD`.
- **Remediation:**
  ```dockerfile
  # backend development & production stages, before CMD:
  RUN addgroup -S app && adduser -S app -G app && chown -R app:app /app
  USER app
  ```
  The `node:*-alpine` images already ship a `node` user you can reuse: `USER node`.

---

## 3. Low Findings

### CN-002 — GitHub Actions workflows have no explicit `permissions`
- **Severity:** Low
- **CWE:** CWE-1220 (Insufficient Granularity of Access Control)
- **OWASP:** A05:2025
- **File:** `.github/workflows/ci.yml`, `build.yml`, `format.yml`
- **Description:** Without a `permissions:` block the jobs inherit the repo-default `GITHUB_TOKEN` scope, which can be broader than needed (write on some repo settings). Principle of least privilege for CI tokens.
- **Remediation:** Add at the top of each workflow:
  ```yaml
  permissions:
    contents: read
  ```

### CN-003 — Third-party actions pinned to mutable tags, not commit SHA
- **Severity:** Low
- **CWE:** CWE-829 (Inclusion of Functionality from Untrusted Control Sphere)
- **OWASP:** A08:2025 — Software & Data Integrity Failures
- **File:** `.github/workflows/build.yml` (`docker/build-push-action@v6`, `docker/setup-buildx-action@v3`), and existing `actions/*@v4`
- **Description:** Tags are mutable; a compromised action release could run in CI. SHA-pinning is the supply-chain best practice.
- **Remediation:** Pin to full commit SHA, e.g. `uses: docker/build-push-action@<40-char-sha> # v6.x`. (First-party `actions/*` is lower risk; third-party actions are the priority.)

### CN-004 — nginx drops security headers inside `/assets/`
- **Severity:** Low
- **CWE:** CWE-693 (Protection Mechanism Failure)
- **OWASP:** A05:2025
- **File:** `infra/docker/nginx.conf:36`
- **Description:** nginx `add_header` in a nested block **replaces** inherited headers. Because `/assets/` declares its own `add_header Cache-Control`, the server-level `X-Frame-Options`/`X-Content-Type-Options`/`Referrer-Policy` are **not** emitted for static-asset responses.
- **Remediation:** Repeat the security `add_header` lines inside the `/assets/` block, or move them into an `include` snippet referenced by each `location`.

---

## 4. Informational

### CN-005 — Weak default secrets in `docker-compose.yml`
- **Severity:** Info
- **File:** `docker-compose.yml` (`JWT_SECRET:-dev-secret-change-me`, `ENCRYPTION_KEY:-dev-encryption-key-32-bytes-min`)
- **Note:** These defaults apply only when the env var is unset (local dev). Ensure staging/prod always inject real secrets and never rely on the fallback. Acceptable for local development.

### CN-006 — Local `.env` files contain default dev credentials
- **Severity:** Info (not leaked)
- **Note:** `.env`, `backend/.env`, `frontend/.env` exist on disk with `postgres:postgres` / `change-me`. **All are `.gitignore`d and untracked** — verified with `git ls-files` and `git check-ignore`. Only `*.env.example` placeholders are committed. No action required beyond keeping them untracked.

### CN-007 — Placeholder connection string in `README.md`
- **Severity:** Info (false positive)
- **File:** `README.md:66` — `postgresql://user:password@localhost:5432/agentes_chat`
- **Note:** Documentation placeholder, not a real credential. Flagged by the pattern scanner; safe.

---

## 5. Dependency Vulnerabilities (SCA)

| Scanner | Result |
|---|---|
| `npm audit` (workspaces: root + backend + frontend) | **0 vulnerabilities** (info/low/moderate/high/critical all 0) |
| Lockfile integrity (`check_lockfiles.py`) | **OK** — `package-lock.json` present & committed, no issues |

> `trivy` / `semgrep` / `gitleaks` / `pip-audit` were not installed. For deeper CVE coverage, `trivy fs .` is recommended in CI.

---

## 6. Supply Chain & CI/CD Assessment

- **Lock file:** committed, integrity clean. ✅
- **Dependency pinning:** npm ranges use `^` (standard); lockfile enforces exact resolution. ✅
- **CI/CD triggers:** No `pull_request_target`; no `${{ github.event.* }}` interpolation inside `run:` blocks → **no script-injection risk**. ✅
- **Secrets in CI:** tests use dummy values in `ci.yml`; no secret echoed. ✅
- **Gaps:** missing explicit `permissions:` (CN-002); actions not SHA-pinned (CN-003).

---

## 7. Positive Controls Observed (added/confirmed this sprint)

- CORS restricted to `FRONTEND_URL` in **both** Express and Socket.io (no wildcard / origin reflection).
- Winston logger **redacts** sensitive keys (tokens, passwords, API keys) before output.
- Rate limiting: app-level (Redis, 100 req/min) + nginx `limit_req` at the edge.
- `helmet()` enabled; `x-powered-by` disabled; nginx `server_tokens off`.
- Environment validated at startup with Zod (fail-fast on missing secrets).
- ORM (Prisma) used throughout — no string-concatenated SQL. No `eval`/`exec`/dynamic `Function`.
- API keys stored AES-256 encrypted (per project design).

---

## 8. Scan Metadata

| | |
|---|---|
| Files in scope (excl. deps) | 217 |
| Tier | Small — full scan |
| Phases run | Recon, SCA, SAST, Secrets, Config/Infra, Supply-chain/CI-CD |
| External tools used | `npm audit`, bundled `scan_secrets.py`, `check_lockfiles.py` |
| External tools absent | semgrep, trivy, gitleaks, pip-audit |
| Coverage | ~100% of changed + config/infra surface |

> Re-run after applying CN-001…CN-004, ideally with `trivy` + `semgrep` wired into CI for continuous coverage.
