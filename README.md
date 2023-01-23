## EnvExplorer

* Allows you to explore environment variables stored in AWS Parameter Store...
    * Because the AWS interface leaves a lot to be desired.

To run:
* Set up an AWS account in ./.env
* Set up a template in client/docker-local.env
* `docker-compose up` or `dotnet run`, `cd client/ && yarn start`
* Navigate to `http://localhost:5102/`

## To-do:

* Editing values
* Copy path/value/.env value
* Comparing 2(+?) environments