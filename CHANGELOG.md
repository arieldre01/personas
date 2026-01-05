# Changelog

All notable changes to the Persona Pulse Explorer project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Conventional Commits](https://www.conventionalcommits.org/).

## [Unreleased]
- docs: add CHANGELOG.md and fix auto-update workflow (#3)

## [1.0.0] - 2026-01-05

### Features
- feat: add streaming responses and conversation memory
- feat: add persona knowledge base (RAG-lite)
- feat: add Ollama-powered persona matching to Finder
- feat: add real persona images extracted from PowerPoint
- feat: add Priya's real photo from slide 10
- feat: improve UI/UX with new typography, animations, glassmorphism, and dark mode toggle
- feat: integrate Ollama AI for persona chat with persona-specific context
- feat: add persona chat feature - interact with personas in their style
- feat: add Persona Pulse Explorer frontend

### Fixes
- fix: center Alex's image by adjusting object-position to top
- fix: add direct answer instructions and specific learning goals for each persona
- fix: remove quotes from responses and add honest 'I don't know' behavior
- fix: prevent personas from awkwardly introducing themselves in chat
- fix: use regular img tags to bypass SSL certificate issue with avatars
- fix: configure Next.js to allow external image domains

### Performance
- perf: switch to gemma3:1b for faster responses

### Chores
- chore: remove temporary extraction scripts
- chore: switch to phi3:mini model with better context settings
- ci: add GitHub Actions workflow for changelog generation

### Documentation
- docs: update hero text to highlight persona chat feature

### Style
- style: make persona cards smaller with 4-column layout

---
*This changelog is automatically updated on merges to main.*

