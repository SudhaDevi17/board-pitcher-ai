import { getIdTokenSafe, auth } from '../firebase';
import { EvaluatePitchRequest, EvaluatePitchResponse } from '../types';

export async function evaluatePitchApi(
  payload: EvaluatePitchRequest
): Promise<EvaluatePitchResponse> {
  const token = await getIdTokenSafe();
  const currentUser = auth.currentUser;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else if (currentUser) {
    headers['Authorization'] = `Bearer guest_token_${currentUser.uid}`;
    headers['x-guest-uid'] = currentUser.uid;
  } else {
    headers['x-guest-uid'] = 'demo_founder_preview';
  }

  const response = await fetch('/api/evaluate-pitch', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(errorData.error || `Server error (${response.status})`);
  }

  return response.json();
}
