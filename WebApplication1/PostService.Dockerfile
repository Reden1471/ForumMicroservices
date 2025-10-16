FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["PostService/PostService.csproj", "PostService/"]
COPY ["CommonModels/CommonModels.csproj", "CommonModels/"]
RUN dotnet restore "PostService/PostService.csproj"
COPY . .
WORKDIR "/src/PostService"
RUN dotnet build "PostService.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "PostService.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "PostService.dll"]