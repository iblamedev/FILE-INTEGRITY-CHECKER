# File Integrity Checker

A comprehensive tool for detecting file tampering through hash comparison, featuring both a Python CLI and a beautiful React web interface.

![File Integrity Checker](https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop)

## 🚀 Features

- **Hash-based Verification**: Uses SHA-256 hashing to detect file modifications
- **Dual Interface**: Command-line Python script + modern React web interface
- **Database Management**: JSON-based database for storing file integrity records
- **Real-time Monitoring**: Track file status with verification history
- **Import/Export**: Backup and restore integrity databases
- **Dark Mode**: Beautiful UI with light/dark theme support
- **Drag & Drop**: Easy file upload via web interface

## 📋 Requirements

### Python CLI
- Python 3.6+
- No external dependencies (uses only standard library)

### Web Interface
- Node.js 16+
- npm or yarn

## 🛠️ Installation

### Clone the Repository
```bash
git clone https://github.com/yourusername/file-integrity-checker.git
cd file-integrity-checker
```

### For Web Interface
```bash
npm install
npm run dev
```

## 📖 Usage

### Python CLI

#### Add a file to the database
```bash
python file_integrity_checker.py add /path/to/file.txt "Important document"
```

#### Verify a single file
```bash
python file_integrity_checker.py verify /path/to/file.txt
```

#### Verify all files in database
```bash
python file_integrity_checker.py verify-all
```

#### List all files in database
```bash
python file_integrity_checker.py list
```

#### Remove a file from database
```bash
python file_integrity_checker.py remove /path/to/file.txt
```

#### Export database
```bash
python file_integrity_checker.py export backup.json
```

#### Import database
```bash
python file_integrity_checker.py import backup.json
# Or merge with existing database
python file_integrity_checker.py import backup.json merge
```

### Web Interface

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser to `http://localhost:5173`

3. Use the web interface to:
   - Drag and drop files for integrity checking
   - View file status with beautiful visualizations
   - Monitor verification history
   - Export/import databases
   - Toggle between light and dark themes

## 🏗️ How It Works

1. **File Addition**: When a file is added, the system calculates its SHA-256 hash and stores it along with metadata (size, date, description)

2. **Verification**: During verification, the current file hash is compared against the stored hash

3. **Status Tracking**: Files are marked as:
   - ✅ **Verified**: Hash matches, file is unchanged
   - ⚠️ **Tampered**: Hash differs, file has been modified
   - ❌ **Missing**: File no longer exists
   - ❓ **Unknown**: File not in database

4. **Database**: All data is stored in a JSON file (`integrity_database.json`) for portability

## 📁 Project Structure

```
file-integrity-checker/
├── file_integrity_checker.py    # Main Python CLI script
├── src/
│   ├── App.tsx                  # React main component
│   ├── main.tsx                 # React entry point
│   └── index.css                # Tailwind CSS
├── package.json                 # Node.js dependencies
├── tailwind.config.js           # Tailwind configuration
├── vite.config.ts              # Vite build configuration
└── README.md                   # This file
```

## 🎨 Screenshots

### Web Interface - Light Mode
The web interface provides an intuitive dashboard for managing file integrity checks with real-time status updates and beautiful visualizations.

### Web Interface - Dark Mode
Includes a sleek dark mode for comfortable usage in low-light environments.

### CLI Interface
```
$ python file_integrity_checker.py verify-all
Verification Results:
  ✓ Verified: 15
  ⚠ Tampered: 2
  ✗ Errors: 0
  TAMPERED: /home/user/important_document.pdf
  TAMPERED: /home/user/config.json
```

## 🔒 Security Features

- **SHA-256 Hashing**: Cryptographically secure hash function
- **Tamper Detection**: Detects even single-bit changes
- **Metadata Tracking**: Monitors file size and modification dates
- **Audit Trail**: Maintains verification history and check counts

## 🚀 Building for Production

### Web Interface
```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

### Python Script
The Python script is ready to use as-is. You can also create a standalone executable:

```bash
pip install pyinstaller
pyinstaller --onefile file_integrity_checker.py
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/) and [Vite](https://vitejs.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Python's built-in `hashlib` for cryptographic functions

## 📞 Support

If you encounter any issues or have questions, please [open an issue](https://github.com/yourusername/file-integrity-checker/issues) on GitHub.

---

**⭐ If you find this project useful, please consider giving it a star on GitHub!**