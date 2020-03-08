using System;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using IdentityModel.Client;

namespace Client.Modes
{
    public static class PasswordGrant
    {
        public static async Task TokenAsync()
        {
            var client = new HttpClient(new LoggingHandler(new HttpClientHandler()));

            var disco = await client.GetDiscoveryDocumentAsync("https://localhost:44300");
            if (disco.IsError)
                //Console.WriteLine(disco.Error);
                return;

            var tokenResponse = await client.RequestPasswordTokenAsync(new PasswordTokenRequest
            {
                Address = disco.TokenEndpoint,
                ClientId = "ro.client",
                ClientSecret = "secret",

                UserName = "alice",
                Password = "password",
                Scope = "schwarzenegger_api"
            });

            if (tokenResponse.IsError)
                //Console.WriteLine(tokenResponse.Error);
                return;

            //Console.WriteLine(tokenResponse.Json); // The access token will now contain a sub claim which uniquely identifies the user (A teszt usereknél ez nincs nem valódi IdentityUser-ek)

            //Console.WriteLine("\n\n");

            // call api
            var apiClient = new HttpClient(new LoggingHandler(new HttpClientHandler()));
            apiClient.SetBearerToken(tokenResponse.AccessToken);

            var response =
                await apiClient.GetAsync(
                    "https://localhost:44300/api/identity"); // Most, hogy van már Access Token-ünk ellenőrizzük, hogy hozzáférünk-e az API-hoz
            if (!response.IsSuccessStatusCode)
                //Console.WriteLine(response.StatusCode);
                return;

            //var content = await response.Content.ReadAsStringAsync();
            //Console.WriteLine(JArray.Parse(content));
        }
    }

    public class LoggingHandler : DelegatingHandler
    {
        public LoggingHandler(HttpMessageHandler innerHandler)
            : base(innerHandler)
        {
        }

        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request,
            CancellationToken cancellationToken)
        {
            Console.WriteLine("\n\n" +
                              "////////////////////////////////////////////////////" +
                              "\n\nRequest:");
            Console.WriteLine(request.ToString());
            if (request.Content != null) Console.WriteLine(await request.Content.ReadAsStringAsync());
            Console.WriteLine();

            var response = await base.SendAsync(request, cancellationToken);

            Console.WriteLine("Response:");
            Console.WriteLine(response.ToString());
            if (response.Content != null) Console.WriteLine(await response.Content.ReadAsStringAsync());
            Console.WriteLine();

            return response;
        }
    }
}