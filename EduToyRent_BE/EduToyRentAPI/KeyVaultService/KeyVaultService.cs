using Azure.Identity;
using Azure.Security.KeyVault.Secrets;

namespace EduToyRentAPI.KeyVaultService
{
    public class KeyVaultService
    {
        private readonly SecretClient _secretClient;

        public KeyVaultService(string keyVaultName)
        {
            var kvUri = $"https://{keyVaultName}.vault.azure.net/";
            _secretClient = new SecretClient(new Uri(kvUri), new DefaultAzureCredential());
        }

        public string GetSecret(string secretName)
        {
            var secret = _secretClient.GetSecret(secretName);
            return secret.Value.Value;
        }
    }
}
