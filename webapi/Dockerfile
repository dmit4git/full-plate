
# SDK stage. Build solution.
FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build

## install Entity Framework
#RUN dotnet tool install --global dotnet-ef
#RUN export PATH="$PATH:/root/.dotnet/tools"

# copy source
WORKDIR /source
COPY NetCore/WebApi .

# build
RUN dotnet publish --configuration release --output build

## run EF migrations
#RUN dotnet ef migrations add BuildMigration -v
#RUN dotnet ef database update -v


# Runtime stage.
FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS run

# copy built app from previous stage
WORKDIR /WebApi
COPY --from=build source/build ./

# run the app
ENTRYPOINT ["dotnet", "WebApi.dll"]
