# ⚡ SYNTAX AI - Intelligent Code Analyzer

An AI-powered code analysis tool that explains any code line-by-line in plain English. Built with Angular and powered by OpenAI's GPT-4o-mini.

![Version](https://img.shields.io/badge/version-2.0-blue)
![Angular](https://img.shields.io/badge/Angular-16.2-red)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- 🚀 **Instant Analysis** - Get detailed explanations in seconds
- 📝 **Line-by-Line Breakdown** - Understand every line of code
- 🔍 **Auto Language Detection** - Automatically detects programming language
- 🎯 **Smart Summaries** - Get overview, key features, and complexity assessment
- 📚 **10+ Languages Supported** - JavaScript, TypeScript, Python, Java, C#, React/JSX, SQL, Go, Rust, C++
- 💾 **Export Options** - Copy or download analysis reports
- 🎨 **Modern UI** - Beautiful, responsive interface with smooth animations

## 🛠️ Tech Stack

- **Frontend**: Angular 16
- **AI Engine**: OpenAI GPT-4o-mini
- **Styling**: Custom CSS with animations
- **HTTP Client**: Angular HttpClient

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- OpenAI API Key

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd Code_Analyser
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure API Key

Add your OpenAI API key in `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  openaiApiKey: 'your-openai-api-key-here'
};
```

### 4. Run the development server

```bash
ng serve
```

Navigate to `http://localhost:4200/`. The application will automatically reload if you change any source files.

## 📖 How to Use

1. **Select Language** - Choose your programming language (optional - auto-detection available)
2. **Paste Code** - Enter your code in the editor or use pre-built examples
3. **Analyze** - Click "Analyze Code" to start the AI analysis
4. **Review Results** - View the summary and line-by-line explanations
5. **Export** - Copy to clipboard or download the full analysis report

## 🌐 Supported Languages

| Language | Icon | Features |
|----------|------|----------|
| JavaScript | ⚡ | Full ES6+ support |
| TypeScript | 📘 | Type annotations |
| React/JSX | ⚛️ | Hooks, Components |
| Python | 🐍 | Functions, Classes |
| Java | ☕ | OOP patterns |
| C# / .NET | 💜 | LINQ, Async/Await |
| C++ | 🔧 | STL, Pointers |
| Go | 🐹 | Goroutines |
| Rust | 🦀 | Ownership, Lifetimes |
| SQL | 🗃️ | Queries, Joins |

## 📁 Project Structure

```
Code_Analyser/
├── src/
│   ├── app/
│   │   ├── app.component.ts      # Main component logic
│   │   ├── app.component.html    # UI template
│   │   ├── app.component.css     # Styles
│   │   └── app.module.ts         # Module configuration
│   ├── environments/
│   │   └── environment.ts        # Environment variables
│   └── index.html                # Entry HTML
├── angular.json                  # Angular configuration
├── package.json                  # Dependencies
└── README.md                     # Documentation
```

## 🔧 Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

```bash
# Development build
ng build

# Production build
ng build --configuration production
```

## 🧪 Running Tests

```bash
# Unit tests
ng test

# End-to-end tests
ng e2e
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

---

<p align="center">
  Made with ❤️ by <strong>SYNTAX AI</strong>
</p>
