import { ModelRouter, TaskContext } from './router';
import { BaseAgent } from './base-agent';
import { 
  Deck, 
  DeckOutline, 
  ResearchSnippet, 
  Slide, 
  ExecutiveSummary,
  AudienceAdaptation,
  QualityCheck,
  DataVizInput,
  DataVizOutput,
  MediaFinderInput,
  MediaFinderOutput,
  SpeakerNotesInput,
  SpeakerNotesOutput,
  AccessibilityInput,
  AccessibilityOutput,
  LiveWidgetInput,
  LiveWidgetOutput,
  ExecutiveSummaryInput,
  ExecutiveSummaryOutput,
  AudienceAdapterInput,
  AudienceAdapterOutput
} from './schemas';

// ============================================================================
// MULTI-MODEL ORCHESTRATOR
// ============================================================================

export interface OrchestratorInput {
  topic: string;
  audience: string;
  tone: string;
  desiredSlideCount: number;
  theme?: string;
  duration?: number;
  sources?: string[];
  urls?: string[];
  enableLive?: boolean;
  policy?: 'quality' | 'speed' | 'cost' | 'balanced' | 'local-only';
}

export interface OrchestratorOutput {
  deck: Deck;
  metadata: {
    totalTokens: number;
    totalCost: number;
    processingTime: number;
    qualityScores: {
      factCheck: number;
      accessibility: number;
      readability: number;
      consistency: number;
    };
  };
  executiveSummary?: ExecutiveSummary;
  qualityChecks?: QualityCheck[];
}

export class MultiModelOrchestrator {
  private router: ModelRouter;
  private agents: Map<string, BaseAgent> = new Map();
  private taskHistory: Map<string, unknown> = new Map();
  private initializationPromise: Promise<void>;
  private isInitialized = false;

  constructor() {
    this.router = new ModelRouter();
    this.initializationPromise = this.initializeAgents();
  }

  // ============================================================================
  // MAIN ORCHESTRATION PIPELINE
  // ============================================================================

  async generatePresentation(input: OrchestratorInput): Promise<OrchestratorOutput> {
    // Ensure agents are initialized before proceeding
    if (!this.isInitialized) {
      await this.initializationPromise;
    }

    const startTime = Date.now();
    const taskId = `task-${Date.now()}`;
    
    try {
      console.log(`[Orchestrator] Starting presentation generation for: ${input.topic}`);
      
      // Step 1: Research (Evidence Collection)
      console.log('[Orchestrator] Step 1: Research');
      const researchResult = await this.executeAgent('researcher', {
        topic: input.topic,
        audience: input.audience,
        tone: input.tone,
        sources: input.sources,
        urls: input.urls,
        maxSnippets: 20,
        minConfidence: 0.6,
      }, input.policy);

      // Step 2: Structure (Deck Outline Planning)
      console.log('[Orchestrator] Step 2: Structure');
      const structureResult = await this.executeAgent('structurer', {
        topic: input.topic,
        audience: input.audience,
        tone: input.tone,
        desiredSlideCount: input.desiredSlideCount,
        researchSnippets: researchResult.snippets,
        theme: input.theme,
        duration: input.duration,
      }, input.policy);

      // Step 3: Content Generation (Parallel per section)
      console.log('[Orchestrator] Step 3: Content Generation');
      const slides = await this.generateSlidesInParallel(
        structureResult.outline,
        researchResult.snippets,
        input
      );

      // Step 4: Quality Assurance Pipeline
      console.log('[Orchestrator] Step 4: Quality Assurance');
      const qualityResults = await this.runQualityPipeline(slides, researchResult.snippets, input);

      // Step 5: Final Assembly
      console.log('[Orchestrator] Step 5: Final Assembly');
      const deck = this.assembleDeck(structureResult.outline, slides, researchResult.snippets, input);

      // Step 6: Executive Summary (Optional)
      let executiveSummary: ExecutiveSummary | undefined;
      if (input.audience.toLowerCase().includes('executive')) {
        console.log('[Orchestrator] Step 6: Executive Summary');
        executiveSummary = await this.generateExecutiveSummary(deck);
      }

      // Calculate metadata
      const processingTime = Date.now() - startTime;
      const metadata = this.calculateMetadata(processingTime);

      const output: OrchestratorOutput = {
        deck,
        metadata,
        executiveSummary,
        qualityChecks: qualityResults.checks,
      };

      console.log(`[Orchestrator] Presentation generation completed in ${processingTime}ms`);
      return output;

    } catch (error) {
      console.error('[Orchestrator] Generation failed:', error);
      throw new Error(`Presentation generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ============================================================================
  // PARALLEL SLIDE GENERATION
  // ============================================================================

  private async generateSlidesInParallel(
    outline: DeckOutline,
    snippets: ResearchSnippet[],
    input: OrchestratorInput
  ): Promise<Slide[]> {
    const slidePromises = outline.sections.map(async (section, sectionIndex) => {
      const slidewriterInput = {
        section,
        researchSnippets: snippets,
        context: {
          topic: input.topic,
          audience: input.audience,
          tone: input.tone,
          theme: input.theme || 'professional',
          slideIndex: sectionIndex + 1,
          totalSlides: outline.sections.length,
        },
        wordBudgets: {
          titleMax: 8,
          bulletMax: 12,
          bulletsPerSlide: 6,
        },
      };

      const result = await this.executeAgent('slidewriter', slidewriterInput, input.policy);
      return result.slides;
    });

    const slideArrays = await Promise.all(slidePromises);
    return slideArrays.flat();
  }

  // ============================================================================
  // QUALITY ASSURANCE PIPELINE
  // ============================================================================

  private async runQualityPipeline(
    slides: Slide[],
    snippets: ResearchSnippet[],
    input: OrchestratorInput
  ): Promise<{ checks: QualityCheck[]; scores: any }> {
    const checks: QualityCheck[] = [];
    const scores: any = {};

    // Run quality checks in parallel for better performance
    const qualityPromises = [
      // Copy Tightening (needs to run first as it modifies slides)
      this.executeAgent('copy-tightener', {
        slides,
        audience: input.audience,
        tone: input.tone,
      }, input.policy).then(result => {
        // Update slides with tightened content
        Object.assign(slides, result.slides);
        return { type: 'copy', result, score: result.qualityScore || 0.8 };
      }).catch(error => {
        console.warn('[Orchestrator] Copy tightening failed:', error);
        return { type: 'copy', result: null, score: 0.5 };
      }),

      // Fact Checking (can run in parallel)
      this.executeAgent('fact-checker', {
        slides,
        researchSnippets: snippets,
      }, input.policy).then(result => {
        return { type: 'fact', result, score: result.overallScore || 0.8 };
      }).catch(error => {
        console.warn('[Orchestrator] Fact checking failed:', error);
        return { type: 'fact', result: null, score: 0.5 };
      }),

      // Accessibility & Design Linting (can run in parallel)
      this.executeAgent('accessibility-linter', {
        slides,
        theme: input.theme || 'professional',
      }, input.policy).then(result => {
        return { type: 'accessibility', result, score: result.overallScore || 0.8 };
      }).catch(error => {
        console.warn('[Orchestrator] Accessibility checking failed:', error);
        return { type: 'accessibility', result: null, score: 0.5 };
      }),

      // Readability Analysis (can run in parallel)
      this.executeAgent('readability-analyzer', {
        slides,
        audience: input.audience,
      }, input.policy).then(result => {
        return { type: 'readability', result, score: result.overallScore || 0.8 };
      }).catch(error => {
        console.warn('[Orchestrator] Readability analysis failed:', error);
        return { type: 'readability', result: null, score: 0.5 };
      })
    ];

    // Wait for all quality checks to complete
    const results = await Promise.all(qualityPromises);

    // Process results
    results.forEach(({ type, result, score }) => {
      scores[type] = score;
      
      if (result && result.checks) {
        checks.push(...result.checks);
      }
    });

    return { checks, scores };
  }

  // ============================================================================
  // EXECUTIVE SUMMARY GENERATION
  // ============================================================================

  private async generateExecutiveSummary(deck: Deck): Promise<ExecutiveSummary> {
    const summaryResult = await this.executeAgent('executive-summary', {
      deck,
    }, 'quality');

    return summaryResult;
  }

  // ============================================================================
  // AUDIENCE ADAPTATION
  // ============================================================================

  async adaptForAudience(
    deck: Deck,
    targetAudience: string,
    targetDuration?: number
  ): Promise<AudienceAdaptation> {
    const adaptationResult = await this.executeAgent('audience-adapter', {
      deck,
      targetAudience,
      targetDuration,
    }, 'balanced');

    return adaptationResult;
  }

  // ============================================================================
  // AGENT EXECUTION
  // ============================================================================

  private async executeAgent(agentType: string, input: unknown, policy?: string): Promise<unknown> {
    const context: TaskContext = {
      priority: (policy as TaskContext['priority']) || 'balanced',
      localOnly: policy === 'local-only',
    };

    console.log(`[Orchestrator] Executing agent: ${agentType}`);
    console.log(`[Orchestrator] Available agents:`, Array.from(this.agents.keys()));

    const agent = this.agents.get(agentType);
    if (!agent) {
      throw new Error(`Agent not found: ${agentType}. Available agents: ${Array.from(this.agents.keys()).join(', ')}`);
    }

    // Select model for this agent
    const model = this.router.selectModel(agentType, context, policy);
    if (!model) {
      throw new Error(`No available model for agent: ${agentType}`);
    }

    agent.setModel(model);

    // Execute the agent
    return await agent.execute(input, context);
  }

  // ============================================================================
  // DECK ASSEMBLY
  // ============================================================================

  private assembleDeck(
    outline: DeckOutline,
    slides: Slide[],
    snippets: ResearchSnippet[],
    input: OrchestratorInput
  ): Deck {
    // Add title slide
    const titleSlide: Slide = {
      id: 'title-slide',
      layout: 'title',
      blocks: [
        {
          type: 'Heading',
          text: outline.title,
          level: 1,
          animation: 'fadeIn',
        },
        {
          type: 'Subheading',
          text: outline.subtitle || '',
          animation: 'slideInFromBottom',
        },
      ],
      notes: `Welcome to our presentation on ${outline.title}. Today we'll explore ${outline.sections.length} key areas.`,
      order: 0,
    };

    // Add agenda slide
    const agendaSlide: Slide = {
      id: 'agenda-slide',
      layout: 'title+bullets',
      blocks: [
        {
          type: 'Heading',
          text: 'Agenda',
          level: 1,
          animation: 'slideInFromTop',
        },
        {
          type: 'Bullets',
          items: outline.sections.map(s => s.title),
          animation: 'staggerIn',
        },
      ],
      notes: 'Here\'s what we\'ll cover today. Each section builds on the previous one.',
      order: 1,
    };

    // Add conclusion slide
    const conclusionSlide: Slide = {
      id: 'conclusion-slide',
      layout: 'title+bullets',
      blocks: [
        {
          type: 'Heading',
          text: 'Conclusion',
          level: 1,
          animation: 'fadeIn',
        },
        {
          type: 'Bullets',
          items: [
            'Key takeaways from our discussion',
            'Next steps and recommendations',
            'Questions and discussion',
          ],
          animation: 'staggerIn',
        },
      ],
      notes: outline.conclusion,
      order: slides.length + 2,
    };

    // Add references slide if we have sources
    let referencesSlide: Slide | undefined;
    if (outline.references.length > 0) {
      referencesSlide = {
        id: 'references-slide',
        layout: 'title+bullets',
        blocks: [
          {
            type: 'Heading',
            text: 'References',
            level: 1,
            animation: 'fadeIn',
          },
          {
            type: 'Bullets',
            items: outline.references,
            animation: 'staggerIn',
          },
        ],
        notes: 'Sources and references used in this presentation.',
        order: slides.length + 3,
      };
    }

    // Assemble all slides
    const allSlides = [titleSlide, agendaSlide, ...slides, conclusionSlide];
    if (referencesSlide) {
      allSlides.push(referencesSlide);
    }

    // Update slide orders
    allSlides.forEach((slide, index) => {
      slide.order = index;
    });

    const deck: Deck = {
      id: `deck-${Date.now()}`,
      meta: {
        title: outline.title,
        subtitle: outline.subtitle,
        author: 'AI Slide Maker',
        date: new Date().toISOString().split('T')[0],
        audience: input.audience,
        tone: input.tone,
        theme: input.theme || 'professional',
        duration: outline.estimatedDuration,
        wordCount: outline.wordCount,
      },
      slides: allSlides,
      researchSnippets: snippets,
      quality: {
        factCheckScore: 0.8,
        accessibilityScore: 0.8,
        readabilityScore: 0.8,
        consistencyScore: 0.8,
      },
    };

    return deck;
  }

  // ============================================================================
  // METADATA CALCULATION
  // ============================================================================

  private calculateMetadata(processingTime: number): OrchestratorOutput['metadata'] {
    // This would be calculated from actual token usage in a real implementation
    return {
      totalTokens: 0, // Would be calculated from agent executions
      totalCost: 0, // Would be calculated from token usage and model costs
      processingTime,
      qualityScores: {
        factCheck: 0.8,
        accessibility: 0.8,
        readability: 0.8,
        consistency: 0.8,
      },
    };
  }

  // ============================================================================
  // AGENT INITIALIZATION
  // ============================================================================

  private async initializeAgents(): Promise<void> {
    console.log('[Orchestrator] Initializing agents...');
    
    // Import and initialize all agents
    try {
      // Core agents
      const { ResearcherAgent } = await import('./agents/researcher');
      const researcher = new ResearcherAgent();
      researcher.setRouter(this.router);
      this.agents.set('researcher', researcher);

      const { StructurerAgent } = await import('./agents/structurer');
      const structurer = new StructurerAgent();
      structurer.setRouter(this.router);
      this.agents.set('structurer', structurer);

      const { SlidewriterAgent } = await import('./agents/slidewriter');
      const slidewriter = new SlidewriterAgent();
      slidewriter.setRouter(this.router);
      this.agents.set('slidewriter', slidewriter);

      const { CopyTightenerAgent } = await import('./agents/copy-tightener');
      const copyTightener = new CopyTightenerAgent();
      copyTightener.setRouter(this.router);
      this.agents.set('copy-tightener', copyTightener);

      const { FactCheckerAgent } = await import('./agents/fact-checker');
      const factChecker = new FactCheckerAgent();
      factChecker.setRouter(this.router);
      this.agents.set('fact-checker', factChecker);

      // New specialized agents
      const { DataVizPlannerAgent } = await import('./agents/data-viz-planner');
      const dataVizPlanner = new DataVizPlannerAgent();
      dataVizPlanner.setRouter(this.router);
      this.agents.set('data-viz-planner', dataVizPlanner);

      const { MediaFinderAgent } = await import('./agents/media-finder');
      const mediaFinder = new MediaFinderAgent();
      mediaFinder.setRouter(this.router);
      this.agents.set('media-finder', mediaFinder);

      const { SpeakerNotesGeneratorAgent } = await import('./agents/speaker-notes-generator');
      const speakerNotesGenerator = new SpeakerNotesGeneratorAgent();
      speakerNotesGenerator.setRouter(this.router);
      this.agents.set('speaker-notes-generator', speakerNotesGenerator);

      const { AccessibilityLinterAgent } = await import('./agents/accessibility-linter');
      const accessibilityLinter = new AccessibilityLinterAgent();
      accessibilityLinter.setRouter(this.router);
      this.agents.set('accessibility-linter', accessibilityLinter);

      const { LiveWidgetPlannerAgent } = await import('./agents/live-widget-planner');
      const liveWidgetPlanner = new LiveWidgetPlannerAgent();
      liveWidgetPlanner.setRouter(this.router);
      this.agents.set('live-widget-planner', liveWidgetPlanner);

      const { ExecutiveSummaryAgent } = await import('./agents/executive-summary');
      const executiveSummary = new ExecutiveSummaryAgent();
      executiveSummary.setRouter(this.router);
      this.agents.set('executive-summary', executiveSummary);

          const { AudienceAdapterAgent } = await import('./agents/audience-adapter');
          const audienceAdapter = new AudienceAdapterAgent();
          audienceAdapter.setRouter(this.router);
          this.agents.set('audience-adapter', audienceAdapter);

          const { ReadabilityAnalyzerAgent } = await import('./agents/readability-analyzer');
          const readabilityAnalyzer = new ReadabilityAnalyzerAgent();
          readabilityAnalyzer.setRouter(this.router);
          this.agents.set('readability-analyzer', readabilityAnalyzer);

          console.log(`[Orchestrator] Initialized ${this.agents.size} agents`);
      this.isInitialized = true;
    } catch (error) {
      console.error('[Orchestrator] Failed to initialize agents:', error);
      this.isInitialized = false;
      throw new Error('Agent initialization failed');
    }
  }

  // ============================================================================
  // MONITORING & METRICS
  // ============================================================================

  getTaskHistory(): Map<string, unknown> {
    return this.taskHistory;
  }

  getAgentStatus(): Map<string, unknown> {
    const status = new Map();
    for (const [name, agent] of this.agents) {
      status.set(name, {
        name: agent.config.name,
        description: agent.config.description,
        capabilities: agent.config.capabilities,
      });
    }
    return status;
  }

  getRouterStatus(): unknown {
    return {
      models: this.router.listModels().length,
      policies: ['quality', 'speed', 'cost', 'balanced', 'local-only'],
      queueStatus: this.router.getQueueStatus(),
    };
  }
}
