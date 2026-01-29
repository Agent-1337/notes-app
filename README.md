# Notes

A simple static website for taking notes.

## Usage

Copy the files into `/var/www/html`, then open the page in your browser.

## Installation (Apache)

To install the app on an Apache server, run the following commands:

```bash
sudo mkdir -p /var/www/html/notes

wget -qO- https://github.com/Agent-1337/notes-app/archive/refs/heads/main.tar.gz \
  | sudo tar -xz -C /var/www/html/notes --strip-components=1
```
