
package com.kjs.inventory

import android.app.AlertDialog
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.View
import android.view.WindowInsets
import android.view.WindowInsetsController
import android.webkit.CookieManager
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView

class MainActivity : ComponentActivity() {

    private var fileChooserCallback: ValueCallback<Array<Uri>>? = null
    private lateinit var webView: WebView

    private val filePicker =
        registerForActivityResult(ActivityResultContracts.GetContent()) { uri ->
            fileChooserCallback?.onReceiveValue(
                uri?.let { arrayOf(it) }
            )
            fileChooserCallback = null
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        hideSystemBars()

        // KONFIRMASI SAAT TOMBOL BACK ANDROID DITEKAN
        onBackPressedDispatcher.addCallback(
            this,
            object : OnBackPressedCallback(true) {
                override fun handleOnBackPressed() {
                    tampilkanKonfirmasiKeluar()
                }
            }
        )

        setContent {
            InventoryWebScreen(
                onWebViewReady = { webView = it },
                onChooseFile = { callback ->
                    fileChooserCallback?.onReceiveValue(null)
                    fileChooserCallback = callback
                    filePicker.launch("*/*")
                }
            )
        }
    }

    private fun tampilkanKonfirmasiKeluar() {
        AlertDialog.Builder(this)
            .setTitle("Keluar dari aplikasi?")
            .setMessage(
                "Apakah Anda yakin ingin keluar dari aplikasi KJS Inventory?"
            )
            .setNegativeButton("Batal") { dialog, _ ->
                dialog.dismiss()
            }
            .setPositiveButton("Ya, Keluar") { _, _ ->
                finish()
            }
            .setCancelable(true)
            .show()
    }

    @Suppress("DEPRECATION")
    private fun hideSystemBars() {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.R) {
            window.insetsController?.let { controller ->
                controller.hide(
                    WindowInsets.Type.statusBars() or
                        WindowInsets.Type.navigationBars()
                )
                controller.systemBarsBehavior =
                    WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            }
        } else {
            window.decorView.systemUiVisibility = (
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                    or View.SYSTEM_UI_FLAG_FULLSCREEN
                    or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                    or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                )
        }
    }

    @Composable
    private fun InventoryWebScreen(
        onWebViewReady: (WebView) -> Unit,
        onChooseFile: (ValueCallback<Array<Uri>>) -> Unit
    ) {
        AndroidView(
            modifier = Modifier.fillMaxSize(),
            factory = { context ->
                WebView(context).apply {
                    webView = this

                    settings.javaScriptEnabled = true
                    settings.domStorageEnabled = true
                    settings.databaseEnabled = true
                    settings.allowFileAccess = false
                    settings.allowContentAccess = true
                    settings.javaScriptCanOpenWindowsAutomatically = false
                    settings.setSupportMultipleWindows(false)

                    CookieManager.getInstance().setAcceptCookie(true)
                    CookieManager.getInstance()
                        .setAcceptThirdPartyCookies(this, true)

                    webViewClient = object : WebViewClient() {
                        override fun shouldOverrideUrlLoading(
                            view: WebView,
                            request: WebResourceRequest
                        ): Boolean {
                            val uri = request.url

                            if (uri.host == "kilaujayasejahtera-bot.github.io") {
                                return false
                            }

                            startActivity(
                                Intent(Intent.ACTION_VIEW, uri)
                            )
                            return true
                        }
                    }

                    webChromeClient = object : WebChromeClient() {
                        override fun onShowFileChooser(
                            view: WebView,
                            callback: ValueCallback<Array<Uri>>,
                            fileChooserParams: FileChooserParams
                        ): Boolean {
                            onChooseFile(callback)
                            return true
                        }
                    }

                    onWebViewReady(this)

                    loadUrl(APP_URL)
                }
            }
        )
    }

    override fun onDestroy() {
        if (::webView.isInitialized) {
            webView.stopLoading()
            webView.destroy()
        }

        super.onDestroy()
    }

    companion object {
        private const val APP_URL =
            "https://kilaujayasejahtera-bot.github.io/KJSSISTEMBARU/app.html"
    }
}
