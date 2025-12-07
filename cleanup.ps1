# EVCharge Project Cleanup Script
# Run this in PowerShell from the project root

Write-Host "🧹 Starting Project Cleanup..." -ForegroundColor Green

# Move root .md files to docs/
Write-Host "`n📄 Moving documentation files..." -ForegroundColor Yellow

# Delete redundant/outdated files
$filesToDelete = @(
    "LAUNCH_CHECKLIST.md",  # Duplicate (already in docs/deployment/)
    "RAILWAY_FIX.md",       # Temporary fix doc
    "render.yaml"           # Not using Render
)

foreach ($file in $filesToDelete) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✓ Deleted: $file" -ForegroundColor Red
    }
}

# Move files to appropriate locations
$moveOperations = @{
    "PROJECT_OVERVIEW.md" = "docs\PROJECT_OVERVIEW.md"
    "SIMPLE_EXPLAIN.md" = "docs\SIMPLE_EXPLAIN.md"
}

foreach ($source in $moveOperations.Keys) {
    if (Test-Path $source) {
        Move-Item -Path $source -Destination $moveOperations[$source] -Force
        Write-Host "  ✓ Moved: $source → $($moveOperations[$source])" -ForegroundColor Green
    }
}

# Clean up duplicate docs/docs folder
if (Test-Path "docs\docs") {
    Write-Host "`n🗑️  Removing duplicate docs/docs folder..." -ForegroundColor Yellow
    Remove-Item -Path "docs\docs" -Recurse -Force
    Write-Host "  ✓ Deleted: docs/docs/" -ForegroundColor Red
}

# Clean up data folder (move to database/)
if (Test-Path "data") {
    Write-Host "`n📦 Moving data files to database/..." -ForegroundColor Yellow
    if (Test-Path "data\bangalore_stations_50.sql") {
        Move-Item "data\bangalore_stations_50.sql" "database\seed\" -Force
        Write-Host "  ✓ Moved: bangalore_stations_50.sql" -ForegroundColor Green
    }
    # Delete data folder if only template files remain
    $dataFiles = Get-ChildItem "data" -File
    if ($dataFiles.Count -le 2) {
        Remove-Item "data" -Recurse -Force
        Write-Host "  ✓ Deleted: data/ folder" -ForegroundColor Red
    }
}

Write-Host "`n✅ Cleanup Complete!" -ForegroundColor Green
Write-Host "`nProject structure is now clean and organized!" -ForegroundColor Cyan


