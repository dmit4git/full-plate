# SDK stage. Build solution.
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

# copy source
WORKDIR /orchard
COPY ./backend .

# build
RUN dotnet publish --configuration release --output build


# Runtime stage.
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS run

# copy built app from previous stage
WORKDIR /orchard
COPY --from=build orchard/build ./

# run the app
ENTRYPOINT ["dotnet", "backend.dll"]
