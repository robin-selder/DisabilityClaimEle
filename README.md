# Disability Eligibility Evaluation Tool

A professional, preliminary screening tool designed to help individuals evaluate their potential eligibility for Social Security Administration (SSA) disability benefits.

## 🚀 Overview

This application provides a multi-step evaluation process based on SSA's medical-vocational guidelines (Grid Rules) and other eligibility criteria. It guides users through their employment history, medical conditions, physical/cognitive limitations, and educational background to provide a preliminary assessment.

## ✨ Key Features

- **Privacy-First Design**: No personal information is collected, stored, or transmitted to any servers. All data stays in the browser's `sessionStorage`.
- **Intelligent Evaluation**: Uses logic based on SSA Grid Rules, including age-based factors, RFC (Residual Functional Capacity) levels, and educational impact.
- **Accessibility Optimized**: WCAG 2.1 AA compliant, featuring skip-navigation, focus management, and screen reader labels.
- **Live Input Masking**: Automatic formatting for date fields (`mm/yyyy`) to ensure data consistency.
- **Dynamic Auto-population**: Automatically populates "Last Employed" dates based on employment history.
- **Printable Results**: Users can print their evaluation summary and key factors for their records.

## 🔒 Security & Privacy

This application is built with a commitment to user privacy:
- **Zero Server-Side Storage**: The app is a static client-side application.
- **Session-Only Data**: All entered information is stored in `sessionStorage`, which is automatically cleared when the browser tab is closed.
- **No Tracking**: No cookies, tracking scripts, or analytics are used.

## 🛠️ Technology Stack

- **HTML5**: Semantic structure and accessibility.
- **Vanilla CSS**: Custom styling with CSS variables for maintainability.
- **Vanilla JavaScript**: Core application logic and evaluation engine.
- **No Dependencies**: Lightweight and fast with zero external libraries.

## 📖 How to Run Locally

1.  **Clone the repository** (or download the files).
2.  **Open `index.html`** in any modern web browser.
3.  **No build process required**.

## 🌐 Publishing to GitHub Pages

This repository includes a GitHub Actions workflow that automatically deploys the application to GitHub Pages for testing and sharing.

### Initial Setup (One-Time Configuration)

1. Go to your repository **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. The workflow will automatically run on the next push to the `main` branch

### Usage

- **Automatic Deployment**: Every push to the `main` branch automatically deploys to GitHub Pages
- **Manual Deployment**: Go to **Actions** tab → **Deploy to GitHub Pages** workflow → **Run workflow** button
- **Access Your Site**: After deployment, your site will be available at:
  ```
  https://[username].github.io/[repository-name]/
  ```

### Checking Deployment Status

1. Navigate to the **Actions** tab in your GitHub repository
2. Look for the **Deploy to GitHub Pages** workflow
3. Click on a workflow run to see deployment details and status
4. Once complete, the deployment URL will be shown in the deploy job

## 📂 Project Structure

- `index.html`: Main application interface.
- `app.js`: Application logic, state management, and evaluation engine.
- `styles.css`: Modern, responsive design system.
- `privacy-policy.html`, `terms-of-service.html`, `accessibility-statement.html`: Legal and compliance pages.
- `robots.txt`, `sitemap.xml`: SEO metadata.

## ⚖️ Disclaimer

This tool is for **informational purposes only** and does not constitute an official disability determination or legal/medical advice. Official determinations must be made by the Social Security Administration.

---
© 2024 Disability Eligibility Evaluation. Developed for public service information.
