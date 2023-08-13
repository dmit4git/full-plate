
# SDK stage. Build solution.
FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
## install Entity Framework
#RUN dotnet tool install --global dotnet-ef
#RUN export PATH="$PATH:/root/.dotnet/tools"
# copy source
WORKDIR /source
COPY ./netcore/appsettings.json ./netcore/Program.cs ./netcore/webapi.csproj ./netcore/WeatherForecast.cs ./
COPY ./netcore/Configurations ./Configurations
COPY ./netcore/Controllers ./Controllers
COPY ./netcore/Helpers ./Helpers
COPY ./netcore/Middlewares ./Middlewares
COPY ./netcore/Models ./Models
COPY ./netcore/Properties ./Properties
COPY ./netcore/Services ./Services
COPY ./netcore/Migrations/20230813211419_InitialMigration.cs ./netcore/Migrations/20230813211419_InitialMigration.Designer.cs ./netcore/Migrations/EF_DataContextModelSnapshot.cs ./Migrations/
COPY ./netcore/Migrations/EF_DataContextModelSnapshot.cs ./Migrations/EF_DataContextModelSnapshot.cs
# build
RUN dotnet publish --configuration release --output built
## run EF migrations
#RUN dotnet ef migrations add BuildMigration -v
#RUN dotnet ef database update -v

# Runtime stage.
FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS run
# copy built app from previous stage
WORKDIR /webapi
COPY --from=build source/built ./
# run the app
ENTRYPOINT ["dotnet", "webapi.dll"]
