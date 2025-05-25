param(
    [string]$Message = "Auto-deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
)

Write-Host "Adding all changes to Git..." -ForegroundColor Green
git add .

Write-Host "Committing changes with message: $Message" -ForegroundColor Green
git commit -m $Message

Write-Host "Pushing to GitHub..." -ForegroundColor Green
git push origin devin/1747592774-initial-project-setup

Write-Host "Deployment complete!" -ForegroundColor Green 