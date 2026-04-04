# Commands

- `chmod <octal> <file>` change mode of file: changes what the current owner/group do - e.g. `chmod 755 script.sh`(Owner: rwx, Group/Others: r-x)
- `chown <user>:<group> <file>`Change both owner and group at once.
- `docker run -it --rm <image> <command>` Run docker image; `-i` Interactive; `-t` Terminal; `--rm` Clean up container after exit.
- `kill -15 <PID>` Graceful shutdown of process PID.
- `kill -9 <PID>` Forces shutdown of process PID (always run `kil -15 <PID>` first!)
- `ls -l <file>`lists detailed permissions (r: read = 4, w: write = 2, x: execute = 1)
- `ps aux | grep <name>` Find specific process by name
- `ps aux`: Snapshot of every single process running; `a` all users; `u` display the user/owner; `x` process not attached to a terminal (background tasks)
- `top` task manager (interactive)
- 