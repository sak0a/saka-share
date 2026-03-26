# Saka Share

A self-hosted file sharing platform, forked from [Pingvin Share](https://github.com/stonith404/pingvin-share).

## Features

### Core

- Share files using a link
- Unlimited file size (restricted only by disk space)
- Set an expiration date for shares
- Secure shares with visitor limits and passwords
- Email recipients
- Reverse shares
- OIDC and LDAP authentication
- Integration with ClamAV for security scans
- Storage providers: local filesystem and S3

### New in Saka Share

- **Code Snippets** - Share syntax-highlighted code snippets alongside files, with auto language detection and support for 30+ languages
- **Inline Code Editor** - VS Code-style editing experience with live syntax highlighting, line numbers, and tab support
- **Redesigned UI** - Modernized interface with animated stacked row lists for shares, improved header with Upload CTA, and theme/language switcher
- **Redesigned Navigation** - Upload button centered in header, avatar dropdown with quick links to My Shares and Reverse Shares
- **Account Layout** - Account settings wrapped in a sidebar navigation layout
- **Improved File Preview** - Enhanced file preview modal with better support for images, audio, video, SVG, and text files
- **Cookie Security** - Hardened cookie security flags across auth, share, and OAuth flows
- **30+ Languages** - Full i18n support with snippet-related translations across all locales

## Setup

### Docker Compose (recommended)

1. Clone this repository
2. Run `docker compose up -d`
3. Access the app at `http://localhost:3000`

### Configuration

Configuration can be done through the admin UI or via a `config.yaml` file. See [config.example.yaml](config.example.yaml) for all available options.

## Credits

Forked from [Pingvin Share](https://github.com/stonith404/pingvin-share) by [stonith404](https://github.com/stonith404).
