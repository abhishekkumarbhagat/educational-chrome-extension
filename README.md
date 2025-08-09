# Educational Content Filter - Chrome Extension

A Chrome extension that helps users focus on educational content by filtering out non-educational websites and promoting learning-focused browsing.

## 🎓 Features

- **Smart Content Filtering**: Automatically detects and filters non-educational websites
- **Educational Categories**: Supports multiple categories including:
  - Academic & Research
  - Online Courses
  - Technical Documentation
  - Educational News
  - Reference & Dictionaries
- **Custom Educational Sites**: Add your own educational domains to the whitelist
- **Usage Statistics**: Track blocked vs. allowed sites
- **Beautiful UI**: Modern, intuitive popup interface
- **Customizable**: Toggle categories and filter settings
- **Session Override**: Temporarily disable filter when needed

## 🚀 Installation

### From Source (Development)

1. Clone this repository:
```bash
git clone https://github.com/abhishekkumarbhagat/educational-chrome-extension.git
cd educational-chrome-extension
```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" in the top right corner

4. Click "Load unpacked" and select the extension directory

5. The Educational Content Filter icon should appear in your extensions toolbar

### From Chrome Web Store

*Coming soon - extension will be published to the Chrome Web Store*

## 📋 Usage

### Basic Usage

1. Click the extension icon in your Chrome toolbar
2. Toggle the "Filter Active" switch to enable/disable filtering
3. Configure which educational categories to include
4. Add custom educational sites as needed

### Educational Categories

The extension recognizes these types of educational content:

- **Academic & Research**: Universities, research papers, scholarly articles
- **Online Courses**: MOOCs, educational platforms, learning sites
- **Technical Documentation**: Developer docs, APIs, programming guides
- **Educational News**: Science news, educational articles
- **Reference**: Dictionaries, encyclopedias, reference materials

### Custom Sites

Add your own educational domains:
1. Open the extension popup
2. Scroll to "Custom Educational Sites"
3. Enter a domain (e.g., `myschool.edu`)
4. Click "Add"

### Statistics

Track your educational browsing:
- View blocked non-educational sites
- See allowed educational sites accessed
- Reset statistics anytime

## 🔧 Configuration

### Default Educational Domains

The extension includes pre-configured educational domains such as:
- `.edu` domains
- Major educational platforms (Khan Academy, Coursera, edX)
- Documentation sites (MDN, Stack Overflow)
- Reference sites (Wikipedia, dictionaries)

### Content Analysis

The extension uses multiple methods to identify educational content:
1. Domain-based filtering
2. URL pattern matching
3. Content keyword analysis
4. Custom user-defined sites

## 🛠️ Development

### Project Structure

```
educational-chrome-extension/
├── manifest.json          # Extension configuration
├── popup.html            # Popup interface
├── popup.js              # Popup functionality
├── styles.css            # Popup styling
├── content.js            # Content script
├── content.css           # Content styling
├── background.js         # Service worker
├── icons/               # Extension icons
└── README.md           # Documentation
```

### Building

No build process required - this is a vanilla JavaScript extension.

### Testing

1. Load the extension in Chrome
2. Visit various websites to test filtering
3. Check console for any errors
4. Test popup functionality

## 🎨 Customization

### Adding New Educational Domains

Edit the `educationalDomains` object in `content.js`:

```javascript
const educationalDomains = {
    academic: [
        // Add new academic domains here
        'newuniversity.edu'
    ],
    // ... other categories
};
```

### Modifying the UI

- Edit `popup.html` for structure changes
- Modify `styles.css` for visual customization
- Update `popup.js` for functionality changes

## 🔒 Permissions

This extension requires the following permissions:
- `activeTab`: To analyze current page content
- `storage`: To save user preferences and statistics
- `tabs`: To communicate with content scripts
- `host_permissions`: To run on all websites for filtering

## 🐛 Known Issues

- Some dynamic content may not be filtered immediately
- Very fast navigation between pages might briefly show non-educational content

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Thanks to all the educational platforms that inspire learning
- Icons and design inspiration from modern web design trends
- Chrome Extension API documentation and community

## 📞 Support

If you encounter any issues or have suggestions:
1. Check the [Issues](https://github.com/abhishekkumarbhagat/educational-chrome-extension/issues) page
2. Create a new issue with detailed information
3. Include your Chrome version and extension version

---

**Happy Learning! 🎓** 