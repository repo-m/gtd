# Manual: Sharing Internet with BeagleBone via USB

This guide covers the configuration required on both the Ubuntu Host and the BeagleBone to enable internet access and system updates.

## Part 1: Ubuntu Host Configuration

Run these commands on your workstation to turn it into a gateway.

### 1. Enable Packet Forwarding

This allows the Linux kernel to route traffic from the USB interface to the Wi-Fi interface.

```bash
sudo sysctl -w net.ipv4.ip_forward=1
```

### 2. Set Up IP Masquerading (NAT)

This masks the BeagleBone's private IP (`192.168.7.2`) with your host's IP (`192.168.178.139`) so external servers can reply.

```bash
sudo iptables -t nat -A POSTROUTING -o wlp2s0 -j MASQUERADE
```

### 3. Configure Forwarding Permissions

These rules allow the firewall to pass traffic specifically for the BeagleBone.

```bash
# Allow outgoing traffic from the BeagleBone interface
sudo iptables -A FORWARD -i enx68c90bed8ed6 -j ACCEPT

# Allow established/related return traffic from the internet
sudo iptables -A FORWARD -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
```

---

## Part 2: BeagleBone Configuration

Switch to your SSH session (`debian@192.168.7.2`) to configure routing and DNS.

### 4. Add the Default Gateway

Tells the BeagleBone to send all internet traffic to the Ubuntu host's IP on the USB link.

```bash
sudo route add default gw 192.168.7.1
```

### 5. Configure DNS

Points the BeagleBone to your Pi-hole for name resolution.

```bash
echo "nameserver 192.168.178.2" | sudo tee /etc/resolv.conf
```

---

## Part 3: Testing and Updating

### 6. Verify Connectivity

Test the connection by pinging an external IP and then a domain name.

```bash
# Test raw routing
ping -c 3 8.8.8.8

# Test DNS resolution
ping -c 3 google.com
```