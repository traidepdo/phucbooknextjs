import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set in environment variables.");
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database with 100+ book records...");

  // Clean up existing data in correct order
  console.log("Cleaning up existing records...");
  await prisma.wishlist.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.bookImage.deleteMany({});
  await prisma.bookCategory.deleteMany({});
  await prisma.bookAuthor.deleteMany({});
  await prisma.book.deleteMany({});
  await prisma.publisher.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.author.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Seed Users
  console.log("Seeding Users...");
  const adminPassword = await bcrypt.hash("admin123", 10);
  const userPassword = await bcrypt.hash("user123", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      name: "System Admin",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const user = await prisma.user.create({
    data: {
      email: "user@example.com",
      name: "Regular User",
      password: userPassword,
      role: "USER",
    },
  });

  // 2. Seed Addresses
  console.log("Seeding Addresses...");
  await prisma.address.createMany({
    data: [
      {
        userId: user.id,
        name: "Home Address",
        phone: "0901234567",
        street: "123 Nguyen Trai Street",
        city: "Ho Chi Minh City",
        country: "Vietnam",
      },
      {
        userId: user.id,
        name: "Work Address",
        phone: "0987654321",
        street: "456 Le Loi Street",
        city: "Da Nang",
        country: "Vietnam",
      },
    ],
  });

  // 3. Seed Coupons
  console.log("Seeding Coupons...");
  const couponWelcome = await prisma.coupon.create({
    data: {
      code: "WELCOME10",
      discount: 10.0,
      type: "PERCENTAGE",
      expiresAt: new Date("2027-12-31T23:59:59Z"),
    },
  });

  await prisma.coupon.create({
    data: {
      code: "FLAT50",
      discount: 50000.0,
      type: "FIXED",
      expiresAt: new Date("2027-12-31T23:59:59Z"),
    },
  });

  // 4. Seed Authors (15 authors)
  console.log("Seeding Authors...");
  const authorsData = [
    { name: "J.K. Rowling", bio: "Tác giả người Anh nổi tiếng với loạt truyện Harry Potter." },
    { name: "George Orwell", bio: "Tiểu thuyết gia người Anh, tác giả của Trại Súc Vật và 1984." },
    { name: "Haruki Murakami", bio: "Nhà văn Nhật Bản đương đại nổi tiếng toàn cầu." },
    { name: "Nguyễn Nhật Ánh", bio: "Nhà văn Việt Nam chuyên viết cho tuổi học trò." },
    { name: "Dale Carnegie", bio: "Tác giả cuốn Đắc Nhân Tâm kinh điển." },
    { name: "Stephen King", bio: "Ông hoàng truyện kinh dị người Mỹ." },
    { name: "Tony Buổi Sáng", bio: "Tác giả ẩn danh truyền cảm hứng cho giới trẻ Việt Nam." },
    { name: "Robert Kiyosaki", bio: "Tác giả bộ sách dạy con làm giàu Rich Dad Poor Dad." },
    { name: "Paulo Coelho", bio: "Tác giả cuốn Nhà Giả Kim nổi tiếng thế giới." },
    { name: "Yuval Noah Harari", bio: "Nhà sử học tác giả cuốn Sapiens: Lược sử loài người." },
    { name: "Simon Sinek", bio: "Tác giả và diễn giả truyền cảm hứng về nghệ thuật lãnh đạo." },
    { name: "Walter Isaacson", bio: "Nhà báo viết tiểu sử nổi tiếng về Steve Jobs và Elon Musk." },
    { name: "James Clear", bio: "Tác giả cuốn sách Atomic Habits nổi tiếng." },
    { name: "Arthur Conan Doyle", bio: "Cha đẻ của thám tử lừng danh Sherlock Holmes." },
    { name: "Victor Hugo", bio: "Đại văn hào Pháp thế kỷ 19." }
  ];

  const authors = [];
  for (const author of authorsData) {
    const created = await prisma.author.create({ data: author });
    authors.push(created);
  }

  // 5. Seed Categories (10 categories)
  console.log("Seeding Categories...");
  const categoriesData = [
    { name: "Văn Học & Tiểu Thuyết", description: "Các tác phẩm văn học trong và ngoài nước." },
    { name: "Kinh Điển", description: "Những cuốn sách trường tồn với thời gian." },
    { name: "Kinh Doanh & Đầu Tư", description: "Kinh nghiệm quản lý, đầu tư và khởi nghiệp." },
    { name: "Kỹ Năng Sống", description: "Phát triển bản thân và kỹ năng làm việc." },
    { name: "Thiếu Nhi", description: "Sách dành cho trẻ em và tuổi học trò." },
    { name: "Khoa Học & Lịch Sử", description: "Khám phá thế giới và lược sử nhân loại." },
    { name: "Kinh Dị & Trinh Thám", description: "Những câu chuyện giật gân, bí ẩn." },
    { name: "Tâm Lý Học", description: "Tìm hiểu hành vi và suy nghĩ con người." },
    { name: "Tiểu Sử & Hồi Ký", description: "Câu chuyện cuộc đời của những người vĩ đại." },
    { name: "Công Nghệ & Tương Lai", description: "Sách về AI, lập trình và kỷ nguyên số." }
  ];

  const categories = [];
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categories.push(created);
  }

  // 6. Seed Publishers (5 publishers)
  console.log("Seeding Publishers...");
  const publishersData = [
    { name: "Nhà xuất bản Trẻ", address: "Hồ Chí Minh, Việt Nam" },
    { name: "Nhà xuất bản Kim Đồng", address: "Hà Nội, Việt Nam" },
    { name: "Nhã Nam", address: "Hà Nội, Việt Nam" },
    { name: "Alpha Books", address: "Hà Nội, Việt Nam" },
    { name: "First News - Trí Việt", address: "Hồ Chí Minh, Việt Nam" }
  ];

  const publishers = [];
  for (const pub of publishersData) {
    const created = await prisma.publisher.create({ data: pub });
    publishers.push(created);
  }

  // 7. Seed 100 Books
  console.log("Generating 100 books...");
  
  const bookTemplates = [
    { title: "Harry Potter và Hòn Đá Phù Thủy", price: 125000, desc: "Tập 1 của loạt truyện Harry Potter.", catIndex: 4, authIndex: 0 },
    { title: "Harry Potter và Phòng Chứa Bí Mật", price: 135000, desc: "Tập 2 của loạt truyện Harry Potter.", catIndex: 4, authIndex: 0 },
    { title: "Harry Potter và Tên Tù Nhân Ngục Azkaban", price: 145000, desc: "Tập 3 của loạt truyện Harry Potter.", catIndex: 4, authIndex: 0 },
    { title: "1984 (Bản dịch mới)", price: 95000, desc: "Một cái nhìn tiên tri về xã hội tương lai.", catIndex: 1, authIndex: 1 },
    { title: "Trại Súc Vật", price: 65000, desc: "Tác phẩm ngụ ngôn châm biếm kinh điển.", catIndex: 1, authIndex: 1 },
    { title: "Rừng Na Uy", price: 115000, desc: "Bản tình ca buồn của tuổi trẻ cô đơn.", catIndex: 0, authIndex: 2 },
    { title: "Phía Nam Biên Giới, Phía Tây Mặt Trời", price: 98000, desc: "Câu chuyện tình lãng mạn đầy hoài niệm.", catIndex: 0, authIndex: 2 },
    { title: "Cho Tôi Xin Một Vé Đi Tuổi Thơ", price: 80000, desc: "Tác phẩm đưa độc giả trở về những ngày thơ bé.", catIndex: 4, authIndex: 3 },
    { title: "Kính Vạn Hoa (Trọn Bộ)", price: 350000, desc: "Bộ truyện học trò gắn liền thế hệ 8x, 9x.", catIndex: 4, authIndex: 3 },
    { title: "Đắc Nhân Tâm", price: 86000, desc: "Cuốn sách nghệ thuật ứng xử hàng đầu mọi thời đại.", catIndex: 3, authIndex: 4 },
    { title: "Quẳng Gánh Lo Đi Và Vui Sống", price: 79000, desc: "Phương pháp giải tỏa lo âu để sống trọn vẹn.", catIndex: 3, authIndex: 4 },
    { title: "Dạy Con Làm Giàu - Tập 1", price: 99000, desc: "Để không có tiền vẫn tạo ra tiền.", catIndex: 2, authIndex: 7 },
    { title: "Dạy Con Làm Giàu - Tập 2", price: 105000, desc: "Sử dụng đồng vốn hiệu quả.", catIndex: 2, authIndex: 7 },
    { title: "Nhà Giả Kim", price: 79000, desc: "Cuốn sách gối đầu giường của những người tìm kiếm ước mơ.", catIndex: 0, authIndex: 8 },
    { title: "Sapiens: Lược Sử Loài Người", price: 189000, desc: "Hành trình tiến hóa của nhân loại từ thời đồ đá.", catIndex: 5, authIndex: 9 },
    { title: "Homo Deus: Lược Sử Tương Lai", price: 199000, desc: "Tương lai của nhân loại dưới góc nhìn khoa học.", catIndex: 5, authIndex: 9 },
    { title: "21 Bài Học Cho Thế Kỷ 21", price: 175000, desc: "Những vấn đề cấp bách nhất của nhân loại ngày nay.", catIndex: 5, authIndex: 9 },
    { title: "Bắt Đầu Với Câu Hỏi Tại Sao", price: 110000, desc: "Tìm kiếm cảm hứng hành động bền vững.", catIndex: 2, authIndex: 10 },
    { title: "Steve Jobs (Tiểu sử chính thức)", price: 220000, desc: "Câu chuyện cuộc đời đầy biến động của người sáng lập Apple.", catIndex: 8, authIndex: 11 },
    { title: "Elon Musk: Táo Bạo và Khát Vọng", price: 235000, desc: "Tiểu sử về bộ óc thiên tài đứng sau SpaceX và Tesla.", catIndex: 8, authIndex: 11 },
    { title: "Atomic Habits - Thay Đổi Tí Hon, Hiệu Quả Phi Thường", price: 129000, desc: "Xây dựng thói quen tốt, loại bỏ thói quen xấu.", catIndex: 3, authIndex: 12 },
    { title: "Những Cuộc Phiêu Lưu Của Sherlock Holmes", price: 140000, desc: "Các vụ án ly kỳ phá án bởi Sherlock Holmes.", catIndex: 6, authIndex: 13 },
    { title: "Những Người Khốn Khổ (Trọn Bộ)", price: 290000, desc: "Kiệt tác văn học hiện thực nhân đạo Pháp.", catIndex: 1, authIndex: 14 },
    { title: "Cà Phê Cùng Tony", price: 85000, desc: "Những chia sẻ sâu sắc dành cho các bạn trẻ trước ngưỡng cửa cuộc đời.", catIndex: 3, authIndex: 6 },
    { title: "Trên Đường Băng", price: 90000, desc: "Cẩm nang chuẩn bị hành trang cất cánh vào đời.", catIndex: 3, authIndex: 6 },
  ];

  const extraAdjectives = ["Bí Ẩn", "Kỳ Lạ", "Đầu Tư Vàng", "Đỉnh Cao", "Phát Triển", "Kỷ Nguyên Mới", "Nghệ Thuật", "Hành Trình", "Phương Pháp", "Bí Quyết"];
  const extraNouns = ["Tư Duy", "Thành Công", "Cuộc Đời", "Vũ Trụ", "Tương Lai", "Thói Quen", "Lãnh Đạo", "Chiến Lược", "Tri Thức", "Hạnh Phúc"];

  const createdBooks = [];
  const imagePool = [
    "https://images.unsplash.com/photo-1544947950-fa07a98d237f",
    "https://images.unsplash.com/photo-1543002588-bfa74002ed7e",
    "https://images.unsplash.com/photo-1532012197267-da84d127e765",
    "https://images.unsplash.com/photo-1495640388908-05fa85288e61",
    "https://images.unsplash.com/photo-1512820790803-83ca734da794"
  ];

  for (let i = 0; i < 100; i++) {
    let title = "";
    let price = 0;
    let description = "";
    let catIndex = 0;
    let authIndex = 0;

    if (i < bookTemplates.length) {
      const template = bookTemplates[i];
      title = template.title;
      price = template.price;
      description = template.desc;
      catIndex = template.catIndex;
      authIndex = template.authIndex;
    } else {
      const adj = extraAdjectives[(i + 3) % extraAdjectives.length];
      const noun = extraNouns[i % extraNouns.length];
      authIndex = (i + 2) % authors.length;
      catIndex = (i + 4) % categories.length;
      
      title = `${noun} ${adj} - Tập ${Math.floor(i / 10) + 1}`;
      price = 50000 + (i * 2500) % 250000;
      description = `Cuốn sách về chủ đề ${categories[catIndex].name.toLowerCase()} giúp độc giả hiểu sâu hơn về ${noun.toLowerCase()} thông qua các góc nhìn khoa học và thực tiễn.`;
    }

    const pubIndex = i % publishers.length;
    const imageUrl = imagePool[i % imagePool.length];

    const book = await prisma.book.create({
      data: {
        title,
        price,
        description,
        stock: 50 + (i * 7) % 150,
        publisherId: publishers[pubIndex].id,
        authors: {
          create: { authorId: authors[authIndex].id },
        },
        categories: {
          create: { categoryId: categories[catIndex].id },
        },
        images: {
          create: [
            { url: imageUrl },
          ],
        },
      },
    });
    createdBooks.push(book);
  }

  // 8. Seed Reviews
  console.log("Seeding Reviews...");
  const reviewsData = [
    { rating: 5, comment: "Một cuốn sách tuyệt vời, khuyên đọc cho mọi lứa tuổi!" },
    { rating: 4, comment: "Nội dung sâu sắc, giao hàng nhanh." },
    { rating: 5, comment: "Rất thực tế và bổ ích, giúp tôi thay đổi tư duy nhiều." },
    { rating: 3, comment: "Sách in đẹp, tuy nhiên nội dung hơi khó tiếp cận đối với tôi." }
  ];

  for (let i = 0; i < 30; i++) {
    const bookIndex = (i * 3) % createdBooks.length;
    const reviewTpl = reviewsData[i % reviewsData.length];
    await prisma.review.create({
      data: {
        rating: reviewTpl.rating,
        comment: reviewTpl.comment,
        userId: user.id,
        bookId: createdBooks[bookIndex].id,
      },
    });
  }

  // 9. Seed Wishlists
  console.log("Seeding Wishlists...");
  for (let i = 0; i < 10; i++) {
    const bookIndex = (i * 7) % createdBooks.length;
    await prisma.wishlist.create({
      data: {
        userId: user.id,
        bookId: createdBooks[bookIndex].id,
      },
    }).catch(() => {
      // Ignore duplicate unique constraints
    });
  }

  // 10. Seed Cart
  console.log("Seeding Carts...");
  for (let i = 0; i < 5; i++) {
    const bookIndex = (i * 11) % createdBooks.length;
    await prisma.cart.create({
      data: {
        userId: user.id,
        bookId: createdBooks[bookIndex].id,
        quantity: 1 + (i % 3),
      },
    });
  }

  // 11. Seed Orders & OrderItems
  console.log("Seeding Orders...");
  const order = await prisma.order.create({
    data: {
      code: "ORD-998877",
      total: 249000.0,
      status: "DELIVERED",
      shippingAddress: "123 Nguyen Trai Street, Ho Chi Minh City, Vietnam",
      userId: user.id,
      couponId: couponWelcome.id,
      orderItems: {
        create: [
          { bookId: createdBooks[0].id, quantity: 1, price: createdBooks[0].price },
          { bookId: createdBooks[1].id, quantity: 1, price: createdBooks[1].price },
        ],
      },
    },
  });

  console.log("Database seeded successfully with 100 books.");
  console.log("Seed Overview:");
  console.log("- Users created:", admin.email, ",", user.email);
  console.log("- Total Books created:", createdBooks.length);
  console.log("- Orders created code:", order.code);
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
