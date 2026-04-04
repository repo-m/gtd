# #Docker

1. 📦 **Dependency Management**: Docker solves "dependency hell" and the classic "it works on my machine" problem by bundling the application with its entire environment.
2. 🚚 **Portability**: Docker is like moving your entire room inside a single shipping container; everything remains exactly as it was, rather than packing and reassembling individual items.
3. 🏢 **Efficiency**: Docker is like an apartment building (shared infrastructure) compared to a Virtual Machine, which is like a standalone house (isolated infrastructure).
4. Workflow and Objects
  - 🎮 Super Nintendo
    - Game Store = Registry (Docker Hub, GitLab Registry)
    - Cartridge (read only) = Image
    - Controller = CLI
    - Console = Daemon
    - Game Session on Screen = Container
    - Downloading Patches = Updating Layers
    - Options menu = e-Flag / Settings -e / Environment Variables
    - TV Cables = p-Flag / Network -p / Port-Mapping
    - Memory Card = v-Flag / Storage -v / Volumes, Bind Mounts
  - 🏗️ Architecture and Construction
    - Archives = Registry (Docker Hub, GitLab Registry)
    - Blueprint (printed)= Image
    - Architect = CLI
    - Construction team = Daemon
    - Building Levels = Layers
    - Finished Building = Container
    - Renovation = Update Layer
    - Interior Decor = e-Flag / Settings -e / Environment Variables
    - Front Door & Address = p-Flag / Network -p / Port-Mapping
    - Safe Deposit Box in the basement = v-Flag / Storage -v / Volumes, Bind Mounts

## 🛠️ Toolkit

- Dockerfile = Blueprint of the Blueprint
- `docker --help`: i.a. lists most important cmds
- **Managing the Library (Images)**
  - `docker images` List all blueprints on your host.
  - `docker build -t <name> .` Create a new blueprint from a **Dockerfile**.
  - `docker rmi <image>` Delete a blueprint from the shelf.
- **Managing the Site (Containers)**
  - `docker ps` List only **running** sessions.
  - `docker ps -a` List **all** sessions (including finished/exited ones).
  - `docker run <image>` Build and start a container.
  - `docker run -d` Run in "Detached" mode (background).
  - `docker rm <name>` Demolish a container session.
- **The Pro-Flags (The "Wiring")**
  - `-p 8080:80` Map **Host Port 8080** to **Container Port 80**.
  - `-v /host/path:/container/path` Create a **Live Bridge** for data/code.
  - `-e KEY=VALUE` Inject a setting into the container.

## ⚠️ Troubleshooting

- **403 Forbidden:** Usually a Linux permission issue. The container user can't read the host folder. (**Fix:** `chmod 755` on folders, `644` on files).
- **Bash "Event Not Found":** Caused by `!` in double quotes. (**Fix:** Use single quotes `' '`).
- **Container Exited (0):** The container finished its main task and shut down. This is normal for build tools like Bazel!

#Docker