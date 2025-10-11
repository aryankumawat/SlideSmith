import { BaseAgent } from '../base-agent';
import { ChartSpec, DataVizInput, DataVizOutput } from '../schemas';

export interface DataVizPlannerConfig {
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

export class DataVizPlannerAgent extends BaseAgent {
  constructor(config: DataVizPlannerConfig) {
    super(config);
  }

  async execute(input: DataVizInput): Promise<DataVizOutput> {
    try {
      console.log(`[${this.config.name}] Starting data visualization planning...`);
      
      const chartSpecs = await this.analyzeDataAndSuggestCharts(input);
      const rationale = await this.generateRationale(input, chartSpecs);
      
      const output: DataVizOutput = {
        chartSpecs,
        rationale,
        metadata: {
          totalCharts: chartSpecs.length,
          dataTypes: this.extractDataTypes(input),
          complexity: this.assessComplexity(chartSpecs)
        }
      };

      console.log(`[${this.config.name}] Generated ${chartSpecs.length} chart specifications`);
      return output;
    } catch (error) {
      this.handleError(error, { input });
    }
  }

  private async analyzeDataAndSuggestCharts(input: DataVizInput): Promise<ChartSpec[]> {
    const prompt = this.buildChartAnalysisPrompt(input);
    const response = await this.callLLM(prompt);
    return this.parseChartSpecs(response);
  }

  private async generateRationale(input: DataVizInput, chartSpecs: ChartSpec[]): Promise<string> {
    const prompt = this.buildRationalePrompt(input, chartSpecs);
    const response = await this.callLLM(prompt);
    return response;
  }

  private buildChartAnalysisPrompt(input: DataVizInput): string {
    return `
You are a data visualization expert. Analyze the provided data and suggest the most appropriate chart types.

Data Context:
- Question: ${input.analyticalQuestion}
- Data Schema: ${JSON.stringify(input.dataSchema, null, 2)}
- Sample Data: ${JSON.stringify(input.sampleData, null, 2)}
- Slide Context: ${input.slideContext}

Guidelines:
1. Choose the simplest chart that answers the question
2. Prefer line charts for time series data
3. Prefer bar charts for categorical comparisons
4. Use pie charts only for parts of a whole (max 5-6 categories)
5. Avoid dual-axis charts unless absolutely necessary
6. Ensure clear axis labels and readable legends

For each suggested chart, provide:
- kind: line, bar, area, pie, scatter, histogram
- x: x-axis field name
- y: y-axis field name
- title: clear, descriptive title
- rationale: one-sentence explanation
- dataExample: small sample of the data structure

Return as JSON array of chart specifications.
`;
  }

  private buildRationalePrompt(input: DataVizInput, chartSpecs: ChartSpec[]): string {
    return `
Explain why these chart types were chosen for the data visualization:

Original Question: ${input.analyticalQuestion}
Data Context: ${input.slideContext}

Chosen Charts:
${chartSpecs.map((spec, i) => `${i + 1}. ${spec.kind} chart: ${spec.title} - ${spec.rationale}`).join('\n')}

Provide a concise explanation (2-3 sentences) of the overall visualization strategy.
`;
  }

  private parseChartSpecs(response: string): ChartSpec[] {
    try {
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);
      
      if (Array.isArray(parsed)) {
        return parsed.map(spec => ({
          kind: spec.kind || 'bar',
          x: spec.x || 'x',
          y: spec.y || 'y',
          title: spec.title || 'Chart',
          rationale: spec.rationale || 'Data visualization',
          dataExample: spec.dataExample || null
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Failed to parse chart specs:', error);
      return [{
        kind: 'bar',
        x: 'category',
        y: 'value',
        title: 'Data Overview',
        rationale: 'Simple bar chart for data comparison',
        dataExample: null
      }];
    }
  }

  private extractDataTypes(input: DataVizInput): string[] {
    const types = new Set<string>();
    
    if (input.dataSchema) {
      Object.values(input.dataSchema).forEach(field => {
        if (typeof field === 'object' && field !== null) {
          types.add(field.type || 'unknown');
        }
      });
    }
    
    return Array.from(types);
  }

  private assessComplexity(chartSpecs: ChartSpec[]): 'simple' | 'moderate' | 'complex' {
    if (chartSpecs.length === 0) return 'simple';
    if (chartSpecs.length <= 2) return 'simple';
    if (chartSpecs.length <= 4) return 'moderate';
    return 'complex';
  }
}
