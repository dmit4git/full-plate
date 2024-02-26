mkdir -p selfsigned_certs
cd selfsigned_certs || exit

DOMAIN=fullplate.local # Use your own domain name
if [ -n "$1" ]; then
  DOMAIN=$1
fi

######################
# Become a Certificate Authority
######################

# Generate private key
openssl genrsa -des3 -out ca_private_key.key 2048
# Generate root certificate
openssl req -x509 -new -nodes -key ca_private_key.key -sha256 -days 825 -out ca_root_cert.pem \
  -subj "/C=FP/ST=FP-State/L=FP-City/O=FP-Org/OU=FP-OrgUnit/CN=CA_root_cert"

######################
# Create CA-signed certs
######################

# Generate a private key
openssl genrsa -out "$DOMAIN".key 2048
# Create a certificate-signing request
openssl req -new -key "$DOMAIN".key -out cert_sign_request.csr \
  -subj "/C=FP/ST=FP-State/L=FP-City/O=FP-Org/OU=FP-OrgUnit/CN=$DOMAIN"
# Create a config file for the extensions
>cert_sign_request_config.ext cat <<-EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names
[alt_names]
DNS.1 = "$DOMAIN" # Be sure to include the domain name here because Common Name is not so commonly honoured by itself
DNS.2 = www."$DOMAIN" # Optionally, add additional domains (I've added a subdomain here)
DNS.3 = logs."$DOMAIN" # Optionally, add additional domains (I've added a subdomain here)
# IP.1 = 192.168.0.13 # Optionally, add an IP address (if the connection which you have planned requires it)
EOF
# Create the signed certificate
openssl x509 -req -in cert_sign_request.csr -CA ca_root_cert.pem -CAkey ca_private_key.key -CAcreateserial \
-out "$DOMAIN".crt -days 825 -sha256 -extfile cert_sign_request_config.ext
