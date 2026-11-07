import SwiftUI
import UIKit
import WebKit

private let mrleeHome = URL(string: "https://mrlee-b6a.pages.dev/")!
private let mrleeHost = "mrlee-b6a.pages.dev"

private enum LinkRoute {
    case website
    case external
    case blocked

    static func classify(_ url: URL) -> LinkRoute {
        guard let scheme = url.scheme?.lowercased() else { return .blocked }
        if scheme == "https" {
            guard url.user == nil && url.password == nil, let host = url.host?.lowercased()
            else { return .blocked }
            if host == mrleeHost && (url.port == nil || url.port == 443) {
                return .website
            }
            if host.contains(mrleeHost) { return .blocked }
            return .external
        }
        if scheme == "mailto" { return .external }
        return .blocked
    }
}

private final class BrowserStore {
    weak var webView: WKWebView?
}

@main
struct MRLeeMobileApp: App {
    var body: some Scene {
        WindowGroup {
            MRLeeContentView()
        }
    }
}

private struct MRLeeContentView: View {
    @State private var offline = false
    @State private var store = BrowserStore()

    var body: some View {
        ZStack {
            Color(red: 0.035, green: 0.075, blue: 0.165).ignoresSafeArea()
            SiteWebView(offline: $offline, store: store)

            if offline {
                VStack(spacing: 18) {
                    Image("Logo")
                        .resizable()
                        .scaledToFit()
                        .frame(width: 104, height: 104)
                        .clipShape(RoundedRectangle(cornerRadius: 22))
                    Text("Chưa kết nối được MR LEE")
                        .font(.system(size: 23, weight: .bold))
                        .multilineTextAlignment(.center)
                    Text("Kiểm tra Internet để học tiếng Hàn, luyện TOPIK và vào Game Zone.")
                        .foregroundStyle(.white.opacity(0.8))
                        .multilineTextAlignment(.center)
                    Button("Thử lại") {
                        offline = false
                        store.webView?.load(URLRequest(url: mrleeHome))
                    }
                    .font(.headline)
                    .buttonStyle(.borderedProminent)
                    .tint(.yellow)
                }
                .padding(30)
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(Color(red: 0.035, green: 0.075, blue: 0.165))
            }
        }
    }
}

private struct SiteWebView: UIViewRepresentable {
    @Binding var offline: Bool
    let store: BrowserStore

    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.websiteDataStore = .default()
        config.defaultWebpagePreferences.allowsContentJavaScript = true
        config.allowsInlineMediaPlayback = true

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        webView.uiDelegate = context.coordinator
        webView.allowsBackForwardNavigationGestures = true
        webView.scrollView.bounces = true
        webView.isOpaque = false
        webView.backgroundColor = UIColor(red: 0.035, green: 0.075, blue: 0.165, alpha: 1)
        webView.scrollView.backgroundColor = webView.backgroundColor

        let refresh = UIRefreshControl()
        refresh.addTarget(context.coordinator, action: #selector(Coordinator.refresh), for: .valueChanged)
        webView.scrollView.refreshControl = refresh

        context.coordinator.browser = webView
        store.webView = webView
        webView.load(URLRequest(url: mrleeHome))
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {
        context.coordinator.parent = self
    }

    final class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate {
        var parent: SiteWebView
        weak var browser: WKWebView?

        init(_ parent: SiteWebView) {
            self.parent = parent
        }

        @objc func refresh() {
            browser?.reload()
        }

        func webView(_ webView: WKWebView,
                     decidePolicyFor navigationAction: WKNavigationAction,
                     decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            guard let url = navigationAction.request.url else {
                decisionHandler(.cancel)
                return
            }
            switch LinkRoute.classify(url) {
            case .website:
                decisionHandler(.allow)
            case .external:
                UIApplication.shared.open(url)
                decisionHandler(.cancel)
            case .blocked:
                decisionHandler(.cancel)
            }
        }

        func webView(_ webView: WKWebView,
                     createWebViewWith configuration: WKWebViewConfiguration,
                     for navigationAction: WKNavigationAction,
                     windowFeatures: WKWindowFeatures) -> WKWebView? {
            guard navigationAction.targetFrame == nil, let url = navigationAction.request.url
            else { return nil }
            switch LinkRoute.classify(url) {
            case .website:
                webView.load(URLRequest(url: url))
            case .external:
                UIApplication.shared.open(url)
            case .blocked:
                break
            }
            return nil
        }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            webView.scrollView.refreshControl?.endRefreshing()
            parent.offline = false
        }

        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!,
                     withError error: Error) {
            webView.scrollView.refreshControl?.endRefreshing()
            let nsError = error as NSError
            if nsError.code != NSURLErrorCancelled { parent.offline = true }
        }

        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!,
                     withError error: Error) {
            webView.scrollView.refreshControl?.endRefreshing()
            let nsError = error as NSError
            if nsError.code != NSURLErrorCancelled { parent.offline = true }
        }

        // The website can request microphone recording for pronunciation,
        // but camera requests and third-party origin requests are always denied.
        @available(iOS 15.0, *)
        func webView(_ webView: WKWebView,
                     requestMediaCapturePermissionFor origin: WKSecurityOrigin,
                     initiatedByFrame frame: WKFrameInfo,
                     type: WKMediaCaptureType,
                     decisionHandler: @escaping (WKPermissionDecision) -> Void) {
            if origin.protocol == "https" && origin.host.lowercased() == mrleeHost &&
                (origin.port == 443 || origin.port == 0) && type == .microphone {
                decisionHandler(.prompt)
            } else {
                decisionHandler(.deny)
            }
        }
    }
}
