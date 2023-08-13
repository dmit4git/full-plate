using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using webapi.Models.Security;

public class EF_DataContext: IdentityDbContext<AppUser> {
    public EF_DataContext(DbContextOptions<EF_DataContext> options): base(options) {}
    // protected override void OnModelCreating(ModelBuilder modelBuilder) {
    //     modelBuilder.UseSerialColumns();
    // }
    // public DbSet<Product> Products {
    //     get;
    //     set;
    // }
    // public DbSet<Order> Orders {
    //     get;
    //     set;
    // }
}