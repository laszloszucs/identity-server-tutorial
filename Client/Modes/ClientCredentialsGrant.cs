using System;
using System.Net.Http;
using System.Threading.Tasks;
using IdentityModel.Client;
using Newtonsoft.Json.Linq;

namespace Client.Modes
{
    public static class ClientCredentialsGrant
    {
        public static async Task TokenAsync()
        {
            // discover endpoints from metadata
            var client = new HttpClient();

            var disco =
                await client.GetDiscoveryDocumentAsync(
                    "https://localhost:44300"); // A végpontokat feltérképezi a .well-known alapján
            if (disco.IsError)
            {
                Console.WriteLine(disco.Error);
                return;
            }

            // request token
            var tokenResponse = await client.RequestClientCredentialsTokenAsync(new ClientCredentialsTokenRequest
            {
                Address = disco.TokenEndpoint, // /connect/token
                ClientId = "client",
                ClientSecret = "secret" // <--Tudjuk a secret-et. Kérhetünk access token-t az alkalmazásból
                //,
                //Scope = "api1" // Ha szerenénk külön megadhatjuk milyen scope-ot szeretnénk (opcionális) scopes másnéven recources
            });

            if (tokenResponse.IsError)
            {
                Console.WriteLine(tokenResponse.Error);
                return;
            }

            Console.WriteLine(tokenResponse.Json);
            Console.WriteLine("\n\n");

            // call api
            var apiClient = new HttpClient();
            apiClient.SetBearerToken(tokenResponse.AccessToken);

            var response =
                await apiClient.GetAsync(
                    "https://localhost:44300/api/identity"); // Most, hogy van már Access Token-ünk ellenőrizzük, hogy hozzáférünk-e az API-hoz
            if (!response.IsSuccessStatusCode)
            {
                Console.WriteLine(response.StatusCode);
                return;
            }

            var content = await response.Content.ReadAsStringAsync();
            Console.WriteLine(JArray.Parse(content));
        }
    }
}