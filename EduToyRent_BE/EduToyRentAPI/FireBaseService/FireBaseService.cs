using Google.Cloud.Storage.V1;

namespace EduToyRentAPI.FireBaseService
{
    public class FireBaseService : IFireBaseService
    {
        private readonly StorageClient _storageClient;
        private readonly IConfiguration _configuration;
        private readonly string _bucketName;

        public FireBaseService(StorageClient storageClient, IConfiguration configuration)
        {
            _storageClient = storageClient;
            _configuration = configuration;
            _bucketName = _configuration["Firebase:Bucket"]!;
        }

        private string ExtractImageNameFromUrl(string imageUrl)
        {
            var uri = new Uri(imageUrl);
            var segments = uri.Segments;
            var escapedImageName = segments[segments.Length - 1];
            var imageName = Uri.UnescapeDataString(escapedImageName);

            return imageName;
        }

        public async Task DeleteImageAsync(string imageUrl)
        {
            await _storageClient.DeleteObjectAsync(_bucketName, ExtractImageNameFromUrl(imageUrl), cancellationToken: CancellationToken.None);
        }

        public async Task DeleteImagesAsync(List<string> imageUrls)
        {
            var deleteImageTasks = new List<Task>();

            foreach (var imageUrl in imageUrls)
            {
                deleteImageTasks.Add(DeleteImageAsync(imageUrl));
            }

            await Task.WhenAll(deleteImageTasks);
        }

        public string GetImageUrl(string imageName)
        {
            string imageUrl = $"https://firebasestorage.googleapis.com/v0/b/{_bucketName}/o/{Uri.EscapeDataString(imageName)}?alt=media";
            return imageUrl;
        }

        public async Task<string> UpdateImageAsync(IFormFile imageFile, string imageName)
        {

            using var stream = new MemoryStream();

            await imageFile.CopyToAsync(stream);

            stream.Position = 0;

            // Re-upload the image with the same name to update it
            var blob = await _storageClient.UploadObjectAsync(_bucketName, imageName, imageFile.ContentType, stream, cancellationToken: CancellationToken.None);

            return GetImageUrl(imageName);
        }


        public async Task<string> UploadImageAsync(IFormFile imageFile, string? imageName = default)
        {

            imageName ??= imageFile.FileName;

            using var stream = new MemoryStream();

            await imageFile.CopyToAsync(stream);

            var blob = await _storageClient.UploadObjectAsync(_bucketName, imageName, imageFile.ContentType, stream, cancellationToken: CancellationToken.None);

            //if (blob is null)
            //{
            //    throw new BadRequestException("Upload failed");
            //}

            return GetImageUrl(imageFile.FileName);

        }

        public async Task<string[]> UploadImagesAsync(List<IFormFile> imageFiles)
        {

            var uploadTasks = new List<Task<string>>();

            for (int i = 0; i < imageFiles.Count; i++)
            {
                var imageFile = imageFiles[i];

                uploadTasks.Add(UploadImageAsync(imageFile));
            }

            var imageUrls = await Task.WhenAll(uploadTasks);

            return imageUrls;
        }
    }

}
