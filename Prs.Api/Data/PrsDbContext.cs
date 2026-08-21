using Microsoft.EntityFrameworkCore;
using Prs.Api.Models;

namespace Prs.Api.Data;

public class PrsDbContext : DbContext
{
    public DbSet<User> Users { get; set; } = default!;
    public DbSet<Vendor> Vendors { get; set; } = default!;
    public DbSet<Product> Products { get; set; } = default!;
    public DbSet<Request> Requests { get; set; } = default!;
    public DbSet<RequestLine> RequestLines { get; set; } = default!;

    public DbSet<Comment> Comments { get; set; }

    public PrsDbContext(DbContextOptions<PrsDbContext> options) : base(options) { }

    public PrsDbContext() { }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
            optionsBuilder.UseSqlServer("server=localhost\\sqlexpress;database=PrsTeamProject;trusted_connection=true;trustServerCertificate=true;");
        }
    }
    protected override void OnModelCreating(ModelBuilder modelBuilder) {
        modelBuilder.Entity<Comment>()
            .HasOne(c => c.User)
            .WithMany()
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.NoAction); 
    }
}