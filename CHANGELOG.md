# Changelog

All notable changes to the Carphatian AI Marketplace will be documented here.

## [Unreleased]

### Security 🔒
- Added virus scanning for file uploads (ClamAV + basic validation)
- Implemented proper Pusher channel authorization checks
- Added file type whitelist validation
- Enforced file size limits (50MB/100MB for archives)
- Database tracking for all file uploads

### Fixed 🐛
- Fixed unauthorized access to private Pusher channels
- Prevented malicious file uploads

### Documentation 📚
- Added SECURITY.md with virus scanning setup
- Documented Pusher authorization logic
- Added ClamAV installation instructions

## [1.0.0] - 2025-12-12

### Added ✨
- Next.js 16 with App Router
- PostgreSQL database with Drizzle ORM
- Stripe Connect for payments
- Pusher for real-time messaging
- Multi-language support (7 languages)
- File upload system
- Contract management
- Job posting and applications
- AI-powered features
- Admin dashboard

### Infrastructure 🏗️
- Docker compose setup
- PM2 process management
- NGINX reverse proxy
- Let's Encrypt SSL
- GitHub Actions CI/CD

---
**Repository**: https://github.com/msrusu87-web/chat-carphatian  
**Live Site**: https://chat.carphatian.ro
