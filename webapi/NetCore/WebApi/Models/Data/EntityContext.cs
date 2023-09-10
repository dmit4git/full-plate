using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using WebApi.Models.Auth;

namespace WebApi.Models.Data;

public class EntityContext: IdentityDbContext<AppUser> {
    
    public EntityContext(DbContextOptions<EntityContext> options): base(options) {}
    
    protected override void OnModelCreating(ModelBuilder modelBuilder) {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<AppUser>().Navigation(user => user.RefreshToken).AutoInclude();
    }
    
#nullable disable
    public DbSet<RefreshToken> RefreshTokens { get; set; }
#nullable enable
}