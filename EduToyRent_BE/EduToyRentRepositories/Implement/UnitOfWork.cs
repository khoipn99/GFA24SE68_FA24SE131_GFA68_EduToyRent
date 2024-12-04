using EduToyRentRepositories.Interface;
using EduToyRentRepositories.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduToyRentRepositories.Implement
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly EduToyRentDBContext _context;
        private IGenericRepository<Cart> cartRepository;
        private IGenericRepository<CartItem> cartItemRepository;
        private IGenericRepository<Category> categoryRepository;
        private IGenericRepository<Conversation> conversationRepository;
        private IGenericRepository<Media> mediaRepository;
        private IGenericRepository<Member> memberRepository;
        private IGenericRepository<Message> messageRepository;
        private IGenericRepository<Order> orderRepository;
        private IGenericRepository<OrderDetail> orderDetailRepository;
        private IGenericRepository<OrderHistory> orderHistoryRepository;
        private IGenericRepository<OrderType> orderTypeRepository;
        private IGenericRepository<PaymentType> paymentTypeRepository;
        private IGenericRepository<Premium> premiumRepository;
        private IGenericRepository<Rating> ratingRepository;
        private IGenericRepository<RatingImage> ratingImageRepository;
        private IGenericRepository<Role> roleRepository;
        private IGenericRepository<Toy> toyRepository;
        private IGenericRepository<ToySupplier> toySupplierRepository;
        private IGenericRepository<Transaction> transactionRepository;
        private IGenericRepository<TransactionDetail> transactionDetailRepository;
        private IGenericRepository<User> userRepository;
        private IGenericRepository<UserConversation> userConversationRepository;
        private IGenericRepository<WalletTransaction> walletTransactionRepository;
        private IGenericRepository<Wallet> walletRepository;

        public UnitOfWork(EduToyRentDBContext context)
        {
            _context = context;
        }

        public IGenericRepository<Cart> CartRepository
        {
            get
            {
                return cartRepository ??= new GenericRepository<Cart>(_context);
            }
        }

        public IGenericRepository<CartItem> CartItemRepository
        {
            get
            {
                return cartItemRepository ??= new GenericRepository<CartItem>(_context);
            }
        }

        public IGenericRepository<Category> CategoryRepository
        {
            get
            {
                return categoryRepository ??= new GenericRepository<Category>(_context);
            }
        }

        public IGenericRepository<Conversation> ConversationRepository
        {
            get
            {
                return conversationRepository ??= new GenericRepository<Conversation>(_context);
            }
        }

        public IGenericRepository<Media> MediaRepository
        {
            get
            {
                return mediaRepository ??= new GenericRepository<Media>(_context);
            }
        }

        public IGenericRepository<Member> MemberRepository
        {
            get
            {
                return memberRepository ??= new GenericRepository<Member>(_context);
            }
        }

        public IGenericRepository<Message> MessageRepository
        {
            get
            {
                return messageRepository ??= new GenericRepository<Message>(_context);
            }
        }

        public IGenericRepository<Order> OrderRepository
        {
            get
            {
                return orderRepository ??= new GenericRepository<Order>(_context);
            }
        }

        public IGenericRepository<OrderDetail> OrderDetailRepository
        {
            get
            {
                return orderDetailRepository ??= new GenericRepository<OrderDetail>(_context);
            }
        }

        public IGenericRepository<OrderHistory> OrderHistoryRepository
        {
            get
            {
                return orderHistoryRepository ??= new GenericRepository<OrderHistory>(_context);
            }
        }

        public IGenericRepository<OrderType> OrderTypeRepository
        {
            get
            {
                return orderTypeRepository ??= new GenericRepository<OrderType>(_context);
            }
        }

        public IGenericRepository<PaymentType> PaymentTypeRepository
        {
            get
            {
                return paymentTypeRepository ??= new GenericRepository<PaymentType>(_context);
            }
        }

        public IGenericRepository<Premium> PremiumRepository
        {
            get
            {
                return premiumRepository ??= new GenericRepository<Premium>(_context);
            }
        }

        public IGenericRepository<Rating> RatingRepository
        {
            get
            {
                return ratingRepository ??= new GenericRepository<Rating>(_context);
            }
        }

        public IGenericRepository<RatingImage> RatingImageRepository
        {
            get
            {
                return ratingImageRepository ??= new GenericRepository<RatingImage>(_context);
            }
        }

        public IGenericRepository<Role> RoleRepository
        {
            get
            {
                return roleRepository ??= new GenericRepository<Role>(_context);
            }
        }

        public IGenericRepository<Toy> ToyRepository
        {
            get
            {
                return toyRepository ??= new GenericRepository<Toy>(_context);
            }
        }

        public IGenericRepository<ToySupplier> ToySupplierRepository
        {
            get
            {
                return toySupplierRepository ??= new GenericRepository<ToySupplier>(_context);
            }
        }

        public IGenericRepository<Transaction> TransactionRepository
        {
            get
            {
                return transactionRepository ??= new GenericRepository<Transaction>(_context);
            }
        }

        public IGenericRepository<TransactionDetail> TransactionDetailRepository
        {
            get
            {
                return transactionDetailRepository ??= new GenericRepository<TransactionDetail>(_context);
            }
        }

        public IGenericRepository<User> UserRepository
        {
            get
            {
                return userRepository ??= new GenericRepository<User>(_context);
            }
        }

        public IGenericRepository<UserConversation> UserConversationRepository
        {
            get
            {
                return userConversationRepository ??= new GenericRepository<UserConversation>(_context);
            }
        }

        public IGenericRepository<WalletTransaction> WalletTransactionRepository
        {
            get
            {
                return walletTransactionRepository ??= new GenericRepository<WalletTransaction>(_context);
            }
        }
        public IGenericRepository<Wallet> WalletRepository
        {
            get
            {
                return walletRepository ??= new GenericRepository<Wallet>(_context);
            }
        }

        public void Save()
        {
            _context.SaveChanges();
        }
        //chat 
        public async Task SaveAsync()
        {
            await _context.SaveChangesAsync();
        }
        //
        private bool disposed = false;

        protected virtual void Dispose(bool disposing)
        {
            if (!disposed)
            {
                if (disposing)
                {
                    _context.Dispose();
                }
                disposed = true;
            }
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }
    }
}
