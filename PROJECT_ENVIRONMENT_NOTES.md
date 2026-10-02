# OnoForge Project Environment Notes

## Local Development Environment

**Permanent environment constraint:** Python is NOT installed on the Windows computer used for OnoForge local testing.

Do not instruct the user to use:
- `python ...`
- `py ...`
- `python3 ...`

for local OnoForge server setup or tooling unless the user explicitly confirms that Python has since been installed.

This has been verified repeatedly during project work, including the 2026-10-02 local-server troubleshooting session. Both `py -m http.server ...` and `python -m http.server ...` were confirmed unavailable.

The existing local OnoForge HTTP server on port 8000 is an established working environment. When local serving is needed, first work with the existing server/process and determine its serving directory rather than assuming Python is available.

This note is an environment fact for future OnoForge chats and handoffs. It is not an application-code requirement.
