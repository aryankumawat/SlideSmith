#!/usr/bin/env node
/**
 * README Validation Script
 * Checks README.md for common formatting issues and consistency
 */

const fs = require('fs');
const path = require('path');

function validateReadme(filePath) {
  const result = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    // Check 1: File exists and is not empty
    if (!content || content.trim().length === 0) {
      result.errors.push('README.md is empty');
      result.isValid = false;
      return result;
    }

    // Check 2: Has title
    if (!lines[0].startsWith('# ')) {
      result.errors.push('README must start with a # title');
      result.isValid = false;
    }

    // Check 3: Check for common markdown issues
    let inCodeBlock = false;
    let codeBlockLine = -1;
    
    lines.forEach((line, index) => {
      const lineNum = index + 1;

      // Track code blocks (only count lines that start with ```)
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeBlockLine = lineNum;
        } else {
          inCodeBlock = false;
          codeBlockLine = -1;
        }
      }

      // Check for broken links (basic check)
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      let match;
      while ((match = linkRegex.exec(line)) !== null) {
        const linkText = match[1];
        const linkUrl = match[2];
        
        if (!linkUrl || linkUrl.trim() === '') {
          result.warnings.push(`Line ${lineNum}: Empty link URL for "${linkText}"`);
        }
      }

      // Check for proper heading hierarchy
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        const text = headingMatch[2];
        
        if (text.trim() === '') {
          result.warnings.push(`Line ${lineNum}: Heading has no text`);
        }
      }
    });

    // Check for unclosed code blocks
    if (inCodeBlock) {
      result.errors.push(`Unclosed code block starting at line ${codeBlockLine}`);
      result.isValid = false;
    }

    // Check 4: Look for specific required sections
    const requiredSections = [
      'System Overview',
      'Installation',
      'API Reference',
      'License',
    ];

    requiredSections.forEach((section) => {
      const sectionRegex = new RegExp(`^##+ ${section}`, 'm');
      if (!sectionRegex.test(content)) {
        result.warnings.push(`Missing recommended section: "${section}"`);
      }
    });

    // Check 5: Count agent mentions
    const agentCount13 = (content.match(/13[- ]agent/gi) || []).length;
    const agentCount12 = (content.match(/12[- ]agent/gi) || []).length;
    
    if (agentCount12 > 0) {
      result.errors.push(`Found ${agentCount12} instance(s) of "12 agent(s)" - should be "13 agents"`);
      result.isValid = false;
    }
    
    console.log(`✓ Agent count validation: Found ${agentCount13} references to "13 agents"`);

    // Check 6: Look for deployment-specific terms
    const deploymentChecks = [
      { term: 'vercel link', message: 'Vercel deployment command' },
      { term: 'vercel --prod', message: 'Vercel production deployment' },
      { term: 'horizontal scaling', message: 'Horizontal scaling reference' },
      { term: 'SOC 2', message: 'SOC 2 compliance mention' },
    ];
    
    deploymentChecks.forEach(({ term, message }) => {
      if (content.toLowerCase().includes(term.toLowerCase())) {
        result.warnings.push(`Found "${term}" (${message}) - consider if appropriate for local dev focus`);
      }
    });

    // Check 7: Validate markdown tables
    let tableRows = 0;
    lines.forEach((line, index) => {
      if (line.includes('|') && line.trim().startsWith('|')) {
        tableRows++;
        const pipeCount = (line.match(/\|/g) || []).length;
        if (pipeCount < 3) {
          result.warnings.push(`Line ${index + 1}: Possible malformed table row (only ${pipeCount} pipes)`);
        }
      }
    });

    console.log(`✓ Found ${tableRows} table rows`);

    // Check 8: Count mermaid diagrams
    const mermaidCount = (content.match(/```mermaid/g) || []).length;
    console.log(`✓ Found ${mermaidCount} Mermaid diagram(s)`);

    // Check 9: Code block validation
    const allCodeFences = (content.match(/^```/gm) || []).length;
    
    if (allCodeFences % 2 !== 0) {
      result.warnings.push(`Mismatched code fences: ${allCodeFences} total (should be even number)`);
    } else {
      console.log(`✓ Code fences balanced: ${allCodeFences / 2} code blocks`);
    }

  } catch (error) {
    result.errors.push(`Failed to read README: ${error.message}`);
    result.isValid = false;
  }

  return result;
}

// Main execution
const readmePath = path.join(__dirname, 'README.md');
console.log('🔍 Validating README.md...\n');

const result = validateReadme(readmePath);

if (result.errors.length > 0) {
  console.log('\n❌ ERRORS:\n');
  result.errors.forEach((err) => console.log(`  • ${err}`));
}

if (result.warnings.length > 0) {
  console.log('\n⚠️  WARNINGS:\n');
  result.warnings.forEach((warn) => console.log(`  • ${warn}`));
}

console.log('');

if (result.isValid && result.warnings.length === 0) {
  console.log('✅ README.md validation passed with no issues!\n');
  process.exit(0);
} else if (result.isValid) {
  console.log('✅ README.md validation passed (with warnings)\n');
  process.exit(0);
} else {
  console.log('❌ README.md validation FAILED\n');
  process.exit(1);
}

