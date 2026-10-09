using System.Diagnostics;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace TiengHanMrLee;

public sealed class MainForm : Form
{
    private const string HomeUrl = "https://tienghanmrlee.github.io/";
    private readonly WebView2 browser = new() { Dock = DockStyle.Fill };
    private readonly ToolStripButton back = new("Quay lại") { Enabled = false };
    private readonly ToolStripButton home = new("Trang chủ") { Enabled = false };
    private readonly ToolStripButton refresh = new("Tải lại") { Enabled = false };
    private readonly ToolStripButton retry = new("Thử lại");
    private readonly ToolStripLabel status = new("Đang khởi động…");
    private bool initializing;
    private bool ready;

    public MainForm()
    {
        Text = "Tiếng Hàn Mr Lee";
        StartPosition = FormStartPosition.CenterScreen;
        Size = new Size(1200, 820);
        MinimumSize = new Size(500, 420);
        var toolbar = new ToolStrip { Dock = DockStyle.Top, GripStyle = ToolStripGripStyle.Hidden };
        toolbar.Items.AddRange(new ToolStripItem[] { back, home, refresh, new ToolStripSeparator(), retry, status });
        Controls.Add(browser);
        Controls.Add(toolbar);
        back.Click += (_, _) => { if (browser.CanGoBack) browser.GoBack(); };
        home.Click += (_, _) => browser.CoreWebView2.Navigate(HomeUrl);
        refresh.Click += (_, _) => browser.Reload();
        retry.Click += async (_, _) =>
        {
            if (ready) browser.CoreWebView2.Navigate(HomeUrl);
            else await InitializeBrowser();
        };
        Shown += async (_, _) => await InitializeBrowser();
    }

    private async Task InitializeBrowser()
    {
        if (initializing || ready) return;
        initializing = true;
        retry.Enabled = false;
        try
        {
            // Store cookies/cache outside the EXE directory so portable copies need no admin rights.
            string profile = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "TiengHanMrLee", "WebView2");
            var environment = await CoreWebView2Environment.CreateAsync(null, profile);
            await browser.EnsureCoreWebView2Async(environment);
            browser.CoreWebView2.Settings.IsStatusBarEnabled = false;
            browser.CoreWebView2.Settings.AreDevToolsEnabled = false;
            browser.CoreWebView2.NavigationStarting += (_, e) =>
            {
                if (e.Uri == "about:blank") return;
                if (IsInternal(e.Uri)) { status.Text = "Đang tải…"; return; }
                e.Cancel = true;
                OpenExternal(e.Uri);
            };
            browser.CoreWebView2.NewWindowRequested += (_, e) =>
            {
                e.Handled = true;
                if (IsInternal(e.Uri)) browser.CoreWebView2.Navigate(e.Uri);
                else OpenExternal(e.Uri);
            };
            browser.CoreWebView2.HistoryChanged += (_, _) => back.Enabled = browser.CanGoBack;
            browser.CoreWebView2.NavigationCompleted += (_, e) =>
            {
                status.Text = e.HttpStatusCode == 404
                    ? "Website chưa sẵn sàng (404). Kiểm tra GitHub Pages."
                    : !e.IsSuccess
                        ? "Không tải được trang. Kiểm tra Internet và nhấn Thử lại."
                        : e.HttpStatusCode >= 400
                            ? $"Website báo lỗi {e.HttpStatusCode}. Nhấn Thử lại."
                            : "Tiếng Hàn Mr Lee";
                back.Enabled = browser.CanGoBack;
            };
            ready = true;
            home.Enabled = refresh.Enabled = true;
            browser.CoreWebView2.Navigate(HomeUrl);
        }
        catch (WebView2RuntimeNotFoundException)
        {
            status.Text = "Cần cài Microsoft Edge WebView2 Runtime.";
            if (MessageBox.Show(this, "Ứng dụng cần Microsoft Edge WebView2 Runtime. Mở trang tải chính thức?",
                Text, MessageBoxButtons.YesNo, MessageBoxIcon.Information) == DialogResult.Yes)
                OpenExternal("https://developer.microsoft.com/en-us/microsoft-edge/webview2/");
        }
        catch (Exception)
        {
            status.Text = "Không khởi động được. Nhấn Thử lại hoặc mở lại ứng dụng.";
        }
        finally { initializing = false; retry.Enabled = true; }
    }

    private static bool IsInternal(string url) =>
        Uri.TryCreate(url, UriKind.Absolute, out var uri)
        && uri.Scheme == Uri.UriSchemeHttps
        && uri.IdnHost.Equals("tienghanmrlee.github.io", StringComparison.OrdinalIgnoreCase)
        && uri.IsDefaultPort;

    private void OpenExternal(string url)
    {
        if (!Uri.TryCreate(url, UriKind.Absolute, out var uri)) return;
        if (uri.Scheme is not ("https" or "http" or "mailto" or "tel")) return;
        try { Process.Start(new ProcessStartInfo(uri.AbsoluteUri) { UseShellExecute = true }); }
        catch (Exception) { status.Text = "Không mở được liên kết bên ngoài."; }
    }
}
