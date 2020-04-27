using IEvangelist.VideoChat.Abstractions;
using IEvangelist.VideoChat.Hubs;
using IEvangelist.VideoChat.Options;
using IEvangelist.VideoChat.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.SpaServices.AngularCli;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;

namespace IEvangelist.VideoChat
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllersWithViews();

            services.Configure<TwilioSettings>(settings =>
                    {
                        settings.AccountSid = "ACbf6e8d345e044dba53b8f87bca6e8dee"; //Environment.GetEnvironmentVariable("TWILIO_ACCOUNT_SID");
                        settings.ApiSecret = "oSE3InQqyHibaX9WvnljSuvGWApoXAdF";//Environment.GetEnvironmentVariable("TWILIO_API_SECRET");                        
                        settings.ApiKey = "SKff5567a08c43f894aac493fe174ff7e1";//Environment.GetEnvironmentVariable("TWILIO_API_KEY");
                    })
                    .AddTransient<IVideoService, VideoService>()
                    .AddSpaStaticFiles(config => config.RootPath = "ClientApp/dist");

            services.AddSignalR();

            services.AddCors(options =>
            {
                options.AddPolicy("All",
                                  builder =>
                                  {
                                      builder.WithOrigins("https://video.singletouchpoint.com").AllowAnyHeader()
                                              .WithMethods("GET", "POST").AllowCredentials(); 
                                  });
            });

        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseHsts();
            }

            app.UseHttpsRedirection()
               .UseStaticFiles()
               .UseSpaStaticFiles();

            app.UseRouting();
            app.UseCors("All");
            app.UseEndpoints(endpoints =>
                {
                    endpoints.MapControllerRoute(
                        name: "default",
                        pattern: "{controller}/{action=Index}/{id?}");

                    endpoints.MapHub<NotificationHub>("/notificationHub");
                })
               .UseSpa(spa =>
                {
                    // To learn more about options for serving an Angular SPA from ASP.NET Core,
                    // see https://go.microsoft.com/fwlink/?linkid=864501
                    spa.Options.SourcePath = "ClientApp";

                    if (env.IsDevelopment())
                    {
                        spa.UseAngularCliServer(npmScript: "start");
                    }
                });
        }
    }
}