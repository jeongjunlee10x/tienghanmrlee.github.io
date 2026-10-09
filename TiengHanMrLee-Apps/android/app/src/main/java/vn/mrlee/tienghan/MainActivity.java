package vn.mrlee.tienghan;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Insets;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowInsets;
import android.webkit.CookieManager;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

public class MainActivity extends Activity {
    private static final String HOME = "https://tienghanmrlee.github.io/";
    private static final int FILE_PICKER = 100;
    private WebView web;
    private ProgressBar progress;
    private LinearLayout errorPanel;
    private TextView errorText;
    private FrameLayout root;
    private LinearLayout content;
    private View video;
    private WebChromeClient.CustomViewCallback videoCallback;
    private ValueCallback<Uri[]> fileCallback;

    @Override public void onCreate(Bundle savedState) {
        super.onCreate(savedState);
        root = new FrameLayout(this);
        root.setBackgroundColor(Color.WHITE);
        content = new LinearLayout(this);
        content.setOrientation(LinearLayout.VERTICAL);
        root.addView(content, new FrameLayout.LayoutParams(-1, -1));
        setContentView(root);
        if (Build.VERSION.SDK_INT >= 30) {
            root.setOnApplyWindowInsetsListener((v, insets) -> {
                Insets bars = insets.getInsets(WindowInsets.Type.systemBars()
                    | WindowInsets.Type.displayCutout() | WindowInsets.Type.ime());
                v.setPadding(bars.left, bars.top, bars.right, bars.bottom);
                return WindowInsets.CONSUMED;
            });
        }

        LinearLayout tools = new LinearLayout(this);
        addButton(tools, "Quay lại", v -> goBack());
        addButton(tools, "Trang chủ", v -> loadHome());
        addButton(tools, "Tải lại", v -> { errorPanel.setVisibility(View.GONE); web.reload(); });
        content.addView(tools);
        progress = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        content.addView(progress, new LinearLayout.LayoutParams(-1, dp(3)));

        errorPanel = new LinearLayout(this);
        errorPanel.setOrientation(LinearLayout.VERTICAL);
        errorPanel.setPadding(dp(16), dp(12), dp(16), dp(12));
        errorText = new TextView(this);
        errorPanel.addView(errorText);
        Button retry = new Button(this);
        retry.setText("Thử lại");
        retry.setOnClickListener(v -> loadHome());
        errorPanel.addView(retry);
        errorPanel.setVisibility(View.GONE);
        content.addView(errorPanel);

        web = new WebView(this);
        content.addView(web, new LinearLayout.LayoutParams(-1, 0, 1));
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setMediaPlaybackRequiresUserGesture(true);
        settings.setSupportMultipleWindows(false);
        CookieManager.getInstance().setAcceptCookie(true);

        web.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (isInternal(uri)) return false;
                if (request.isForMainFrame()) openExternal(uri);
                return true;
            }
            @Override public void onPageStarted(WebView view, String url, android.graphics.Bitmap favicon) {
                errorPanel.setVisibility(View.GONE);
                progress.setVisibility(View.VISIBLE);
            }
            @Override public void onPageFinished(WebView view, String url) {
                progress.setVisibility(View.GONE);
            }
            @Override public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) showError("Không tải được trang. Kiểm tra kết nối Internet rồi nhấn Thử lại.");
            }
            @Override public void onReceivedHttpError(WebView view, WebResourceRequest request, WebResourceResponse response) {
                if (request.isForMainFrame()) showError(response.getStatusCode() == 404
                    ? "Website chưa sẵn sàng (404). Thầy cần kiểm tra cài đặt GitHub Pages."
                    : "Website báo lỗi " + response.getStatusCode() + ". Vui lòng thử lại sau.");
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override public void onProgressChanged(WebView view, int value) { progress.setProgress(value); }
            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;
                try { startActivityForResult(params.createIntent(), FILE_PICKER); }
                catch (ActivityNotFoundException e) {
                    fileCallback.onReceiveValue(null);
                    fileCallback = null;
                    Toast.makeText(MainActivity.this, "Không mở được trình chọn tệp.", Toast.LENGTH_SHORT).show();
                }
                return true;
            }
            @Override public void onShowCustomView(View view, CustomViewCallback callback) {
                if (video != null) { callback.onCustomViewHidden(); return; }
                video = view;
                videoCallback = callback;
                content.setVisibility(View.GONE);
                root.addView(video, new FrameLayout.LayoutParams(-1, -1));
            }
            @Override public void onHideCustomView() { hideVideo(); }
        });
        // Downloads use the browser's download UI rather than requesting broad storage access.
        web.setDownloadListener((url, agent, disposition, type, length) -> openExternal(Uri.parse(url)));
        if (Build.VERSION.SDK_INT >= 33) {
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
                android.window.OnBackInvokedDispatcher.PRIORITY_DEFAULT, this::goBack);
        }
        if (savedState == null || web.restoreState(savedState) == null) loadHome();
    }

    private boolean isInternal(Uri uri) {
        return "https".equalsIgnoreCase(uri.getScheme())
            && "tienghanmrlee.github.io".equalsIgnoreCase(uri.getHost())
            && (uri.getPort() == -1 || uri.getPort() == 443);
    }
    private void openExternal(Uri uri) {
        String scheme = uri.getScheme();
        if (!"https".equalsIgnoreCase(scheme) && !"http".equalsIgnoreCase(scheme)
            && !"mailto".equalsIgnoreCase(scheme) && !"tel".equalsIgnoreCase(scheme)) return;
        try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); }
        catch (ActivityNotFoundException e) {
            Toast.makeText(this, "Không có ứng dụng mở liên kết này.", Toast.LENGTH_SHORT).show();
        }
    }
    private void loadHome() { errorPanel.setVisibility(View.GONE); web.loadUrl(HOME); }
    private void showError(String message) {
        errorText.setText(message);
        errorPanel.setVisibility(View.VISIBLE);
        progress.setVisibility(View.GONE);
    }
    private void addButton(LinearLayout row, String label, View.OnClickListener action) {
        Button button = new Button(this);
        button.setText(label);
        button.setTextSize(12);
        button.setOnClickListener(action);
        row.addView(button, new LinearLayout.LayoutParams(0, -2, 1));
    }
    private int dp(int value) { return Math.round(value * getResources().getDisplayMetrics().density); }
    private void hideVideo() {
        if (video == null) return;
        root.removeView(video);
        video = null;
        content.setVisibility(View.VISIBLE);
        if (videoCallback != null) { videoCallback.onCustomViewHidden(); videoCallback = null; }
    }
    private void goBack() {
        if (video != null) hideVideo();
        else if (web.canGoBack()) web.goBack();
        else finish();
    }
    @Override public void onBackPressed() { goBack(); }
    @Override protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == FILE_PICKER && fileCallback != null) {
            fileCallback.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(resultCode, data));
            fileCallback = null;
        }
    }
    @Override protected void onSaveInstanceState(Bundle state) {
        web.saveState(state);
        super.onSaveInstanceState(state);
    }
    @Override protected void onPause() { web.onPause(); CookieManager.getInstance().flush(); super.onPause(); }
    @Override protected void onResume() { super.onResume(); if (web != null) web.onResume(); }
    @Override protected void onDestroy() {
        if (fileCallback != null) fileCallback.onReceiveValue(null);
        hideVideo();
        ((ViewGroup) web.getParent()).removeView(web);
        web.destroy();
        super.onDestroy();
    }
}
