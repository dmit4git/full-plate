# Full-plate
A self-hosted **full**stack project boiler**plate**. 
Demo available at [fullplate.dev](https://fullplate.dev).  
It is currently in prototype stage, development is in progress.

## Features
* **Authentication/authorization**: the app has two authentication/authorization systems, [role-based endpoint securing](https://github.com/dmit4git/full-plate/blob/c9b04133ac51f958e75d65aea8de336490bfa28f/webapi/NetCore/WebApi/Controllers/Auth/Checks/AuthChecksController.cs#L26) works with both:
  * Single-sign on solution ([accounts.fullplate.dev](https://accounts.fullplate.dev)) implemented with [Keycloak](https://www.keycloak.org/) used as a centralized identity and access management system
    * User can sign in into the App, Graylog, Grafana and Portainer with Keycloak account  
  * [Native authentication/authorization](https://youtu.be/IzhHI-dZCsg) implemented with [.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/?view=aspnetcore-8.0), built-in into the backend
* **management**:
  * [Graylog](https://graylog.org/) ([logs.fullplate.dev](https://logs.fullplate.dev/)) is used for logs monitoring
  * [Prometheus](https://prometheus.io/) + [Grafana](https://grafana.com/) ([metrics.fullplate.dev](https://metrics.fullplate.dev)) are used for performance metrics monitoring
  * [Portainer](https://www.portainer.io/) ([containers.fullplate.dev](https://containers.fullplate.dev/)) is used for management of docker containers
* **themes**: user can choose from variety of themes

## To do
* app data management system
* multi-language support
* wiki page with detailed feature description, dev docs

## Documentation
Please see [wiki pages](https://github.com/dmit4git/full-plate/wiki) of the repository for more information.
