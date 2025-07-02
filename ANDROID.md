# Android Development Reference - Earth 2089

## Platform Support Matrix

| Platform | Distribution | MWA Support | Wallet Integration | Target Devices | Status |
|----------|-------------|-------------|-------------------|----------------|---------|
| **Web dApp** | Netlify | ✅ Via Chrome Android | @solana/wallet-adapter-react | All browsers | ✅ Current |
| **Android - Solana Mobile** | Solana dApp Store | ✅ Native hardware + webview | Existing wallet adapter | Solana Mobile devices | 🔄 Testing needed |
| **Android - Play Store** | Google Play Store | ✅ Via Chrome webview | Existing wallet adapter | All Android devices | 🔄 Testing needed |

## Development Checklist

### Prerequisites ✅
- [x] Node.js 22+ installed and set as default
- [x] Capacitor core and Android platform added
- [x] Android Studio installed
- [x] Android SDK configured
- [x] Java 21 installed and configured
- [x] Android emulator created (Medium_Phone_API_36.0)

### Capacitor Configuration
- [x] `capacitor.config.ts` created
- [x] Android platform added (`npx cap add android`)
- [x] Java version compatibility configured (Java 21)
- [x] Gradle build configuration updated
- [ ] Deep linking configuration for wallet intents
- [ ] Performance optimization for mobile canvas rendering

### Build Process
```bash
# Development workflow
npm run build              # Build web assets
npx cap sync android      # Sync to Android project
npx cap open android      # Open in Android Studio
npx cap run android       # Run on emulator/device
```

### Testing Requirements

#### Web App Compatibility (Capacitor Webview)
- [ ] Verify @solana/wallet-adapter-react works in Android webview
- [ ] Test wallet connections (Phantom, Solflare) on Android
- [ ] Validate transaction signing flow
- [ ] Check canvas character generation performance

#### Solana Mobile Specific
- [ ] Test on Solana Mobile device/emulator
- [ ] Verify Seed Vault integration works through existing wallet adapter
- [ ] Test deep linking with `solana-wallet://` schemes
- [ ] Validate MWA protocol compatibility

#### General Android
- [ ] Test on various Android versions (API 24+)
- [ ] Performance testing on lower-end devices
- [ ] Battery usage optimization
- [ ] Network connectivity handling

### Distribution Preparation

#### Solana dApp Store
- [ ] Review Solana dApp Store publishing requirements
- [ ] Prepare app metadata and descriptions
- [ ] Test installation from Solana dApp Store

#### Google Play Store
- [ ] Target SDK: Android 14 (API level 34)
- [ ] Minimum SDK: Android 7.0 (API level 24)
- [ ] 64-bit support enabled
- [ ] Required permissions documented and justified
- [ ] Privacy policy and data handling compliance

### Technical Requirements

#### Android Permissions
```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

#### Deep Linking Configuration
```xml
<!-- For wallet deep linking support -->
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="earth2089" />
</intent-filter>
```

#### Performance Optimizations
- [ ] Canvas rendering optimized for mobile GPUs
- [ ] Asset caching implemented
- [ ] Network request batching
- [ ] Memory management for character images

### Known Compatibility

#### MWA Support Matrix
| Platform | MWA Support | Notes |
|----------|-------------|-------|
| Android Chrome Webview | ✅ | Automatic via @solana/wallet-adapter-react |
| iOS Safari | ❌ | Not supported by Solana Mobile Stack |
| Other Android browsers | ❌ | Limited MWA support |

#### Wallet Compatibility
- **Phantom Mobile**: Primary testing target
- **Solflare Mobile**: Secondary testing target
- **Ultimate**: Additional testing recommended
- **Backpack**: Additional testing recommended

### Development Commands

```bash
# Environment setup
nvm use 22                          # Ensure Node 22+
npm install                         # Install dependencies

# Build and sync
npm run build                       # Build web app
npx cap sync android               # Sync to Android

# Development
npx cap run android --livereload   # Live reload development
npx cap open android               # Open Android Studio

# Building APKs
cd android
./gradlew assembleDebug            # Debug APK
./gradlew assembleRelease          # Release APK

# Testing
npx cap doctor android             # Verify Android setup
emulator -list-avds                # List available emulators
```

**Note:** Initial APK deployment to emulator can take 5-10 minutes. Subsequent deployments are much faster.

### Questions to Resolve

1. **Webview MWA Compatibility**: Does Capacitor's webview behave exactly like Chrome for MWA support?
2. **Intent Filters**: What specific Android intent filters are needed for optimal wallet deep linking?
3. **Solana dApp Store**: What are the specific submission requirements vs Google Play Store?
4. **Performance**: Any mobile-specific optimizations needed for canvas character generation?
5. **Hardware Features**: Can/should the app leverage Solana Mobile hardware features through web APIs?

### Success Criteria

- [ ] Web app runs smoothly in Android webview
- [ ] Wallet connections work on all target Android devices
- [ ] Performance is acceptable on mid-range Android hardware
- [ ] App can be published to both Solana dApp Store and Google Play Store
- [ ] All blockchain functionality works identically to web version

---

**Note**: This is a web-first approach using Capacitor. The app remains fundamentally a web application with Android packaging for mobile distribution and Solana Mobile compatibility.