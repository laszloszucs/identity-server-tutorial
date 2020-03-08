using System.Threading.Tasks;

namespace Schwarzenegger.Core.DAL.Interfaces
{
    public interface IDatabaseInitializer
    {
        Task InitializeAsync();
        Task SeedAsync();
    }
}