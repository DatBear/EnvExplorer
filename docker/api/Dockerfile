FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src

COPY ["EnvExplorer/EnvExplorer.csproj", "EnvExplorer/"]
RUN dotnet restore "EnvExplorer/EnvExplorer.csproj"

COPY . .

WORKDIR "/src/EnvExplorer"
RUN dotnet build "EnvExplorer.csproj" -c Release -o /app/build

FROM build as publish
RUN dotnet publish "EnvExplorer.csproj" -c Release -o /app/publish

FROM base as final
WORKDIR /app
COPY --from=publish /app/publish .

ENTRYPOINT ["dotnet", "EnvExplorer.dll"]