using System.Threading.Tasks;
using Client.Modes;

namespace Client
{
    /// <summary>
    ///     Identity Server-től Access token szerzése és az API végpont meghívása.
    ///     Futtatni kell az IdentityServer projectet és az Api projectet is a teszteléshez.
    ///     Ezután ezt a projectet kell futtatni (Client)
    ///     Az Api visszaadja az Access Token-hez tartozó Claim objektumokat, amiben benne lesz
    ///     a scope schwarzenegger_api is, ami az Identity Serveren lett felkonfigurálva
    /// </summary>
    public class Program
    {
        private static async Task Main()
        {
            // Módok

            // await ClientCredentialsGrant.TokenAsync();
            await PasswordGrant
                .TokenAsync(); // Ezáltal meg lehet különböztetni, hogy az alkalmazás direktben kommunikál-e az API-val vagy egy User hívta-e az API-kat (A teszt usereknél ez nincs nem valódi IdentityUser-ek)
        }
    }
}