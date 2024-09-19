# full-plate
A self-hosted **full**stack project boiler**plate**. 
Demo available at [fullplate.dev](https://fullplate.dev).  
It is currently in prototype stage, development is in progress.

## Features
* **Authentication/authorization**: the app has two authentication/authorization systems, [role-based endpoint securing](https://github.com/dmit4git/full-plate/blob/c9b04133ac51f958e75d65aea8de336490bfa28f/webapi/NetCore/WebApi/Controllers/Auth/Checks/AuthChecksController.cs#L26) works with both:
  * Single-sign on solution ([accounts.fullplate.dev](https://accounts.fullplate.dev)) implemented with [Keycloak](https://www.keycloak.org/) used as a centralized identity and access management system
    * User can sign in into the App, Graylog and Grafana with Keycloak account  
  * [Native authentication/authorization](https://youtu.be/IzhHI-dZCsg) implemented with [.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/?view=aspnetcore-8.0), built-in into the backend
* **monitoring**: admin can query logs and performance metrics, and configure alerts on their basis
  * [Graylog](https://graylog.org/) ([logs.fullplate.dev](https://logs.fullplate.dev/)) is used for logs monitoring
  * [Prometheus](https://prometheus.io/) + [Grafana](https://grafana.com/) ([metrics.fullplate.dev](https://metrics.fullplate.dev)) are used for performance metrics monitoring
* **themes**: user can choose from variety of themes
* **todo**:
  * app data management system
  * multi-language support
  * wiki page with detailed feature description, dev docs

## Tech Stack
 * **React** frontend, because it is most used ([stateofjs.com](https://2022.stateofjs.com/en-US/libraries/front-end-frameworks/)) and has the largest community 
 * **.Net Core 8.0** backend, because its performance is top tier ([techempower.com](https://www.techempower.com/benchmarks/#section=data-r21)) and it has one of the largest communities
 * **PostgreSQL** database 
 * **Nginx** web server / reverse proxy
 * **Graylog** centralized log management system
 * **Prometheus+Grafana** centralized health metrics management system
 * **Keycloak** identity and access management system

## HowTo
### run on Linux
To run it on Linux, you need to clone the repository, go to docker compose directory and start its containers:
```
git clone https://github.com/dmit4git/full-plate.git
cd full-plate/compose
docker compose --profile frontend --profile backend up --build --detach
```
This will:
 * start PostgreSQL database container
 * build .Net Core WebApi backend container and start it
 * build React webapp and start Nginx container to serve it
   * Nginx will also forward all `/webapi` calls to the WebApi backend (port 10080)
 
Open it at [localhost](http://localhost).  
Stop containers to shut it down: `docker compose --profile frontend --profile backend down`

#### SSL
Letsencrypt [certbot](https://certbot.eff.org/) can be used to make new SSL certificate and periodically renew it.
  * run "frontend" service with nginx configured without ssl 
    * leave only one uncommented include directive `include /etc/nginx/conf.d/nginx.fullplate.nossl.conf.template;` in `nginx.conf`
    * run "frontend" docker service: `docker compose --profile frontend up --build --detach`
  * run "certbot" service that will make new certificate if it's not there yet and will be renewing it every 12 hours
    * `docker compose --profile certbot up --build --detach`
  * restart "frontend" service with nginx configured with ssl
    * run "frontend" docker service: `docker compose --profile frontend down`
    * leave only one uncommented include directive `include /etc/nginx/conf.d/nginx.fullplate.conf.template;` in `nginx.conf`
    * run "frontend" docker service: `docker compose --profile frontend up --build --detach` 

Alternatively, you can create your own certificate authority and use it to make new certificates
  * run `nginx/certbot/selfsigned.sh` to generate following files in `nginx/certbot/own_ca_certs`
    * personal certificate authority root certificate (`ca_root_cert.pem`)
    * certificate and key (`fullplate.local.crt, fullplate.local.key`) signed with your new root certificate for fullplate.local, www.fullplate.local, logs.fullplate.local and metrics.fullplate.local
  * run "frontend" service with nginx configured with self-made ssl certificates
    * leave only one uncommented include directive `include /etc/nginx/conf.d/nginx.local.ssl.conf.template;` in `nginx.conf`
    * run "frontend" docker service: `docker compose --profile frontend up --build --detach`
  * add your root certificate to your browser as certificate authority
    * go to "Privacy and security" [settings](chrome://settings/certificates) in Chrome, select "Authorities" tab, click import, select generated ca_root_cert.pem, check all options on the form

### develop on Linux
[Install](https://learn.microsoft.com/en-us/dotnet/core/install/linux) .Net SDK locally to debug .Net code without dotnet container.

For development, use `dev` profile with `docker compose`:  
`docker compose --profile dev up --build --detach`
This will:
* start container with PostgreSQL database listening on default port 5432
  * start container with PostgreSQL test database listening on port 5433
* start Dozzle container to show containers logs at [localhost:8080](http://localhost:8080)
* start Nginx container to forward port 80 calls to port 3000 (default React dev server port)  
   * Nginx will also forward all `/webapi` calls to the WebApi backend (port 10080)

Run/debug .Net Core app in `webapi/NetCore/WebApi` with your IDE, it listens on port 10080 which Nginx forwards to.  
Start React development with `npm run dev` in `webapp/react`, dev server listens on port 3000 which Nginx forwards to.  

Open it at [localhost](http://localhost).  
Or add `fullplate.local` domain to `/etc/hosts` for convenience:
 * `127.0.0.1       fullplate.local` - to access the app at [fullplate.local](http://fullplate.local)
 * `127.0.0.1       logs.fullplate.local` - to access Graylog at [logs.fullplate.local](http://logs.fullplate.local)

Stop containers to shut it down: `docker compose --profile dev down`

### Keycloak
Users management is done with [Keycloak](https://www.keycloak.org/).
Frontend app uses [authorization code grant with PKCE](https://github.com/authts/oidc-client-ts/blob/main/docs/protocols/authorization-code-grant-with-pkce.md) for authentication with Keycloak.  
Following Keycloak configuration is required in order to support the front-end app:
 * [create new realm](https://www.keycloak.org/docs/latest/server_admin/index.html#proc-creating-a-realm_server_administration_guide) 
   * name it <ins>fullplate</ins>
   * <ins>Login</ins> tab configuration
     * Toggle on <ins>User registration</ins>, <ins>Forgot password</ins> and <ins>Remember me</ins>
   * <ins>Email</ins> tab configuration
     * [setup](https://www.keycloak.org/docs/latest/server_admin/index.html#_email) realm email using your email provider
       * in case you're using AWS SES, [create](https://docs.aws.amazon.com/ses/latest/dg/smtp-credentials.html) IAM user to obtain username/password credentials for SMTP authentication
         * _Optionally_, to require user's email verification, go to <ins>Authentication</ins> -> <ins>Required actions</ins> tab, and toggle on <ins>Set as default action</ins> of <ins>Verify Email</ins>
  * switch to the newly created <ins>fullplate</ins> realm and configure it
   * [create new client](https://www.keycloak.org/docs/latest/server_admin/index.html#proc-creating-oidc-client_server_administration_guide)
     * use <ins>fullplate-webapp</ins> for id
     * <ins>Capability config</ins> step (<ins>Settings</ins> tab after client creation) configuration
       * keep <ins>Client authentication</ins> off because front-end app can't securely store client secret
       * disable <ins>Direct access grants</ins>
     * <ins>Login settings</ins> step (<ins>Settings</ins> tab after client creation) configuration
       * set <ins>Home URL</ins> and <ins>Web origins</ins> with your domain (e.g., https://fullplate.dev)
       * set <ins>Valid redirect URIs</ins> and <ins>Valid post logout redirect URIs</ins> according to your domain (e.g., https://fullplate.dev/*)
     * <ins>Advanced</ins> tab configuration
       * set <ins>Proof Key for Code Exchange Code Challenge Method</ins> to <ins>S256</ins>
         * this setting is _optional_ because it is default in case of authorization code grant with PKCE

Additional configuration is required for .Net Core backend to work properly with Keycloak.
WebApi will be calling Keycloak over https as an OIDC authority.  
In development setup, certificate authority of Keycloak's TLS certificate needs to be trusted
 * [add](https://ubuntu.com/server/docs/install-a-root-ca-certificate-in-the-trust-store) <ins>ca_root_cert.crt</ins> made with <ins>make_own_ca_certs.sh</ins> to your OS trust store

[Role-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/roles?view=aspnetcore-8.0#add-role-services-to-identity) in .Net Core expects role claims to be in format different from Keycloak's default.  
Client roles mapper need to be created to format roles part of access_token provided by Keycloak
* In Keycloak admin console, with <ins>fullplate</ins> realm selected, go to <ins>Clients</ins>, click <ins>fullplate-webapp</ins> client, open <ins>Client scopes</ins> tab
* click on <ins>fullplate-webapp-dedicated</ins> scope, in the opened <ins>Mappers</ins> tab click <ins>Add mapper</ins>, and from popped up menu pick <ins>By configuration</ins>
  * in the <ins>Configure a new mapper</ins> popup pick <ins>User Client Role</ins>
  * finish mapper configuration in given <ins>Add mapper</ins> form
    * give the new mapper a <ins>Name</ins> 
    * select <ins>fullplate-webapp</ins> for <ins>Client ID</ins>
    * keep <ins>Multivalued</ins> toggle on
    * set all <ins>Add to ...</ins> toggles off
      * except for <ins>Add to access token</ins>, keep that one on
    * click <ins>Save</ins>

Keycloak can be [configured](https://console.developers.google.com/apis) to delegate authentication to a social media portal.
You'll need to create client credentials for each social identity provider:
- Google account:
  - [Get your Google API client ID](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid)
- Microsoft account:
  - create [azure](https://azure.microsoft.com/en-ca) account
  - from [azure portal](https://portal.azure.com/#home) go to <ins>Microsoft Entra ID</ins> and click <ins>Add application registration</ins> on the bottom of the page
    - select <ins>Accounts in any organizational directory (Any Microsoft Entra ID tenant - Multitenant) and personal Microsoft accounts (e.g. Skype, Xbox)</ins> so any user with MS account could log in
    - pick <ins>WEB</ins> for platform
    - use redirection URI provided by Keycloak
  - to create client secret, got to configuration of newly created client
    - go to <ins>Manage</ins> -> <ins>Certificates & secrets</ins>, click <ins>New client secret</ins>


### Run Graylog on Linux
Docker services are configured to send logs to Graylog ([graylog.org](https://go2docs.graylog.org/5-0/what_is_graylog/what_is_graylog.htm)) instead of writing to local log file.  
You can run containerized Graylog stack with `docker compose`. Start in `full-plate` directory.
 * Only once, before starting Graylog for the first time, run setup script to prepare directories for persistent Graylog data:
   * go to graylog directory: `cd graylog`
   * add execution permission to the script: `chmod +x setup.sh`
   * run the script: `./setup.sh`
   * go back to full-plate directory: `cd ..`
 * run Graylog stack
   * go to compose directory: `cd compose`
   * start Graylog services stack: `docker compose --profile graylog up --detach`
     * stop it when you want with: `docker compose --profile graylog down`
 * Only once, configure Graylog input(s) to receive logs from docker compose services:
   * go to `localhost:9900/system/inputs`
     * or use `logs.fullplate.local/system/inputs` if you added the record to `/etc/hosts`
     * default credentials are user: `admin`, password: `admin`
   * add new `GELF UDP` input
     * select `GELF UDP` input, and click "Launch new input" button
     * give the new input a title, for example "input-GELF-UDP", scroll down, click "Launch input"
   * remote services should send logs over TLS, use `Syslog TCP` input for that purpose
     * select `Syslog TCP` input, and click "Launch new input" button
     * give the new input a title, for example "input-Syslog-TCP-TLS"
     * set "Port" to `12514`, and fill-out TLS settings
       * "TLS cert file" to `/own_ca_certs/fullplate.local.crt`
       * "TLS private key file" to `/own_ca_certs/fullplate.local.key`
       * check "Enable TLS" box
       * set "TLS key password" to whatever password you used making your own certificates with make_own_ca_certs.sh
     * scroll down, click "Launch input"

In case you're using certificates signed by your private CA for TLS of Graylog,  
you need to [add](https://graylog.org/post/how-to-guide-securing-graylog-with-tls/) the CA certificate to Graylog's Java Key Store (JKS)
 * copy default JKS of Graylog (/opt/java/openjdk/lib/security/cacerts inside the container to graylog/graylog/cacerts.jks)
 * add your CA to the copied keystore
   * `sudo keytool -importcert -keystore graylog/graylog/cacerts.jks -storepass changeit -alias cachain -file nginx/certbot/own_ca_certs/ca_root_cert.pem`

OIDC is supported only in [enterprise](https://graylog.org/products/enterprise/) version of Graylog,  
there is a free version of enterprise license called [small business](https://graylog.org/products/small-business/) (SMB).  
In order to use OIDC in Graylog, run graylog-enterprise docker image, [get](https://graylog.org/products/small-business/) SMB license key and [update](https://go2.graylog.org/share/hubspotvideo/63623147018) license on your cluster.  
Follow [documentation](https://go2docs.graylog.org/current/setting_up_graylog/oidc.html?Highlight=OIDC) to configure OIDC. Use following settings for the OIDC Authentication Service in Graylog:
* OIDC base URL: `https://accounts.fullplate.dev/realms/fullplate`
* Callback URL: `https://logs.fullplate.dev/authorization-code/callback`
* Graylog has a required default role setting, so any user authenticated with Keycloak will [have access](https://community.graylog.org/t/oidc-reject-users-without-any-roles/33412/3) to Graylog in default role
  * use [keycloak-restrict-client-auth](https://github.com/sventorben/keycloak-restrict-client-auth) to deny users without `restricted-access` client role

Graylog stack is independent of other services and can be started/stopped at any time.  

### Run Prometheus + Grafana on Linux
Containerized Prometheus stack can be used for storing, querying and visualising performance related metrics.
Starting in `full-plate` directory:
 * go to prometheus directory: `cd prometheus`
 * add execution permission to the script: `chmod +x setup.sh`
 * run preparation script: `./setup.sh`
 * go back to full-plate directory: `cd ..`
 * run Prometheus stack
   * go to compose directory: `cd compose`
   * start Prometheus services stack: `docker compose --profile prometheus up --detach`
       * stop it when you want with: `docker compose --profile prometheus down`
 * Only once, configure Grafana:
   * Connect Grafana to Prometheus data source:
     * open [data sources configuration](http://localhost:23000/connections/datasources), and click "Add data source"
     * select "prometheus" option, and configure it
       * Prometheus server URL -> http://localhost:9090
       * Prometheus type -> Prometheus
       * click "Save & test"
   * Add visualisation dashboard
     * open [dashboards configuration](http://localhost:23000/connections/datasources), and click "Create Dashboard"
     * import "Cadvisor exporter" dashboard
       * click "Import dashboard"
       * input https://grafana.com/grafana/dashboards/14282-cadvisor-exporter/ for dashboard URL, and click "Load"
       * select previously created Prometheus data source for "Prometheus" option, and click "Import"
     * import "Node Exporter Full" dashboard
       * use https://grafana.com/grafana/dashboards/1860-node-exporter-full/ for dashboard URL

[Setup](https://grafana.com/docs/grafana/latest/setup-grafana/configure-security/configure-authentication/keycloak/) single-sign on of Grafana with Keycloak.

In case you're using certificates signed by your private CA for TLS of Grafana,  
you need to make Grafana container use ca-certificates.crt updated with your private CA:
* [install](https://ubuntu.com/server/docs/install-a-root-ca-certificate-in-the-trust-store) your private CA certificates in the trust store of your host OS
  * this installation will update /etc/ssl/certs/ca-certificates.crt on your host OS
* copy the updated ca-certificates.crt to prometheus/grafana/ca-certificates.crt

Apparently Grafana takes roles from id token and Keycloak doesn't set roles on it.  
To make Keycloak set roles on id token, configure grafana client role mapper similar to how it's done for .Net Core in Keycloak section:
 * set <ins>Token Claim Name</ins> to resource_access.grafana.roles
 * keep <ins>Multivalued</ins> on
 * among <ins>Add to ...</ins> toggles keep only <ins>Add to ID token</ins> on, set the rest off
