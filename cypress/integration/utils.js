export const getPickerInstanceFromWindow = (which = 'focusPicker') => {
  return cy
    .window()
    .its(which)
    .then((instance) => instance);
};
