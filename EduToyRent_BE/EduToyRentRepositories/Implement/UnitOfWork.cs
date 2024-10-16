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
        private IGenericRepository<Role> roleRepository;
        private IGenericRepository<User> userRepository;

        public UnitOfWork(EduToyRentDBContext context)
        {
            _context = context;
        }

        public IGenericRepository<Role> RoleRepository
        {
            get
            {
                return roleRepository ??= new GenericRepository<Role>(_context);
            }
        }
        public IGenericRepository<User> UserRepository
        {
            get
            {
                return userRepository ??= new GenericRepository<User>(_context);
            }
        }

        public void Save()
        {
            _context.SaveChanges();
        }

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
