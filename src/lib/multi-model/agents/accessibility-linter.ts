import { BaseAgent } from '../base-agent';
import { AccessibilityInput, AccessibilityOutput, AccessibilityIssue, AccessibilityFix } from '../schemas';

export interface AccessibilityLinterConfig {
  name: string;
  description: string;
  model: {
    provider: 'ollama' | 'openai' | 'demo';
    apiKey: string;
    baseUrl: string;
    model: string;
    maxTokens: number;
    temperature: number;
  };
}

export class AccessibilityLinterAgent extends BaseAgent {
  constructor(config: AccessibilityLinterConfig) {
    super(config);
  }

  async execute(input: AccessibilityInput): Promise<AccessibilityOutput> {
    try {
      console.log(`[${this.config.name}] Starting accessibility audit...`);
      
      const issues = await this.auditAccessibility(input);
      const fixes = await this.generateFixes(input, issues);
      
      const output: AccessibilityOutput = {
        issues,
        fixes,
        metadata: {
          totalIssues: issues.length,
          criticalIssues: issues.filter(i => i.severity === 'critical').length,
          warningIssues: issues.filter(i => i.severity === 'warning').length,
          infoIssues: issues.filter(i => i.severity === 'info').length,
          autoFixable: fixes.filter(f => f.autoFixable).length
        }
      };

      console.log(`[${this.config.name}] Found ${issues.length} accessibility issues`);
      return output;
    } catch (error) {
      this.handleError(error, { input });
    }
  }

  private async auditAccessibility(input: AccessibilityInput): Promise<AccessibilityIssue[]> {
    const prompt = this.buildAuditPrompt(input);
    const response = await this.callLLM(prompt);
    return this.parseAccessibilityIssues(response);
  }

  private async generateFixes(input: AccessibilityInput, issues: AccessibilityIssue[]): Promise<AccessibilityFix[]> {
    const fixes: AccessibilityFix[] = [];
    
    for (const issue of issues) {
      const prompt = this.buildFixPrompt(input, issue);
      const response = await this.callLLM(prompt);
      const fix = this.parseFix(response, issue);
      fixes.push(fix);
    }
    
    return fixes;
  }

  private buildAuditPrompt(input: AccessibilityInput): string {
    return `
You are an accessibility expert. Audit this slide deck for accessibility and design issues.

Deck Information:
- Title: ${input.deck.title}
- Theme: ${input.theme}
- Total Slides: ${input.deck.slides.length}
- Slides: ${JSON.stringify(input.deck.slides, null, 2)}

Theme Tokens:
- Colors: ${JSON.stringify(input.themeTokens.colors, null, 2)}
- Typography: ${JSON.stringify(input.themeTokens.typography, null, 2)}
- Spacing: ${JSON.stringify(input.themeTokens.spacing, null, 2)}

Check for:
1. Color contrast issues (WCAG AA compliance)
2. Font size readability (minimum 12pt)
3. Heading hierarchy (proper H1-H6 structure)
4. Alt text for images
5. Bullet point length (max 6 per slide)
6. Title length (max 8 words)
7. Bullet length (max 12 words)
8. Touch target sizes (minimum 44px)
9. Reading level (aim for grade 8-10)
10. Navigation accessibility

For each issue, provide:
- type: contrast, typography, structure, content, navigation
- severity: critical, warning, info
- slideId: which slide has the issue
- element: specific element or block
- description: what's wrong
- impact: how it affects users
- wcagLevel: AA or AAA if applicable

Return as JSON array of accessibility issues.
`;
  }

  private buildFixPrompt(input: AccessibilityInput, issue: AccessibilityIssue): string {
    return `
Generate a fix for this accessibility issue:

Issue: ${issue.description}
Type: ${issue.type}
Severity: ${issue.severity}
Slide ID: ${issue.slideId}
Element: ${issue.element}
Impact: ${issue.impact}

Current Theme: ${input.theme}
Available Colors: ${JSON.stringify(input.themeTokens.colors, null, 2)}

Provide:
- description: what to change
- autoFixable: true/false
- priority: high/medium/low
- effort: quick/moderate/extensive
- code: specific code changes if auto-fixable
- explanation: why this fix works

Return as JSON object with fix details.
`;
  }

  private parseAccessibilityIssues(response: string): AccessibilityIssue[] {
    try {
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);
      
      if (Array.isArray(parsed)) {
        return parsed.map(issue => ({
          type: issue.type || 'content',
          severity: issue.severity || 'warning',
          slideId: issue.slideId || 'unknown',
          element: issue.element || 'unknown',
          description: issue.description || 'Accessibility issue',
          impact: issue.impact || 'May affect user experience',
          wcagLevel: issue.wcagLevel || 'AA'
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Failed to parse accessibility issues:', error);
      return [];
    }
  }

  private parseFix(response: string, issue: AccessibilityIssue): AccessibilityFix {
    try {
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);
      
      return {
        issueId: issue.slideId + '_' + issue.type,
        description: parsed.description || 'Fix for accessibility issue',
        autoFixable: parsed.autoFixable || false,
        priority: parsed.priority || 'medium',
        effort: parsed.effort || 'moderate',
        code: parsed.code || null,
        explanation: parsed.explanation || 'This fix improves accessibility'
      };
    } catch (error) {
      return {
        issueId: issue.slideId + '_' + issue.type,
        description: 'Manual fix required for accessibility issue',
        autoFixable: false,
        priority: 'medium',
        effort: 'moderate',
        code: null,
        explanation: 'Please review and fix manually'
      };
    }
  }
}
