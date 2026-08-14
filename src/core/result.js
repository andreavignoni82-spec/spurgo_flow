export const ok = (value) => Object.freeze({ ok: true, value });
export const err = (error) => Object.freeze({ ok: false, error });
