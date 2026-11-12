import type { GenerationResponse, StudySession } from '@/types/study';

export const SAMPLE_STUDY_MATERIAL = `CPU Scheduling Algorithms & Concurrency in Modern Operating Systems:
CPU scheduling is the basis of multi-programmed operating systems. By switching the CPU among processes, the operating system can make the computer more productive.

Key Concepts:
1. CPU-I/O Burst Cycle: Process execution consists of a cycle of CPU execution and I/O wait. Processes alternate between these two states.
2. Preemptive vs Non-Preemptive Scheduling:
   - Non-preemptive (cooperative): Once the CPU has been allocated to a process, the process keeps the CPU until it releases it, either by terminating or by switching to the waiting state (e.g., FCFS).
   - Preemptive: A process can be interrupted and moved to the ready state by the OS scheduler (e.g., Round Robin, Shortest Remaining Time First).
3. Core Scheduling Algorithms:
   - First-Come, First-Served (FCFS): Simple FIFO queue. Suffer from the 'convoy effect' where short processes wait behind one long CPU-bound process.
   - Shortest Job First (SJF): Associates each process with the length of its next CPU burst. Optimal in minimizing average waiting time, but difficult to predict future burst times.
   - Round Robin (RR): Designed especially for time-sharing systems. A small unit of time called a time quantum or time slice (typically 10-100 ms) is defined. Preempts processes exceeding the quantum.
   - Priority Scheduling: Allocates CPU based on process priority. Can suffer from starvation (indefinite blocking), which is solved using aging (gradually increasing the priority of waiting processes).
4. Critical Section Problem & Synchronization:
   - When concurrent processes access shared data, race conditions can occur.
   - Solutions must satisfy: Mutual Exclusion, Progress, and Bounded Waiting.
   - Common synchronization primitives include Mutex Locks, Semaphores (counting and binary), and Monitors.`;

export const MOCK_GENERATION_RESPONSE: GenerationResponse = {
  title: 'Operating Systems: CPU Scheduling & Process Synchronization',
  blocks: [
    {
      type: 'summary',
      id: 'summary-os-sched',
      title: 'Executive Summary: CPU Scheduling Fundamentals',
      content:
        'CPU scheduling is a core mechanism in multi-programmed operating systems designed to maximize CPU utilization and throughput while minimizing turnaround, waiting, and response times. Modern schedulers distinguish between preemptive (interrupted by OS timer or priority) and non-preemptive paradigms. Balancing responsiveness and efficiency requires careful selection of algorithms like Round Robin or SJF, paired with starvation prevention techniques such as aging.',
      keyPoints: [
        'The CPU-I/O burst cycle dictates scheduling efficiency.',
        'FCFS is simple but prone to the convoy effect.',
        'SJF minimizes average waiting time but requires burst prediction.',
        'Round Robin relies on a time quantum to deliver responsive time-sharing.',
        'Priority scheduling requires aging to prevent process starvation.',
        'Synchronization primitives (mutexes, semaphores) prevent race conditions in critical sections.',
      ],
    },
    {
      type: 'flashcards',
      id: 'flashcards-os-sched',
      cards: [
        {
          id: 'card-1',
          question: 'What is the "Convoy Effect" in First-Come, First-Served (FCFS) scheduling?',
          answer:
            'A phenomenon where short I/O-bound processes are delayed in the ready queue behind a single long, CPU-bound process, resulting in poor CPU and device utilization.',
          difficulty: 'easy',
        },
        {
          id: 'card-2',
          question: 'How does Round Robin (RR) scheduling prevent monopolization of the CPU?',
          answer:
            'By enforcing a fixed time quantum (typically 10-100ms). If a process does not complete within this slice, a timer interrupt preempts it and moves it to the tail of the ready queue.',
          difficulty: 'medium',
        },
        {
          id: 'card-3',
          question: 'What technique solves the indefinite starvation problem in Priority Scheduling?',
          answer:
            'Aging: a technique that gradually increases the priority of processes that wait in the system for a long duration, guaranteeing eventual execution.',
          difficulty: 'medium',
        },
        {
          id: 'card-4',
          question: 'What are the three mandatory requirements to solve the Critical Section Problem?',
          answer:
            '1. Mutual Exclusion (only one process in the CS at a time)\n2. Progress (selection of next process cannot be postponed indefinitely)\n3. Bounded Waiting (limit on times other processes enter before a waiting process).',
          difficulty: 'hard',
        },
      ],
    },
    {
      type: 'quiz',
      id: 'quiz-os-sched',
      questions: [
        {
          id: 'q-1',
          question: 'Which CPU scheduling algorithm is mathematically proven to achieve the minimum average waiting time for a given set of processes?',
          options: [
            'First-Come, First-Served (FCFS)',
            'Shortest-Job-First (SJF)',
            'Round Robin (RR)',
            'Multi-Level Feedback Queue (MLFQ)',
          ],
          correctAnswerIndex: 1,
          explanation:
            'SJF is provably optimal because moving a short process before a long one decreases waiting time for the short process more than it increases waiting time for the long process.',
        },
        {
          id: 'q-2',
          question: 'What happens in Round Robin scheduling if the time quantum is set arbitrarily large?',
          options: [
            'Context switching overhead causes thrashing',
            'The algorithm degenerates into First-Come, First-Served (FCFS)',
            'The system guarantees zero waiting time',
            'Shortest processes are prioritized automatically',
          ],
          correctAnswerIndex: 1,
          explanation:
            'If the time quantum exceeds the longest CPU burst of all ready processes, every process completes in its first burst, behaving identically to FCFS.',
        },
        {
          id: 'q-3',
          question: 'Which condition occurs when multiple processes access and manipulate the same data concurrently and the outcome depends on the execution order?',
          options: [
            'Deadlock',
            'Race Condition',
            'Starvation',
            'Convoy Effect',
          ],
          correctAnswerIndex: 1,
          explanation:
            'A Race Condition occurs when multiple concurrent threads or processes read and write shared data, and the final value depends on the non-deterministic interleaving of instructions.',
        },
      ],
    },
    {
      type: 'checklist',
      id: 'checklist-os-sched',
      title: 'Revision Checklist: OS Scheduling & Synchronization',
      items: [
        { id: 'chk-1', text: 'Understand the difference between preemptive and non-preemptive scheduling' },
        { id: 'chk-2', text: 'Calculate average waiting time and turnaround time for Gantt charts' },
        { id: 'chk-3', text: 'Analyze the impact of time quantum size on Round Robin context-switch overhead' },
        { id: 'chk-4', text: 'Explain the mechanism of process aging to resolve priority starvation' },
        { id: 'chk-5', text: 'Identify the three formal criteria for valid critical section solutions' },
      ],
    },
    {
      type: 'chart',
      id: 'chart-os-sched',
      title: 'Comparative Benchmark: Average Waiting Time (ms)',
      chartType: 'comparison',
      xAxisLabel: 'Standard 5-process benchmark test suite',
      yAxisLabel: 'Average Waiting Time (ms)',
      data: [
        { label: 'Shortest Job First (SJF)', value: 14, unit: 'ms', description: 'Provably minimal waiting time with prior burst knowledge' },
        { label: 'Round Robin (RR, q=20ms)', value: 28, unit: 'ms', description: 'Balanced time-sharing with low latency' },
        { label: 'Priority Scheduling', value: 34, unit: 'ms', description: 'Priority-based dispatch with aging enabled' },
        { label: 'First-Come, First-Served (FCFS)', value: 52, unit: 'ms', description: 'Highest latency due to convoy effect' },
      ],
      summary: 'Shortest Job First (SJF) achieves the lowest average waiting time (14ms), outperforming FCFS by 73% by preventing shorter tasks from queuing behind CPU-bound processes.',
    },
  ],
};

export const MOCK_SAVED_SESSION: StudySession = {
  id: 'session-demo-os',
  title: MOCK_GENERATION_RESPONSE.title,
  topicOrNotes: SAMPLE_STUDY_MATERIAL,
  difficulty: 'intermediate',
  selectedBlockTypes: ['summary', 'flashcards', 'quiz', 'checklist', 'chart'],
  createdAt: Date.now() - 3600000,
  updatedAt: Date.now() - 1800000,
  blocks: MOCK_GENERATION_RESPONSE.blocks,
  progress: {
    flashcards: {
      'card-1': 'known',
      'card-2': 'learning',
    },
    quiz: {
      answers: {
        'q-1': 1,
        'q-2': 0, // Wrong answer for demoing wrong answer retesting!
      },
      submitted: true,
      score: 1,
      total: 2,
      incorrectQuestionIds: ['q-2'],
      attempts: 1,
      history: [
        {
          timestamp: Date.now() - 1800000,
          score: 1,
          total: 2,
          mode: 'full',
        },
      ],
    },
    checklist: {
      'chk-1': true,
      'chk-2': true,
    },
  },
};
