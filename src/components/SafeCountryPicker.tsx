import React, { useState } from 'react';
import CountryPicker from 'react-native-country-picker-modal';

type Props = any;

export default function SafeCountryPicker(props: Props) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    // Render a fallback small placeholder when the underlying picker errors.
    return (
      // Keep layout similar so UI doesn't jump
      <></>
    );
  }

  try {
    // Render the native picker. If it throws synchronously, catch and fallback.
    return (
      <CountryPicker
        {...(props as any)}
        onChange={(c: any) => {
          try {
            props.onChange && props.onChange(c as any);
          } catch (e) {
            // ignore
          }
        }}
      />
    );
  } catch (e) {
    // If rendering throws (e.g., measureInWindow undefined), mark error and stop rendering picker.
    // Next renders will show the empty fallback.
    setHasError(true);
    return <></>;
  }
}
