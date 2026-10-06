# MIU Python Book Website

A static educational website for a Python learning book, designed to teach programming concepts through interactive examples, chapter explanations, and browser-based Python execution.

This project contains the full website content for the book, including chapter pages, code examples, practice sections, video links, feedback forms, and a built-in code runner.

## Overview

The project is organized as a static site that can be deployed to Netlify, Vercel, or GitHub Pages without needing a backend server for normal browsing.

Key features include:

- Full book content organized into chapters and topics
- Interactive Python code examples that run in the browser
- Built-in code runner for learners to write and test code
- Chapter-wise explanations, notes, and examples
- Dark mode support
- Mobile-friendly navigation and layout
- Feedback and review forms connected to email
- PDF interest form and copyright page

## Project Structure

- `site/` — Published website files ready for deployment
- `tools/` — Source generation and content-related utilities
- `tools/source/` — Book content and media metadata
- `tools/build_site.py` — Script used to generate the website from source content
- `site/assets/` — CSS, JavaScript, and runtime assets
- `graphify-out/` — Generated analysis metadata

## Tech Stack

- HTML, CSS, and JavaScript for the static website
- Python-based build tooling for content generation
- Pyodide for running Python code inside the browser
- FormSubmit integration for email-based form submissions

## Local Preview

To preview the website locally:

```bash
cd /path/to/Python_Book_Website
python3 -m http.server 8000 --directory site
```

Then open:

```text
http://localhost:8000
```

Important: the site should be opened through a local web server rather than directly as a file, because the browser-based code runner depends on browser-side asset loading.

## Deployment

You can deploy the `site/` folder to any static hosting provider.

### Netlify

- Go to <https://app.netlify.com/drop>
- Drag and drop the `site` folder
- Deploy immediately

### Vercel

- Import the project in Vercel
- Select the `site` folder as the deployment root
- Use the framework setting `Other`

### GitHub Pages

- Push the contents of `site/` to the root of a repository
- In GitHub repository settings, enable Pages
- Set the branch to `main` and folder to `/`

## Forms and Email Integration

The website forms are configured in `site/assets/config.js`.

Typical config values include:

- contact or review email address
- optional FormSubmit configuration
- optional Web3Forms access key

After deployment, activate the form submission email once from the configured inbox to receive submissions directly in Gmail.

## Content and Media

To modify the book videos or content:

- Update video metadata in `tools/source/videos.json`
- Regenerate the site using the build script if needed

The build system reads source data and turns it into static HTML pages under `site/`.

## Notes

This project includes browser protection scripts for content and copy-protection behavior, such as disabling certain shortcuts and restricting direct actions on text and images. These measures are designed to discourage casual copying and support copyright notice enforcement, but they cannot guarantee full prevention in all browser or device scenarios.

## License and Usage

This repository appears to be intended for a specific educational book website and its published content. Please respect the copyright notices and usage restrictions included in the project and on the site.

## Summary

MIU Python Book Website is a static educational platform for teaching Python through a structured book, interactive browser code execution, and rich chapter content. It is designed to be simple to deploy, easy to update, and suitable for static hosting.
