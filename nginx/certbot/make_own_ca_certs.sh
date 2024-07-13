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
# Become a Certificate Authority
################################

echo "Generating CA private key"
openssl genrsa -des3 -passout pass:"$CA_PASS_PHRASE" -out ca_private_key.key 2048
#
echo "Generating CA certificate"
openssl req -x509 -new -nodes -key ca_private_key.key -sha256 -days 825 -out ca_root_cert.pem \
  -subj "/C=FP/ST=FP-State/L=FP-City/O=FP-Org/OU=FP-OrgUnit/CN=CA_root_cert" -passin pass:"$CA_PASS_PHRASE"

#################################
# Create CA-signed certs
#################################

echo "Generating a private key for CA-signed certificate"
openssl genrsa -out "$DOMAIN".key 2048
#
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
DNS.5 = localhost
IP.1 = 192.168.2.26 # internal IP address
IP.2 = 123.456.789.0 # external IP address
IP.3 = 127.0.0.1
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
openssl pkcs8 -in "$DOMAIN".key.pkcs5.pem -passin pass:pass4_FP -topk8 -out "$DOMAIN".key.pkcs8.pem -passout pass:pass4_FP
#
echo "changing permissions on own_ca_certs and its content"
cd ..
chmod o+r+w -R own_ca_certs
