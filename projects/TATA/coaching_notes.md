# Coaching notes

## Linux CLI & Build Agent Management

- Build Agent (or Runner) = Linux machine/container waiting for instructions
- Permissions & Ownership
    - `chmod`changes what can be done (Read, Write, Execute)
        - -rw-r--r--: User rw; Group r; Others r 
    - `chown`Changes who owns the file
- Process Management & Troubleshooting
    - `top`or `htop`task manager
    - `ps aux`: Snapshot of every single process running; `a` all users; `u` display the user/owner; `x` process not attached to a terminal (background tasks)
    - `ps aux | grep <name>` Find specific process by name
    - `kill -9 <PID>` Forces process PID to stop immediately (always run `kil <PID>` first!)
    - `kill <PID>` Asks the process PID to stop.
- Networking
    - IPv4 - loopback: 127.0.0.0 - 127.255.255.255 (>16mio addresses)
    - IPv6 - loopback: ::1 (1x address)
    - Big Three
        - `nslookup` / `dig` DNS resolution
        - `ss -tuln` Socket statistics (check privacy; find conflict; verify App)
        - `curl -v <URL>`Swiss Army Knife - shows entire "handshake" between the agent and the server
    - Errors
        - Could not resolve host -> DNS -> dig
        - Connection refused -> Service/Port -> ss


## Git Mastery & Workflows

## Networking for CI/CD