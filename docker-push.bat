docker-compose build
docker tag envexplorer_client:latest jrankin312/envexplorer:latest
docker push jrankin312/envexplorer:latest
pause