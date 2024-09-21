#./make_own_ca_certs.sh -c pass_for_ca -p pass_for_pfx

mkdir -p own_ca_certs
cd own_ca_certs || exit

DOMAIN=fullplate.local # default domain name
CA_PASS_PHRASE=changeme # default certificate authority certificate passphrase
PFX_PASSWORD=changeme # default password for pfx file

#################################
# parse arguments
#################################
while getopts "d:c:p:" opt; do
  case $opt in
    d)
      DOMAIN="$OPTARG"
      ;;
    c)
      CA_PASS_PHRASE="$OPTARG"
      ;;
    p)
      PFX_PASSWORD="$OPTARG"
      ;;
    *)
      echo "Invalid option: -$OPTARG" >&2
      ;;
  esac
done

################################
# Make Certificate Authority
################################

echo "Generating CA private key"
openssl genrsa -des3 -passout pass:"$CA_PASS_PHRASE" -out ca_private_key.key 2048
#
echo "Generating CA certificates (pem and crt)"
openssl req -x509 -new -nodes -key ca_private_key.key -sha256 -days 825 -out ca_root_cert.pem \
  -subj "/C=FP/ST=FP-State/L=FP-City/O=FP-Org/OU=FP-OrgUnit/CN=CA_root_cert" -passin pass:"$CA_PASS_PHRASE"
openssl x509 -in ca_root_cert.pem -inform PEM -out ca_root_cert.crt
#
echo "Generating a private key for CA-signed certificate"
openssl genrsa -out "$DOMAIN".key 2048

#################################
# Create CA-signed certs
#################################

echo "Creating a certificate-signing request"
openssl req -new -key "$DOMAIN".key -out cert_sign_request.csr \
  -subj "/C=FP/ST=FP-State/L=FP-City/O=FP-Org/OU=FP-OrgUnit/CN=$DOMAIN"
#
echo "Create a config file for the extensions"
>cert_sign_request_config.ext cat <<-EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names
[alt_names]
DNS.1 = "$DOMAIN" # Be sure to include the domain name here because Common Name is not so commonly honoured by itself
DNS.2 = www."$DOMAIN" # additional domain
DNS.3 = logs."$DOMAIN" # graylog subdomain
DNS.4 = metrics."$DOMAIN" # prometheus + grafana subdomain
DNS.5 = accounts."$DOMAIN" # keycloak subdomain
DNS.5 = containers."$DOMAIN" # portainer subdomain
DNS.6 = localhost
IP.1 = 192.168.2.30 # internal IP address
IP.2 = 142.250.176.206 # external IP address (142.250.176.206 is google.com)
IP.3 = 127.0.0.1 # localhost
EOF
#
echo "Creating the signed certificate"
openssl x509 -req -in cert_sign_request.csr -CA ca_root_cert.pem -CAkey ca_private_key.key -CAcreateserial \
-out "$DOMAIN".crt -days 825 -sha256 -extfile cert_sign_request_config.ext -passin pass:"$CA_PASS_PHRASE"
#
echo "Creating pfx (certificate and key in single file)"
openssl pkcs12 -export -out "$DOMAIN".pfx -inkey "$DOMAIN".key -in "$DOMAIN".crt -password pass:"$PFX_PASSWORD"
#
echo "Creating PKCS#8 pem certificate and key (for graylog GUI)"
openssl pkcs12 -in "$DOMAIN".pfx -passin pass:"$CA_PASS_PHRASE" -nokeys -out "$DOMAIN".crt.pem
openssl pkcs12 -in "$DOMAIN".pfx -passin pass:"$CA_PASS_PHRASE" -nocerts -out "$DOMAIN".key.pkcs5.pem -passout pass:"$CA_PASS_PHRASE"
openssl pkcs8 -in "$DOMAIN".key.pkcs5.pem -passin pass:"$CA_PASS_PHRASE" -topk8 -out "$DOMAIN".key.pkcs8.pem -passout pass:"$CA_PASS_PHRASE"
#
echo "changing permissions on own_ca_certs and its content"
cd ..
chmod o+r+w -R own_ca_certs
