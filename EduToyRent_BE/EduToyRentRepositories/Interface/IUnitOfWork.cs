using EduToyRentRepositories.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduToyRentRepositories.Interface
{
    public interface IUnitOfWork : IDisposable
    {
        IGenericRepository<Cart> CartRepository { get; }
        IGenericRepository<CartItem> CartItemRepository { get; }
        IGenericRepository<Category> CategoryRepository { get; }
        IGenericRepository<Conversation> ConversationRepository { get; }
        IGenericRepository<Media> MediaRepository { get; }
        IGenericRepository<Message> MessageRepository { get; }
        IGenericRepository<Order> OrderRepository { get; }
        IGenericRepository<OrderDetail> OrderDetailRepository { get; }
        IGenericRepository<OrderHistory> OrderHistoryRepository { get; }
        IGenericRepository<OrderType> OrderTypeRepository { get; }
        IGenericRepository<PaymentType> PaymentTypeRepository { get; }
        IGenericRepository<Premium> PremiumRepository { get; }
        IGenericRepository<Rating> RatingRepository { get; }
        IGenericRepository<RatingImage> RatingImageRepository { get; }
        IGenericRepository<Role> RoleRepository { get; }
        IGenericRepository<Toy> ToyRepository { get; }
        IGenericRepository<Transaction> TransactionRepository { get; }
        IGenericRepository<TransactionDetail> TransactionDetailRepository { get; }
        IGenericRepository<User> UserRepository { get; }
        IGenericRepository<UserConversation> UserConversationRepository { get; }
        IGenericRepository<WalletTransaction> WalletTransactionRepository { get; }
        IGenericRepository<Wallet> WalletRepository { get; }

        void Save();
        Task SaveAsync();
    }
}
