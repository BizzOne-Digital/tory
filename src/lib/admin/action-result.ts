export type ActionResult<T = void> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; error: string };

export function actionError(error: string): ActionResult<never> {
  return { ok: false, error };
}

export function actionSuccess<T = void>(
  data?: T,
  message?: string,
): ActionResult<T> {
  return { ok: true, data, message };
}

export function serializeDoc<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
