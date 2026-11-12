import { describe, it, expect } from 'vitest';
import { ChartBlockSchema, StudyBlockSchema, GenerationResponseSchema } from '../lib/schemas';

describe('Chart Block Validation Suite', () => {
  it('successfully validates a well-formed quantitative comparison chart', () => {
    const validChart = {
      type: 'chart',
      id: 'chart-cpu-benchmarks',
      title: 'Scheduling Algorithm Latency Comparison',
      chartType: 'comparison',
      xAxisLabel: 'Benchmark processes',
      yAxisLabel: 'Latency in milliseconds',
      data: [
        { label: 'Shortest Job First', value: 12.5, unit: 'ms', description: 'Optimal theoretical latency' },
        { label: 'Round Robin (20ms)', value: 24.0, unit: 'ms', description: 'Balanced time-sharing' },
        { label: 'First-Come, First-Served', value: 48.0, unit: 'ms', description: 'High turnaround due to convoy effect' },
      ],
      summary: 'Shortest Job First provides a 74% reduction in waiting latency compared to FCFS.',
    };

    const parsed = ChartBlockSchema.parse(validChart);
    expect(parsed.type).toBe('chart');
    expect(parsed.data).toHaveLength(3);
    expect(parsed.data[0].value).toBe(12.5);
  });

  it('validates a chart through the root StudyBlock discriminated union', () => {
    const chartBlock = {
      type: 'chart',
      id: 'chart-1',
      title: 'Algorithm Distribution',
      chartType: 'distribution',
      data: [
        { label: 'Preemptive', value: 65, unit: '%' },
        { label: 'Non-preemptive', value: 35, unit: '%' },
      ],
      summary: '65% of modern schedulers employ preemptive context switching.',
    };

    const parsed = StudyBlockSchema.parse(chartBlock);
    expect(parsed.type).toBe('chart');
  });

  it('rejects chart data with non-numeric value', () => {
    const invalidChart = {
      type: 'chart',
      id: 'chart-invalid-num',
      title: 'Invalid Data Test',
      chartType: 'bar',
      data: [
        { label: 'Process A', value: 'forty-two' }, // invalid type
      ],
      summary: 'Summary text',
    };

    expect(() => ChartBlockSchema.parse(invalidChart)).toThrow();
  });

  it('rejects chart with empty data array', () => {
    const emptyChart = {
      type: 'chart',
      id: 'chart-empty',
      title: 'Empty Data Test',
      chartType: 'bar',
      data: [],
      summary: 'No data',
    };

    expect(() => ChartBlockSchema.parse(emptyChart)).toThrow(/at least one data point/);
  });

  it('rejects chart with missing summary', () => {
    const missingSummary = {
      type: 'chart',
      id: 'chart-no-summary',
      title: 'Missing Summary Test',
      chartType: 'bar',
      data: [{ label: 'Metric', value: 10 }],
      summary: '',
    };

    expect(() => ChartBlockSchema.parse(missingSummary)).toThrow(/accessible text summary/);
  });

  it('validates a complete GenerationResponse including summary, flashcards, quiz, checklist, and chart', () => {
    const fullResponse = {
      title: 'Comprehensive Computer Science Module',
      blocks: [
        {
          type: 'summary',
          id: 's-1',
          title: 'Overview',
          content: 'Detailed summary content...',
          keyPoints: ['Core takeaway 1'],
        },
        {
          type: 'flashcards',
          id: 'fc-1',
          cards: [{ id: 'c-1', question: 'Q?', answer: 'A!' }],
        },
        {
          type: 'quiz',
          id: 'q-1',
          questions: [
            {
              id: 'q-1',
              question: 'Which is fastest?',
              options: ['Option A', 'Option B'],
              correctAnswerIndex: 0,
              explanation: 'Option A is fastest.',
            },
          ],
        },
        {
          type: 'checklist',
          id: 'chk-1',
          title: 'Review checklist',
          items: [{ id: 'i-1', text: 'Master algorithms' }],
        },
        {
          type: 'chart',
          id: 'ch-1',
          title: 'Speedup Metrics',
          chartType: 'bar',
          data: [{ label: 'Optimized', value: 4.2, unit: 'x' }],
          summary: '4.2x speedup achieved with parallel pipelines.',
        },
      ],
    };

    const parsed = GenerationResponseSchema.parse(fullResponse);
    expect(parsed.blocks).toHaveLength(5);
    expect(parsed.blocks.map((b) => b.type)).toEqual([
      'summary',
      'flashcards',
      'quiz',
      'checklist',
      'chart',
    ]);
  });
});
