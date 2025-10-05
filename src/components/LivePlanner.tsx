'use client';

import React, { useState, useEffect } from 'react';
import { PresentationPlan, PlanningStep } from '@/lib/planner';
import { ExecutionState, PresentationExecutor } from '@/lib/executor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Play, Pause, RotateCcw, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LivePlannerProps {
  plan: PresentationPlan;
  onPlanComplete: (deck: any) => void;
  onCancel: () => void;
}

export function LivePlanner({ plan, onPlanComplete, onCancel }: LivePlannerProps) {
  const [executionState, setExecutionState] = useState<ExecutionState | null>(null);
  const [executor, setExecutor] = useState<PresentationExecutor | null>(null);
  const [isAutoMode, setIsAutoMode] = useState(true);

  useEffect(() => {
    const newExecutor = new PresentationExecutor(plan, setExecutionState);
    setExecutor(newExecutor);
    
    // Start execution automatically
    if (isAutoMode) {
      newExecutor.startExecution();
    }
  }, [plan, isAutoMode]);

  const handleStepClick = async (stepId: string) => {
    if (executor && !isAutoMode) {
      await executor.executeStep(stepId);
    }
  };

  const handleToggleMode = () => {
    if (executor) {
      if (isAutoMode) {
        executor.pauseExecution();
      } else {
        executor.resumeExecution();
      }
      setIsAutoMode(!isAutoMode);
    }
  };

  const handleRestart = () => {
    if (executor) {
      const newExecutor = new PresentationExecutor(plan, setExecutionState);
      setExecutor(newExecutor);
      if (isAutoMode) {
        newExecutor.startExecution();
      }
    }
  };

  const getStepIcon = (step: PlanningStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStepBadgeVariant = (step: PlanningStep) => {
    switch (step.status) {
      case 'completed':
        return 'default';
      case 'in_progress':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (!executionState) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{plan.title}</h2>
          <p className="text-muted-foreground">{plan.overview}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleMode}
            disabled={!executor}
          >
            {isAutoMode ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isAutoMode ? 'Pause' : 'Resume'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRestart}
            disabled={!executor}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Restart
          </Button>
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Progress</span>
            <Badge variant="outline">
              {executionState.progress.percentage}% Complete
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={executionState.progress.percentage} className="w-full" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{executionState.progress.completed} of {executionState.progress.total} steps completed</span>
              <span>Estimated time: {plan.estimatedDuration}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Step */}
      {executionState.currentStep && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
              <span>Currently Working On</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <h3 className="font-semibold">{executionState.currentStep.title}</h3>
              <p className="text-sm text-muted-foreground">
                {executionState.currentStep.description}
              </p>
              <div className="flex items-center space-x-4 text-sm">
                <span className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{executionState.currentStep.estimatedTime}</span>
                </span>
                <Badge variant="secondary">
                  {executionState.currentStep.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Steps List */}
      <div className="grid gap-4">
        <h3 className="text-lg font-semibold">Execution Steps</h3>
        <div className="space-y-3">
          <AnimatePresence>
            {plan.steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    step.status === 'in_progress' ? 'ring-2 ring-blue-500' : ''
                  } ${
                    step.status === 'completed' ? 'bg-green-50 border-green-200' : ''
                  }`}
                  onClick={() => handleStepClick(step.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStepIcon(step)}
                        <div>
                          <h4 className="font-medium">{step.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {step.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getStepBadgeVariant(step)}>
                          {step.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {step.estimatedTime}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Live Logs */}
      {executionState.logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Live Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {executionState.logs.slice(-10).map((log) => (
                <div
                  key={log.id}
                  className="flex items-center space-x-2 text-sm"
                >
                  <span className="text-muted-foreground">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <Badge
                    variant={
                      log.type === 'success' ? 'default' :
                      log.type === 'error' ? 'destructive' :
                      log.type === 'warning' ? 'secondary' : 'outline'
                    }
                    className="text-xs"
                  >
                    {log.type}
                  </Badge>
                  <span>{log.message}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completion */}
      {executionState.progress.percentage === 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-800 mb-2">
                Presentation Complete!
              </h3>
              <p className="text-green-700 mb-4">
                Your presentation has been generated successfully with {executionState.deck.slides?.length || 0} slides.
              </p>
              <Button onClick={() => onPlanComplete(executionState.deck)}>
                View Presentation
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

