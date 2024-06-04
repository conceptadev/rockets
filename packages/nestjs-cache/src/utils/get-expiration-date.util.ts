import ms from 'ms';

const getExpirationDate = (
  expiresIn: string | null | undefined,
): Date | null => {
  if (!expiresIn) return null;

  const now = new Date();
  const expires = ms(expiresIn);

  // TODO: should be a custom exception
  if (!expires) throw new Error(`Invalid expiresIn`);

  // add time in seconds to now as string format
  return new Date(now.getTime() + expires);
};

export default getExpirationDate;
