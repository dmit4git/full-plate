FROM certbot/certbot:v2.8.0

#ENTRYPOINT ["sleep", "3600"]

## certbot certonly --non-interactive --webroot --webroot-path /var/www/certbot/ -d fullplate.dev -d www.fullplate.dev -d logs.fullplate.dev --email box4dmitry@gmail.com
#ENTRYPOINT ["certbot", "certonly", "--non-interactive",
#    "--webroot", "--webroot-path", "/var/www/certbot/",
#    "--domains", "fullplate.dev, www.fullplate.dev, logs.fullplate.dev",
#    "--email", "box4dmitry@gmail.com"]

WORKDIR /opt/certbot
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh
ENTRYPOINT ./entrypoint.sh
