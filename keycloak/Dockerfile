FROM quay.io/keycloak/keycloak:25.0.2 as build

# Database
ENV KC_DB=postgres

# Enable health and metrics support
ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true

WORKDIR /opt/keycloak
RUN /opt/keycloak/bin/kc.sh build


FROM quay.io/keycloak/keycloak:25.0.2
COPY --from=build /opt/keycloak/ /opt/keycloak/

ARG FP_KEYCLOAK_DATABASE_PASSWORD
ARG FP_KEYCLOAK_HOSTNAME_ADMIN
ARG FP_KEYCLOAK_ADMIN_PASSWORD

# Database
ENV KC_DB=postgres
ENV KC_DB_URL=jdbc:postgresql://localhost:12432/keycloak_db
ENV KC_DB_USERNAME=keycloak_db_user
ENV KC_DB_PASSWORD=${FP_KEYCLOAK_DATABASE_PASSWORD}
ENV KC_HTTP_PORT=12080

# Host
ENV KC_HOSTNAME=users.fullplate.dev
# ENV KC_HOSTNAME_STRICT=false

# Admin console
ENV KC_HOSTNAME_ADMIN=${FP_KEYCLOAK_HOSTNAME_ADMIN}
# ENV KC_PROXY=passthrough # DEPRECATED
ENV KC_PROXY_HEADERS=xforwarded
ENV KEYCLOAK_ADMIN=admin
ENV KEYCLOAK_ADMIN_PASSWORD=${FP_KEYCLOAK_ADMIN_PASSWORD}

# TLS
ENV KC_HTTPS_PORT=12443
ENV KC_HTTPS_CERTIFICATE_FILE=/own_ca_certs/fullplate.local.crt
ENV KC_HTTPS_CERTIFICATE_KEY_FILE=/own_ca_certs/fullplate.local.key

# etc
ENV KC_HTTP_MANAGEMENT_PORT=12900
ENV KC_LOG_LEVEL=info

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD ["start", "--optimized"]
