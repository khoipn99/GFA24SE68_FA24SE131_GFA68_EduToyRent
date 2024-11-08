namespace EduToyRentAPI.FireBaseService
{
    public interface IFireBaseService
    {
        Task<string> UploadImageAsync(IFormFile imageFile, string? imageName = default);

        string GetImageUrl(string imageName);

        Task<string> UpdateImageAsync(IFormFile imageFile, string imageName);

        Task DeleteImageAsync(string imageUrl);

        Task DeleteImagesAsync(List<string> imageUrls);

        Task<string[]> UploadImagesAsync(List<IFormFile> imageFiles);
    }
}
