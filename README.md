# Domain Generator

A modern web application for generating creative domain names and checking their availability in real-time.

![Solid.js](https://img.shields.io/badge/Solid.js-2C4F7C?style=flat&logo=solid&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)
![UnoCSS](https://img.shields.io/badge/UnoCSS-333333?style=flat&logo=unocss&logoColor=white)

## Features

- **Smart Domain Generation** - Generate creative domain names using intelligent word combinations, prefixes, and suffixes
- **Real-time Availability Check** - Verify domain availability using RDAP and DNS protocols
- **Bulk Operations** - Check multiple domains at once or auto-generate only available domains
- **Favorites & Bookmarks** - Save interesting domains and mark your favorites
- **Multiple TLDs** - Support for 10 popular TLDs (.com, .net, .org, .io, .dev, .app, .co, .me, .ai, .tech)
- **Keyword-based Generation** - Generate domains based on your custom keywords
- **Dark Mode** - Clean, modern UI with dark mode support

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | [Solid.js](https://www.solidjs.com/) + [SolidStart](https://start.solidjs.com/) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Database | [SQLite](https://www.sqlite.org/) + [Prisma ORM](https://www.prisma.io/) |
| Styling | [UnoCSS](https://unocss.dev/) (Atomic CSS) |
| Build Tool | [Vinxi](https://vinxi.vercel.app/) |

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/domain-generator.git
cd domain-generator

# Install dependencies
pnpm install

# Generate Prisma client
pnpm run db:generate

# Initialize the database
pnpm run db:push
```

### Development

```bash
# Start development server with hot reload
pnpm run dev
```

The app will be available at `http://localhost:3000`

### Production

```bash
# Build for production
pnpm run build

# Start production server
pnpm run start
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Run production server |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:push` | Sync database schema |
| `pnpm db:studio` | Open Prisma Studio GUI |

## Project Structure

```
src/
├── components/
│   ├── GeneratorForm.tsx    # Domain generation options form
│   ├── DomainCard.tsx       # Individual domain display card
│   └── SavedDomains.tsx     # Saved domains management
├── lib/
│   ├── generator.ts         # Domain name generation logic
│   ├── availability.ts      # RDAP/DNS availability checking
│   ├── actions.ts           # Server actions (RPC)
│   └── db.ts                # Prisma client
├── routes/
│   └── index.tsx            # Main page
├── app.tsx                  # Root component
├── entry-client.tsx         # Client entry
└── entry-server.tsx         # Server entry
```

## How It Works

### Domain Generation

The generator creates domain names using multiple strategies:
- Base word combinations
- Prefix combinations (e.g., "super", "mega", "cyber")
- Suffix combinations (e.g., "ify", "hub", "lab")
- Keyword-based generation
- Short word combinations

### Availability Checking

Domain availability is verified using two methods:
1. **RDAP Protocol** - Primary method for .com, .net, .org, .io, .dev, .app
2. **DNS Resolution** - Fallback method for other TLDs

## License

MIT

---

Built with [Solid.js](https://www.solidjs.com/) and [SolidStart](https://start.solidjs.com/)
