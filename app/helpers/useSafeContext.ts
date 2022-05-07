import * as React from 'react';

/** Wrapper around useContext that throws an error if the context is not provided */
export const useSafeContext = <T>(context: React.Context<T>) => {
  const value = React.useContext(context);
  if (value == undefined) {
    throw new Error(`${context.displayName} must be used inside ${context.displayName}.Provider`);
  }
  return value!; // this cannot be undefined, so we can destructure from it
};
