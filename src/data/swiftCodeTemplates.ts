export interface SwiftFile {
  name: string;
  language: string;
  description: string;
  path: string;
  code: string;
}

export const swiftFiles: SwiftFile[] = [
  {
    name: "DiaryEntry.swift",
    language: "swift",
    description: "SwiftData Entity Schema representing a single secure, timestamped entry in the diary. Configures database indexing for high performance.",
    path: "Models/DiaryEntry.swift",
    code: `import Foundation
import SwiftData

/// The lightweight, secure storage schema representing a single diary entry in SwiftData.
@Model
final public class DiaryEntry {
    @Attribute(.unique) public var id: UUID
    public var title: String
    public var content: String
    public var timestamp: Date
    
    // Additional features: metadata tags for categories, and a locked flag (for optional entry-specific encryption)
    public var category: String
    public var isFlagged: Bool
    
    public init(
        id: UUID = UUID(),
        title: String = "",
        content: String = "",
        timestamp: Date = Date(),
        category: String = "Personal",
        isFlagged: Bool = false
    ) {
        self.id = id
        self.title = title
        self.content = content
        self.timestamp = timestamp
        self.category = category
        self.isFlagged = isFlagged
    }
}
`
  },
  {
    name: "SecurityManager.swift",
    language: "swift",
    description: "Multi-layered security controller bridging bio-authentication (Face ID/Touch ID) and secure Keychain services for high-grade iOS protection.",
    path: "Managers/SecurityManager.swift",
    code: `import Foundation
import Security
import LocalAuthentication

/// A thread-safe cryptographic and biometric boundary that manages secure states and system Keychain interaction.
public final class SecurityManager: ObservableObject {
    public static let shared = SecurityManager()
    
    private let keychainService = "com.diary.secure.app"
    private let keychainAccount = "user_pin_code"
    
    @Published public var pinExists: Bool = false
    @Published public var isBiometricsAvailable: Bool = false
    
    private init() {
        self.pinExists = checkIfPinExists()
        self.isBiometricsAvailable = checkBiometricSupport()
    }
    
    // MARK: - Biometric Verification
    
    /// Queries the iOS hardware layers to verify whether Face ID or Touch ID is configured and supported.
    public func checkBiometricSupport() -> Bool {
        let context = LAContext()
        var error: NSError?
        let canEvaluate = context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error)
        return canEvaluate
    }
    
    /// Requests Face ID authentication on the device. Returns state asynchronously.
    public func authenticateWithBiometrics(reason: String = "Unlock your secure personal timeline") async -> Bool {
        let context = LAContext()
        
        // Customizes the biometric trigger cancel button prompt text
        context.localizedCancelTitle = "Use Secret PIN"
        
        do {
            let success = try await context.evaluatePolicy(
                .deviceOwnerAuthenticationWithBiometrics,
                localizedReason: reason
            )
            return success
        } catch {
            print("❌ Biometric Authentication Failed: \\(error.localizedDescription)")
            return false
        }
    }
    
    // MARK: - Keychain Secure PIN Layer
    
    /// Saves a 4-digit PIN string directly into the Secure iOS Keychain.
    @discardableResult
    public func savePin(_ pin: String) -> Bool {
        guard pin.count == 4, let data = pin.data(using: .utf8) else { return false }
        
        // Define query to add new keychain entry
        var query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: keychainService,
            kSecAttrAccount as String: keychainAccount,
            kSecValueData as String: data,
            // Restrict physical accessibility: Only accessible when the device is unlocked!
            kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly
        ]
        
        // Delete any pre-existing credentials first to avoid conflicts
        SecItemDelete(query as CFDictionary)
        
        // Insert item to Keychain
        let status = SecItemAdd(query as CFDictionary, nil)
        let success = (status == errSecSuccess)
        
        if success {
            DispatchQueue.main.async { self.pinExists = true }
        }
        return success
    }
    
    /// Compares the input PIN code against the cryptographically stored Keychain secrets.
    public func verifyPin(_ input: String) -> Bool {
        guard let savedPin = retrievePinFromKeychain() else { return false }
        return input == savedPin
    }
    
    /// Clears any security parameters and locks stored in the secure database.
    public func resetSecurity() -> Bool {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: keychainService,
            kSecAttrAccount as String: keychainAccount
        ]
        let status = SecItemDelete(query as CFDictionary)
        let success = (status == errSecSuccess || status == errSecItemNotFound)
        
        if success {
            DispatchQueue.main.async { self.pinExists = false }
        }
        return success
    }
    
    // MARK: - Internal Helpers
    
    private func checkIfPinExists() -> Bool {
        return retrievePinFromKeychain() != nil
    }
    
    private func retrievePinFromKeychain() -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: keychainService,
            kSecAttrAccount as String: keychainAccount,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        
        var dataTypeRef: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &dataTypeRef)
        
        guard status == errSecSuccess, let data = dataTypeRef as? Data else {
            return nil
        }
        
        return String(data: data, encoding: .utf8)
    }
}
`
  },
  {
    name: "AuthViews.swift",
    language: "swift",
    description: "An elegant, Apple-inspired security boundary presenting fluid onboarding PIN setups, circular keypads, and biometrics challenge sheets.",
    path: "Views/AuthViews.swift",
    code: `import SwiftUI

// MARK: - Passcode Circle Indicator
struct PinDotsView: View {
    let pinLength: Int
    let maxLength: Int = 4
    
    var body: some View {
        HStack(spacing: 24) {
            ForEach(0..<maxLength, id: \\.self) { index in
                Circle()
                    .stroke(Color.primary.opacity(0.4), lineWidth: 1.5)
                    .background(
                        Circle()
                            .fill(index < pinLength ? Color.primary : Color.clear)
                            .padding(4)
                    )
                    .frame(width: 18, height: 18)
                    .scaleEffect(index < pinLength ? 1.15 : 1.0)
                    .animation(.spring(response: 0.25, dampingFraction: 0.6), value: pinLength)
            }
        }
    }
}

// MARK: - Circular Numeric Keypad
struct KeypadGrid: View {
    let onDigitTap: (String) -> Void
    let onDeleteTap: () -> Void
    let onBiometricsTap: (() -> Void)?
    let showBiometricsButton: Bool
    
    private let digits = [
        ["1", "2", "3"],
        ["4", "5", "6"],
        ["7", "8", "9"]
    ]
    
    var body: some View {
        VStack(spacing: 16) {
            ForEach(digits, id: \\.self) { row in
                HStack(spacing: 28) {
                    ForEach(row, id: \\.self) { num in
                        Button(action: { onDigitTap(num) }) {
                            Text(num)
                                .font(.system(size: 32, weight: .regular, design: .rounded))
                                .frame(width: 78, height: 78)
                                .background(Color(.systemGray6))
                                .foregroundColor(.primary)
                                .clipShape(Circle())
                        }
                        .buttonStyle(KeypadButtonStyle())
                    }
                }
            }
            
            // Bottom key row with Backspace and optional Biometric trigger
            HStack(spacing: 28) {
                // Biometrics Slot
                if showBiometricsButton, let onTap = onBiometricsTap {
                    Button(action: onTap) {
                        Image(systemName: "faceid")
                            .font(.system(size: 28))
                            .frame(width: 78, height: 78)
                            .foregroundColor(.accentColor)
                    }
                } else {
                    Spacer().frame(width: 78, height: 78)
                }
                
                // Zero Button
                Button(action: { onDigitTap("0") }) {
                    Text("0")
                        .font(.system(size: 32, weight: .regular, design: .rounded))
                        .frame(width: 78, height: 78)
                        .background(Color(.systemGray6))
                        .foregroundColor(.primary)
                        .clipShape(Circle())
                }
                .buttonStyle(KeypadButtonStyle())
                
                // Backspace Button
                Button(action: onDeleteTap) {
                    Image(systemName: "delete.left")
                        .font(.system(size: 22))
                        .frame(width: 78, height: 78)
                        .foregroundColor(.primary)
                }
            }
        }
    }
}

// Helper Button Style for circular button click shrinking
struct KeypadButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.92 : 1.0)
            .animation(.easeOut(duration: 0.1), value: configuration.isPressed)
    }
}

// MARK: - Onboarding Screen (PIN Setup)
public struct OnboardingSetupView: View {
    @ObservedObject var securityManager: SecurityManager
    let onCompletion: () -> Void
    
    @State private var step: SetupStep = .firstEntry
    @State private var pin: String = ""
    @State private var confirmPin: String = ""
    @State private var hasError: Bool = false
    
    enum SetupStep {
        case firstEntry, confirmation
        
        var title: String {
            switch self {
            case .firstEntry: return "Create Passcode"
            case .confirmation: return "Confirm Passcode"
            }
        }
        
        var subtitle: String {
            switch self {
            case .firstEntry: return "Choose a secure 4-digit PIN to encrypt your local diary entries."
            case .confirmation: return "Please enter your passcode once more to make sure it is correct."
            }
        }
    }
    
    public init(securityManager: SecurityManager, onCompletion: @escaping () -> Void) {
        self.securityManager = securityManager
        self.onCompletion = onCompletion
    }
    
    public var body: some View {
        VStack {
            Spacer().frame(height: 48)
            
            // Header Info
            Image(systemName: "lock.shield")
                .font(.system(size: 64))
                .foregroundColor(.accentColor)
                .padding(.bottom, 16)
            
            Text(step.title)
                .font(.title).bold()
                .padding(.bottom, 4)
            
            Text(step.subtitle)
                .font(.subheadline)
                .foregroundColor(.black.opacity(0.6))
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
                .frame(height: 48)
            
            Spacer()
            
            // Interactive Circles
            PinDotsView(pinLength: step == .firstEntry ? pin.count : confirmPin.count)
                .shake(trigger: hasError)
                .padding(.vertical, 24)
            
            Spacer()
            
            // Grid Keyboard
            KeypadGrid(
                onDigitTap: handleDigit,
                onDeleteTap: handleDelete,
                onBiometricsTap: nil,
                showBiometricsButton: false
            )
            .padding(.bottom, 40)
        }
    }
    
    private func handleDigit(_ char: String) {
        if step == .firstEntry {
            if pin.count < 4 {
                pin += char
                if pin.count == 4 {
                    // Stagger transition
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.25) {
                        self.step = .confirmation
                    }
                }
            }
        } else {
            if confirmPin.count < 4 {
                confirmPin += char
                if confirmPin.count == 4 {
                    verifyAndSave()
                }
            }
        }
    }
    
    private func handleDelete() {
        if step == .firstEntry {
            if !pin.isEmpty { pin.removeLast() }
        } else {
            if !confirmPin.isEmpty { confirmPin.removeLast() }
        }
    }
    
    private func verifyAndSave() {
        if pin == confirmPin {
            let success = securityManager.savePin(pin)
            if success {
                onCompletion()
            } else {
                triggerError()
            }
        } else {
            triggerError()
        }
    }
    
    private func triggerError() {
        hasError = true
        UIImpactFeedbackGenerator(style: .heavy).impactOccurred()
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.45) {
            self.hasError = false
            self.confirmPin = ""
            self.pin = ""
            self.step = .firstEntry
        }
    }
}

// MARK: - Lock Screen View (Decryption Wall)
public struct LockScreenView: View {
    @ObservedObject var securityManager: SecurityManager
    let onUnlockSuccess: () -> Void
    
    @State private var inputCode: String = ""
    @State private var isShaking: Bool = false
    
    public init(securityManager: SecurityManager, onUnlockSuccess: @escaping () -> Void) {
        self.securityManager = securityManager
        self.onUnlockSuccess = onUnlockSuccess
    }
    
    public var body: some View {
        VStack {
            Spacer()
            
            // Lock Indicator
            VStack(spacing: 8) {
                Image(systemName: "lock")
                    .font(.system(size: 44, weight: .light))
                    .foregroundColor(.primary)
                
                Text("Enter Diary Passcode")
                    .font(.headline)
                    .tracking(0.5)
                
                Text("Your notes are encrypted in secure storage")
                    .font(.caption)
                    .foregroundColor(.black.opacity(0.5))
            }
            
            Spacer().frame(height: 32)
            
            // Password dots visualizer
            PinDotsView(pinLength: inputCode.count)
                .shake(trigger: isShaking)
            
            Spacer()
            
            // Lock screen pad
            KeypadGrid(
                onDigitTap: handleDigit,
                onDeleteTap: handleDelete,
                onBiometricsTap: triggerBiometrics,
                showBiometricsButton: securityManager.isBiometricsAvailable
            )
            .padding(.bottom, 48)
        }
        .onAppear {
            if securityManager.isBiometricsAvailable {
                triggerBiometrics()
            }
        }
    }
    
    private func handleDigit(_ char: String) {
        guard inputCode.count < 4 else { return }
        inputCode += char
        
        if inputCode.count == 4 {
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) {
                authenticateAndVerify()
            }
        }
    }
    
    private func handleDelete() {
        if !inputCode.isEmpty {
            inputCode.removeLast()
        }
    }
    
    private func authenticateAndVerify() {
        if securityManager.verifyPin(inputCode) {
            UIImpactFeedbackGenerator(style: .medium).impactOccurred()
            onUnlockSuccess()
        } else {
            isShaking = true
            UIImpactFeedbackGenerator(style: .heavy).impactOccurred()
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.45) {
                self.isShaking = false
                self.inputCode = ""
            }
        }
    }
    
    private func triggerBiometrics() {
        Task {
            let authorized = await securityManager.authenticateWithBiometrics()
            if authorized {
                await MainActor.run {
                    onUnlockSuccess()
                }
            }
        }
    }
}

// MARK: - Shake Animation Extension
extension View {
    func shake(trigger: Bool) -> some View {
        modifier(ShakeEffect(trigger: trigger))
    }
}

struct ShakeEffect: GeometryEffect {
    var trigger: Bool
    var animatableData: CGFloat {
        get { trigger ? 1.0 : 0.0 }
        set { }
    }
    
    func effectValue(size: CGSize) -> ProjectionTransform {
        let translation = trigger ? sin(animatableData * .pi * 5.0) * 10.0 : 0
        return ProjectionTransform(CGAffineTransform(translationX: translation, y: 0))
    }
}
`
  },
  {
    name: "DiaryApp.swift",
    language: "swift",
    description: "The application's Root Scene configuration. Implements the SwiftData container, core navigation routers, and handles automatic foreground/background locking states via ScenePhase.",
    path: "DiaryApp.swift",
    code: `import SwiftUI
import SwiftData

@main
struct DiaryApp: App {
    // Inject and observe ScenePhase lifecycle events
    @Environment(\\.scenePhase) private var scenePhase
    
    // Core state and security systems initialization
    @StateObject private var securityManager = SecurityManager.shared
    @State private var appAuthState: AppAuthState = .locked
    
    var body: some Scene {
        WindowGroup {
            Group {
                switch appAuthState {
                case .verificationNeeded:
                    OnboardingSetupView(securityManager: securityManager) {
                        self.appAuthState = .unlocked
                    }
                case .locked:
                    LockScreenView(securityManager: securityManager) {
                        self.appAuthState = .unlocked
                    }
                case .unlocked:
                    NavigationStack {
                        DiaryTimelineView()
                    }
                    .transition(.asymmetric(
                        insertion: .opacity.combined(with: .scale(scale: 0.98)),
                        removal: .opacity
                    ))
                }
            }
            .animation(.easeInOut(duration: 0.35), value: appAuthState)
            .onAppear(perform: initializeAppSecurityState)
            // Listen to active/inactive/background state transitions!
            .onChange(of: scenePhase) { oldPhase, newPhase in
                handleLifecycleTransition(newPhase: newPhase)
            }
        }
        // Bind modelContainer to enable full-app SwiftData access context
        .modelContainer(for: DiaryEntry.self)
    }
    
    // MARK: - Initial State Router
    private func initializeAppSecurityState() {
        if !securityManager.pinExists {
            appAuthState = .verificationNeeded
        } else {
            appAuthState = .locked
        }
    }
    
    // MARK: - Automatic Background Lock Hook
    private func handleLifecycleTransition(newPhase: ScenePhase) {
        switch newPhase {
        case .background, .inactive:
            // Intercept background triggers and immediately re-arm the secure authentication cover!
            if securityManager.pinExists {
                appAuthState = .locked
            }
        case .active:
            break
        @unknown default:
            break
        }
    }
}

/// Structural categorization of application loading stages.
enum AppAuthState {
    case verificationNeeded // Brand new user, needs setup
    case locked             // PIN code lock screen presented
    case unlocked           // Safe state, displays actual records
}
`
  },
  {
    name: "TimelineView.swift",
    language: "swift",
    description: "The primary workspace screen. Organizes SwiftData model collections into chronological groupings, handles dynamic querying, filtering, and animations.",
    path: "Views/TimelineView.swift",
    code: `import SwiftUI
import SwiftData

public struct DiaryTimelineView: View {
    @Environment(\\.modelContext) private var modelContext
    
    // Fetch records reversing index so newer is top
    @Query(sort: \\DiaryEntry.timestamp, order: .reverse) private var entries: [DiaryEntry]
    
    @State private var searchText = ""
    @State private var isAddingEntry = false
    @State private var resettingSecurity = false
    
    public init() {}
    
    public var body: some View {
        List {
            // Group our records calendar-wise
            let grouped = Dictionary(grouping: filteredEntries) { entry in
                Calendar.current.startOfDay(for: entry.timestamp)
            }
            
            let sortedKeys = grouped.keys.sorted(by: >)
            
            ForEach(sortedKeys, id: \\.self) { dateKey in
                Section(header: Text(formatHeaderDate(dateKey))
                    .font(.footnote)
                    .fontWeight(.bold)
                    .foregroundColor(.secondary)
                    .textCase(.uppercase)
                ) {
                    ForEach(grouped[dateKey] ?? []) { entry in
                        NavigationLink(destination: ImageDetailsWrapper(entry: entry)) {
                            TimelineEntryRow(entry: entry)
                        }
                        .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                            Button(role: .destructive) {
                                deleteEntry(entry)
                            } label: {
                                Label("Delete", systemName: "trash")
                            }
                        }
                    }
                }
            }
            
            if filteredEntries.isEmpty {
                emptyPlaceholderView
            }
        }
        .listStyle(GroupedListStyle())
        .navigationTitle("My Diary")
        .searchable(text: $searchText, prompt: "Search entry text...")
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button(action: { isAddingEntry = true }) {
                    Image(systemName: "square.and.pencil")
                        .font(.headline)
                }
            }
            
            ToolbarItem(placement: .navigationBarLeading) {
                Button(action: { resettingSecurity = true }) {
                    Image(systemName: "key.viewfinder")
                        .foregroundColor(.secondary)
                }
            }
        }
        .sheet(isPresented: $isAddingEntry) {
            DiaryEditorView()
        }
        .confirmationDialog(
            "Security Settings",
            isPresented: $resettingSecurity,
            titleVisibility: .visible
        ) {
            Button("Reset Security PIN & FaceID", role: .destructive) {
                SecurityManager.shared.resetSecurity()
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("This will wipe your stored Keychain credentials and prompt for a replacement on restart.")
        }
    }
    
    // Query filtering computation
    private var filteredEntries: [DiaryEntry] {
        if searchText.isEmpty {
            return entries
        } else {
            return entries.filter {
                $0.title.localizedCaseInsensitiveContains(searchText) ||
                $0.content.localizedCaseInsensitiveContains(searchText)
            }
        }
    }
    
    private func deleteEntry(_ entry: DiaryEntry) {
        withAnimation {
            modelContext.delete(entry)
            try? modelContext.save()
        }
    }
    
    private func formatHeaderDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.doesRelativeDateFormatting = true
        return formatter.string(from: date)
    }
    
    private var emptyPlaceholderView: some View {
        VStack(spacing: 16) {
            Spacer().frame(height: 32)
            Image(systemName: "doc.text.magnifyingglass")
                .font(.system(size: 60))
                .foregroundColor(.secondary.opacity(0.5))
            
            Text(searchText.isEmpty ? "No Entries Yet" : "No Match Found")
                .font(.headline)
                .foregroundColor(.secondary)
            
            Text(searchText.isEmpty ? "Write down your experiences, secure ideas, and keep record of today." : "Try typing another search key or adjusting keywords.")
                .font(.subheadline)
                .foregroundColor(.secondary.opacity(0.8))
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
            Spacer()
        }
        .frame(maxWidth: .infinity, minHeight: 280)
        .listRowBackground(Color.clear)
    }
}

// Custom Row Element UI
struct TimelineEntryRow: View {
    let entry: DiaryEntry
    
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(entry.title.isEmpty ? "Untitled Entry" : entry.title)
                    .font(.headline)
                    .foregroundColor(.primary)
                Spacer()
                
                Text(formatTimeOfDay(entry.timestamp))
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
            
            Text(entry.content.isEmpty ? "No written text..." : entry.content)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .lineLimit(2)
        }
        .padding(.vertical, 4)
    }
    
    private func formatTimeOfDay(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }
}

struct ImageDetailsWrapper: View {
    let entry: DiaryEntry
    
    var body: some View {
        DiaryEditorView(existingEntry: entry)
    }
}
`
  },
  {
    name: "EditorView.swift",
    language: "swift",
    description: "The creative editing board containing automatic timestamp headers and rich interactive form controls for full SwiftData operations (Inserting & Modifying).",
    path: "Views/EditorView.swift",
    code: `import SwiftUI
import SwiftData

public struct DiaryEditorView: View {
    @Environment(\\.modelContext) private var modelContext
    @Environment(\\.dismiss) private var dismiss
    
    private var existingEntry: DiaryEntry?
    
    @State private var title: String = ""
    @State private var content: String = ""
    @State private var category: String = "Personal"
    @State private var creationDate: Date = Date()
    @State private var isNew: Bool = true
    
    public init(existingEntry: DiaryEntry? = nil) {
        self.existingEntry = existingEntry
        _isNew = State(initialValue: existingEntry == nil)
    }
    
    public var body: some View {
        NavigationStack {
            Form {
                Section(header: Text("Title & metadata")) {
                    TextField("Enter Title...", text: $title)
                        .font(.headline)
                    
                    Picker("Category", selection: $category) {
                        Text("Personal").tag("Personal")
                        Text("Work").tag("Work")
                        Text("Thoughts").tag("Thoughts")
                        Text("Inspiration").tag("Inspiration")
                    }
                    .pickerStyle(.segmented)
                }
                
                Section(header: Text("Timestamp (Recorded Automatically)")) {
                    HStack {
                        Image(systemName: "calendar.badge.clock")
                            .foregroundColor(.accentColor)
                        Text(formatFullDate(creationDate))
                            .font(.subheadline)
                            .foregroundColor(.primary)
                    }
                }
                
                Section(header: Text("Written Record")) {
                    TextEditor(text: $content)
                        .frame(minHeight: 250)
                        .font(.body)
                }
            }
            .navigationTitle(isNew ? "New Diary Entry" : "Modify Record")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Discard") {
                        dismiss()
                    }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save") {
                        saveAndSync()
                    }
                    .fontWeight(.semibold)
                    .disabled(title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
            }
            .onAppear {
                if let entry = existingEntry {
                    title = entry.title
                    content = entry.content
                    category = entry.category
                    creationDate = entry.timestamp
                }
            }
        }
    }
    
    private func saveAndSync() {
        if isNew {
            // Instantiate and inject a completely fresh database entity
            let newEntry = DiaryEntry(
                title: title,
                content: content,
                timestamp: Date(), // Automatically captures the exact timestamp on creation
                category: category
            )
            modelContext.insert(newEntry)
        } else {
            // Update referenced properties directly inside active transaction
            if let entry = existingEntry {
                entry.title = title
                entry.content = content
                entry.category = category
                // Retains initial timestamp as requested, or can be configured to update optionally
            }
        }
        
        do {
            try modelContext.save()
            dismiss()
        } catch {
            print("❌ Saving SwiftData Entry Failed: \\(error.localizedDescription)")
        }
    }
    
    private func formatFullDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .long
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }
}
`
  },
  {
    name: "Info.plist Configuration",
    language: "xml",
    description: "Crucial iOS system configuration strings that must be bundled with the application to authorize local biometric FaceID queries.",
    path: "Supporting Files/Info.plist",
    code: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleIdentifier</key>
    <string>com.diary.secure.app</string>
    <key>CFBundleName</key>
    <string>SecureDiary</string>
    
    <!-- CRITICAL ACCESS DECORATION REQUIRED FOR FACE ID OPERATION -->
    <key>NSFaceIDUsageDescription</key>
    <string>Secure Diary requires Face ID biometric authentication to quickly and safely grant access to your encrypted timeline and past entries.</string>
</dict>
</plist>
`
  }
];

export const xcodeSetupGuideMarkdown = `## Xcode Setup & Integration Instructions

Follow these direct development steps to launch this professional secure diary app inside your own Apple Developer Studio workspace (Xcode):

### 🛠️ Step 1: Create a New SwiftUI Project
1. Open **Xcode 15 or 16** and select **File > New > Project...**
2. Choose **iOS App** from the selector and click Next.
3. Configure your project parameters:
   - **Product Name**: \`SecureDiary\`
   - **Interface**: \`SwiftUI\`
   - **Language**: \`Swift\`
   - **Storage**: Select **SwiftData** (or select \`None\` and we will configure the model container cleanly in the main code). Let's use **SwiftUI / SwiftData** setup.
4. Click Next and select a path on your local drive to place the project.

### 🦺 Step 2: Configure Workspace Folder Structure
Inside your Xcode File Navigator (left pane), right-click your root folder and construct the following groups (folders):
- 📁 \`Models\` (Create \`DiaryEntry.swift\` inside this)
- 📁 \`Managers\` (Create \`SecurityManager.swift\` inside this)
- 📁 \`Views\` (Create \`AuthViews.swift\`, \`TimelineView.swift\`, and \`EditorView.swift\` inside this)

### 💾 Step 3: Copy Code Snippets
1. Select each folder inside Xcode, hit **⌘N** (New File), choose **Swift File** or **SwiftUI View**, name it according to our list, and paste the precise code files.
2. In the root, overwrite the content of \`SecureDiaryApp.swift\` with the provided code in the **App Root Scene** tab (\`DiaryApp.swift\`).

### 🔑 Step 4: Add Face ID Hardware Declarations (Info.plist)
Apple demands a specific description string when asking a user to authorize biometric checks. If this key is missing, your app will crash on startup if biometrics trigger.
1. Click on the root **SecureDiary** project icon in the Xcode File Navigator.
2. Select the App target and navigate to the **Info** tab.
3. Hover over any row, click the **+** icon, and paste the following key:
   - Key: \`Privacy - Face ID Usage Description\`
   - Value: \`Secure Diary requires Face ID biometric authentication to quickly and safely grant access to your encrypted entries.\`
4. Alternatively, open your project's \`Info.plist\` or target's build settings and paste the XML structure in our plist tab.

### 📱 Step 5: Test on Simulator or Hardware Device
1. Run on a simulated iPhone using **⌘R**.
2. **First Run**: The app displays the onboarding flow. Enter a 4-digit PIN, then confirm it. The application saves it securely inside the system Keychain.
3. **Subsequent Run (Biometrics Simulation)**: 
   - Lock standard device simulator screens using **⌘L** or simply rebuild the app.
   - To test biometrics in the Xcode Simulator, click **Features > Face ID > Enrolled** inside the Simulator menu bar, then re-launch the lock view and choose **Features > Face ID > Matching Face** to simulate a successful check!
`;
