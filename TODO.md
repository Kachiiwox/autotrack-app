# AutoTrack Core Reliability TODOs

This file tracks critical reliability gaps that must be resolved to fulfill the core promises of the application. Do not move these to "future phases" if they compromise data integrity.

## High Priority

- [ ] **Migrate to `@react-native-firebase/firestore` for Mobile Persistence**
  - **Issue:** The Firebase JS SDK's `persistentLocalCache` does not support IndexedDB on React Native (iOS/Android) without unreliable polyfills. It silently degrades to `memoryLocalCache`.
  - **Risk:** If a mechanic goes offline, creates/edits a complaint, and then force-closes the app before connectivity returns, all those unsynced writes will be permanently lost. This violates the app's core promise to "never lose a customer complaint."
  - **Action Required:** 
    1. Swap the JS SDK (`firebase/firestore`) out for `@react-native-firebase/firestore`.
    2. Build a custom Expo Dev Client (since `@react-native-firebase` requires native code and doesn't work in standard Expo Go).
    3. Remove the fallback to `memoryLocalCache` in `firebaseConfig.js`.
