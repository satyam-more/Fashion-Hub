# PowerShell script to update API URLs in React components

Write-Host "🔄 Updating API URLs in React components..." -ForegroundColor Cyan

# Define the files to update
$files = @(
    "frontend/src/components/Navbar.jsx",
    "frontend/src/components/ProductDetail.jsx",
    "frontend/src/components/SearchResults.jsx",
    "frontend/src/components/CategoryPage.jsx",
    "frontend/src/components/ForgotPassword.jsx",
    "frontend/src/components/user/Cart.jsx",
    "frontend/src/components/user/Wishlist.jsx",
    "frontend/src/components/user/Orders.jsx",
    "frontend/src/components/user/Profile.jsx",
    "frontend/src/components/user/Checkout.jsx",
    "frontend/src/components/user/UPIPayment.jsx",
    "frontend/src/components/user/OrderConfirmation.jsx",
    "frontend/src/components/user/CustomTailoring.jsx",
    "frontend/src/components/user/AppointmentConfirmation.jsx",
    "frontend/src/components/user/Membership.jsx",
    "frontend/src/components/user/UserDashboard.jsx",
    "frontend/src/components/admin/AdminDashboard.jsx",
    "frontend/src/components/admin/Users.jsx",
    "frontend/src/components/admin/Products.jsx",
    "frontend/src/components/admin/Orders.jsx",
    "frontend/src/components/admin/PaymentVerification.jsx",
    "frontend/src/components/admin/Reviews.jsx",
    "frontend/src/components/admin/Appointments.jsx",
    "frontend/src/components/admin/Analytics.jsx",
    "frontend/src/components/admin/AnalyticsEnhanced.jsx",
    "frontend/src/components/admin/SalesAnalytics.jsx",
    "frontend/src/components/admin/ConsultationAnalytics.jsx",
    "frontend/src/components/admin/Settings.jsx"
)

$updatedCount = 0
$errorCount = 0

foreach ($file in $files) {
    if (Test-Path $file) {
        try {
            $content = Get-Content $file -Raw
            $originalContent = $content
            
            # Replace hardcoded API base URL declarations
            $content = $content -replace "const API_BASE_URL = 'http://localhost:5000/api';", ""
            $content = $content -replace "const API_BASE_URL = `"http://localhost:5000/api`";", ""
            
            # Replace inline fetch URLs
            $content = $content -replace "'http://localhost:5000/api", "API_ENDPOINTS.API"
            $content = $content -replace "`"http://localhost:5000/api", "API_ENDPOINTS.API"
            $content = $content -replace "'http://localhost:5000/uploads", "API_ENDPOINTS.UPLOADS.BASE"
            $content = $content -replace "`"http://localhost:5000/uploads", "API_ENDPOINTS.UPLOADS.BASE"
            
            # Only update if content changed
            if ($content -ne $originalContent) {
                Set-Content $file -Value $content -NoNewline
                Write-Host "✅ Updated: $file" -ForegroundColor Green
                $updatedCount++
            } else {
                Write-Host "⏭️  Skipped (no changes): $file" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "❌ Error updating $file : $_" -ForegroundColor Red
            $errorCount++
        }
    } else {
        Write-Host "⚠️  File not found: $file" -ForegroundColor Yellow
    }
}

Write-Host "`n📊 Summary:" -ForegroundColor Cyan
Write-Host "   Updated: $updatedCount files" -ForegroundColor Green
Write-Host "   Errors: $errorCount files" -ForegroundColor $(if ($errorCount -gt 0) { "Red" } else { "Green" })
Write-Host "`n✨ Done! Remember to add imports manually where needed." -ForegroundColor Cyan
