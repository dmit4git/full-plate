# make new certificate if it doesn't exist
if [ ! -d /etc/letsencrypt/live ]; then
  certbot certonly --non-interactive \
    --webroot --webroot-path /var/www/certbot/ \
    --domains "${CERTBOT_DOMAIN_NAME}, www.${CERTBOT_DOMAIN_NAME}, logs.${CERTBOT_DOMAIN_NAME}, metrics.${CERTBOT_DOMAIN_NAME}" \
    --email "admin@${CERTBOT_DOMAIN_NAME}" \
    --agree-tos
fi
# renew the certificate every 12 hours
watch -n 43200 certbot renew --non-interactive

