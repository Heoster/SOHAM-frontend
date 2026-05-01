import type {IntentResult, IntentType} from './intent-detector';
import {getTrainingExampleCount} from './intent-training-data';

export interface IntentFeedbackRecord {
  message: string;
  historyTail: string[];
  result: IntentResult;
  recommendations: string[];
  timestamp: string;
}

const FEEDBACK_BUFFER_LIMIT = 100;
const feedbackBuffer: IntentFeedbackRecord[] = [];

export function getIntentQualityRecommendations(
  result: IntentResult,
  ranking: Array<{intent: IntentType; score: number}>,
  historyTail: string[]
): string[] {
  const recommendations: string[] = [];
  const sorted = [...ranking].sort((a, b) => b.score - a.score);
  const top = sorted[0];
  const second = sorted[1];

  if (top && second && top.score - second.score < 0.12) {
    recommendations.push(`Low separation between ${top.intent} and ${second.intent}; add more disambiguation examples.`);
  }

  if (result.confidence < 0.72) {
    recommendations.push('Confidence is low; review similar queries and promote confirmed outcomes into training examples.');
  }

  if (historyTail.length === 0) {
    recommendations.push('No prior context was available; consider using more follow-up examples in training.');
  }

  if (getTrainingExampleCount(result.intent) < 80) {
    recommendations.push(`Training set for ${result.intent} is smaller than target size.`);
  }

  return recommendations;
}

export function recordIntentFeedback(record: IntentFeedbackRecord) {
  feedbackBuffer.push(record);
  if (feedbackBuffer.length > FEEDBACK_BUFFER_LIMIT) {
    feedbackBuffer.shift();
  }
}

export function getIntentFeedbackBuffer() {
  return [...feedbackBuffer];
}
