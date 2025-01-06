FROM quay.io/keycloak/keycloak:25.0.2 as build

# Database
ENV KC_DB=postgres

# Enable health and metrics support
ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true

WORKDIR /opt/keycloak

# https://github.com/sventorben/keycloak-restrict-client-auth
ADD --chown=keycloak:keycloak --chmod=644 providers/keycloak-restrict-client-auth.jar /opt/keycloak/providers/myprovider.jar
ADD --chown=keycloak:keycloak --chmod=644 keycloakify/dist_keycloak/keycloak-theme-for-kc-22-and-above.jar /opt/keycloak/providers/keycloak-theme-for-kc-22-and-above.jar

RUN /opt/keycloak/bin/kc.sh build


FROM quay.io/keycloak/keycloak:25.0.2
COPY --from=build /opt/keycloak/ /opt/keycloak/

ARG FP_KEYCLOAK_DATABASE_PASSWORD
ARG FP_KEYCLOAK_HOSTNAME
ARG FP_KEYCLOAK_ADMIN_PASSWORD

# Database
ENV KC_DB=postgres
ENV KC_DB_URL=jdbc:postgresql://localhost:12432/keycloak_db
ENV KC_DB_USERNAME=keycloak_db_user
ENV KC_DB_PASSWORD=${FP_KEYCLOAK_DATABASE_PASSWORD}

# Host
ENV KC_HOSTNAME=${FP_KEYCLOAK_HOSTNAME}
#ENV KC_HOSTNAME_STRICT=false

# Admin console
ENV KC_HOSTNAME_ADMIN=https://${FP_KEYCLOAK_HOSTNAME}
# ENV KC_PROXY=passthrough # DEPRECATED
ENV KC_PROXY_HEADERS=xforwarded
ENV KEYCLOAK_ADMIN=admin
ENV KEYCLOAK_ADMIN_PASSWORD=${FP_KEYCLOAK_ADMIN_PASSWORD}

# HTTP
ENV KC_HTTP_PORT=12080
# TLS
ENV KC_HTTPS_PORT=12443
ENV KC_HTTPS_CERTIFICATE_FILE=/own_ca_certs/fullplate.local.crt
ENV KC_HTTPS_CERTIFICATE_KEY_FILE=/own_ca_certs/fullplate.local.key

# Logging
ENV KC_LOG_LEVEL=INFO

# etc
ENV KC_HTTP_MANAGEMENT_PORT=12900

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD ["start", "--optimized"]
