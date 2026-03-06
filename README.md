#  Love _mate

**love_mate** is a premium, high-aesthetic matchmaking and intimacy-building platform designed to help souls find their perfect rhythm. Built with a "god-level" design philosophy, it focuses on shared experiences, personality alignment, and meaningful connections.

---

##  Key Features

- **Vibrational Matching**: Find compatible partners based on your core personality traits and gender preferences.
- ** Strict Safety**: Built-in validation ensures matches follow gender-parity rules (Boy/Girl matches only).
- ** Shared Quests**: Embark on curated challenges with your partner to build intimacy.
- ** Proof of Harmony**: Upload memories and proof of work to complete shared tasks.
- ** Friends Sanctuary**: A dedicated space for your most meaningful connections to persist, complete with chat and ongoing quests.
- ** Personality Trails**: Deeply integrated trait system that influences recommended tasks and matching accuracy.
- ** Heart Stream**: Real-time chat to keep the conversation flowing.

---

##  Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Database**: [Prisma](https://www.prisma.io/) with SQLite
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) (Credentials Provider)
- **Styling**: Vanilla CSS with Tailwind CSS for rapid, fluid layout design
- **Security**: Bcrypt for password hashing and strict API-level validation

---

##  Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd cfc
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="your-secret-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Initialize the Database**:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

5. **Run the development server**:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) to begin your journey.

---

##  Project Structure

- `app/api/`: Backend routes for matches, friends, traits, and tasks.
- `components/`: Reusable UI components including `ChatRoom` and `RecommendedTasks`.
- `prisma/`: Database schema and seed data.
- `lib/`: Shared utilities, Prisma client, and auth configuration.

---

## 📜 License

Created with ❤️ for meaningful connections.
