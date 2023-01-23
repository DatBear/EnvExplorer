using dotenv.net;
using EnvExplorer.Infrastructure.Configurations;
using EnvExplorer.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
var services = builder.Services;
var config = builder.Configuration;

DotEnv.Load(new DotEnvOptions(probeForEnv: true, probeLevelsToSearch: 5));
config.AddEnvironmentVariables();

services.AddControllers();
services.AddEndpointsApiExplorer();
services.AddSwaggerGen();

services.Configure<AWSConfig>(config.GetSection("AWSConfig"));

services.AddScoped<IParameterStoreService, ParameterStoreService>();

services.AddAutoMapper(typeof(Program));

services.AddCors(x => x.AddDefaultPolicy(x => x.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin()));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.UseCors(x => x.AllowAnyMethod().AllowAnyHeader().AllowAnyOrigin());

app.Run();
