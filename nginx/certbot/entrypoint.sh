# make new certificate if it doesn't exist
if [ ! -d /etc/letsencrypt/live ]; then
  certbot certonly --non-interactive \
    --webroot --webroot-path /var/www/certbot/ \
    --domains "fullplate.dev, www.fullplate.dev, logs.fullplate.dev" \
    --email change_me@email.com
fi
# renew the certificate every 12 hours
watch -n 43200 certbot renew --non-interactive

