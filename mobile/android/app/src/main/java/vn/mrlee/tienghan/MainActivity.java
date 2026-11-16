package vn.mrlee.tienghan;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.os.Message;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.CookieManager;
import android.webkit.PermissionRequest;
import android.webkit.SslErrorHandler;
import android.net.http.SslError;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

public class MainActivity extends Activity {
    private static final String HOME = "https://mrlee-b6a.pages.dev/";
    private static final String SITE_HOST = "mrlee-b6a.pages.dev";
    private static final int MICROPHONE_REQUEST = 7001;
    private static final int FILE_PICKER_REQUEST = 7002;

    private FrameLayout root;
    private WebView browser;
    private View offlinePanel;
    private View fullscreenView;
    private WebChromeClient.CustomViewCallback fullscreenCallback;
    private PermissionRequest pendingMicrophone;
    private ValueCallback<Uri[]> pendingFileUpload;

    private static boolean isSiteUri(Uri uri) {
        return uri != null
                && "https".equalsIgnoreCase(uri.getScheme())
                && SITE_HOST.equalsIgnoreCase(uri.getHost())
                && uri.getUserInfo() == null
                && (uri.getPort() == -1 || uri.getPort() == 443);
    }

    private static boolean isAllowedExternalUri(Uri uri) {
        if (uri == null || uri.getUserInfo() != null) return false;
        String scheme = uri.getScheme();
        if ("mailto".equalsIgnoreCase(scheme)) return true;
        if (!"https".equalsIgnoreCase(scheme)) return false;
        String host = uri.getHost();
        return host != null && !host.toLowerCase(java.util.Locale.ROOT).contains(SITE_HOST);
    }

    private void openExternal(Uri uri) {
        if (!isAllowedExternalUri(uri)) return;
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, uri));
        } catch (ActivityNotFoundException ignored) {
            // No browser/mail client installed: do not navigate to an unsafe fallback.
        }
    }

    private boolean handleNavigation(Uri uri) {
        if (isSiteUri(uri)) return false;
        if (isAllowedExternalUri(uri)) openExternal(uri);
        return true; // Reject non-HTTPS, lookalike and all unknown schemes.
    }

    @Override
    @SuppressLint("SetJavaScriptEnabled")
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Color.rgb(12, 29, 66));
        getWindow().setNavigationBarColor(Color.rgb(12, 29, 66));
        root = new FrameLayout(this);
        root.setFitsSystemWindows(true);
        root.setBackgroundColor(Color.rgb(9, 19, 42));
        setContentView(root);

        browser = new WebView(this);
        browser.setBackgroundColor(Color.rgb(9, 19, 42));
        root.addView(browser, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));

        WebView.setWebContentsDebuggingEnabled(false);
        WebSettings settings = browser.getSettings();
        settings.setJavaScriptEnabled(true); // Required by current MR LEE lessons and games.
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true); // Android file-picker grants scoped content URIs.
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setSafeBrowsingEnabled(true);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setSupportMultipleWindows(true);
        settings.setMediaPlaybackRequiresUserGesture(true);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(browser, false);

        browser.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return handleNavigation(request.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return handleNavigation(Uri.parse(url));
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                if (isSiteUri(Uri.parse(url))) showOffline(false);
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) showOffline(true);
            }

            @Override
            public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
                handler.cancel(); // Never ignore an invalid SSL certificate.
                showOffline(true);
            }
        });

        browser.setDownloadListener((url, userAgent, contentDisposition, mimeType, contentLength) -> {
            Uri uri = Uri.parse(url);
            if (isSiteUri(uri)) {
                // Use the system browser for files instead of unsafe file:// access.
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, uri));
                } catch (ActivityNotFoundException ignored) { }
            } else {
                openExternal(uri);
            }
        });

        browser.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(PermissionRequest request) {
                runOnUiThread(() -> {
                    if (!isSiteUri(request.getOrigin())) {
                        request.deny();
                        return;
                    }
                    String[] resources = request.getResources();
                    if (resources.length != 1 || !PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(resources[0])) {
                        request.deny(); // No camera/video/mixed permission bundles.
                        return;
                    }
                    if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) ==
                            PackageManager.PERMISSION_GRANTED) {
                        request.grant(new String[]{PermissionRequest.RESOURCE_AUDIO_CAPTURE});
                    } else {
                        if (pendingMicrophone != null) pendingMicrophone.deny();
                        pendingMicrophone = request;
                        requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO},
                                MICROPHONE_REQUEST);
                    }
                });
            }

            @Override
            public void onPermissionRequestCanceled(PermissionRequest request) {
                if (pendingMicrophone == request) pendingMicrophone = null;
            }

            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> callback,
                                             FileChooserParams params) {
                if (pendingFileUpload != null) pendingFileUpload.onReceiveValue(null);
                pendingFileUpload = callback;
                Intent picker = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                picker.addCategory(Intent.CATEGORY_OPENABLE);
                picker.setType("*/*");
                picker.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
                try {
                    startActivityForResult(picker, FILE_PICKER_REQUEST);
                    return true;
                } catch (ActivityNotFoundException e) {
                    pendingFileUpload.onReceiveValue(null);
                    pendingFileUpload = null;
                    return false;
                }
            }

            @Override
            public boolean onCreateWindow(WebView view, boolean isDialog,
                                          boolean isUserGesture, Message resultMsg) {
                if (!isUserGesture) return false;
                WebView popup = new WebView(MainActivity.this);
                popup.setWebViewClient(new WebViewClient() {
                    @Override
                    public boolean shouldOverrideUrlLoading(WebView ignored, WebResourceRequest req) {
                        Uri uri = req.getUrl();
                        if (isSiteUri(uri)) browser.loadUrl(uri.toString());
                        else openExternal(uri);
                        return true;
                    }

                    @Override
                    public void onPageStarted(WebView ignored, String url,
                                              android.graphics.Bitmap favicon) {
                        Uri uri = Uri.parse(url);
                        if (isSiteUri(uri)) browser.loadUrl(url);
                        else openExternal(uri);
                        ignored.stopLoading();
                        ignored.destroy();
                    }
                });
                WebView.WebViewTransport transport = (WebView.WebViewTransport) resultMsg.obj;
                transport.setWebView(popup);
                resultMsg.sendToTarget();
                return true;
            }

            @Override
            public void onShowCustomView(View view, CustomViewCallback callback) {
                if (fullscreenView != null) {
                    callback.onCustomViewHidden();
                    return;
                }
                fullscreenView = view;
                fullscreenCallback = callback;
                browser.setVisibility(View.GONE);
                root.addView(view, new FrameLayout.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
                getWindow().getDecorView().setSystemUiVisibility(
                        View.SYSTEM_UI_FLAG_FULLSCREEN |
                        View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
                        View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
            }

            @Override
            public void onHideCustomView() {
                closeFullscreen();
            }
        });

        offlinePanel = createOfflinePanel();
        root.addView(offlinePanel, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        offlinePanel.setVisibility(View.GONE);
        browser.loadUrl(HOME);
    }

    private View createOfflinePanel() {
        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setGravity(Gravity.CENTER);
        layout.setPadding(dp(26), dp(25), dp(26), dp(25));
        layout.setBackgroundColor(Color.rgb(9, 19, 42));

        ImageView logo = new ImageView(this);
        logo.setImageResource(R.mipmap.ic_launcher);
        LinearLayout.LayoutParams logoParams = new LinearLayout.LayoutParams(dp(100), dp(100));
        logoParams.bottomMargin = dp(20);
        layout.addView(logo, logoParams);

        TextView title = new TextView(this);
        title.setText(R.string.offline_title);
        title.setTextSize(23);
        title.setTextColor(Color.WHITE);
        title.setGravity(Gravity.CENTER);
        layout.addView(title);

        TextView detail = new TextView(this);
        detail.setText(R.string.offline_detail);
        detail.setTextSize(15);
        detail.setTextColor(Color.rgb(205, 219, 248));
        detail.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams textParams = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        textParams.topMargin = dp(15);
        textParams.bottomMargin = dp(22);
        layout.addView(detail, textParams);

        Button retry = new Button(this);
        retry.setText(R.string.retry);
        retry.setOnClickListener(v -> {
            showOffline(false);
            browser.loadUrl(HOME);
        });
        layout.addView(retry);
        return layout;
    }

    private int dp(float value) {
        return (int) (value * getResources().getDisplayMetrics().density + 0.5f);
    }

    private void showOffline(boolean shown) {
        if (offlinePanel != null) offlinePanel.setVisibility(shown ? View.VISIBLE : View.GONE);
    }

    private void closeFullscreen() {
        if (fullscreenView == null) return;
        root.removeView(fullscreenView);
        fullscreenView = null;
        browser.setVisibility(View.VISIBLE);
        getWindow().getDecorView().setSystemUiVisibility(0);
        if (fullscreenCallback != null) {
            fullscreenCallback.onCustomViewHidden();
            fullscreenCallback = null;
        }
    }

    @Override
    @Deprecated
    public void onBackPressed() {
        if (fullscreenView != null) closeFullscreen();
        else if (browser != null && browser.canGoBack()) browser.goBack();
        else super.onBackPressed();
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions,
                                           int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode != MICROPHONE_REQUEST || pendingMicrophone == null) return;
        PermissionRequest request = pendingMicrophone;
        pendingMicrophone = null;
        if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED &&
                isSiteUri(request.getOrigin())) {
            request.grant(new String[]{PermissionRequest.RESOURCE_AUDIO_CAPTURE});
        } else request.deny();
    }

    @Override
    @Deprecated
    protected void onActivityResult(int requestCode, int resultCode, Intent intent) {
        super.onActivityResult(requestCode, resultCode, intent);
        if (requestCode != FILE_PICKER_REQUEST || pendingFileUpload == null) return;
        Uri[] results = null;
        if (resultCode == RESULT_OK && intent != null) {
            if (intent.getClipData() != null) {
                android.content.ClipData clip = intent.getClipData();
                results = new Uri[clip.getItemCount()];
                for (int i = 0; i < clip.getItemCount(); i++) {
                    results[i] = clip.getItemAt(i).getUri();
                }
            } else if (intent.getData() != null) {
                results = new Uri[]{intent.getData()};
            }
        }
        pendingFileUpload.onReceiveValue(results);
        pendingFileUpload = null;
    }

    @Override
    protected void onDestroy() {
        if (pendingMicrophone != null) pendingMicrophone.deny();
        if (pendingFileUpload != null) pendingFileUpload.onReceiveValue(null);
        if (browser != null) {
            root.removeView(browser);
            browser.destroy();
            browser = null;
        }
        super.onDestroy();
    }
}
