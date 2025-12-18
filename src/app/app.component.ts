import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { environment } from '../environments/environment';

interface LineExplanation {
  lineNumber: number;
  code: string;
  explanation: string;
  type: 'code' | 'comment' | 'empty';
}

interface CodeExample {
  name: string;
  language: string;
  icon: string;
  code: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.4s ease-out', style({ opacity: 1 }))
      ])
    ]),
    trigger('slideUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.5s cubic-bezier(0.33, 1, 0.68, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('slideDown', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('0.3s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerFadeIn', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(15px)' }),
          stagger('80ms', [
            animate('0.4s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('0.3s ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ])
  ]
})
export class AppComponent implements OnInit {
  private apiKey: string = '';

  codeInput: string = '';
  selectedLanguage: string = 'javascript';

  isAnalyzing: boolean = false;
  analysisComplete: boolean = false;
  explanations: LineExplanation[] = [];
  codeSummary: {
    title: string;
    purpose: string;
    keyFeatures: string[];
    complexity: 'Beginner' | 'Intermediate' | 'Advanced';
  } | null = null;
  errorMessage: string = '';

  activeTab: 'input' | 'output' = 'input';
  showExamples: boolean = false;
  analysisProgress: number = 0;
  totalLines: number = 0;
  analyzedLines: number = 0;
  languageAutoDetected: boolean = false;
  originalSelectedLanguage: string = '';
  isBriefMode: boolean = false; 
  showCodePreview: boolean = false; 
  
  showToast: boolean = false;
  toastMessage: string = '';
  toastIcon: string = '✓';
  
  totalAnalyses: number = 0;

  languages = [
    { value: 'javascript', label: 'JavaScript', icon: '⚡' },
    { value: 'typescript', label: 'TypeScript', icon: '📘' },
    { value: 'react', label: 'React/JSX', icon: '⚛️' },
    { value: 'python', label: 'Python', icon: '🐍' },
    { value: 'java', label: 'Java', icon: '☕' },
    { value: 'csharp', label: 'C# / .NET', icon: '💜' },
    { value: 'cpp', label: 'C++', icon: '🔧' },
    { value: 'go', label: 'Go', icon: '🐹' },
    { value: 'rust', label: 'Rust', icon: '🦀' },
    { value: 'sql', label: 'SQL', icon: '🗃️' }
  ];

  codeExamples: CodeExample[] = [
    {
      name: 'React Component',
      language: 'react',
      icon: '⚛️',
      code: `import React, { useState, useEffect } from 'react';

const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser(userId).then(data => {
      setUser(data);
      setLoading(false);
    });
  }, [userId]);

  if (loading) return <Spinner />;

  return (
    <div className="profile">
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
};

export default UserProfile;`
    },
    {
      name: 'Python Function',
      language: 'python',
      icon: '🐍',
      code: `def fibonacci(n):
    """Generate Fibonacci sequence up to n terms."""
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    
    sequence = [0, 1]
    while len(sequence) < n:
        next_num = sequence[-1] + sequence[-2]
        sequence.append(next_num)
    
    return sequence

# Example usage
result = fibonacci(10)
print(f"First 10 Fibonacci numbers: {result}")`
    },
    {
      name: 'Java Class',
      language: 'java',
      icon: '☕',
      code: `public class BankAccount {
    private String accountNumber;
    private double balance;
    private String ownerName;

    public BankAccount(String accountNumber, String ownerName) {
        this.accountNumber = accountNumber;
        this.ownerName = ownerName;
        this.balance = 0.0;
    }

    public void deposit(double amount) {
        if (amount > 0) {
            balance += amount;
            System.out.println("Deposited: $" + amount);
        }
    }

    public boolean withdraw(double amount) {
        if (amount > 0 && balance >= amount) {
            balance -= amount;
            return true;
        }
        return false;
    }

    public double getBalance() {
        return balance;
    }
}`
    },
    {
      name: 'C# LINQ Query',
      language: 'csharp',
      icon: '💜',
      code: `using System;
using System.Linq;
using System.Collections.Generic;

public class OrderProcessor
{
    public List<OrderSummary> GetTopCustomerOrders(List<Order> orders)
    {
        var result = orders
            .Where(o => o.Status == OrderStatus.Completed)
            .GroupBy(o => o.CustomerId)
            .Select(g => new OrderSummary
            {
                CustomerId = g.Key,
                TotalOrders = g.Count(),
                TotalAmount = g.Sum(o => o.Amount)
            })
            .OrderByDescending(s => s.TotalAmount)
            .Take(10)
            .ToList();

        return result;
    }
}`
    },
    {
      name: 'JavaScript Async',
      language: 'javascript',
      icon: '⚡',
      code: `async function fetchUserData(userId) {
  try {
    const response = await fetch(\`/api/users/\${userId}\`);
    
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    
    const userData = await response.json();
    
    const posts = await fetch(\`/api/users/\${userId}/posts\`);
    userData.posts = await posts.json();
    
    return userData;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }
}

// Usage with promise chaining
fetchUserData(123)
  .then(user => console.log(user))
  .catch(err => console.error(err));`
    },
    {
      name: 'SQL Query',
      language: 'sql',
      icon: '🗃️',
      code: `SELECT 
    c.customer_name,
    COUNT(o.order_id) AS total_orders,
    SUM(o.total_amount) AS lifetime_value,
    AVG(o.total_amount) AS avg_order_value
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
WHERE o.order_date >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)
    AND o.status = 'completed'
GROUP BY c.customer_id, c.customer_name
HAVING COUNT(o.order_id) >= 5
ORDER BY lifetime_value DESC
LIMIT 20;`
    }
  ];

  // Statistics
  stats = {
    linesAnalyzed: 0,
    tokensUsed: 0,
    analysisTime: 0
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.totalAnalyses = parseInt(localStorage.getItem('total_analyses') || '0', 10);
    
    this.apiKey = environment.openaiApiKey;
    console.log('✅ API Key loaded from environment');
  }

  showNotification(message: string, icon: string = '✓'): void {
    this.toastMessage = message;
    this.toastIcon = icon;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  getLineNumbers(): number[] {
    const lines = (this.codeInput || ' ').split('\n').length;
    return Array.from({ length: lines }, (_, i) => i + 1);
  }

  onCodePaste(event: ClipboardEvent): void {
    setTimeout(() => {
      const detected = this.detectLanguage(this.codeInput);
      if (detected !== this.selectedLanguage) {
        this.selectedLanguage = detected;
        this.showNotification(`Language detected: ${this.getLanguageLabel()}`, '🔍');
      }
    }, 100);
  }

  copyLine(item: LineExplanation): void { 
    const text = `Line ${item.lineNumber}: ${item.code}\n→ ${item.explanation}`;
    navigator.clipboard.writeText(text).then(() => { 
      this.showNotification('Line copied!', '📋');
      //
    });
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });

  }

  selectLanguage(lang: string): void {
    this.selectedLanguage = lang;
  }

  loadExample(example: CodeExample): void {
    this.codeInput = example.code;
    this.selectedLanguage = example.language;
    this.showExamples = false;
    this.analysisComplete = false;
    this.explanations = [];
    this.embeddedLanguage = '';
    this.showNotification(`Loaded: ${example.name}`, '📚');
  }

  clearCode(): void {
    this.codeInput = '';
    this.analysisComplete = false;
    this.explanations = [];
    this.errorMessage = '';
    this.embeddedLanguage = '';
    this.showNotification('Code cleared', '🗑️');
  }

  getLanguageLabel(): string {
    const lang = this.languages.find(l => l.value === this.selectedLanguage);
    return lang ? lang.label : 'Unknown';
  }

  getLanguageIcon(): string {
    const lang = this.languages.find(l => l.value === this.selectedLanguage);
    return lang ? lang.icon : '📄';
  }
  detectLanguage(code: string): string {

    const patterns: { [key: string]: { pattern: RegExp, weight: number }[] } = {
      'csharp': [
        // Very strong C# indicators (weight 3)
        { pattern: /async\s+Task</, weight: 3 },
        { pattern: /await\s+\w+\./, weight: 3 },
        { pattern: /using\s*\(\s*var\s+\w+\s*=/, weight: 3 },
        { pattern: /ICollection<|IEnumerable<|IList<|List</, weight: 3 },
        { pattern: /\.GetDbConnection\(/, weight: 3 },
        { pattern: /ConnectionState\./, weight: 3 },
        { pattern: /AddParameterWithValue/, weight: 3 },
        { pattern: /ExecuteReader\(|ExecuteNonQuery\(/, weight: 3 },
        { pattern: /namespace\s+[\w.]+\s*{/, weight: 3 },
        // Strong C# indicators (weight 2)
        { pattern: /using\s+System/, weight: 2 },
        { pattern: /public\s+async\s+/, weight: 2 },
        { pattern: /private\s+readonly\s+/, weight: 2 },
        { pattern: /\[.*Attribute\]|\[HttpGet\]|\[HttpPost\]/, weight: 2 },
        { pattern: /\.Connection\.State/, weight: 2 },
        { pattern: /cmd\.CommandText\s*=/, weight: 2 },
        { pattern: /var\s+\w+\s*=\s*\w+\.(Create|Get|Open)/, weight: 2 },
        // Regular C# indicators (weight 1)
        { pattern: /Console\.Write/, weight: 1 },
        { pattern: /public\s+class\s+\w+/, weight: 1 },
        { pattern: /private\s+\w+\s+_\w+/, weight: 1 },
        { pattern: /\.cs$/, weight: 1 }
      ],
      'java': [
        { pattern: /public\s+static\s+void\s+main/, weight: 3 },
        { pattern: /System\.out\.print/, weight: 3 },
        { pattern: /import\s+java\./, weight: 3 },
        { pattern: /extends\s+\w+\s*{/, weight: 2 },
        { pattern: /implements\s+\w+/, weight: 2 },
        { pattern: /public\s+class\s+\w+/, weight: 1 },
        { pattern: /@Override/, weight: 2 },
        { pattern: /\.class\b/, weight: 1 }
      ],
      'python': [
        { pattern: /^def\s+\w+\s*\(/m, weight: 3 },
        { pattern: /^from\s+\w+\s+import/m, weight: 3 },
        { pattern: /if\s+__name__\s*==\s*['"]__main__['"]/, weight: 3 },
        { pattern: /self\.\w+/, weight: 2 },
        { pattern: /:\s*$/m, weight: 1 },
        { pattern: /^import\s+\w+$/m, weight: 2 },
        { pattern: /print\s*\(/, weight: 1 }
      ],
      'typescript': [
        { pattern: /:\s*(string|number|boolean|any|void)\s*[;=\)]/, weight: 3 },
        { pattern: /interface\s+\w+\s*{/, weight: 3 },
        { pattern: /type\s+\w+\s*=/, weight: 3 },
        { pattern: /export\s+(interface|type|enum)/, weight: 3 },
        { pattern: /as\s+(string|number|any)/, weight: 2 },
        { pattern: /import\s+.*\s+from\s+['"]/, weight: 1 }
      ],
      'react': [
        { pattern: /import\s+React/, weight: 3 },
        { pattern: /from\s+['"]react['"]/, weight: 3 },
        { pattern: /useState\s*<|useEffect\s*\(|useContext/, weight: 3 },
        { pattern: /className\s*=/, weight: 2 },
        { pattern: /<\w+[^>]*\/>/, weight: 1 }
      ],
      'javascript': [
        { pattern: /console\.log\s*\(/, weight: 2 },
        { pattern: /document\.\w+|window\.\w+/, weight: 3 },
        { pattern: /require\s*\(['"]/, weight: 2 },
        { pattern: /module\.exports/, weight: 3 },
        { pattern: /const\s+\w+\s*=\s*\(/, weight: 1 },
        { pattern: /function\s+\w+\s*\(/, weight: 1 },
        { pattern: /=>\s*{/, weight: 1 }
      ],
      'sql': [
        { pattern: /^SELECT\s+/im, weight: 3 },
        { pattern: /^INSERT\s+INTO/im, weight: 3 },
        { pattern: /^UPDATE\s+\w+\s+SET/im, weight: 3 },
        { pattern: /^DELETE\s+FROM/im, weight: 3 },
        { pattern: /^CREATE\s+(TABLE|DATABASE|INDEX)/im, weight: 3 },
        { pattern: /INNER\s+JOIN|LEFT\s+JOIN|RIGHT\s+JOIN/i, weight: 2 },
        { pattern: /WHERE\s+\w+\s*(=|<|>|LIKE|IN)/i, weight: 1 }
      ],
      'cpp': [
        { pattern: /#include\s*<\w+>/, weight: 3 },
        { pattern: /std::/, weight: 3 },
        { pattern: /cout\s*<</, weight: 3 },
        { pattern: /cin\s*>>/, weight: 3 },
        { pattern: /int\s+main\s*\(/, weight: 2 },
        { pattern: /nullptr/, weight: 2 }
      ],
      'go': [
        { pattern: /^package\s+\w+/m, weight: 3 },
        { pattern: /func\s+\(\w+\s+\*?\w+\)/, weight: 3 },
        { pattern: /fmt\.Print/, weight: 2 },
        { pattern: /:=/, weight: 1 }
      ],
      'rust': [
        { pattern: /^fn\s+\w+/m, weight: 3 },
        { pattern: /let\s+mut\s+/, weight: 3 },
        { pattern: /println!\(/, weight: 3 },
        { pattern: /impl\s+\w+\s+for/, weight: 2 },
        { pattern: /pub\s+fn/, weight: 2 },
        { pattern: /use\s+std::/, weight: 2 }
      ]
    };

    const scores: { [key: string]: number } = {};
    
    for (const [lang, weightedPatterns] of Object.entries(patterns)) {
      scores[lang] = weightedPatterns.reduce((total, { pattern, weight }) => {
        return total + (pattern.test(code) ? weight : 0);
      }, 0);
    }

    console.log('Language detection scores:', scores);


    const sqlInStringPattern = /(@?"[\s\S]*?(SELECT|INSERT|UPDATE|DELETE|CREATE)[\s\S]*?"|'[\s\S]*?(SELECT|INSERT|UPDATE|DELETE|CREATE)[\s\S]*?'|`[\s\S]*?(SELECT|INSERT|UPDATE|DELETE|CREATE)[\s\S]*?`)/i;
    const hasEmbeddedSQL = sqlInStringPattern.test(code);
    
    if (hasEmbeddedSQL) {
      const nonSqlMaxScore = Math.max(...Object.entries(scores)
        .filter(([lang]) => lang !== 'sql')
        .map(([, score]) => score));
      
      if (nonSqlMaxScore >= 3) {
        scores['sql'] = 0; 
      }
    }

    let detectedLang = this.selectedLanguage;
    let maxScore = 0;
    
    for (const [lang, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        detectedLang = lang;
      }
    }

    this.embeddedLanguage = '';
    if (hasEmbeddedSQL && detectedLang !== 'sql') {
      this.embeddedLanguage = 'SQL';
    }

    return maxScore >= 3 ? detectedLang : this.selectedLanguage;
  }

  detectedLanguage: string = '';
  embeddedLanguage: string = '';

  async analyzeCode(): Promise<void> {
    if (!this.codeInput.trim()) {
      this.errorMessage = 'Please enter some code to analyze.';
      return;
    }

    if (!this.apiKey.trim()) {
      this.errorMessage = 'API key not configured. Please check your environment file.';
      return;
    }

    this.isAnalyzing = true;
    this.errorMessage = '';
    this.explanations = [];
    this.analysisProgress = 0;
    this.languageAutoDetected = false;
    
    this.originalSelectedLanguage = this.selectedLanguage;
    this.detectedLanguage = this.detectLanguage(this.codeInput);
    if (this.detectedLanguage !== this.selectedLanguage) {
      console.log(`Language auto-detected: ${this.selectedLanguage} → ${this.detectedLanguage}`);
      this.selectedLanguage = this.detectedLanguage; // Auto-select the detected language
      this.languageAutoDetected = true;
    }
    
    const startTime = Date.now();
    const lines = this.codeInput.split('\n');
    this.totalLines = lines.length;
    this.analyzedLines = 0;
    
    this.isBriefMode = this.totalLines > 50;

    try {
      const prompt = this.buildPrompt();
      const response = await this.callOpenAI(prompt);
      
      if (response) {
        this.explanations = this.parseResponse(response, lines);
        this.analysisComplete = true;
        this.activeTab = 'output';
        
        // Update stats - count only non-empty lines
        this.stats.linesAnalyzed = this.explanations.filter(e => e.type !== 'empty').length;
        this.stats.analysisTime = Math.round((Date.now() - startTime) / 1000 * 10) / 10;
        
        this.totalAnalyses++;
        localStorage.setItem('total_analyses', this.totalAnalyses.toString());
        
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
      }
    } catch (error: any) {
      console.error('Analysis error:', error);
      this.errorMessage = error.message || 'Failed to analyze code. Please check your API key and try again.';
    } finally {
      this.isAnalyzing = false;
      this.analysisProgress = 100;
    }
  }

  getDetectedLanguageLabel(): string {
    const lang = this.languages.find(l => l.value === this.detectedLanguage);
    return lang ? lang.label : this.detectedLanguage;
  }

  private buildPrompt(): string {
    const lines = this.codeInput.split('\n');
    
    if (this.isBriefMode) {
      return `You are an expert code analyzer. Analyze this code and provide a comprehensive summary.

HERE IS THE CODE (${lines.length} lines):
${this.codeInput}

PROVIDE A DETAILED SUMMARY including:
1. What this code does overall
2. Main purpose and functionality  
3. Key components/functions/classes used
4. Any notable patterns or techniques
5. Complexity assessment

RESPOND WITH THIS EXACT JSON FORMAT:
{
  "summary": {
    "title": "Brief descriptive title of what this code does",
    "purpose": "4-5 sentences explaining the purpose, what it accomplishes, how it works at a high level, and any important details about the implementation.",
    "keyFeatures": ["feature 1", "feature 2", "feature 3", "feature 4", "feature 5"],
    "complexity": "Beginner or Intermediate or Advanced"
  },
  "lines": []
}

Respond with ONLY the JSON object.`;
    }

    const nonEmptyLines: {num: number, code: string}[] = [];
    
    lines.forEach((line, i) => {
      if (line.trim()) {
        nonEmptyLines.push({ num: i + 1, code: line });
      }
    });

    const numberedCode = nonEmptyLines.map(l => `LINE ${l.num}: ${l.code}`).join('\n');
    
    let embeddedContext = '';
    if (this.embeddedLanguage) {
      embeddedContext = `\n\nNOTE: This code contains embedded ${this.embeddedLanguage} queries. When explaining lines with ${this.embeddedLanguage}, explain both the host language syntax AND the ${this.embeddedLanguage} query logic.`;
    }

    return `You are an expert code analyzer. Analyze this code and explain each line accurately.${embeddedContext}

HERE IS THE CODE (empty lines are skipped):
${numberedCode}

PROVIDE:
1. A SUMMARY of what the overall code does
2. An explanation for each non-empty line listed above

RULES:
- Line numbers correspond to the LINE numbers shown above
- Explain what each specific line does accurately
- Maximum 2-3 sentences per line
- For comments: explain what the comment describes
- Be SPECIFIC about variables, values, and operations
- For SIMPLE SYNTAX lines like just "{" or "}" or ");", give SHORT explanations like "Opening brace of the function/block" or "Closing brace" - do NOT over-explain brackets
- Only explain what is LITERALLY on that line, not what comes before or after

RESPOND WITH THIS EXACT JSON FORMAT:
{
  "summary": {
    "title": "What this code does",
    "purpose": "2-3 sentences about the purpose",
    "keyFeatures": ["feature 1", "feature 2", "feature 3"],
    "complexity": "Beginner"
  },
  "lines": [
    {"line": 1, "explanation": "What LINE 1 does"},
    {"line": 3, "explanation": "What LINE 3 does"}
  ]
}

IMPORTANT: Only include lines that have code (skip empty lines). Use the exact line numbers shown above.
Respond with ONLY the JSON object.`;
  }

  private async callOpenAI(prompt: string): Promise<string> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey.trim()}`
    });

    const body = {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert code analyzer. Respond ONLY with valid JSON. Line numbers in your response must start from 1 and match exactly with the line numbers shown in the code. Be accurate and specific in your explanations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 4000
    };

    try {
      const response: any = await this.http.post(
        'https://api.openai.com/v1/chat/completions',
        body,
        { headers }
      ).toPromise();

      if (response?.choices?.[0]?.message?.content) {
        this.stats.tokensUsed = response.usage?.total_tokens || 0;
        return response.choices[0].message.content;
      }
      throw new Error('Invalid response from OpenAI');
    } catch (error: any) {
      if (error.status === 401) {
        throw new Error('Invalid API key. Please check your OpenAI API key.');
      } else if (error.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      } else if (error.status === 500) {
        throw new Error('OpenAI server error. Please try again later.');
      }
      throw error;
    }
  }

  private parseResponse(response: string, originalLines: string[]): LineExplanation[] {
    try {
      let cleanResponse = response.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.slice(7);
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.slice(3);
      }
      if (cleanResponse.endsWith('```')) {
        cleanResponse = cleanResponse.slice(0, -3);
      }
      cleanResponse = cleanResponse.trim();

      const parsed = JSON.parse(cleanResponse);
      
      // Extract summary if present
      if (parsed.summary) {
        this.codeSummary = {
          title: parsed.summary.title || 'Code Analysis',
          purpose: parsed.summary.purpose || 'This code performs various operations.',
          keyFeatures: parsed.summary.keyFeatures || [],
          complexity: parsed.summary.complexity || 'Intermediate'
        };
      }

      const lineExplanations = parsed.lines || parsed;
      
      let lineOffset = 0;
      if (Array.isArray(lineExplanations) && lineExplanations.length > 0) {
        const firstLine = lineExplanations[0]?.line;
        if (firstLine === 0) {
          lineOffset = 1;
        }
      }
      
      return originalLines.map((code, index) => {
        const lineNum = index + 1;
        const trimmedCode = code.trim();
        
        let found = null;
        if (Array.isArray(lineExplanations)) {
          found = lineExplanations.find((p: any) => p.line === lineNum || p.line + lineOffset === lineNum);
          
          if (!found && lineExplanations[index]) {
            found = lineExplanations[index];
          }
        }
        
        let type: 'code' | 'comment' | 'empty' = 'code';
        if (!trimmedCode) {
          type = 'empty';
        } else if (this.isComment(trimmedCode)) {
          type = 'comment';
        }

        const simpleSyntaxExplanation = this.getSimpleSyntaxExplanation(trimmedCode);
        const finalExplanation = simpleSyntaxExplanation || found?.explanation || this.getDefaultExplanation(trimmedCode, type);

        return {
          lineNumber: lineNum,
          code: code,
          explanation: finalExplanation,
          type
        };
      });
    } catch (e) {
      console.error('Parse error:', e);
      this.codeSummary = null;
      return originalLines.map((code, index) => {
        const trimmedCode = code.trim();
        let type: 'code' | 'comment' | 'empty' = 'code';
        if (!trimmedCode) type = 'empty';
        else if (this.isComment(trimmedCode)) type = 'comment';

        const simpleSyntaxExplanation = this.getSimpleSyntaxExplanation(trimmedCode);

        return {
          lineNumber: index + 1,
          code: code,
          explanation: simpleSyntaxExplanation || this.getDefaultExplanation(trimmedCode, type),
          type
        };
      });
    }
  }

  private isComment(code: string): boolean {
    const commentPatterns = [
      /^\/\//, // JavaScript, TypeScript, Java, C#, C++
      /^\/\*/, // Multi-line comment start
      /^\*/, // Multi-line comment continuation
      /^#/, // Python, Ruby, Shell
      /^--/, // SQL
      /^{\/\*/, // JSX comment
      /^<!--/, // HTML comment
      /^"""/, // Python docstring
      /^'''/, // Python docstring
    ];
    return commentPatterns.some(pattern => pattern.test(code.trim()));
  }

  private getDefaultExplanation(code: string, type: 'code' | 'comment' | 'empty'): string {
    if (type === 'empty') return 'Empty line for code readability and visual separation.';
    if (type === 'comment') return 'This is a comment providing context or documentation for the code.';
    return 'This line contains code logic.';
  }

  private getSimpleSyntaxExplanation(code: string): string | null {
    const trimmed = code.trim();
    
    // Simple syntax patterns with their explanations
    const simpleSyntax: { pattern: RegExp, explanation: string }[] = [
      { pattern: /^{$/, explanation: 'Opening brace - starts a code block.' },
      { pattern: /^}$/, explanation: 'Closing brace - ends a code block.' },
      { pattern: /^};?$/, explanation: 'Closing brace - ends a code block.' },
      { pattern: /^\);?$/, explanation: 'Closing parenthesis.' },
      { pattern: /^\];?$/, explanation: 'Closing bracket.' },
      { pattern: /^}\);?$/, explanation: 'Closing brace and parenthesis - ends a function or callback.' },
      { pattern: /^}\s*else\s*{?$/, explanation: 'Else clause - executes when the if condition is false.' },
      { pattern: /^}\s*catch\s*\(/, explanation: 'Catch block - handles exceptions from the try block.' },
      { pattern: /^}\s*finally\s*{?$/, explanation: 'Finally block - always executes after try/catch.' },
      { pattern: /^try\s*{?$/, explanation: 'Try block - wraps code that might throw exceptions.' },
      { pattern: /^{?\s*get\s*{?$/, explanation: 'Getter accessor - returns the property value.' },
      { pattern: /^{?\s*set\s*{?$/, explanation: 'Setter accessor - sets the property value.' },
    ];

    for (const { pattern, explanation } of simpleSyntax) {
      if (pattern.test(trimmed)) {
        return explanation;
      }
    }

    return null; 
  }

  copyExplanations(): void {
    let text = '';
    
    if (this.codeSummary) {
      text += `📋 ${this.codeSummary.title}\n`;
      text += `${'─'.repeat(50)}\n\n`;
      text += `🎯 WHAT THIS CODE DOES:\n${this.codeSummary.purpose}\n\n`;
      text += `⚡ KEY FEATURES:\n`;
      this.codeSummary.keyFeatures.forEach(f => text += `  • ${f}\n`);
      text += `\n📊 Complexity: ${this.codeSummary.complexity}\n\n`;
      text += `${'─'.repeat(50)}\n`;
      text += `📝 LINE-BY-LINE BREAKDOWN:\n${'─'.repeat(50)}\n\n`;
    }
    
    // Add line explanations
    text += this.explanations.map(e => 
      `Line ${e.lineNumber}: ${e.code}\n→ ${e.explanation}`
    ).join('\n\n');
    
    navigator.clipboard.writeText(text).then(() => {
      this.showNotification('Copied to clipboard!', '📋');
    });
  }

  downloadExplanations(): void {
    let text = '';
    const divider = '═'.repeat(60);
    const subDivider = '─'.repeat(60);
    
    text += `${divider}\n`;
    text += `   CODE ANALYSIS REPORT\n`;
    text += `   Generated by SYNTAX AI\n`;
    text += `${divider}\n\n`;
    
    text += `Language: ${this.getLanguageLabel()}\n`;
    text += `Analyzed: ${new Date().toLocaleString()}\n`;
    text += `Lines Analyzed: ${this.stats.linesAnalyzed}\n\n`;
    
    // Summary section
    if (this.codeSummary) {
      text += `${divider}\n`;
      text += `   SUMMARY\n`;
      text += `${divider}\n\n`;
      
      text += `Title: ${this.codeSummary.title}\n\n`;
      text += `Purpose:\n${this.codeSummary.purpose}\n\n`;
      text += `Key Features:\n`;
      this.codeSummary.keyFeatures.forEach((f, i) => {
        text += `  ${i + 1}. ${f}\n`;
      });
      text += `\nComplexity Level: ${this.codeSummary.complexity}\n\n`;
    }
    
    text += `${divider}\n`;
    text += `   ORIGINAL CODE\n`;
    text += `${divider}\n\n`;
    text += this.codeInput + '\n\n';
    
    text += `${divider}\n`;
    text += `   LINE-BY-LINE EXPLANATION\n`;
    text += `${divider}\n\n`;
    
    this.explanations
      .filter(e => e.type !== 'empty')
      .forEach(e => {
        text += `${subDivider}\n`;
        text += `LINE ${e.lineNumber}:\n`;
        text += `${e.code}\n\n`;
        text += `Explanation:\n${e.explanation}\n\n`;
      });
    
    text += `${divider}\n`;
    text += `   END OF REPORT\n`;
    text += `${divider}\n`;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code-analysis-${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  resetAnalysis(): void {
    this.activeTab = 'input';
    this.analysisComplete = false;
    this.explanations = [];
    this.codeSummary = null;
    this.errorMessage = '';
    this.embeddedLanguage = '';
    this.languageAutoDetected = false;
    this.isBriefMode = false;
    this.showCodePreview = false;
  }

  getLineClass(type: string): string {
    switch (type) {
      case 'comment': return 'line-comment';
      case 'empty': return 'line-empty';
      default: return 'line-code';
    }
  }
}
